(function(root) {
  'use strict';

  const VALID_STATUSES = new Set(['perfect', 'uncertain', 'unattempted']);

  function defaultIdentity(word) {
    return typeof word?.id === 'string' ? word.id : word?.word;
  }

  function readArray(storage, key) {
    try {
      const parsed = JSON.parse(storage.getItem(key));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function parseStatusObject(value) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function createLearningStatusStore({ storage, prefix, getWords, getIdentity = defaultIdentity }) {
    if (!storage || typeof prefix !== 'string' || typeof getWords !== 'function') {
      throw new TypeError('A storage object, prefix, and vocabulary provider are required.');
    }

    const statusKey = prefix + 'statuses';
    const migrationKey = prefix + 'statuses_migrated_v1';
    const masteryKey = prefix + 'mastery';
    const knownKey = prefix + 'known';
    const unknownKey = prefix + 'unknown';

    function validKeys() {
      return new Set(getWords().map(getIdentity).filter(key => typeof key === 'string'));
    }

    function migrateOnce(current, keys) {
      if (storage.getItem(migrationKey) === '1') return current;

      const isValid = key => typeof key === 'string' && keys.has(key);
      const unknown = new Set(readArray(storage, unknownKey).filter(isValid));
      const known = new Set(readArray(storage, knownKey).filter(isValid));
      const mastery = new Set(readArray(storage, masteryKey).filter(isValid));
      const migrated = { ...current };

      // No timestamps exist in the legacy format. Explicit mastery wins, then
      // an explicit unknown answer, then the older known set.
      for (const key of known) {
        if (!Object.prototype.hasOwnProperty.call(migrated, key)) migrated[key] = 'perfect';
      }
      for (const key of unknown) {
        if (!Object.prototype.hasOwnProperty.call(current, key)) migrated[key] = 'uncertain';
      }
      for (const key of mastery) {
        if (!Object.prototype.hasOwnProperty.call(current, key)) migrated[key] = 'perfect';
      }

      storage.setItem(statusKey, JSON.stringify(migrated));
      storage.setItem(migrationKey, '1');
      return migrated;
    }

    function getAll() {
      const keys = validKeys();
      const stored = parseStatusObject(storage.getItem(statusKey));
      const current = {};
      for (const [key, status] of Object.entries(stored)) {
        if (keys.has(key) && VALID_STATUSES.has(status) && status !== 'unattempted') {
          current[key] = status;
        }
      }
      const migrated = migrateOnce(current, keys);
      // Return a sanitized copy, including values possibly written by migration.
      const sanitized = {};
      for (const [key, status] of Object.entries(migrated)) {
        if (keys.has(key) && VALID_STATUSES.has(status) && status !== 'unattempted') {
          sanitized[key] = status;
        }
      }
      return sanitized;
    }

    function get(key) {
      return getAll()[key] || 'unattempted';
    }

    function replace(statuses) {
      if (!statuses || typeof statuses !== 'object' || Array.isArray(statuses)) {
        throw new TypeError('Statuses must be an object.');
      }
      const keys = validKeys();
      const next = {};
      for (const [key, status] of Object.entries(statuses)) {
        if (!keys.has(key)) throw new Error(`Invalid word ID: ${key}`);
        if (!VALID_STATUSES.has(status)) throw new Error(`Invalid status for ${key}: ${status}`);
        if (status !== 'unattempted') next[key] = status;
      }
      storage.setItem(statusKey, JSON.stringify(next));
      storage.setItem(migrationKey, '1');
      return next;
    }

    function set(key, status) {
      if (typeof key !== 'string' || !validKeys().has(key)) throw new Error(`Invalid word ID: ${key}`);
      if (!VALID_STATUSES.has(status)) throw new Error(`Invalid learning status: ${status}`);
      const next = getAll();
      if (status === 'unattempted') delete next[key];
      else next[key] = status;
      storage.setItem(statusKey, JSON.stringify(next));
      storage.setItem(migrationKey, '1');
      return status;
    }

    return {
      statusKey,
      migrationKey,
      validKeys,
      getAll,
      get,
      set,
      replace,
    };
  }

  function normalizeImportedStatuses(data, validKeys) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('Backup data must be a JSON object.');
    }
    const keys = validKeys instanceof Set ? validKeys : new Set(validKeys || []);
    const hasStatuses = Object.prototype.hasOwnProperty.call(data, 'statuses');
    const legacyFields = ['mastery', 'flashcardKnown', 'flashcardUnknown'];
    const hasLegacy = legacyFields.some(field => Object.prototype.hasOwnProperty.call(data, field));
    if (!hasStatuses && !hasLegacy) throw new Error('Backup has no learning statuses.');

    const validateIds = (value, field) => {
      if (!Array.isArray(value)) throw new TypeError(`${field} must be an array of word IDs.`);
      for (const key of value) {
        if (typeof key !== 'string' || !keys.has(key)) throw new Error(`Invalid word ID in ${field}: ${key}`);
      }
      return value;
    };

    const mastery = Object.prototype.hasOwnProperty.call(data, 'mastery')
      ? validateIds(data.mastery, 'mastery') : [];
    const known = Object.prototype.hasOwnProperty.call(data, 'flashcardKnown')
      ? validateIds(data.flashcardKnown, 'flashcardKnown') : [];
    const unknown = Object.prototype.hasOwnProperty.call(data, 'flashcardUnknown')
      ? validateIds(data.flashcardUnknown, 'flashcardUnknown') : [];

    const result = {};
    // A modern status map is complete and authoritative. Legacy arrays are
    // still validated, but cannot resurrect a key the modern map intentionally
    // leaves unattempted.
    if (!hasStatuses) {
      for (const key of known) result[key] = 'perfect';
      for (const key of unknown) result[key] = 'uncertain';
      for (const key of mastery) result[key] = 'perfect';
    }

    if (hasStatuses) {
      const statuses = data.statuses;
      if (!statuses || typeof statuses !== 'object' || Array.isArray(statuses)) {
        throw new TypeError('statuses must be an object mapping word IDs to statuses.');
      }
      for (const [key, status] of Object.entries(statuses)) {
        if (!keys.has(key)) throw new Error(`Invalid word ID in statuses: ${key}`);
        if (!VALID_STATUSES.has(status)) throw new Error(`Invalid status for ${key}: ${status}`);
        if (status === 'unattempted') delete result[key];
        else result[key] = status;
      }
    }
    return result;
  }

  function filterWordsByStatus(words, statuses, filter, getIdentity = defaultIdentity) {
    if (!['all', 'perfect', 'uncertain', 'unattempted'].includes(filter)) {
      throw new Error(`Invalid status filter: ${filter}`);
    }
    if (filter === 'all') return [...words];
    return words.filter(word => (statuses[getIdentity(word)] || 'unattempted') === filter);
  }

  const api = { VALID_STATUSES, createLearningStatusStore, normalizeImportedStatuses, filterWordsByStatus };
  root.LearningStatus = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
