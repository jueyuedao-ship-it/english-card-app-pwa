import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { upgradeIpaCacheVersion } from './ipa-cache-version.mjs';

const DATA_FILES = Array.from({ length: 8 }, (_, i) => `toeic-data-${i + 1}.js`);
const CMUDICT_URL = 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict';

const PHONE_TO_IPA = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  EH: 'ɛ', ER: 'ɝ', EY: 'eɪ', IH: 'ɪ', IY: 'i', OW: 'oʊ',
  OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h',
  JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', P: 'p',
  R: 'ɹ', S: 's', SH: 'ʃ', T: 't', TH: 'θ', V: 'v', W: 'w',
  Y: 'j', Z: 'z', ZH: 'ʒ',
};

const VOWELS = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']);
const ONSETS = new Set([
  'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH',
  'B L', 'B R', 'D R', 'D W', 'F L', 'F R', 'G L', 'G R', 'K L', 'K R', 'K W', 'P L', 'P R', 'S K', 'S L', 'S M', 'S N', 'S P', 'S T', 'S W', 'SH R', 'T R', 'T W', 'TH R',
  'S K R', 'S K W', 'S P L', 'S P R', 'S T R',
]);

const TOKEN_OVERRIDES = new Map([
  ['s', [{ base: 'Z', stress: null }]],
  ['re', [{ base: 'ER', stress: '0' }]],
  ['m', [{ base: 'M', stress: null }]],
  ['ve', [{ base: 'V', stress: null }]],
  ['ll', [{ base: 'L', stress: null }]],
  ['d', [{ base: 'D', stress: null }]],
]);

function readRows() {
  const rows = [];
  for (const file of DATA_FILES) {
    const source = readFileSync(file, 'utf8');
    const start = source.indexOf('.push(');
    if (start === -1) throw new Error(`${file}: missing .push(...)`);
    const end = source.lastIndexOf(');');
    if (end === -1) throw new Error(`${file}: missing closing );`);
    rows.push(...JSON.parse(source.slice(start + 6, end)));
  }
  return rows;
}

function parsePhones(raw) {
  return raw.trim().split(/\s+/).map(phone => {
    const match = phone.match(/^([A-Z]+)([012])?$/);
    if (!match) throw new Error(`Unexpected ARPAbet phone: ${phone}`);
    return { base: match[1], stress: match[2] ?? null };
  });
}

function vowelIpa(base, stress) {
  if (base === 'AH' && stress === '0') return 'ə';
  if (base === 'ER' && stress === '0') return 'ɚ';
  return PHONE_TO_IPA[base];
}

function onsetStartForVowel(phones, vowelIndex, previousVowelIndex) {
  if (previousVowelIndex === -1) return 0;
  const clusterStart = previousVowelIndex + 1;
  if (clusterStart >= vowelIndex) return vowelIndex;

  for (let start = clusterStart; start < vowelIndex; start++) {
    const cluster = phones.slice(start, vowelIndex).map(phone => phone.base).join(' ');
    if (ONSETS.has(cluster)) return start;
  }
  return vowelIndex;
}

function phonesToIpa(phones) {
  const stressBefore = new Map();
  let previousVowelIndex = -1;

  phones.forEach((phone, index) => {
    if (!VOWELS.has(phone.base)) return;
    if (phone.stress === '1' || phone.stress === '2') {
      const onsetStart = onsetStartForVowel(phones, index, previousVowelIndex);
      stressBefore.set(onsetStart, phone.stress === '1' ? 'ˈ' : 'ˌ');
    }
    previousVowelIndex = index;
  });

  return phones.map((phone, index) => {
    const marker = stressBefore.get(index) || '';
    const symbol = VOWELS.has(phone.base)
      ? vowelIpa(phone.base, phone.stress)
      : PHONE_TO_IPA[phone.base];
    if (!symbol) throw new Error(`No IPA mapping for ${phone.base}`);
    return marker + symbol;
  }).join('');
}

function parseCmu(text) {
  const dict = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';;;')) continue;
    const match = trimmed.match(/^(\S+)\s+(.+)$/);
    if (!match) continue;
    const rawWord = match[1].toLowerCase();
    const word = rawWord.replace(/\(\d+\)$/, '');
    const phones = match[2].replace(/\s+#.*$/, '').trim();
    if (phones && !dict.has(word)) dict.set(word, parsePhones(phones));
  }
  return dict;
}

function cleanEntryText(value) {
  return value
    .normalize('NFKC')
    .replace(/[’‘]/g, "'")
    .trim();
}

function lookupToken(token, dict) {
  const normalized = token.toLowerCase();
  if (TOKEN_OVERRIDES.has(normalized)) return TOKEN_OVERRIDES.get(normalized);
  return dict.get(normalized) || null;
}

function resolveWithCmu(value, dict) {
  let text = cleanEntryText(value);
  if (!text) return null;

  text = text.split('/')[0].trim();
  text = text.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  if (!text) return null;

  const exact = lookupToken(text, dict);
  if (exact) return phonesToIpa(exact);

  const tokens = text
    .split(/[\s-]+/)
    .map(token => token.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ''))
    .filter(Boolean);
  if (!tokens.length) return null;

  const parts = [];
  for (const token of tokens) {
    const phones = lookupToken(token, dict);
    if (!phones) return null;
    parts.push(phonesToIpa(phones));
  }
  return parts.join(' ');
}

function resolveWithEspeak(value) {
  const spoken = cleanEntryText(value).split('/')[0].replace(/\s*\([^)]*\)\s*$/g, '').trim();
  if (!spoken) return null;
  try {
    const output = execFileSync('espeak-ng', ['-q', '--ipa=3', '-v', 'en-us', spoken], { encoding: 'utf8' })
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return output || null;
  } catch {
    return null;
  }
}

function wrapIpa(value) {
  const cleaned = value.replace(/^\/+|\/+$/g, '').trim();
  return `/${cleaned}/`;
}

function replaceOnce(file, before, after) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(before)) {
    if (source.includes(after)) return;
    throw new Error(`${file}: patch target not found`);
  }
  writeFileSync(file, source.replace(before, after));
}

function patchAppFiles() {
  replaceOnce(
    'index.html',
    '<script src="./app.js"></script>\n<script src="./toeic-mode.js"></script>',
    '<script src="./app.js"></script>\n<script src="./toeic-phonetics.js"></script>\n<script src="./toeic-mode.js"></script>'
  );

  replaceOnce(
    'toeic-mode.js',
    `      const wordCell = document.createElement('td');\n      wordCell.className = 'word-cell';\n      wordCell.textContent = item.word;`,
    `      const wordCell = document.createElement('td');\n      wordCell.className = 'word-cell';\n\n      const wordText = document.createElement('div');\n      wordText.textContent = item.word;\n\n      const phonetic = document.createElement('div');\n      phonetic.className = 'word-phonetic';\n      phonetic.textContent = item.phonetic;\n\n      wordCell.appendChild(wordText);\n      wordCell.appendChild(phonetic);`
  );

  replaceOnce(
    'toeic-mode.js',
    `    if (rows.length !== 5021) {\n      throw new Error(\`Expected 5021 TOEIC Bridge entries, received \${rows.length}.\`);\n    }\n\n    WORD_DATA.words = rows.map((row, index) => {`,
    `    if (rows.length !== 5021) {\n      throw new Error(\`Expected 5021 TOEIC Bridge entries, received \${rows.length}.\`);\n    }\n\n    const phonetics = window.TOEIC_BRIDGE_PHONETICS;\n    if (!Array.isArray(phonetics) || phonetics.length !== rows.length || phonetics.some(value => !value)) {\n      throw new Error('TOEIC Bridge pronunciation data is incomplete.');\n    }\n\n    WORD_DATA.words = rows.map((row, index) => {`
  );

  replaceOnce(
    'toeic-mode.js',
    `        word,\n        meaning,\n        cefr,`,
    `        word,\n        meaning,\n        phonetic: phonetics[index],\n        cefr,`
  );

  const styles = readFileSync('styles.css', 'utf8');
  const styleBlock = `\n\n/* TOEIC Bridge pronunciation */\n.toeic-mode .word-phonetic {\n  margin-top: 2px;\n  color: #68697a;\n  font-size: .78rem;\n  font-weight: 400;\n  line-height: 1.3;\n  letter-spacing: .01em;\n}\n`;
  if (!styles.includes('.word-phonetic')) writeFileSync('styles.css', styles.trimEnd() + styleBlock + '\n');

  const worker = readFileSync('sw.js', 'utf8');
  const upgradedWorker = upgradeIpaCacheVersion(worker);
  if (worker !== upgradedWorker) writeFileSync('sw.js', upgradedWorker);
  replaceOnce(
    'sw.js',
    "  './toeic-data-8.js',\n  './pwa.js',",
    "  './toeic-data-8.js',\n  './toeic-phonetics.js',\n  './pwa.js',"
  );
}

async function main() {
  const rows = readRows();
  if (rows.length !== 5021) throw new Error(`Expected 5021 rows, found ${rows.length}`);

  const response = await fetch(CMUDICT_URL);
  if (!response.ok) throw new Error(`Failed to download CMUdict: ${response.status}`);
  const dict = parseCmu(await response.text());

  let fallbackCount = 0;
  const missing = [];
  const phonetics = rows.map(([word], index) => {
    let ipa = resolveWithCmu(word, dict);
    if (!ipa) {
      fallbackCount++;
      ipa = resolveWithEspeak(word);
    }
    if (!ipa) {
      missing.push(`#${index + 1} ${word}`);
      return null;
    }
    return wrapIpa(ipa);
  });

  if (missing.length) {
    throw new Error(`Missing pronunciation for ${missing.length} entries:\n${missing.join('\n')}`);
  }

  const header = '// Generated by scripts/implement-toeic-ipa.mjs from CMUdict (General American); eSpeak NG is used only for entries CMUdict cannot resolve.\n';
  writeFileSync('toeic-phonetics.js', `${header}window.TOEIC_BRIDGE_PHONETICS=${JSON.stringify(phonetics)};\n`);
  patchAppFiles();

  console.log(`Generated ${phonetics.length} IPA entries (${fallbackCount} eSpeak fallbacks).`);
}

await main();
