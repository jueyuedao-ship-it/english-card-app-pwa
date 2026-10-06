import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SOURCE_SHA256 = 'b0dd3c635f1c9a4fdf1490c7e5b7c48e8bbe55b652ad0c9860a95f98e10ae498';
const IDENTITY_SHA256 = 'b98f3d3f08a95be2eea9bdb3a541041adf9a006db2c2d311d828e7e59babe1d1';
const hash = value => createHash('sha256').update(value).digest('hex');

export function parseCsv(text) {
  const records = [];
  let record = [], field = '', quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      record.push(field); field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index++;
      record.push(field); records.push(record); record = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (field || record.length) { record.push(field); records.push(record); }
  return records;
}

// Alias groups come from the pinned source itself, rather than broad spelling
// substitutions which can accidentally change an unrelated word.
const csvBytes = readFileSync(join(ROOT, 'data/toeic/cefrj-vocabulary-profile-1.5.csv'));
if (hash(csvBytes) !== SOURCE_SHA256) throw new Error('CEFR-J reference checksum mismatch');
const [header, ...csvRecords] = parseCsv(csvBytes.toString('utf8').replace(/^\uFEFF/, ''));
if (header.slice(0, 3).join(',') !== 'headword,pos,CEFR') throw new Error('Unexpected CEFR-J CSV header');
const reference = csvRecords.filter(row => ['A1', 'A2', 'B1'].includes(row[2]));
const aliases = new Map();
const posAliases = new Map();
function addAlias(map, key, canonical) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(canonical);
}
for (const [headword, pos] of csvRecords) {
  const variants = headword.split('/').map(word => word.trim().toLowerCase());
  const canonical = variants[0];
  for (const variant of [...variants, headword.toLowerCase()]) {
    const posKey = JSON.stringify([variant, pos]);
    addAlias(posAliases, posKey, canonical);
    // Without POS, prefer an explicit variant group (AM -> a.m.). With
    // POS, the be-verb am remains am and cannot match the time abbreviation.
    addAlias(aliases, variant, canonical);
  }
}
for (const [display, original] of [['s', "'s"], ['re', "'re"], ['m', "'m"]]) {
  aliases.set(display, new Set([original]));
  posAliases.set(JSON.stringify([display, 'be-verb']), new Set([original]));
}
// Without POS, the requested time aliases default to the adverb. entryKey
// always supplies POS, so this default cannot affect be-verb am.
for (const variant of ['am', 'a.m.', 'a.m./a.m./am/am']) aliases.set(variant, new Set(['a.m.']));
for (const variant of ['pm', 'p.m.', 'p.m./p.m./pm/pm']) aliases.set(variant, new Set(['p.m.']));

export function normalizeHeadword(value, pos) {
  const word = value.trim().toLowerCase().replace(/[’‘]/g, "'");
  const candidates = pos ? posAliases.get(JSON.stringify([word, pos])) : aliases.get(word);
  if (!candidates) return word;
  if (candidates.size !== 1) throw new Error(`Ambiguous spelling alias: ${value} (${pos || 'unspecified POS'})`);
  return [...candidates][0];
}

export function entryKey(headword, pos, cefr) {
  return JSON.stringify([normalizeHeadword(headword, pos), pos, cefr]);
}

export function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length !== 5021) throw new Error('Expected exactly 5021 curated entries');
  const expectedKeys = new Map(reference.map(([headword, pos, cefr]) => [entryKey(headword, pos, cefr), headword]));
  if (expectedKeys.size !== 5021) throw new Error('CEFR-J source identity collision');
  const seen = new Set();
  for (const [index, item] of entries.entries()) {
    if (item.rank !== index + 1) throw new Error(`Rank/order mismatch at ${index + 1}`);
    for (const field of ['word', 'headword', 'pos', 'cefr', 'priority', 'meaning']) {
      if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`Empty ${field} at ${item.rank}`);
    }
    const key = entryKey(item.headword, item.pos, item.cefr);
    if (!expectedKeys.has(key) || expectedKeys.get(key) !== item.headword) throw new Error(`Unknown source identity at ${item.rank}: ${key}`);
    if (normalizeHeadword(item.word, item.pos) !== normalizeHeadword(item.headword, item.pos)) throw new Error(`Display/source spelling mismatch at ${item.rank}`);
    if (seen.has(key)) throw new Error(`Duplicate source identity at ${item.rank}: ${key}`);
    seen.add(key);
    if (/#(?:ERROR!|NAME\?|N\/A|VALUE!|REF!|DIV\/0!)/i.test(item.meaning)) throw new Error(`Spreadsheet error at ${item.rank}`);
    if (!/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(item.meaning)) throw new Error(`Non-Japanese meaning at ${item.rank}`);
  }
  if (seen.size !== expectedKeys.size) throw new Error('Incomplete CEFR-J source coverage');
  if (hash(JSON.stringify(entries.map(({ word, cefr, priority }) => [word, cefr, priority]))) !== IDENTITY_SHA256) {
    throw new Error('Original word/CEFR/priority/rank identity changed');
  }
  return entries;
}

export function generateParts(entries) {
  validateEntries(entries);
  // Original part sizes: seven parts of 628 entries, then 625 entries.
  return Array.from({ length: 8 }, (_, part) => {
    const rows = entries.slice(part * 628, (part + 1) * 628)
      .map(({ word, meaning, cefr, priority, pos, headword }) => [word, meaning, cefr, priority, pos, headword]);
    return 'window.TOEIC_BRIDGE_WORD_PARTS=window.TOEIC_BRIDGE_WORD_PARTS||[];window.TOEIC_BRIDGE_WORD_PARTS.push('
      + JSON.stringify(rows) + ');\n';
  });
}

function main(args) {
  const check = args.includes('--check');
  const optionValue = flag => {
    const index = args.indexOf(flag);
    if (index < 0) return null;
    if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Missing value for ${flag}`);
    return resolve(args[index + 1]);
  };
  const input = optionValue('--entries') || join(ROOT, 'data/toeic/entries.json');
  const output = optionValue('--output-dir') || ROOT;
  const knownArgs = new Set(['--check', '--entries', '--output-dir']);
  for (let index = 0; index < args.length; index++) {
    if (!knownArgs.has(args[index])) throw new Error(`Unknown argument: ${args[index]}`);
    if (args[index] !== '--check') index++;
  }
  const entries = JSON.parse(readFileSync(input, 'utf8'));
  const parts = generateParts(entries); // Validate every entry before writing any asset.
  if (!check) mkdirSync(output, { recursive: true });
  parts.forEach((content, index) => {
    const path = join(output, `toeic-data-${index + 1}.js`);
    if (check) {
      if (readFileSync(path, 'utf8') !== content) throw new Error(`Generated asset is stale: ${path}`);
    } else writeFileSync(path, content, 'utf8');
  });
  console.log(`${check ? 'Verified' : 'Generated'} 5021 entries; 8 parts; source keys 5021; errors 0; empty 0; non-Japanese 0.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
