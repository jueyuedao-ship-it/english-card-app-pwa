// Focused browser regression check for the unified three-state word progress.
// Run an HTTP server first, then: node scripts/check-progress-status.cjs [base URL]
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { chromium } = require('playwright');

async function selectMode(page, mode) {
  await page.getByRole('button', { name: mode === 'toeic' ? /TOEIC Bridge対策/ : /高専用/ }).click();
  await page.waitForFunction(expected =>
    !document.getElementById('appShell').hidden &&
    document.body.classList.contains('toeic-mode') === (expected === 'toeic'), mode);
}

async function answerQuiz(page, wordId, correct) {
  await page.evaluate(id => {
    state.quizMode = 'en-jp';
    state.quizOrder = [WORD_DATA.words.find(word => word.id === id || word.word === id)];
    state.quizIndex = 0;
    showQuiz();
  }, wordId);
  const expected = await page.evaluate(() => {
    const word = state.quizOrder[state.quizIndex];
    return word.meaning;
  });
  const option = correct
    ? page.locator('#quizOptions .quiz-option').filter({ hasText: new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })
    : page.locator('#quizOptions .quiz-option').filter({ hasNotText: expected }).first();
  await option.click();
  await page.waitForTimeout(30);
}

async function statusOf(page, id) {
  return page.evaluate(key => getWordStatus(key), id);
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const mobile = process.env.TOEIC_BROWSER_MOBILE === '1';
    const context = await browser.newContext({
      acceptDownloads: true,
      ...(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {}),
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    const url = process.argv[2] || 'http://127.0.0.1:8765/';

    await page.goto(url);
    await page.evaluate(() => {
      localStorage.setItem('wordcard_toeic_mastery', JSON.stringify(['toeic-66']));
      localStorage.setItem('wordcard_toeic_known', JSON.stringify(['toeic-2577']));
      localStorage.setItem('wordcard_toeic_unknown', JSON.stringify(['toeic-1811']));
    });
    await selectMode(page, 'toeic');

    assert.equal(await statusOf(page, 'toeic-66'), 'perfect');
    assert.equal(await statusOf(page, 'toeic-2577'), 'perfect');
    assert.equal(await statusOf(page, 'toeic-1811'), 'anxious');
    assert.equal(await page.evaluate(() => WORD_DATA.words.length), 5021);

    await page.getByRole('button', { name: '全単語リスト', exact: true }).click();
    await page.locator('#searchInput').fill('man');
    const manRow = page.locator('#wordTableBody tr').filter({
      has: page.locator('.word-cell > div:first-child').filter({ hasText: /^man$/ }),
    });
    assert.equal(await manRow.locator('[data-word-status="perfect"]').getAttribute('aria-pressed'), 'true');
    await manRow.locator('[data-word-status="anxious"]').click();
    assert.equal(await statusOf(page, 'toeic-66'), 'anxious');
    assert.equal(await manRow.locator('[data-word-status="perfect"]').getAttribute('aria-pressed'), 'false');
    await page.locator('#panel-list .list-toolbar .filter-btn').filter({ hasText: /^不安$/ }).click();
    assert.equal(await page.locator('#wordTableBody tr').count(), 1);
    await page.locator('#panel-list .list-toolbar .filter-btn').filter({ hasText: /^未挑戦$/ }).click();
    assert.equal(await manRow.count(), 0);

    await page.getByRole('button', { name: 'フラッシュカード', exact: true }).click();
    const beforeShuffle = await page.evaluate(() => localStorage.getItem('wordcard_toeic_status_v1'));
    await page.evaluate(() => { toggleShuffle(); togglePageOrder(); });
    assert.equal(await page.evaluate(() => localStorage.getItem('wordcard_toeic_status_v1')), beforeShuffle);
    await page.evaluate(() => {
      state.flashcardOrder = [WORD_DATA.words.find(word => word.id === 'toeic-594')];
      state.flashcardIndex = 0;
      showFlashcard();
    });
    await page.getByRole('button', { name: '知っていなかった', exact: true }).click();
    assert.equal(await statusOf(page, 'toeic-594'), 'anxious');

    await page.getByRole('button', { name: '4択クイズ', exact: true }).click();
    await answerQuiz(page, 'toeic-594', true);
    assert.equal(await statusOf(page, 'toeic-594'), 'perfect');
    await answerQuiz(page, 'toeic-594', false);
    assert.equal(await statusOf(page, 'toeic-594'), 'anxious');

    const exportPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'エクスポート', exact: true }).click();
    const download = await exportPromise;
    const backup = JSON.parse(readFileSync(await download.path(), 'utf8'));
    assert.equal(backup.mode, 'toeic');
    assert.ok(Array.isArray(backup.mastery));
    assert.ok(Array.isArray(backup.flashcardKnown));
    assert.ok(Array.isArray(backup.flashcardUnknown));
    assert.equal(backup.wordStatuses.version, 1);
    assert.equal(backup.wordStatuses.entries['toeic-594'], 'anxious');

    await page.reload();
    await page.waitForFunction(() => document.body.classList.contains('toeic-mode') && !document.getElementById('appShell').hidden);
    assert.equal(await statusOf(page, 'toeic-594'), 'anxious');
    assert.equal(await page.evaluate(() => WORD_DATA.words.find(word => word.id === 'toeic-66').rank), 66);

    await page.getByRole('button', { name: 'ホーム', exact: true }).click();
    await page.evaluate(() => {
      localStorage.removeItem('wordcard_status_v1');
      localStorage.setItem('wordcard_mastery', JSON.stringify(['add']));
      localStorage.setItem('wordcard_known', JSON.stringify(['male']));
      localStorage.setItem('wordcard_unknown', JSON.stringify(['plus']));
    });
    await selectMode(page, 'kosen');
    assert.equal(await page.evaluate(() => WORD_DATA.words.length), 498);
    assert.equal(await statusOf(page, 'add'), 'perfect');
    assert.equal(await statusOf(page, 'male'), 'perfect');
    assert.equal(await statusOf(page, 'plus'), 'anxious');

    await page.getByRole('button', { name: '全単語リスト', exact: true }).click();
    await page.locator('#searchInput').fill('add');
    const addRow = page.locator('#wordTableBody tr').filter({
      has: page.locator('.word-cell').filter({ hasText: /^add$/ }),
    });
    assert.equal(await addRow.locator('[data-word-status="perfect"]').getAttribute('aria-pressed'), 'true');
    await addRow.locator('[data-word-status="anxious"]').click();
    assert.equal(await statusOf(page, 'add'), 'anxious');
    await page.locator('#panel-list .list-toolbar .filter-btn').filter({ hasText: /^未挑戦$/ }).click();
    assert.equal(await addRow.count(), 0);
    await page.locator('#panel-list .list-toolbar .filter-btn').filter({ hasText: /^全部$/ }).click();
    await addRow.locator('[data-word-status="untried"]').click();
    assert.equal(await statusOf(page, 'add'), null);

    await page.getByRole('button', { name: 'フラッシュカード', exact: true }).click();
    await page.evaluate(() => {
      state.flashcardOrder = [WORD_DATA.words.find(word => word.word === 'subtract')];
      state.flashcardIndex = 0;
      showFlashcard();
    });
    await page.getByRole('button', { name: '知っていた', exact: true }).click();
    assert.equal(await statusOf(page, 'subtract'), 'perfect');
    await page.getByRole('button', { name: '4択クイズ', exact: true }).click();
    await answerQuiz(page, 'subtract', false);
    assert.equal(await statusOf(page, 'subtract'), 'anxious');
    await answerQuiz(page, 'subtract', true);
    assert.equal(await statusOf(page, 'subtract'), 'perfect');

    const importData = {
      mastery: ['add'],
      flashcardKnown: ['male'],
      flashcardUnknown: ['plus'],
    };
    await page.locator('#importFile').setInputFiles({
      name: 'wrong-mode-progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backup)),
    });
    await page.waitForTimeout(100);
    assert.equal(await statusOf(page, 'add'), null);

    await page.locator('#importFile').setInputFiles({
      name: 'invalid-progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{}'),
    });
    await page.waitForTimeout(100);
    assert.equal(await statusOf(page, 'add'), null);

    await page.locator('#importFile').setInputFiles({
      name: 'legacy-progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(importData)),
    });
    await page.waitForFunction(() => getWordStatus('add') === 'perfect' && getWordStatus('male') === 'perfect' && getWordStatus('plus') === 'anxious');

    await page.reload();
    await page.waitForFunction(() => !document.getElementById('appShell').hidden && !document.body.classList.contains('toeic-mode'));
    assert.equal(await statusOf(page, 'add'), 'perfect');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    assert.ok((await page.evaluate(() => caches.keys())).includes('english-vocab-pwa-v11'));
    assert.deepEqual(errors, []);
    console.log(`Progress status checks passed (${mobile ? 'mobile viewport' : 'desktop'}): legacy migration, exclusive latest result, manual tags, three filters, both modes, shuffle, backup, reload, rank IDs, and service-worker cache.`);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
