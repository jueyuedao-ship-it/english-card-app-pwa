import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const observedPath = path.join(root, 'toeic-observed.js');
const entriesPath = path.join(root, 'data', 'toeic', 'entries.json');
const toeicModePath = path.join(root, 'toeic-mode.js');
const serviceWorkerPath = path.join(root, 'sw.js');

const expected = [
  'wireless',
  'athletics',
  'scooter',
  'lounge',
  'coworker',
  'roommate',
  'subtotal',
  'laundry',
  'organizer',
  'wildflower',
  'hiker',
  'cancellation',
  'appliance',
  'driverless',
  'waiting room',
  'break down',
  'give someone a ride',
  'sell-by date',
  'every second Friday',
  'no extra charge',
  'balance due',
  'sales tax',
  'take part',
  'for sale',
  'along with',
  'in good condition',
  'on request',
  'move out',
];

function loadObservedVocabulary() {
  assert.ok(fs.existsSync(observedPath), 'toeic-observed.js must exist');
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(observedPath, 'utf8'), context, { filename: observedPath });
  return context.window.TOEIC_BRIDGE_OBSERVED;
}

test('keeps the CEFR-J base dataset unchanged at 5,021 entries', () => {
  const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
  assert.equal(entries.length, 5021);
});

test('contains exactly the 28 TOEIC Bridge reading items selected from the supplied questions', () => {
  const rows = loadObservedVocabulary();
  assert.ok(Array.isArray(rows));
  assert.equal(rows.length, 28);
  assert.deepEqual([...rows.map(row => row.word)].sort(), [...expected].sort());
});

test('uses stable observed IDs and does not invent CEFR, priority, or rank metadata', () => {
  const rows = loadObservedVocabulary();
  const ids = rows.map(row => row.id);

  assert.equal(new Set(ids).size, rows.length);
  assert.equal(new Set(rows.map(row => row.word)).size, rows.length);

  for (const row of rows) {
    assert.match(row.id, /^toeic-observed-[a-z0-9-]+$/);
    assert.equal(typeof row.meaning, 'string');
    assert.ok(row.meaning.length > 0);
    assert.ok(row.kind === 'word' || row.kind === 'phrase');
    assert.equal(row.sourceCategory, 'observed');
    assert.equal(row.sourceLabel, '実問題追加');
    assert.ok(Array.isArray(row.sourceRefs) && row.sourceRefs.length > 0);
    assert.equal('cefr' in row, false);
    assert.equal('priority' in row, false);
    assert.equal('rank' in row, false);
  }
});

test('integrates the observed layer into TOEIC mode and the PWA cache', () => {
  const toeicMode = fs.readFileSync(toeicModePath, 'utf8');
  const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');

  assert.match(toeicMode, /toeic-observed\.js/);
  assert.match(toeicMode, /TOEIC_BRIDGE_OBSERVED/);
  assert.match(toeicMode, /実問題追加/);
  assert.match(serviceWorker, /toeic-observed\.js/);
});
