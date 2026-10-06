import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

let generator = {};
try {
  generator = await import('../scripts/generate-toeic-meanings.mjs');
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

test('dictionary spelling aliases preserve POS and resolve to one canonical headword', () => {
  assert.equal(typeof generator.normalizeHeadword, 'function', 'normalization is not implemented');
  const { normalizeHeadword } = generator;
  for (const value of ['a.m.', 'A.M.', 'am', 'AM', 'a.m./A.M./am/AM']) {
    assert.equal(normalizeHeadword(value), 'a.m.');
  }
  for (const value of ['p.m.', 'P.M.', 'pm', 'PM', 'p.m./P.M./pm/PM']) {
    assert.equal(normalizeHeadword(value), 'p.m.');
  }
  assert.equal(normalizeHeadword('recognize'), normalizeHeadword('recognise'));
  assert.equal(normalizeHeadword('recognize/recognise'), normalizeHeadword('recognise'));
  assert.equal(normalizeHeadword('colour'), normalizeHeadword('color/colour'));
  assert.equal(normalizeHeadword('defence'), normalizeHeadword('defense/defence'));
  assert.equal(normalizeHeadword('s'), "'s");
  assert.equal(normalizeHeadword('re'), "'re");
  assert.equal(normalizeHeadword('m'), "'m");
  assert.equal(normalizeHeadword('TRUE'), 'true');
  assert.equal(normalizeHeadword('FALSE'), 'false');
  assert.equal(normalizeHeadword('am', 'be-verb'), 'am');
  assert.equal(normalizeHeadword('AM', 'adverb'), 'a.m.');
  assert.throws(() => normalizeHeadword('check-in', 'noun'), /Ambiguous/);
  assert.notEqual(normalizeHeadword('check-in counter/check-in', 'noun'), normalizeHeadword('check-in desk/check-in', 'noun'));
});

test('translation keys keep noun, verb and CEFR records separate', () => {
  assert.equal(typeof generator.entryKey, 'function', 'POS identity is not implemented');
  const { entryKey } = generator;
  assert.notEqual(entryKey('fine', 'adjective', 'A1'), entryKey('fine', 'noun', 'B1'));
  assert.notEqual(entryKey('work', 'noun', 'A1'), entryKey('work', 'verb', 'A1'));
  assert.notEqual(entryKey('open', 'verb', 'A1'), entryKey('open', 'verb', 'A2'));
  assert.equal(entryKey('recognise', 'verb', 'B1'), entryKey('recognize/recognise', 'verb', 'B1'));
  assert.notEqual(entryKey('am', 'be-verb', 'A1'), entryKey('AM', 'adverb', 'A1'));
});

test('CEFR-J CSV parsing handles quoted headwords, CRLF and empty fields', () => {
  assert.equal(typeof generator.parseCsv, 'function', 'CSV parsing is not implemented');
  assert.deepEqual(generator.parseCsv('headword,pos,CEFR,extra\r\n"some, word",noun,A1,\r\n"a""b",verb,B1,"two\nlines"\r\n'), [
    ['headword', 'pos', 'CEFR', 'extra'],
    ['some, word', 'noun', 'A1', ''],
    ['a"b', 'verb', 'B1', 'two\nlines'],
  ]);
});

const root = fileURLToPath(new URL('../', import.meta.url));
const entries = JSON.parse(readFileSync(join(root, 'data/toeic/entries.json'), 'utf8'));

test('all 5021 curated source identities are covered exactly once', () => {
  assert.doesNotThrow(() => generator.validateEntries(entries));
  const fewer = entries.slice(0, -1);
  assert.throws(() => generator.validateEntries(fewer), /5021/);
  const duplicate = structuredClone(entries);
  duplicate[1] = { ...duplicate[0], rank: 2 };
  assert.throws(() => generator.validateEntries(duplicate), /Duplicate source identity/);
  const wrongPos = structuredClone(entries);
  wrongPos[65].pos = 'verb'; // man is a noun in the source.
  assert.throws(() => generator.validateEntries(wrongPos), /Unknown source identity/);
});

for (const [meaning, expected] of [
  [' ', /Empty meaning/], ['#ERROR!', /Spreadsheet error/],
  ['#NAME?', /Spreadsheet error/], ['television', /Non-Japanese meaning/],
]) {
  test(`generation refuses a meaning of ${JSON.stringify(meaning)}`, () => {
    const invalid = structuredClone(entries);
    invalid[0].meaning = meaning;
    assert.throws(() => generator.generateParts(invalid), expected);
  });
}

test('generation refuses rank and existing identity changes', () => {
  const rankChanged = structuredClone(entries);
  rankChanged[0].rank = 2;
  assert.throws(() => generator.generateParts(rankChanged), /Rank\/order mismatch/);
  const priorityChanged = structuredClone(entries);
  priorityChanged[0].priority = 'C';
  assert.throws(() => generator.generateParts(priorityChanged), /identity changed/);
  const swapped = structuredClone(entries);
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  swapped[0].rank = 1; swapped[1].rank = 2;
  assert.throws(() => generator.generateParts(swapped), /identity changed/);
});

test('all eight checked-in assets reproduce exactly from the curated source', () => {
  const parts = generator.generateParts(entries);
  assert.equal(parts.length, 8);
  parts.forEach((part, index) => assert.equal(part, readFileSync(join(root, `toeic-data-${index + 1}.js`), 'utf8')));
  const check = spawnSync(process.execPath, ['scripts/generate-toeic-meanings.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /Verified 5021 entries/);
});

test('CLI validates all rows before creating any output assets', () => {
  const directory = mkdtempSync(join(tmpdir(), 'toeic-invalid-'));
  try {
    const invalid = structuredClone(entries);
    invalid.at(-1).meaning = '#NAME?';
    const input = join(directory, 'entries.json');
    const output = join(directory, 'generated');
    writeFileSync(input, JSON.stringify(invalid));
    const result = spawnSync(process.execPath, ['scripts/generate-toeic-meanings.mjs', '--entries', input, '--output-dir', output], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Spreadsheet error at 5021/);
    assert.deepEqual(readdirSync(directory), ['entries.json']);
  } finally {
    assert.equal(resolve(dirname(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('toeic-invalid-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
