(() => {
  const MODE_KEY = 'wordcard_study_mode';
  const TOEIC_PREFIX = 'wordcard_toeic_';
  const TOEIC_DATA_FILES = [
    './toeic-data-1.js',
    './toeic-data-2.js',
    './toeic-data-3.js',
    './toeic-data-4.js',
    './toeic-data-5.js',
    './toeic-data-6.js',
    './toeic-data-7.js',
    './toeic-data-8.js',
  ];
  const CEFR_TO_PAGE = { A1: 1, A2: 2, B1: 3 };
  const PAGE_TO_CEFR = { 1: 'A1', 2: 'A2', 3: 'B1' };
  const TOEIC_PRIORITIES = ['S+', 'S', 'A', 'B', 'C'];
  const TOEIC_LIST_FILTER_KEY = TOEIC_PREFIX + 'list_cefr_priority_filter_v1';

  function getToeicFilterStorageKey(key) {
    return key === 'list'
      ? TOEIC_LIST_FILTER_KEY
      : TOEIC_PREFIX + key + '_cefr_priority_filter_v1';
  }
  const KOSEN_WORDS = WORD_DATA.words.map(item => ({ ...item }));
  let TOEIC_ROWS_CACHE = null;

  const original = {
    getPageFilter,
    setPageFilter,
    setupPageFilter,
    savePageFilter,
    selectAllPages,
    deselectAllPages,
    clearAllPageFilters,
    getFilteredWords,
    getWrongAnswers,
    updateProgressInfo,
    toggleShuffle,
    togglePageOrder,
    showFlashcard,
    markCard,
    checkQuiz,
    renderList,
    isAppendix,
  };

  function isToeicMode() {
    return localStorage.getItem(MODE_KEY) === 'toeic';
  }

  function parseStoredSet(key) {
    const saved = localStorage.getItem(key);
    if (!saved) return new Set();
    try {
      const parsed = JSON.parse(saved);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  getPageFilter = function(key) {
    if (!isToeicMode()) return original.getPageFilter(key);
    const saved = localStorage.getItem(TOEIC_PREFIX + 'page_filter_' + key);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  setPageFilter = function(key, pages) {
    if (!isToeicMode()) return original.setPageFilter(key, pages);
    localStorage.setItem(TOEIC_PREFIX + 'page_filter_' + key, JSON.stringify(pages));
  };

  function getDefaultToeicFilter(key) {
    const selectedPages = getPageFilter(key);
    const filter = {};

    Object.entries(PAGE_TO_CEFR).forEach(([page, cefr]) => {
      const enabled = selectedPages === null || selectedPages.includes(Number(page));
      filter[cefr] = enabled ? [...TOEIC_PRIORITIES] : [];
    });

    return filter;
  }

  function getToeicFilter(key) {
    const saved = localStorage.getItem(getToeicFilterStorageKey(key));
    if (!saved) return getDefaultToeicFilter(key);

    try {
      const parsed = JSON.parse(saved);
      const filter = {};
      Object.values(PAGE_TO_CEFR).forEach(cefr => {
        const values = Array.isArray(parsed?.[cefr]) ? parsed[cefr] : [];
        filter[cefr] = TOEIC_PRIORITIES.filter(priority => values.includes(priority));
      });
      return filter;
    } catch {
      return getDefaultToeicFilter(key);
    }
  }

  function setToeicFilter(key, filter) {
    localStorage.setItem(getToeicFilterStorageKey(key), JSON.stringify(filter));

    const selectedPages = Object.entries(PAGE_TO_CEFR)
      .filter(([, cefr]) => (filter[cefr] || []).length > 0)
      .map(([page]) => Number(page));

    setPageFilter(key, selectedPages);
  }

  function syncToeicLevelToggle(group) {
    const levelToggle = group.querySelector('.toeic-level-toggle');
    const priorities = [...group.querySelectorAll('.toeic-priority-toggle')];
    const checkedCount = priorities.filter(input => input.checked).length;

    levelToggle.checked = checkedCount === priorities.length;
    levelToggle.indeterminate = checkedCount > 0 && checkedCount < priorities.length;
  }

  function saveToeicFilterFromUi(key) {
    const grid = document.getElementById(key + 'PageGrid');
    if (!grid) return;

    const filter = {};
    Object.values(PAGE_TO_CEFR).forEach(cefr => {
      filter[cefr] = [...grid.querySelectorAll(`.toeic-priority-toggle[data-cefr="${cefr}"]:checked`)]
        .map(input => input.value);
    });

    setToeicFilter(key, filter);
    switchTab(state.currentTab);
  }

  function setupToeicPriorityFilter(key, grid) {
    const filter = getToeicFilter(key);
    grid.innerHTML = '';
    grid.classList.add('toeic-priority-filter-grid');

    Object.values(PAGE_TO_CEFR).forEach(cefr => {
      const group = document.createElement('div');
      group.className = 'toeic-priority-group';

      const heading = document.createElement('label');
      heading.className = 'toeic-priority-heading';

      const levelToggle = document.createElement('input');
      levelToggle.type = 'checkbox';
      levelToggle.className = 'toeic-level-toggle';
      levelToggle.dataset.cefr = cefr;

      const headingText = document.createElement('span');
      headingText.textContent = `${cefr} 優先度`;

      heading.appendChild(levelToggle);
      heading.appendChild(headingText);
      group.appendChild(heading);

      const priorities = document.createElement('div');
      priorities.className = 'toeic-priority-options';

      TOEIC_PRIORITIES.forEach(priority => {
        const label = document.createElement('label');
        label.className = 'page-filter-item toeic-priority-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'toeic-priority-toggle';
        checkbox.dataset.cefr = cefr;
        checkbox.value = priority;
        checkbox.checked = (filter[cefr] || []).includes(priority);
        checkbox.addEventListener('change', () => {
          syncToeicLevelToggle(group);
          saveToeicFilterFromUi(key);
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(priority));
        priorities.appendChild(label);
      });

      group.appendChild(priorities);
      grid.appendChild(group);

      levelToggle.addEventListener('change', () => {
        group.querySelectorAll('.toeic-priority-toggle').forEach(input => {
          input.checked = levelToggle.checked;
        });
        levelToggle.indeterminate = false;
        saveToeicFilterFromUi(key);
      });

      syncToeicLevelToggle(group);
    });
  }

  setupPageFilter = function(key) {
    if (!isToeicMode()) return original.setupPageFilter(key);

    const grid = document.getElementById(key + 'PageGrid');
    if (!grid) return;
    setupToeicPriorityFilter(key, grid);
  };

  savePageFilter = function(key) {
    if (!isToeicMode()) return original.savePageFilter(key);
    saveToeicFilterFromUi(key);
  };

  selectAllPages = function(key) {
    if (!isToeicMode()) return original.selectAllPages(key);

    const grid = document.getElementById(key + 'PageGrid');
    if (!grid) return;
    grid.querySelectorAll('.toeic-priority-toggle').forEach(input => {
      input.checked = true;
    });
    grid.querySelectorAll('.toeic-priority-group').forEach(syncToeicLevelToggle);
    saveToeicFilterFromUi(key);
  };

  deselectAllPages = function(key) {
    if (!isToeicMode()) return original.deselectAllPages(key);

    const grid = document.getElementById(key + 'PageGrid');
    if (!grid) return;
    grid.querySelectorAll('.toeic-priority-toggle').forEach(input => {
      input.checked = false;
    });
    grid.querySelectorAll('.toeic-priority-group').forEach(syncToeicLevelToggle);
    saveToeicFilterFromUi(key);
  };

  clearAllPageFilters = function() {
    if (!isToeicMode()) return original.clearAllPageFilters();

    ['flashcard', 'quiz', 'list'].forEach(key => {
      localStorage.removeItem(getToeicFilterStorageKey(key));
    });
    original.clearAllPageFilters();
  };

  getFilteredWords = function(key) {
    if (!isToeicMode()) return original.getFilteredWords(key);

    const filter = getToeicFilter(key);
    return WORD_DATA.words.filter(item =>
      (filter[item.cefr] || []).includes(item.priority)
    );
  };

  getWrongAnswers = function(correctAnswer, count = 3, field = 'meaning') {
    if (!isToeicMode()) return original.getWrongAnswers(correctAnswer, count, field);

    const unique = [];
    const seen = new Set([correctAnswer]);
    for (const item of shuffle(WORD_DATA.words)) {
      const value = item[field];
      if (seen.has(value)) continue;
      seen.add(value);
      unique.push(value);
      if (unique.length >= count) break;
    }
    return unique;
  };

  updateProgressInfo = function() {
    if (!isToeicMode()) return original.updateProgressInfo();
    const count = getMastery().size;
    document.getElementById('progressInfo').textContent =
      `${count} / ${WORD_DATA.words.length} 習得済み`;
  };

  toggleShuffle = function() {
    if (!isToeicMode()) return original.toggleShuffle();

    state.flashcardMode = 'shuffle';
    state.flashcardIndex = 0;
    state.flashcardFlipped = false;
    state.flashcardOrder = shuffle(getFilteredWords('flashcard'));

    document.getElementById('shuffleBtn').classList.add('active');
    document.getElementById('pageOrderBtn').classList.remove('active');
    showFlashcard();

    setTimeout(() => {
      document.getElementById('shuffleBtn').classList.remove('active');
    }, 200);
  };

  togglePageOrder = function() {
    if (!isToeicMode()) return original.togglePageOrder();

    state.flashcardMode = 'page';
    state.flashcardIndex = 0;
    state.flashcardFlipped = false;
    state.flashcardOrder = getFilteredWords('flashcard');

    document.getElementById('pageOrderBtn').classList.add('active');
    document.getElementById('shuffleBtn').classList.remove('active');
    showFlashcard();

    setTimeout(() => {
      document.getElementById('pageOrderBtn').classList.remove('active');
    }, 200);
  };

  showFlashcard = function() {
    if (!isToeicMode()) return original.showFlashcard();

    const word = state.flashcardOrder[state.flashcardIndex];
    if (!word) return;

    const card = document.getElementById('flashcard');
    card.classList.remove('card-flipped');
    state.flashcardFlipped = false;

    document.getElementById('flashcardWord').textContent = word.word;
    document.getElementById('flashcardMeaning').textContent = word.meaning;
    document.getElementById('flashcardPage').textContent =
      `CEFR ${word.cefr} / #${word.rank} / ${word.priority}`;

    const known = state.flashcardKnown.size;
    const unknown = state.flashcardUnknown.size;
    const total = state.flashcardOrder.length;
    const progress = state.flashcardIndex + 1;
    document.getElementById('flashcardStats').textContent =
      `${progress}/${total} | 知っていた: ${known} | 知っていなかった: ${unknown}`;
  };

  markCard = function(known) {
    if (!isToeicMode()) return original.markCard(known);

    const word = state.flashcardOrder[state.flashcardIndex];
    if (!word) return;

    setWordStatus(word, known ? 'perfect' : 'anxious');

    if (state.flashcardIndex < state.flashcardOrder.length - 1) {
      state.flashcardIndex++;
      showFlashcard();
    } else {
      document.getElementById('flashcardStats').textContent = 'おめでとうございます！全語完了！';
    }
    updateProgressInfo();
  };

  checkQuiz = function(btn, selected, correct) {
    if (!isToeicMode()) return original.checkQuiz(btn, selected, correct);
    if (state.quizAnswerLocked) return;
    state.quizAnswerLocked = true;
    const runId = state.quizRunId;

    const buttons = document.querySelectorAll('#quizOptions .quiz-option');
    buttons.forEach(button => {
      button.disabled = true;
      button.classList.add('disabled');
      if (button.textContent === correct) button.classList.add('correct');
    });

    const isCorrect = selected === correct;
    if (isCorrect) {
      btn.classList.add('correct');
      state.quizCorrect++;
    } else {
      btn.classList.add('wrong');
    }
    state.quizTotal++;

    const current = state.quizOrder[state.quizIndex];
    if (current) setWordStatus(current, isCorrect ? 'perfect' : 'anxious');

    document.getElementById('quizResult').textContent =
      isCorrect ? '正解！' : `不正解 😅 正解は ${correct}`;
    updateProgressInfo();

    setTimeout(() => {
      if (state.quizRunId !== runId) return;
      state.quizIndex++;
      showQuiz();
    }, 1200);
  };

  isAppendix = function(word) {
    if (isToeicMode()) return false;
    return original.isAppendix(word);
  };

  renderList = function() {
    if (!isToeicMode()) return original.renderList();

    const statuses = getWordStatuses();
    let filtered = getFilteredWords('list');

    if (state.listSearch) {
      const search = state.listSearch.toLowerCase();
      filtered = filtered.filter(item =>
        item.word.toLowerCase().includes(search) ||
        item.meaning.toLowerCase().includes(search)
      );
    }

    if (state.listFilter !== 'all') {
      const expected = state.listFilter === 'untried' ? null : state.listFilter;
      filtered = filtered.filter(item => getWordStatusFromSets(item.id, statuses) === expected);
    }

    document.getElementById('listStats').textContent =
      `${filtered.length} / ${WORD_DATA.words.length}語を表示`;

    const tbody = document.getElementById('wordTableBody');
    tbody.innerHTML = '';

    const fragment = document.createDocumentFragment();
    filtered.forEach(item => {
      const status = getWordStatusFromSets(item.id, statuses);
      const row = document.createElement('tr');
      if (status === 'perfect') row.className = 'mastery-done';
      if (status === 'anxious') row.className = 'mastery-anxious';

      const wordCell = document.createElement('td');
      wordCell.className = 'word-cell';

      const wordText = document.createElement('div');
      wordText.textContent = item.word;

      const phonetic = document.createElement('div');
      phonetic.className = 'word-phonetic';
      phonetic.textContent = item.phonetic;

      wordCell.appendChild(wordText);
      wordCell.appendChild(phonetic);

      const meaningCell = document.createElement('td');
      meaningCell.textContent = item.meaning;

      const levelCell = document.createElement('td');
      levelCell.textContent = `${item.cefr} / ${item.priority}`;

      const statusCell = createWordStatusCell(item, status);

      row.appendChild(wordCell);
      row.appendChild(meaningCell);
      row.appendChild(levelCell);
      row.appendChild(statusCell);
      fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-toeic-src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.toeicSrc = src;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function loadToeicData() {
    if (TOEIC_ROWS_CACHE) return TOEIC_ROWS_CACHE;

    window.TOEIC_BRIDGE_WORD_PARTS = [];
    for (const file of TOEIC_DATA_FILES) {
      await loadScript(file);
    }

    if (window.TOEIC_BRIDGE_WORD_PARTS.length !== TOEIC_DATA_FILES.length) {
      throw new Error('TOEIC Bridge vocabulary data is incomplete.');
    }

    TOEIC_ROWS_CACHE = window.TOEIC_BRIDGE_WORD_PARTS.flat();
    window.TOEIC_BRIDGE_WORD_PARTS = null;
    return TOEIC_ROWS_CACHE;
  }

  function setToeicLabels() {
    document.body.classList.add('toeic-mode');
    document.querySelector('.header h1').textContent = '英単語単語帳 - TOEIC Bridge対策';

    document.querySelectorAll('.page-filter-title').forEach(el => {
      el.textContent = 'CEFR・優先度を選択';
    });

    document.querySelectorAll('.page-filter-btns button').forEach(button => {
      const action = button.getAttribute('onclick') || '';
      if (action.startsWith('selectAllPages')) button.textContent = '全選択';
      if (action.startsWith('deselectAllPages')) button.textContent = '選択解除';
      if (action.startsWith('clearAllPageFilters')) button.textContent = '絞り込みリセット';
    });

    document.querySelectorAll('.page-filter-btn').forEach(button => {
      if ((button.getAttribute('onclick') || '').startsWith('togglePageFilter')) {
        button.textContent = 'CEFR・優先度';
      }
    });

    document.getElementById('pageOrderBtn').textContent = '順位順';
    document.getElementById('quizPageOrderBtn').textContent = '順位順';

    const thirdHeader = document.querySelector('#wordTable thead th:nth-child(3)');
    if (thirdHeader) thirdHeader.textContent = 'CEFR / 優先度';

    ['flashcard', 'quiz', 'list'].forEach(key => {
      if (document.getElementById(key + 'PageFilter')?.classList.contains('open')) {
        setupPageFilter(key);
      }
    });
  }

  function resetRuntimeState() {
    state.flashcardIndex = 0;
    state.flashcardOrder = [];
    state.flashcardFlipped = false;
    state.flashcardShuffle = false;
    state.flashcardMode = null;
    state.flashcardKnown = new Set();
    state.flashcardUnknown = new Set();
    state.quizIndex = 0;
    state.quizOrder = [];
    state.quizRunId++;
    state.quizAnswerLocked = false;
    state.quizCorrect = 0;
    state.quizTotal = 0;
    state.listFilter = 'all';
    state.listSearch = '';

    const search = document.getElementById('searchInput');
    if (search) search.value = '';
  }

  async function activateToeic() {
    const rows = await loadToeicData();

    if (rows.length !== 5021) {
      throw new Error(`Expected 5021 TOEIC Bridge entries, received ${rows.length}.`);
    }

    const phonetics = window.TOEIC_BRIDGE_PHONETICS;
    if (!Array.isArray(phonetics) || phonetics.length !== rows.length || phonetics.some(value => !value)) {
      throw new Error('TOEIC Bridge pronunciation data is incomplete.');
    }

    WORD_DATA.words = rows.map((row, index) => {
      const [word, meaning, cefr, priority, pos, headword] = row;
      return {
        id: `toeic-${index + 1}`,
        word,
        meaning,
        phonetic: phonetics[index],
        cefr,
        priority,
        pos,
        headword,
        rank: index + 1,
        page: CEFR_TO_PAGE[cefr],
      };
    });

    if (WORD_DATA.words.some(item => !item.page)) {
      throw new Error('Unexpected CEFR level in TOEIC Bridge data.');
    }

    resetRuntimeState();
    setToeicLabels();

    const lastTab = localStorage.getItem('wordcard_last_tab');
    const targetTab = ['flashcard', 'quiz', 'list'].includes(lastTab) ? lastTab : 'flashcard';
    switchTab(targetTab);
    updateProgressInfo();
  }

  function setKosenLabels() {
    document.body.classList.remove('toeic-mode');
    document.querySelectorAll('.page-filter-grid').forEach(grid => {
      grid.classList.remove('toeic-priority-filter-grid');
    });
    document.querySelector('.header h1').textContent = '英単語単語帳';

    document.querySelectorAll('.page-filter-title').forEach(el => {
      el.textContent = '表示するページを選択';
    });

    document.querySelectorAll('.page-filter-btns button').forEach(button => {
      const action = button.getAttribute('onclick') || '';
      if (action.startsWith('selectAllPages')) button.textContent = '全ページ';
      if (action.startsWith('deselectAllPages')) button.textContent = '選択解除';
      if (action.startsWith('clearAllPageFilters')) button.textContent = '全ページクリア';
    });

    document.querySelectorAll('.page-filter-btn').forEach(button => {
      if ((button.getAttribute('onclick') || '').startsWith('togglePageFilter')) {
        button.textContent = 'ページ選択';
      }
    });

    document.getElementById('pageOrderBtn').textContent = 'ページ順';
    document.getElementById('quizPageOrderBtn').textContent = 'ページ順';

    const thirdHeader = document.querySelector('#wordTable thead th:nth-child(3)');
    if (thirdHeader) thirdHeader.textContent = 'ページ';

    ['flashcard', 'quiz', 'list'].forEach(key => {
      if (document.getElementById(key + 'PageFilter')?.classList.contains('open')) {
        original.setupPageFilter(key);
      }
    });
  }

  function activateKosen() {
    WORD_DATA.words = KOSEN_WORDS.map(item => ({ ...item }));
    resetRuntimeState();
    setKosenLabels();

    const lastTab = localStorage.getItem('wordcard_last_tab');
    const targetTab = ['flashcard', 'quiz', 'list'].includes(lastTab) ? lastTab : 'flashcard';
    switchTab(targetTab);
    updateProgressInfo();
  }

  function showApp() {
    document.getElementById('studyModeChooser').hidden = true;
    document.getElementById('appShell').hidden = false;
  }

  function showChooser(errorMessage = '') {
    document.body.classList.remove('toeic-mode');
    document.getElementById('appShell').hidden = true;
    const chooser = document.getElementById('studyModeChooser');
    chooser.hidden = false;

    chooser.querySelectorAll('button').forEach(button => {
      button.disabled = false;
    });

    const error = document.getElementById('studyModeError');
    if (error) error.textContent = errorMessage;
  }

  function returnToStudyModeHome() {
    localStorage.removeItem(MODE_KEY);
    showChooser();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function chooseStudyMode(mode) {
    if (!['kosen', 'toeic'].includes(mode)) return;

    const buttons = document.querySelectorAll('#studyModeChooser button');
    buttons.forEach(button => button.disabled = true);
    const error = document.getElementById('studyModeError');
    if (error) error.textContent = '';

    try {
      localStorage.setItem(MODE_KEY, mode);
      if (mode === 'toeic') {
        await activateToeic();
      } else {
        activateKosen();
      }
      showApp();
    } catch (err) {
      console.error('[study-mode]', err);
      localStorage.removeItem(MODE_KEY);
      buttons.forEach(button => button.disabled = false);
      showChooser('教材データの読み込みに失敗しました。通信状態を確認して再試行してください。');
    }
  }

  window.chooseStudyMode = chooseStudyMode;
  window.returnToStudyModeHome = returnToStudyModeHome;

  document.addEventListener('keydown', event => {
    const chooser = document.getElementById('studyModeChooser');
    if (chooser && !chooser.hidden) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  async function boot() {
    const mode = localStorage.getItem(MODE_KEY);

    try {
      if (mode === 'toeic') {
        await activateToeic();
        showApp();
      } else if (mode === 'kosen') {
        activateKosen();
        showApp();
      } else {
        showChooser();
      }
    } catch (err) {
      console.error('[study-mode]', err);
      localStorage.removeItem(MODE_KEY);
      showChooser('教材データの読み込みに失敗しました。もう一度選択してください。');
    }
  }

  boot();
})();
