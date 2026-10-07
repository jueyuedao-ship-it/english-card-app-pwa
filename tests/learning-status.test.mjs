import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { createLearningStatusStore, normalizeImportedStatuses, filterWordsByStatus } = require('../learning-status.js');
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    dump() { return Object.fromEntries(values); },
  };
}

test('legacy migration merges mastery, unknown, and known with the documented precedence', () => {
  const storage = createStorage({
    wordcard_mastery: JSON.stringify(['mastered', 'overlap']),
    wordcard_unknown: JSON.stringify(['overlap', 'uncertain', 'legacy-invalid']),
    wordcard_known: JSON.stringify(['overlap', 'uncertain', 'known']),
  });
  const store = createLearningStatusStore({
    storage,
    prefix: 'wordcard_',
    getWords: () => [
      { word: 'mastered' }, { word: 'overlap' }, { word: 'uncertain' }, { word: 'known' },
    ],
  });

  assert.deepEqual(store.getAll(), {
    mastered: 'perfect',
    overlap: 'perfect',
    uncertain: 'uncertain',
    known: 'perfect',
  });
  assert.equal(storage.getItem('wordcard_statuses_migrated_v1'), '1');
});

test('latest card or quiz result replaces status, and explicit clearing never re-migrates', () => {
  const storage = createStorage({ wordcard_mastery: JSON.stringify(['add']) });
  const words = [{ word: 'add' }];
  let store = createLearningStatusStore({ storage, prefix: 'wordcard_', getWords: () => words });
  assert.equal(store.get('add'), 'perfect');

  store.set('add', 'uncertain');
  assert.equal(store.get('add'), 'uncertain');
  store.set('add', 'perfect');
  assert.equal(store.get('add'), 'perfect');
  store.set('add', 'unattempted');
  assert.equal(store.get('add'), 'unattempted');

  store = createLearningStatusStore({ storage, prefix: 'wordcard_', getWords: () => words });
  assert.equal(store.get('add'), 'unattempted');
});

test('TOEIC rank IDs keep same-spelling POS entries separate and mode namespaces isolated', () => {
  const storage = createStorage();
  const toeicWords = [
    { id: 'toeic-1', word: 'fine', pos: 'adjective' },
    { id: 'toeic-2', word: 'fine', pos: 'noun' },
  ];
  const toeic = createLearningStatusStore({ storage, prefix: 'wordcard_toeic_', getWords: () => toeicWords });
  const kosen = createLearningStatusStore({ storage, prefix: 'wordcard_', getWords: () => [{ word: 'fine' }] });

  toeic.set('toeic-1', 'perfect');
  toeic.set('toeic-2', 'uncertain');
  kosen.set('fine', 'perfect');
  assert.equal(toeic.get('toeic-1'), 'perfect');
  assert.equal(toeic.get('toeic-2'), 'uncertain');
  assert.equal(kosen.get('fine'), 'perfect');
  assert.deepEqual(toeic.getAll(), { 'toeic-1': 'perfect', 'toeic-2': 'uncertain' });
});

test('import validates all IDs and states before producing a replacement map', () => {
  const valid = new Set(['toeic-1', 'toeic-2']);
  assert.deepEqual(normalizeImportedStatuses({ statuses: { 'toeic-1': 'perfect', 'toeic-2': 'unattempted' } }, valid), {
    'toeic-1': 'perfect',
  });
  assert.deepEqual(normalizeImportedStatuses({ mastery: ['toeic-1'], flashcardUnknown: ['toeic-2'] }, valid), {
    'toeic-1': 'perfect',
    'toeic-2': 'uncertain',
  });
  assert.deepEqual(normalizeImportedStatuses({
    statuses: { 'toeic-1': 'unattempted' },
    mastery: ['toeic-1'],
    flashcardKnown: ['toeic-1'],
  }, valid), {});
  assert.throws(() => normalizeImportedStatuses({ statuses: { 'toeic-1': 'maybe' } }, valid), /status/i);
  assert.throws(() => normalizeImportedStatuses({ mastery: ['not-a-rank'] }, valid), /ID/i);
});

test('status filters intersect with already page- or priority-filtered words', () => {
  const words = [
    { id: 'toeic-1', page: 1 },
    { id: 'toeic-2', page: 2 },
    { id: 'toeic-3', page: 2 },
  ];
  const statuses = { 'toeic-1': 'perfect', 'toeic-2': 'uncertain' };
  const selectedByPage = words.filter(word => word.page === 2);
  assert.deepEqual(filterWordsByStatus(selectedByPage, statuses, 'uncertain'), [words[1]]);
  assert.deepEqual(filterWordsByStatus(selectedByPage, statuses, 'unattempted'), [words[2]]);
});

class FakeClassList {
  constructor(owner) { this.owner = owner; this.values = new Set(); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.values.has(name) : Boolean(force);
    if (shouldAdd) this.values.add(name);
    else this.values.delete(name);
    return shouldAdd;
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.classList = new FakeClassList(this);
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.disabled = false;
    this.hidden = false;
    this.onclick = null;
  }
  set className(value) {
    this._className = value;
    this.classList.values = new Set(String(value).split(/\s+/).filter(Boolean));
  }
  get className() { return this._className || [...this.classList.values].join(' '); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  set innerHTML(value) {
    this._innerHTML = value;
    if (value === '') this.children = [];
  }
  get innerHTML() { return this._innerHTML || ''; }
  addEventListener(name, fn) { this[`on${name}`] = fn; }
  click() { this.onclick?.(); }
  closest(selector) {
    const selectors = selector.split(',').map(value => value.trim());
    let current = this;
    while (current) {
      for (const item of selectors) {
        if (item.startsWith('.') && current.classList.contains(item.slice(1))) return current;
        if (/^[a-z]+$/i.test(item) && current.tagName.toLowerCase() === item.toLowerCase()) return current;
        if (item === '[contenteditable]' && current.getAttribute('contenteditable') !== null) return current;
        if (item === '[role="textbox"]' && current.getAttribute('role') === 'textbox') return current;
      }
      current = current.parentNode;
    }
    return null;
  }
  querySelectorAll(selector) {
    const descendants = [];
    const visit = element => element.children.forEach(child => {
      descendants.push(child);
      visit(child);
    });
    visit(this);
    const classes = [...selector.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
    const datasets = [...selector.matchAll(/\[data-([\w-]+)="([^"]+)"\]/g)];
    return descendants.filter(child => {
      if (classes.some(name => !child.classList.contains(name))) return false;
      for (const [, key, value] of datasets) {
        const datasetKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        if (child.dataset[datasetKey] !== value) return false;
      }
      if (selector === '[data-status-filter]' && !child.dataset.statusFilter) return false;
      if (/:checked/.test(selector) && !child.checked) return false;
      if (/^input\b/.test(selector) && child.tagName !== 'INPUT') return false;
      return true;
    });
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function createAppHarness(seed = {}) {
  const values = new Map(Object.entries(seed));
  const listeners = new Map();
  const elements = new Map();
  const timers = [];
  const captured = { exportData: null, alerts: [] };
  const flashcardControls = [new FakeElement('button'), new FakeElement('button')];
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    dump() { return Object.fromEntries(values); },
  };
  const document = {
    body: new FakeElement('body'),
    addEventListener(name, fn) {
      const entries = listeners.get(name) || [];
      entries.push(fn);
      listeners.set(name, entries);
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    createElement(tagName) {
      const element = new FakeElement(tagName);
      if (tagName === 'a') element.click = () => { captured.exportData = element.href; };
      return element;
    },
    createTextNode(text) { const node = new FakeElement('#text'); node.textContent = text; return node; },
    querySelectorAll(selector) {
      if (selector === '#panel-flashcard .card-controls button') {
        return flashcardControls;
      }
      if (selector === '#quizOptions .quiz-option') return document.getElementById('quizOptions').querySelectorAll('.quiz-option');
      if (selector === '.tab' || selector === '.mode-panel') return [];
      return [];
    },
    querySelector(selector) {
      return selector === '.header h1' ? document.getElementById('headerTitle') : null;
    },
  };
  const window = { addEventListener() {}, scrollTo() {} };
  class FakeFileReader {
    readAsText(file) { this.onload({ target: { result: file.contents } }); }
  }
  class FakeBlob {
    constructor(parts) { this.contents = parts.join(''); }
  }
  const context = {
    console,
    document,
    window,
    localStorage,
    LearningStatus: require('../learning-status.js'),
    FileReader: FakeFileReader,
    Blob: FakeBlob,
    URL: { createObjectURL: blob => blob.contents, revokeObjectURL() {} },
    alert: message => captured.alerts.push(message),
    setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {},
    Math,
    Date,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(repositoryRoot, 'app.js'), 'utf8'), context, { filename: 'app.js' });
  vm.runInContext(`globalThis.testApi = {
    state,
    setWords(words) { WORD_DATA.words = words; },
    getStatus: getWordStatus,
    setStatus: setWordStatus,
    getStatuses: getLearningStatuses,
    getFlashcardStats() { return getFlashcardStats(); },
    initFlashcard,
    markCard,
    toggleShuffle,
    togglePageOrder,
    switchTab,
    initQuiz,
    checkQuiz,
    getFilteredWords(key) { return getFilteredWords(key); },
    setupPageFilter(key) { return setupPageFilter(key); },
    savePageFilter(key) { return savePageFilter(key); },
    renderList,
    setLearningFilter,
    exportProgress,
    importProgress,
    getMastery,
  };`, context);
  const api = context.testApi;
  const clickStatusTag = button => {
    const target = { closest: selector => selector === '.status-tag' ? button : null };
    for (const listener of listeners.get('click') || []) listener({ target });
  };
  const runTimers = () => {
    while (timers.length) timers.shift().fn();
  };
  const dispatchKeydown = event => {
    for (const listener of listeners.get('keydown') || []) listener(event);
  };
  return { api, context, document, localStorage, elements, timers, captured, clickStatusTag, runTimers, dispatchKeydown };
}

async function loadToeicMode(app) {
  app.document.head = {
    appendChild(script) {
      const filename = script.src.replace(/^\.\//, '');
      vm.runInContext(readFileSync(join(repositoryRoot, filename), 'utf8'), app.context, { filename });
      script.onload?.();
    },
  };
  vm.runInContext(readFileSync(join(repositoryRoot, 'toeic-phonetics.js'), 'utf8'), app.context, { filename: 'toeic-phonetics.js' });
  vm.runInContext(readFileSync(join(repositoryRoot, 'toeic-mode.js'), 'utf8'), app.context, { filename: 'toeic-mode.js' });
  await new Promise(resolve => setImmediate(resolve));
}

function sampleWords() {
  return [
    { word: 'alpha', meaning: '最初', page: 1 },
    { word: 'bravo', meaning: '勇敢', page: 1 },
    { word: 'charlie', meaning: '人名', page: 2 },
    { word: 'delta', meaning: '差', page: 2 },
  ];
}

test('real flashcard, quiz, and list handlers replace and clear one shared status', () => {
  const app = createAppHarness();
  const words = sampleWords();
  app.api.setWords(words);
  app.api.initFlashcard();

  app.api.markCard(false);
  assert.equal(app.api.getStatus('alpha'), 'uncertain');
  assert.equal(app.elements.get('flashcardStats').textContent, '2/4 | 知っていた: 0 | 知っていなかった: 1');
  app.api.toggleShuffle();
  app.api.togglePageOrder();
  assert.equal(app.api.getStatus('alpha'), 'uncertain', 'order controls retain status history');

  app.api.state.quizPageOrder = true;
  app.api.initQuiz();
  assert.equal(app.api.state.quizOrder[0].word, 'alpha');
  let options = app.elements.get('quizOptions').children;
  const correctOption = options.find(button => button.textContent === '最初');
  correctOption.onclick();
  assert.equal(app.api.getStatus('alpha'), 'perfect');
  correctOption.onclick();
  assert.equal(app.api.state.quizTotal, 1, 'a second click cannot submit the same question twice');

  app.runTimers();
  app.api.initQuiz();
  options = app.elements.get('quizOptions').children;
  const wrongOption = options.find(button => button.textContent !== '最初');
  wrongOption.onclick();
  assert.equal(app.api.getStatus('alpha'), 'uncertain', 'the latest quiz result replaces perfect status');

  app.api.setLearningFilter('list', 'all');
  const row = app.elements.get('wordTableBody').children[0];
  const perfectTag = row.children[3].children.find(child => child.classList.contains('status-tag-perfect'));
  app.clickStatusTag(perfectTag);
  assert.equal(app.api.getStatus('alpha'), 'perfect', 'the list can manually set perfect');
  let updatedRow = app.elements.get('wordTableBody').children[0];
  const nextUncertainTag = updatedRow.children[3].children.find(child => child.classList.contains('status-tag-uncertain'));
  app.clickStatusTag(nextUncertainTag);
  assert.equal(app.api.getStatus('alpha'), 'uncertain', 'the list can manually set uncertain');

  updatedRow = app.elements.get('wordTableBody').children[0];
  const uncertainTag = updatedRow.children[3].children.find(child => child.classList.contains('status-tag-uncertain'));
  app.clickStatusTag(uncertainTag);
  assert.equal(app.api.getStatus('alpha'), 'unattempted', 'clicking the selected manual tag clears the status');

  app.api.renderList();
  const cleared = app.elements.get('wordTableBody').children[0].children[3];
  assert.equal(cleared.children[2].textContent, '未挑戦');
  assert.equal(cleared.children[2].hidden, false);

  app.api.setStatus('bravo', 'perfect');
  app.api.setStatus('charlie', 'uncertain');
  app.api.setStatus('delta', 'perfect');
  app.localStorage.setItem('wordcard_page_filter_list', JSON.stringify([2]));
  app.api.setLearningFilter('list', 'perfect');
  assert.deepEqual(app.elements.get('wordTableBody').children.map(row => row.children[0].textContent), ['delta']);
  app.api.setLearningFilter('list', 'uncertain');
  assert.deepEqual(app.elements.get('wordTableBody').children.map(row => row.children[0].textContent), ['charlie']);
  app.api.setStatus('delta', 'unattempted');
  app.api.setLearningFilter('list', 'unattempted');
  assert.deepEqual(app.elements.get('wordTableBody').children.map(row => row.children[0].textContent), ['delta']);

  app.api.setLearningFilter('flashcard', 'perfect');
  app.api.setStatus('bravo', 'uncertain');
  app.api.switchTab('flashcard');
  assert.equal(app.elements.get('flashcardWord').textContent, '');
  assert.equal(app.document.getElementById('flashcard').getAttribute('aria-disabled'), 'true');
  assert.ok(app.document.querySelectorAll('#panel-flashcard .card-controls button').every(button => button.disabled));

  const reloaded = createAppHarness(app.localStorage.dump());
  reloaded.api.setWords(words);
  assert.equal(reloaded.api.getStatus('alpha'), 'unattempted');
  assert.equal(reloaded.api.getStatus('bravo'), 'uncertain');
});

test('flashcard and quiz status filters show empty states without stale answer controls', () => {
  const app = createAppHarness();
  app.api.setWords(sampleWords());
  app.api.setStatus('alpha', 'perfect');
  app.api.setLearningFilter('flashcard', 'uncertain');
  assert.equal(app.elements.get('flashcardWord').textContent, '');
  assert.match(app.elements.get('flashcardStats').textContent, /条件に合う単語がありません/);
  assert.equal(app.document.getElementById('flashcard').getAttribute('aria-disabled'), 'true');
  assert.equal(app.api.state.flashcardOrder.length, 0);

  app.api.setLearningFilter('quiz', 'uncertain');
  assert.equal(app.elements.get('quizWord').textContent, '');
  assert.match(app.elements.get('quizResult').textContent, /条件に合う単語がありません/);
  assert.equal(app.elements.get('quizOptions').children.length, 0);
});

test('quiz completion preserves retry behavior and delayed feedback cannot cross study modes', () => {
  const app = createAppHarness();
  const words = [sampleWords()[0]];
  app.api.setWords(words);
  app.api.state.quizPageOrder = true;
  app.api.initQuiz();
  const correct = app.elements.get('quizOptions').children.find(button => button.textContent === '最初');
  correct.onclick();
  app.runTimers();
  assert.equal(app.elements.get('quizWord').textContent, '✓完了！');
  const retry = app.elements.get('quizOptions').children[0];
  assert.equal(retry.textContent, 'もう一度');
  retry.onclick();
  assert.equal(app.elements.get('quizWord').textContent, '最初' === words[0].meaning ? words[0].word : words[0].meaning);

  const oldQuestion = app.api.state.quizOrder[0];
  const oldButton = app.elements.get('quizOptions').children.find(button => button.textContent === oldQuestion.meaning);
  oldButton.onclick();
  assert.equal(app.timers.length, 1);
  app.api.state.studyMode = 'toeic';
  app.api.setWords([{ id: 'toeic-1', word: 'alpha', meaning: '最初', cefr: 'A1', priority: 'S', rank: 1, page: 1 }]);
  app.runTimers();
  assert.equal(app.api.getStatus('toeic-1'), 'unattempted');
  assert.equal(app.api.state.quizSeen.has('alpha'), false);
});

test('canonical export and import cannot resurrect a manually cleared legacy status', () => {
  const app = createAppHarness({
    wordcard_mastery: JSON.stringify(['alpha']),
    wordcard_known: JSON.stringify(['alpha']),
  });
  app.api.setWords(sampleWords());
  assert.equal(app.api.getStatus('alpha'), 'perfect');
  app.api.setStatus('alpha', 'unattempted');
  app.api.exportProgress();
  const backup = JSON.parse(app.captured.exportData);
  assert.equal(Object.hasOwn(backup.statuses, 'alpha'), false);
  assert.equal(backup.mastery.includes('alpha'), false);
  assert.equal(backup.flashcardKnown.includes('alpha'), false);

  app.api.setStatus('alpha', 'uncertain');
  app.api.importProgress({ target: { files: [{ contents: app.captured.exportData }], value: 'backup.json' } });
  assert.equal(app.api.getStatus('alpha'), 'unattempted');
});

test('shared list renderer displays the supplied TOEIC phonetic field', () => {
  const app = createAppHarness();
  app.api.state.studyMode = 'toeic';
  app.api.setWords([{ id: 'toeic-1', word: 'apple', meaning: 'りんご', phonetic: '/ˈæp.əl/', cefr: 'A1', priority: 'S', rank: 1, page: 1 }]);
  app.api.renderList();
  const wordCell = app.elements.get('wordTableBody').children[0].children[0];
  assert.equal(wordCell.children[1].className, 'word-phonetic');
  assert.equal(wordCell.children[1].textContent, '/ˈæp.əl/');
});

test('study shortcuts leave focused filter buttons to native keyboard activation', () => {
  const app = createAppHarness();
  app.api.setWords(sampleWords());
  app.api.initFlashcard();
  const filterButton = new FakeElement('button');
  filterButton.dataset.statusFilter = 'uncertain';
  let prevented = 0;

  app.dispatchKeydown({ code: 'Enter', target: filterButton, preventDefault() { prevented++; } });
  assert.equal(prevented, 0, 'Enter is not intercepted on an interactive button');
  assert.equal(app.api.getStatus('alpha'), 'unattempted');
  assert.equal(app.elements.get('flashcardWord').textContent, 'alpha');

  app.dispatchKeydown({ code: 'Space', target: filterButton, preventDefault() { prevented++; } });
  assert.equal(prevented, 0, 'Space remains available for native button activation');
  assert.equal(app.document.getElementById('flashcard').classList.contains('card-flipped'), false);

  app.dispatchKeydown({ code: 'Enter', target: app.document.body, preventDefault() { prevented++; } });
  assert.equal(prevented, 1, 'body-scoped Enter keeps its card-answer shortcut');
  assert.equal(app.api.getStatus('alpha'), 'perfect');
  assert.equal(app.elements.get('flashcardWord').textContent, 'bravo');

  app.dispatchKeydown({ code: 'Space', target: app.document.body, preventDefault() { prevented++; } });
  assert.equal(prevented, 2, 'body-scoped Space keeps its card-flip shortcut');
  assert.equal(app.document.getElementById('flashcard').classList.contains('card-flipped'), true);
});

test('multiword status-filtered quiz visits each eligible identity once', () => {
  const app = createAppHarness();
  const words = sampleWords().slice(0, 3);
  app.api.setWords(words);
  app.api.state.quizPageOrder = true;
  app.api.setLearningFilter('quiz', 'unattempted');
  const visited = [];

  for (const expected of words) {
    assert.equal(app.api.state.quizOrder[0]?.word, expected.word);
    visited.push(app.api.state.quizOrder[0].word);
    const wrong = app.elements.get('quizOptions').children.find(button => button.textContent !== expected.meaning);
    wrong.onclick();
    app.runTimers();
  }

  assert.deepEqual(visited, words.map(word => word.word));
  assert.equal(new Set(visited).size, words.length);
  assert.match(app.elements.get('quizResult').textContent, /条件に合う単語がありません/);
  assert.equal(app.elements.get('quizOptions').children.length, 0);
});

test('actual TOEIC mode lifecycle keeps status namespaces isolated and intersects CEFR priority filters', async () => {
  const app = createAppHarness();
  app.api.setWords(sampleWords());
  app.api.setStatus('alpha', 'perfect');
  await loadToeicMode(app);
  app.localStorage.setItem('wordcard_toeic_mastery', JSON.stringify(['toeic-66', 'toeic-2577']));
  app.localStorage.setItem('wordcard_toeic_known', JSON.stringify(['toeic-594']));

  await app.context.window.chooseStudyMode('toeic');
  assert.equal(app.api.state.studyMode, 'toeic');
  const expectedPerfect = ['toeic-2577', 'toeic-594', 'toeic-66'];
  assert.deepEqual([...app.api.getMastery()].sort(), expectedPerfect);
  assert.deepEqual([...app.api.getFlashcardStats().known].sort(), expectedPerfect);
  app.api.setStatus('toeic-66', 'uncertain');

  app.api.setupPageFilter('list');
  const grid = app.document.getElementById('listPageGrid');
  grid.querySelectorAll('.toeic-priority-toggle').forEach(input => {
    input.checked = input.dataset.cefr === 'B1' && input.value === 'B';
  });
  app.api.savePageFilter('list');
  assert.deepEqual(JSON.parse(app.localStorage.getItem('wordcard_toeic_list_cefr_priority_filter_v1')), {
    A1: [], A2: [], B1: ['B'],
  });
  const eligible = app.api.getFilteredWords('list');
  assert.ok(eligible.length > 2);
  assert.ok(eligible.every(word => word.cefr === 'B1' && word.priority === 'B'));

  const uncertainWord = eligible[0];
  const perfectWord = eligible[1];
  app.api.setStatus(uncertainWord, 'uncertain');
  app.api.setStatus(perfectWord, 'perfect');
  app.api.setLearningFilter('list', 'uncertain');
  assert.deepEqual(
    app.elements.get('wordTableBody').children.map(row => row.children[3].children[0]._wordKey),
    [uncertainWord.id],
  );

  app.context.window.returnToStudyModeHome();
  await app.context.window.chooseStudyMode('kosen');
  assert.equal(app.api.state.studyMode, 'kosen');
  assert.equal(app.api.getStatus('alpha'), 'perfect');

  app.context.window.returnToStudyModeHome();
  await app.context.window.chooseStudyMode('toeic');
  assert.equal(app.api.getStatus('toeic-66'), 'uncertain');
  assert.equal(app.api.getStatus(uncertainWord.id), 'uncertain');
});

test('status labels keep a readable root-relative size in desktop and TOEIC mobile rules', () => {
  const css = readFileSync(join(repositoryRoot, 'styles.css'), 'utf8');
  const baseTag = css.match(/\.status-tag\s*\{([^}]*)\}/)?.[1] || '';
  const toeicTag = css.match(/\.toeic-mode \.status-tag\s*\{([^}]*)\}/)?.[1] || '';
  const emptyLabel = css.match(/\.status-empty\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(baseTag, /font-size:\s*\.75rem/);
  assert.match(toeicTag, /font-size:\s*\.75rem/);
  assert.match(emptyLabel, /font-size:\s*\.75rem/);
});
