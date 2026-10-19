import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const historyScriptPath = join(repositoryRoot, 'history-navigation.js');

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : Boolean(force);
    if (enabled) this.values.add(name);
    else this.values.delete(name);
    return enabled;
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.classList = new FakeClassList();
    this.textContent = '';
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
    return descendants.filter(child => classes.every(name => child.classList.contains(name)));
  }
}

function createHarness(words) {
  const values = new Map();
  const listeners = new Map();
  const elements = new Map();
  const timers = [];
  const flashcardControls = [new FakeElement('button'), new FakeElement('button')];
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
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
    createElement(tagName) { return new FakeElement(tagName); },
    createTextNode(text) {
      const node = new FakeElement('#text');
      node.textContent = text;
      return node;
    },
    querySelectorAll(selector) {
      if (selector === '#panel-flashcard .card-controls button') return flashcardControls;
      if (selector === '#quizOptions .quiz-option') {
        return document.getElementById('quizOptions').querySelectorAll('.quiz-option');
      }
      if (selector === '.tab' || selector === '.mode-panel') return [];
      return [];
    },
    querySelector(selector) {
      return selector === '.header h1' ? document.getElementById('headerTitle') : null;
    },
  };
  const window = { addEventListener() {}, scrollTo() {} };
  const context = {
    console,
    document,
    window,
    localStorage,
    LearningStatus: require('../learning-status.js'),
    FileReader: class {},
    Blob: class {},
    URL: { createObjectURL() { return ''; }, revokeObjectURL() {} },
    alert() {},
    setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {},
    Math,
    Date,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(repositoryRoot, 'app.js'), 'utf8'), context, { filename: 'app.js' });
  vm.runInContext(`
    WORD_DATA.words = ${JSON.stringify(words)};
    globalThis.testApi = {
      state,
      getStatus: getWordStatus,
    };
  `, context);

  assert.equal(existsSync(historyScriptPath), true, 'history-navigation.js should exist');
  vm.runInContext(readFileSync(historyScriptPath, 'utf8'), context, { filename: 'history-navigation.js' });
  vm.runInContext(`
    testApi.initFlashcard = initFlashcard;
    testApi.markCard = markCard;
    testApi.initQuiz = initQuiz;
  `, context);

  const runTimers = () => {
    while (timers.length) timers.shift().fn();
  };
  return { context, document, elements, timers, runTimers };
}

const words = [
  { word: 'alpha', meaning: '最初', page: 1 },
  { word: 'bravo', meaning: '勇敢', page: 1 },
  { word: 'charlie', meaning: '人名', page: 2 },
  { word: 'delta', meaning: '差', page: 2 },
];

test('UI exposes one-step back controls and caches the history script for offline use', () => {
  const html = readFileSync(join(repositoryRoot, 'index.html'), 'utf8');
  const serviceWorker = readFileSync(join(repositoryRoot, 'sw.js'), 'utf8');

  assert.match(html, /id="flashcardBackBtn"[^>]*onclick="goBackFlashcard\(\)"[^>]*disabled/);
  assert.match(html, /id="quizBackBtn"[^>]*onclick="goBackQuiz\(\)"[^>]*disabled/);
  assert.match(html, /<script src="\.\/history-navigation\.js"><\/script>/);
  assert.match(serviceWorker, /'\.\/history-navigation\.js'/);
});

test('flashcard back restores the previous card and learning status for re-answering', () => {
  const app = createHarness(words);
  app.context.testApi.initFlashcard();

  assert.equal(app.elements.get('flashcardWord').textContent, 'alpha');
  app.context.testApi.markCard(false);
  assert.equal(app.context.testApi.getStatus('alpha'), 'uncertain');
  assert.equal(app.elements.get('flashcardWord').textContent, 'bravo');
  assert.equal(app.elements.get('flashcardBackBtn').disabled, false);

  app.context.goBackFlashcard();
  assert.equal(app.context.testApi.getStatus('alpha'), 'unattempted');
  assert.equal(app.elements.get('flashcardWord').textContent, 'alpha');
  assert.equal(app.context.testApi.state.flashcardSeen.has('alpha'), false);
  assert.equal(app.elements.get('flashcardBackBtn').disabled, true);

  app.context.testApi.markCard(true);
  assert.equal(app.context.testApi.getStatus('alpha'), 'perfect');
});

test('flashcard back remains available after answering the last card', () => {
  const app = createHarness(words.slice(0, 1));
  app.context.testApi.initFlashcard();
  app.context.testApi.markCard(true);

  assert.equal(app.elements.get('flashcardWord').textContent, '');
  assert.equal(app.elements.get('flashcardBackBtn').disabled, false);
  app.context.goBackFlashcard();
  assert.equal(app.elements.get('flashcardWord').textContent, 'alpha');
  assert.equal(app.context.testApi.getStatus('alpha'), 'unattempted');
});

test('quiz back restores score, status, and the exact previous choices while cancelling delayed advance', () => {
  const app = createHarness(words);
  app.context.testApi.state.quizPageOrder = true;
  app.context.testApi.initQuiz();

  const question = app.elements.get('quizWord').textContent;
  const options = app.elements.get('quizOptions').children.map(button => button.textContent);
  const wrong = app.elements.get('quizOptions').children.find(button => button.textContent !== '最初');
  wrong.onclick();

  assert.equal(app.context.testApi.getStatus('alpha'), 'uncertain');
  assert.equal(app.context.testApi.state.quizTotal, 1);
  assert.equal(app.elements.get('quizBackBtn').disabled, false);

  app.context.goBackQuiz();
  assert.equal(app.context.testApi.getStatus('alpha'), 'unattempted');
  assert.equal(app.context.testApi.state.quizCorrect, 0);
  assert.equal(app.context.testApi.state.quizTotal, 0);
  assert.equal(app.elements.get('quizWord').textContent, question);
  assert.deepEqual(app.elements.get('quizOptions').children.map(button => button.textContent), options);
  assert.equal(app.elements.get('quizBackBtn').disabled, true);

  app.runTimers();
  assert.equal(app.elements.get('quizWord').textContent, question, 'stale delayed advance must not replace the restored question');

  const correct = app.elements.get('quizOptions').children.find(button => button.textContent === '最初');
  correct.onclick();
  assert.equal(app.context.testApi.getStatus('alpha'), 'perfect');
  assert.equal(app.context.testApi.state.quizCorrect, 1);
  assert.equal(app.context.testApi.state.quizTotal, 1);
});

test('quiz back also restores the previous question after the normal delayed transition', () => {
  const app = createHarness(words);
  app.context.testApi.state.quizPageOrder = true;
  app.context.testApi.initQuiz();
  const firstQuestion = app.elements.get('quizWord').textContent;
  const wrong = app.elements.get('quizOptions').children.find(button => button.textContent !== '最初');
  wrong.onclick();
  app.runTimers();

  assert.notEqual(app.elements.get('quizWord').textContent, firstQuestion);
  app.context.goBackQuiz();
  assert.equal(app.elements.get('quizWord').textContent, firstQuestion);
  assert.equal(app.context.testApi.getStatus('alpha'), 'unattempted');
  assert.equal(app.context.testApi.state.quizTotal, 0);
});
