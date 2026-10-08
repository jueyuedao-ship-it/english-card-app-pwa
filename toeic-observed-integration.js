(() => {
  const MODE_KEY = 'wordcard_study_mode';
  const OBSERVED_FILTER_SUFFIX = '_observed_filter_v1';
  const OBSERVED_LABEL = '実問題追加';

  const base = {
    getFilteredWords,
    setupPageFilter,
    selectAllPages,
    deselectAllPages,
    clearAllPageFilters,
    showFlashcard,
    renderList,
  };

  function isToeicMode() {
    return state.studyMode === 'toeic';
  }

  function isObservedWord(word) {
    return word?.sourceCategory === 'observed';
  }

  function getObservedFilterKey(key) {
    return `wordcard_toeic_${key}${OBSERVED_FILTER_SUFFIX}`;
  }

  function isObservedEnabled(key) {
    const saved = localStorage.getItem(getObservedFilterKey(key));
    return saved === null ? true : saved === 'true';
  }

  function setObservedEnabled(key, enabled) {
    localStorage.setItem(getObservedFilterKey(key), String(Boolean(enabled)));
  }

  function getObservedRows() {
    const rows = window.TOEIC_BRIDGE_OBSERVED;
    if (!Array.isArray(rows) || rows.length !== 28) {
      throw new Error('TOEIC Bridge observed vocabulary data is incomplete.');
    }
    return rows;
  }

  function ensureObservedVocabulary() {
    if (!isToeicMode()) return 0;

    const rows = getObservedRows();
    const existingIds = new Set(WORD_DATA.words.map(word => word.id));
    let added = 0;

    for (const row of rows) {
      if (existingIds.has(row.id)) continue;
      WORD_DATA.words.push({ ...row, page: null });
      existingIds.add(row.id);
      added++;
    }

    if (added > 0) {
      updateObservedModeLabels();
      updateProgressInfo();
      switchTab(state.currentTab);
    }

    return added;
  }

  function appendObservedFilter(key, grid) {
    if (!grid || grid.querySelector('.toeic-observed-group')) return;

    const group = document.createElement('div');
    group.className = 'toeic-priority-group toeic-observed-group';

    const heading = document.createElement('label');
    heading.className = 'toeic-priority-heading';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'toeic-observed-toggle';
    checkbox.checked = isObservedEnabled(key);
    checkbox.addEventListener('change', () => {
      setObservedEnabled(key, checkbox.checked);
      switchTab(state.currentTab);
    });

    const text = document.createElement('span');
    text.textContent = OBSERVED_LABEL;

    heading.appendChild(checkbox);
    heading.appendChild(text);
    group.appendChild(heading);
    grid.appendChild(group);
  }

  function updateObservedModeLabels() {
    if (!isToeicMode()) return;

    document.querySelectorAll('.page-filter-title').forEach(element => {
      element.textContent = 'CEFR・優先度・実問題追加を選択';
    });

    document.querySelectorAll('.page-filter-btn').forEach(button => {
      if ((button.getAttribute('onclick') || '').startsWith('togglePageFilter')) {
        button.textContent = 'CEFR・優先度＋実問題';
      }
    });

    const thirdHeader = document.querySelector('#wordTable thead th:nth-child(3)');
    if (thirdHeader) thirdHeader.textContent = 'CEFR / 優先度 / 区分';

    ['flashcard', 'quiz', 'list'].forEach(key => {
      const grid = document.getElementById(key + 'PageGrid');
      if (grid && document.getElementById(key + 'PageFilter')?.classList.contains('open')) {
        appendObservedFilter(key, grid);
      }
    });
  }

  function getVisibleListWords() {
    let filtered = getFilteredWords('list');

    if (state.listSearch) {
      const search = state.listSearch.toLowerCase();
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(search) || word.meaning.includes(search)
      );
    }

    return LearningStatus.filterWordsByStatus(
      filtered,
      getLearningStatuses(),
      getLearningFilter('list'),
      getWordIdentity
    );
  }

  getFilteredWords = function(key) {
    const filtered = base.getFilteredWords(key);
    if (!isToeicMode() || !isObservedEnabled(key)) return filtered;

    const included = new Set(filtered.map(word => word.id));
    const observed = WORD_DATA.words.filter(word => isObservedWord(word) && !included.has(word.id));
    return filtered.concat(observed);
  };

  setupPageFilter = function(key) {
    const result = base.setupPageFilter(key);
    if (isToeicMode()) appendObservedFilter(key, document.getElementById(key + 'PageGrid'));
    return result;
  };

  selectAllPages = function(key) {
    if (isToeicMode()) setObservedEnabled(key, true);
    return base.selectAllPages(key);
  };

  deselectAllPages = function(key) {
    if (isToeicMode()) setObservedEnabled(key, false);
    return base.deselectAllPages(key);
  };

  clearAllPageFilters = function() {
    if (isToeicMode()) {
      ['flashcard', 'quiz', 'list'].forEach(key => {
        localStorage.removeItem(getObservedFilterKey(key));
      });
    }
    return base.clearAllPageFilters();
  };

  showFlashcard = function() {
    const result = base.showFlashcard();
    if (isToeicMode()) {
      const word = state.flashcardOrder[0];
      if (isObservedWord(word)) {
        const metadata = document.getElementById('flashcardPage');
        if (metadata) metadata.textContent = OBSERVED_LABEL;
      }
    }
    return result;
  };

  renderList = function() {
    const result = base.renderList();
    if (!isToeicMode()) return result;

    const visible = getVisibleListWords();
    const rows = document.querySelectorAll('#wordTableBody tr');
    visible.forEach((word, index) => {
      if (!isObservedWord(word)) return;
      const cell = rows[index]?.children?.[2];
      if (cell) cell.textContent = OBSERVED_LABEL;
    });
    return result;
  };

  const originalChooseStudyMode = window.chooseStudyMode;
  if (typeof originalChooseStudyMode === 'function') {
    window.chooseStudyMode = async function(mode) {
      await originalChooseStudyMode(mode);
      if (mode === 'toeic') ensureObservedVocabulary();
    };
  }

  function waitForRememberedToeicMode() {
    if (localStorage.getItem(MODE_KEY) !== 'toeic') return;

    let attempts = 0;
    const wait = () => {
      if (isToeicMode() && WORD_DATA.words.some(word => word.id === 'toeic-1')) {
        ensureObservedVocabulary();
        return;
      }
      attempts++;
      if (attempts < 500) setTimeout(wait, 20);
    };
    wait();
  }

  waitForRememberedToeicMode();
})();
