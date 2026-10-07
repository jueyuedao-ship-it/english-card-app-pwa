// Optional browser regression check. Requires Playwright and installed Chrome.
// Run an HTTP server first, then: node scripts/check-toeic-browser.cjs [base URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const mobile = process.env.TOEIC_BROWSER_MOBILE === '1';
    const context = await browser.newContext(mobile
      ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
      : {});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = process.argv[2] || 'http://127.0.0.1:8765/';
    await page.goto(url);
    // Seed the pre-change, rank-based storage format once. Reloads never seed it.
    await page.evaluate(() => {
      localStorage.setItem('wordcard_toeic_mastery', JSON.stringify(['toeic-66', 'toeic-2577']));
      localStorage.setItem('wordcard_toeic_known', JSON.stringify(['toeic-594']));
      localStorage.setItem('wordcard_toeic_unknown', JSON.stringify(['toeic-1811']));
    });
    await page.getByRole('button', { name: /TOEIC Bridge対策/ }).click();
    await page.waitForFunction(() => document.body.classList.contains('toeic-mode') && !document.getElementById('appShell').hidden);
    const words = await page.evaluate(() => WORD_DATA.words);
    assert.equal(words.length, 5021);
    assert.ok(words.every((word, index) => word.id === `toeic-${index + 1}` && word.rank === index + 1 && word.pos && word.headword && word.phonetic));
    const expectedPerfect = ['toeic-2577', 'toeic-594', 'toeic-66'];
    assert.deepEqual(await page.evaluate(() => [...getMastery()].sort()), expectedPerfect);
    assert.deepEqual(await page.evaluate(() => [...getFlashcardStats().known].sort()), expectedPerfect);
    assert.deepEqual(await page.evaluate(() => [...getFlashcardStats().unknown]), ['toeic-1811']);

    await page.getByRole('button', { name: '全単語リスト', exact: true }).click();
    assert.equal(await page.locator('#wordTableBody tr').count(), 5021);
    const rowFor = word => page.locator('#wordTableBody tr').filter({
      has: page.locator('.word-cell > div:first-child').filter({ hasText: new RegExp(`^${word}$`) }),
    });
    await page.locator('#searchInput').fill('man');
    assert.match(await rowFor('man').locator('td').nth(1).innerText(), /男性|男の人/);
    assert.match(await rowFor('man').locator('.word-phonetic').innerText(), /^\/.+\/$/);
    assert.equal(await rowFor('man').locator('.status-tag-perfect').getAttribute('aria-pressed'), 'true');
    await rowFor('man').locator('.status-tag-perfect').click();
    assert.equal(await rowFor('man').locator('.status-empty').innerText(), '未挑戦');
    await page.locator('#searchInput').fill('fine');
    const fineMeanings = await rowFor('fine').locator('td:nth-child(2)').allInnerTexts();
    assert.equal(fineMeanings.length, 2);
    assert.match(fineMeanings[0], /元気|良い|よい|晴れ|細かい/);
    assert.match(fineMeanings[1], /罰金/);

    await page.getByRole('button', { name: 'フラッシュカード', exact: true }).click();
    await page.evaluate(() => {
      state.flashcardOrder = [WORD_DATA.words.find(word => word.word === 'fine' && word.pos === 'adjective')];
      state.flashcardIndex = 0;
      showFlashcard();
    });
    await page.locator('#flashcard').click();
    assert.ok(await page.locator('#flashcard').evaluate(element => element.classList.contains('card-flipped')));
    assert.match(await page.locator('#flashcardMeaning').innerText(), /元気|良い|よい|晴れ|細かい/);
    await page.getByRole('button', { name: '知っていた', exact: true }).click();

    await page.getByRole('button', { name: '4択クイズ', exact: true }).click();
    await page.evaluate(() => {
      state.quizOrder = [WORD_DATA.words.find(word => word.id === 'toeic-66')];
      state.quizIndex = 0;
      showQuiz();
    });
    assert.equal(await page.locator('#quizWord').innerText(), 'man');
    const quizMeaning = words.find(word => word.id === 'toeic-66').meaning;
    const exactMeaning = new RegExp('^' + quizMeaning.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
    await page.locator('#quizOptions .quiz-option').filter({ hasText: exactMeaning }).click();
    assert.equal(await page.locator('#quizResult').innerText(), '正解！');
    assert.equal(await page.locator('#quizOptions .correct').count(), 1);

    await page.reload();
    await page.waitForFunction(() => document.body.classList.contains('toeic-mode') && !document.getElementById('appShell').hidden);
    assert.equal(await page.evaluate(() => getMastery().has('toeic-66')), true);
    assert.equal(await page.evaluate(() => getMastery().has('toeic-2577')), true);
    assert.equal(await page.evaluate(() => getFlashcardStats().known.has('toeic-594')), true);
    assert.equal(await page.evaluate(() => getFlashcardStats().unknown.has('toeic-1811')), true);

    await page.getByRole('button', { name: '全単語リスト', exact: true }).click();
    await page.locator('#panel-list > .page-filter-btn').click();
    await page.locator('#listPageGrid .toeic-priority-toggle[data-cefr="B1"]').first().uncheck();
    const filterBefore = await page.evaluate(() => localStorage.getItem('wordcard_toeic_list_cefr_priority_filter_v1'));
    assert.ok(filterBefore);
    await page.reload();
    await page.waitForFunction(() => document.body.classList.contains('toeic-mode') && !document.getElementById('appShell').hidden);
    assert.equal(await page.evaluate(() => localStorage.getItem('wordcard_toeic_list_cefr_priority_filter_v1')), filterBefore);
    assert.equal(await page.evaluate(() => getFilteredWords('list').some(word => word.cefr === 'B1' && word.priority === 'S+')), false);

    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    assert.ok((await page.evaluate(() => caches.keys())).includes('english-vocab-pwa-v11'));
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => document.body.classList.contains('toeic-mode') && !document.getElementById('appShell').hidden);
    await page.locator('#searchInput').fill('fine');
    assert.deepEqual(await rowFor('fine').locator('td:nth-child(2)').allInnerTexts(), fineMeanings);
    assert.equal(await page.evaluate(() => getMastery().has('toeic-2577')), true);
    await context.setOffline(false);

    await page.getByRole('button', { name: 'ホーム', exact: true }).click();
    await page.getByRole('button', { name: /高専用/ }).click();
    await page.waitForFunction(() => !document.getElementById('appShell').hidden);
    assert.equal(await page.evaluate(() => WORD_DATA.words.length), 498);
    assert.equal(await page.evaluate(() => document.body.classList.contains('toeic-mode')), false);
    assert.deepEqual(errors, []);
    console.log(`Browser checks passed (${mobile ? 'mobile viewport' : 'desktop'}): 5021 rows, POS/IPA, corrected list/card/quiz, existing progress, reload, filters, offline, Kosen mode.`);
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
