import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const historySource = readFileSync(join(repositoryRoot, 'history-navigation.js'), 'utf8');

function createElement() {
  return {
    textContent: '',
    disabled: false,
    children: [],
    className: '',
    onclick: null,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    set innerHTML(value) {
      if (value === '') this.children = [];
    },
    get innerHTML() {
      return '';
    },
  };
}

function createHarness() {
  const words = [
    { word: 'alpha', meaning: '最初' },
    { word: 'bravo', meaning: '勇敢' },
    { word: 'charlie', meaning: '人名' },
    { word: 'delta', meaning: '差' },
  ];
  const statuses = new Map();
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement());
      return elements.get(id);
    },
    createElement() {
      return createElement();
    },
    querySelectorAll(selector) {
      if (selector === '#quizOptions .quiz-option') {
        return document.getElementById('quizOptions').children;
      }
      return [];
    },
  };

  const state = {
    studyMode: 'book',
    flashcardOrder: [],
    flashcardSeen: new Set(),
    flashcardIndex: 0,
    flashcardFlipped: false,
    flashcardKnown: 0,
    flashcardUnknown: 0,
    quizMode: 'word-to-meaning',
    quizOrder: [],
    quizSeen: new Set(),
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    quizGeneration: 0,
    quizAnsweredGeneration: null,
  };

  const getWordIdentity = word => typeof word === 'string' ? word : word.word;
  const getWordStatus = word => statuses.get(getWordIdentity(word)) || 'unattempted';
  const setWordStatus = (word, status) => {
    const key = getWordIdentity(word);
    if (status === 'unattempted') statuses.delete(key);
    else statuses.set(key, status);
  };
  const showFlashcard = () => {
    document.getElementById('flashcardWord').textContent = state.flashcardOrder[0]?.word || '';
  };
  const renderQuiz = () => {
    const word = state.quizOrder[0];
    document.getElementById('quizWord').textContent = word?.word || '';
    document.getElementById('quizScore').textContent = state.quizCorrect;
    document.getElementById('quizTotal').textContent = state.quizTotal;
    const container = document.getElementById('quizOptions');
    container.innerHTML = '';
    if (!word) return;
    [word.meaning, `${word.meaning}-1`, `${word.meaning}-2`, `${word.meaning}-3`].forEach(option => {
      const button = createElement();
      button.className = 'quiz-option';
      button.textContent = option;
      container.appendChild(button);
    });
  };

  const context = {
    console,
    document,
    state,
    getWordIdentity,
    getWordStatus,
    setWordStatus,
    showFlashcard,
    getFlashcardStats() {
      let known = 0;
      let unknown = 0;
      for (const word of words) {
        const status = getWordStatus(word);
        if (status === 'perfect') known += 1;
        if (status === 'uncertain') unknown += 1;
      }
      return { known, unknown };
    },
    updateProgressInfo() {},
    initFlashcard() {
      state.flashcardOrder = [...words];
      state.flashcardSeen = new Set();
      showFlashcard();
    },
    toggleShuffle() {},
    togglePageOrder() {},
    markCard(known) {
      const word = state.flashcardOrder.shift();
      if (!word) return;
      setWordStatus(word, known ? 'perfect' : 'uncertain');
      state.flashcardSeen.add(word.word);
      showFlashcard();
    },
    initQuiz() {
      state.quizOrder = [...words];
      state.quizSeen = new Set();
      state.quizCorrect = 0;
      state.quizTotal = 0;
      state.quizGeneration += 1;
      state.quizAnsweredGeneration = null;
      renderQuiz();
    },
    checkQuiz(
      btn,
      selected,
      correct,
      token = state.quizGeneration,
      wordKey = getWordIdentity(state.quizOrder[0]),
      mode = state.studyMode
    ) {
      const word = state.quizOrder[0];
      if (!word || token !== state.quizGeneration || mode !== state.studyMode || word.word !== wordKey) return;
      const isCorrect = selected === correct;
      setWordStatus(word, isCorrect ? 'perfect' : 'uncertain');
      if (isCorrect) state.quizCorrect += 1;
      state.quizTotal += 1;
      state.quizSeen.add(word.word);
      state.quizOrder.shift();
      state.quizGeneration += 1;
      state.quizAnsweredGeneration = null;
      renderQuiz();
    },
  };

  vm.createContext(context);
  vm.runInContext(historySource, context, { filename: 'history-navigation.js' });
  return { context, state, document, statuses, words };
}

test('flashcard back can be pressed repeatedly to restore three earlier answers', () => {
  const app = createHarness();
  app.context.initFlashcard();

  app.context.markCard(false);
  app.context.markCard(true);
  app.context.markCard(false);
  assert.equal(app.document.getElementById('flashcardWord').textContent, 'delta');

  app.context.goBackFlashcard();
  assert.equal(app.document.getElementById('flashcardWord').textContent, 'charlie');
  assert.equal(app.context.getWordStatus('charlie'), 'unattempted');
  assert.equal(app.document.getElementById('flashcardBackBtn').disabled, false);

  app.context.goBackFlashcard();
  assert.equal(app.document.getElementById('flashcardWord').textContent, 'bravo');
  assert.equal(app.context.getWordStatus('bravo'), 'unattempted');
  assert.equal(app.context.getWordStatus('alpha'), 'uncertain');
  assert.equal(app.document.getElementById('flashcardBackBtn').disabled, false);

  app.context.goBackFlashcard();
  assert.equal(app.document.getElementById('flashcardWord').textContent, 'alpha');
  assert.equal(app.context.getWordStatus('alpha'), 'unattempted');
  assert.equal(app.document.getElementById('flashcardBackBtn').disabled, true);
});

test('quiz back can be pressed repeatedly while restoring score and statuses at each step', () => {
  const app = createHarness();
  app.context.initQuiz();

  const answerCurrent = isCorrect => {
    const word = app.state.quizOrder[0];
    const correct = word.meaning;
    app.context.checkQuiz({}, isCorrect ? correct : `${correct}-wrong`, correct);
  };

  answerCurrent(false);
  answerCurrent(true);
  answerCurrent(false);
  assert.equal(app.document.getElementById('quizWord').textContent, 'delta');
  assert.equal(app.state.quizCorrect, 1);
  assert.equal(app.state.quizTotal, 3);

  app.context.goBackQuiz();
  assert.equal(app.document.getElementById('quizWord').textContent, 'charlie');
  assert.equal(app.state.quizCorrect, 1);
  assert.equal(app.state.quizTotal, 2);
  assert.equal(app.context.getWordStatus('charlie'), 'unattempted');
  assert.equal(app.document.getElementById('quizBackBtn').disabled, false);

  app.context.goBackQuiz();
  assert.equal(app.document.getElementById('quizWord').textContent, 'bravo');
  assert.equal(app.state.quizCorrect, 0);
  assert.equal(app.state.quizTotal, 1);
  assert.equal(app.context.getWordStatus('bravo'), 'unattempted');
  assert.equal(app.context.getWordStatus('alpha'), 'uncertain');
  assert.equal(app.document.getElementById('quizBackBtn').disabled, false);

  app.context.goBackQuiz();
  assert.equal(app.document.getElementById('quizWord').textContent, 'alpha');
  assert.equal(app.state.quizCorrect, 0);
  assert.equal(app.state.quizTotal, 0);
  assert.equal(app.context.getWordStatus('alpha'), 'unattempted');
  assert.equal(app.document.getElementById('quizBackBtn').disabled, true);
});
