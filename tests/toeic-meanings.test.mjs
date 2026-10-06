import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(root + path, 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const context = { window: {} };
for (let part = 1; part <= 8; part++) {
  vm.runInNewContext(read(`toeic-data-${part}.js`), context);
}
const rows = context.window.TOEIC_BRIDGE_WORD_PARTS.flat();

test('every shipped vocabulary row has a Japanese gloss and original POS identity', () => {
  assert.equal(rows.length, 5021);
  rows.forEach(([word, meaning, cefr, priority, pos, headword], index) => {
    const label = `${index + 1}: ${word}`;
    assert.equal(typeof meaning, 'string', label);
    assert.ok(meaning.trim(), `empty meaning: ${label}`);
    assert.doesNotMatch(meaning, /#(?:ERROR!|NAME\?|N\/A|VALUE!|REF!|DIV\/0!)/i, label);
    assert.match(meaning, /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u, label);
    assert.ok(pos, `missing POS: ${label}`);
    assert.ok(headword, `missing original headword: ${label}`);
  });
});

test('original words, CEFR, priority and rank stay aligned with saved progress and IPA', () => {
  assert.equal(hash(JSON.stringify(rows.map(([word, , cefr, priority]) => [word, cefr, priority]))),
    'b98f3d3f08a95be2eea9bdb3a541041adf9a006db2c2d311d828e7e59babe1d1');
  assert.equal(hash(read('toeic-phonetics.js').replace(/\r\n/g, '\n')), 'a96e3aa85f1d3fc59d26eb547c9384f95f7b89341b678c61b18c3b4a4e22b383');
});

// Expectations are learner senses, independently specified from the generator.
const regressions = [
  ['man', 'A1', 'noun', /男性|男の人/, /マン島/],
  ['tell', 'A1', 'verb', /伝える|話す|教える/, /テル|英雄/],
  ['job', 'A1', 'noun', /仕事|職/, /ヨブ|聖書/],
  ['nice', 'A1', 'adjective', /良い|よい|すてき|素敵|親切/, /ニース/],
  ['mail', 'A1', 'noun', /郵便|メール/, /鎖|よろい/],
  ['mail', 'B1', 'verb', /郵送する|送る/, /鎖|よろい/],
  ['guy', 'A1', 'noun', /男|人/, /控え綱|支え綱/],
  ['file', 'A1', 'noun', /ファイル|書類/, /やすり/],
  ['kid', 'A1', 'noun', /子ども|子供/, /ヤギ/],
  ['kid', 'B1', 'verb', /冗談|からかう/, /ヤギ/],
  ['fine', 'A1', 'adjective', /元気|良い|よい|晴れ|細かい/, /罰金/],
  ['fine', 'B1', 'noun', /罰金/, /元気/],
  ['bear', 'A1', 'noun', /熊|クマ/, /耐える/],
  ['bear', 'A2', 'verb', /耐える|我慢する/, /クマ|星座/],
  ['address', 'A1', 'noun', /住所/, /対処する/],
  ['address', 'B1', 'verb', /話しかける|対処する|宛名|演説する/, /^住所$/],
  ['bacon', 'B1', 'noun', /ベーコン/, /Francis|哲学者|政治家/],
  ['pole', 'B1', 'noun', /棒|柱|極/, /ポーランド人/],
  ['lamb', 'B1', 'noun', /子羊|子ヒツジ|ラム肉/, /Charles|文人|批評家/],
  ['crow', 'B1', 'noun', /カラス/, /クロー族|クロー語/],
  ['mash', 'B1', 'verb', /つぶす|潰す/, /病院|陸軍/],
  ['p.m./P.M./pm/PM', 'A1', 'adverb', /午後/, /paymaster|Magistrate/],
  ['a.m./A.M./am/AM', 'A1', 'adverb', /午前/, /放送|振幅/],
  ['act', 'A2', 'noun', /行為|行動|幕/, /Testing|Territory/],
  ['act', 'B1', 'verb', /行動する|演じる/, /Testing|Territory/],
  ['CD', 'A1', 'noun', /CD|コンパクトディスク/, /deposit|Defense/],
  ['PC', 'A2', 'noun', /パソコン|コンピュータ/, /Peace|部隊/],
  ['TV', 'A1', 'noun', /テレビ/, /^television$/],
  ['windscreen', 'B1', 'noun', /フロントガラス/, /windshield 1/],
  ['shall', 'A2', 'modal auxiliary', /しましょうか|すればよい/, /ものとする/],
  ['whenever', 'B1', 'adverb', /^(?:いつでも|時を問わず)/, /するとき/],
  ['fry', 'A2', 'noun', /フライドポテト/, /揚げ物/],
  ['supposedly', 'B1', 'adverb', /言われている|とされている/, /おそらく/],
  ['immigrate', 'B1', 'verb', /(?:他国|外国).*移住してくる/, /^移住する$/],
];

for (const [word, cefr, pos, expected, rejected] of regressions) {
  test(`${word} (${pos}, ${cefr}) teaches the common meaning`, () => {
    // Before POS is recovered, use CEFR to reproduce the existing mistranslation.
    const matches = rows.filter(row => row[0] === word && row[2] === cefr && (!row[4] || row[4] === pos));
    assert.equal(matches.length, 1);
    assert.match(matches[0][1], expected);
    assert.doesNotMatch(matches[0][1], rejected);
  });
}
