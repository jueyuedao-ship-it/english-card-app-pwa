import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadToeicRows() {
  const rows = [];
  for (let i = 1; i <= 8; i++) {
    const source = readFileSync(join(root, `toeic-data-${i}.js`), 'utf8');
    const start = source.indexOf('.push(');
    assert.notEqual(start, -1, `toeic-data-${i}.js must contain .push(...)`);
    const json = source.slice(start + 6, source.lastIndexOf(');'));
    rows.push(...JSON.parse(json));
  }
  return rows;
}

function loadPhonetics() {
  const source = readFileSync(join(root, 'toeic-phonetics.js'), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: 'toeic-phonetics.js' });
  return context.window.TOEIC_BRIDGE_PHONETICS;
}

test('TOEIC Bridge IPA data covers all 5,021 vocabulary rows', () => {
  const rows = loadToeicRows();
  const phonetics = loadPhonetics();

  assert.equal(rows.length, 5021);
  assert.ok(Array.isArray(phonetics));
  assert.equal(phonetics.length, rows.length);

  phonetics.forEach((ipa, index) => {
    assert.equal(typeof ipa, 'string', `row ${index + 1} must have an IPA string`);
    assert.match(ipa, /^\/.+\/$/, `row ${index + 1} must be wrapped in slashes`);
    assert.doesNotMatch(ipa, /[*?]/, `row ${index + 1} must not contain a missing-pronunciation marker`);
  });
});

test('TOEIC list integrates and renders the phonetic field', () => {
  const modeSource = readFileSync(join(root, 'toeic-mode.js'), 'utf8');
  const appSource = readFileSync(join(root, 'app.js'), 'utf8');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const css = readFileSync(join(root, 'styles.css'), 'utf8');
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');

  assert.match(modeSource, /phonetic\s*:/, 'TOEIC rows must receive a phonetic field');
  assert.match(appSource, /word-phonetic/, 'the shared list renderer must render a phonetic element');
  assert.match(appSource, /if\s*\(w\.phonetic\)/, 'the renderer must display phonetics when a word provides one');
  assert.match(html, /toeic-phonetics\.js["']/, 'the pronunciation asset must load in the app');
  assert.ok(html.indexOf('toeic-phonetics.js') < html.indexOf('toeic-mode.js'), 'pronunciation data must load before toeic-mode.js');
  assert.match(css, /\.word-phonetic\b/, 'pronunciation styling must exist');
  assert.match(sw, /\.\/toeic-phonetics\.js/, 'the PWA cache must include pronunciation data');
});
