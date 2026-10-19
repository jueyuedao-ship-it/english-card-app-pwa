(() => {
  const history = {
    flashcard: null,
    quiz: null,
  };

  function updateBackButtons() {
    const flashcardButton = document.getElementById('flashcardBackBtn');
    if (flashcardButton) {
      flashcardButton.disabled = !history.flashcard || history.flashcard.studyMode !== state.studyMode;
    }

    const quizButton = document.getElementById('quizBackBtn');
    if (quizButton) {
      quizButton.disabled = !history.quiz ||
        history.quiz.studyMode !== state.studyMode ||
        history.quiz.quizMode !== state.quizMode;
    }
  }

  function refreshSharedStats() {
    const stats = getFlashcardStats();
    state.flashcardKnown = stats.known;
    state.flashcardUnknown = stats.unknown;
    updateProgressInfo();
  }

  const originalInitFlashcard = initFlashcard;
  initFlashcard = function() {
    history.flashcard = null;
    const result = originalInitFlashcard();
    updateBackButtons();
    return result;
  };

  const originalToggleShuffle = toggleShuffle;
  toggleShuffle = function() {
    history.flashcard = null;
    const result = originalToggleShuffle();
    updateBackButtons();
    return result;
  };

  const originalTogglePageOrder = togglePageOrder;
  togglePageOrder = function() {
    history.flashcard = null;
    const result = originalTogglePageOrder();
    updateBackButtons();
    return result;
  };

  const originalMarkCard = markCard;
  markCard = function(known) {
    const word = state.flashcardOrder[0];
    if (!word) return originalMarkCard(known);

    history.flashcard = {
      studyMode: state.studyMode,
      wordKey: getWordIdentity(word),
      previousStatus: getWordStatus(word),
      order: [...state.flashcardOrder],
      seen: new Set(state.flashcardSeen),
    };

    const result = originalMarkCard(known);
    updateBackButtons();
    return result;
  };

  function goBackFlashcard() {
    const previous = history.flashcard;
    if (!previous || previous.studyMode !== state.studyMode) return;

    history.flashcard = null;
    setWordStatus(previous.wordKey, previous.previousStatus);
    state.flashcardOrder = [...previous.order];
    state.flashcardSeen = new Set(previous.seen);
    state.flashcardIndex = 0;
    state.flashcardFlipped = false;
    refreshSharedStats();
    showFlashcard();
    updateBackButtons();
  }

  const originalInitQuiz = initQuiz;
  initQuiz = function() {
    history.quiz = null;
    const result = originalInitQuiz();
    updateBackButtons();
    return result;
  };

  const originalCheckQuiz = checkQuiz;
  checkQuiz = function(
    btn,
    selected,
    correct,
    token = state.quizGeneration,
    wordKey = getWordIdentity(state.quizOrder[0]),
    mode = state.studyMode
  ) {
    const word = state.quizOrder[0];
    const accepted = token === state.quizGeneration &&
      state.quizAnsweredGeneration !== token &&
      mode === state.studyMode &&
      word &&
      getWordIdentity(word) === wordKey;

    if (accepted) {
      history.quiz = {
        studyMode: state.studyMode,
        quizMode: state.quizMode,
        wordKey,
        previousStatus: getWordStatus(word),
        order: [...state.quizOrder],
        seen: new Set(state.quizSeen),
        correctCount: state.quizCorrect,
        totalCount: state.quizTotal,
        question: document.getElementById('quizWord').textContent,
        options: [...document.querySelectorAll('#quizOptions .quiz-option')].map(button => button.textContent),
        correct,
      };
    }

    const result = originalCheckQuiz(btn, selected, correct, token, wordKey, mode);
    if (accepted) updateBackButtons();
    return result;
  };

  function renderRestoredQuiz(previous) {
    const token = ++state.quizGeneration;
    state.quizAnsweredGeneration = null;

    document.getElementById('quizWord').textContent = previous.question;
    document.getElementById('quizScore').textContent = state.quizCorrect;
    document.getElementById('quizTotal').textContent = state.quizTotal;
    document.getElementById('quizResult').textContent = '';

    const container = document.getElementById('quizOptions');
    container.innerHTML = '';
    previous.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'quiz-option';
      button.textContent = option;
      button.onclick = () => checkQuiz(
        button,
        option,
        previous.correct,
        token,
        previous.wordKey,
        previous.studyMode
      );
      container.appendChild(button);
    });
  }

  function goBackQuiz() {
    const previous = history.quiz;
    if (!previous ||
      previous.studyMode !== state.studyMode ||
      previous.quizMode !== state.quizMode) return;

    history.quiz = null;
    setWordStatus(previous.wordKey, previous.previousStatus);
    state.quizOrder = [...previous.order];
    state.quizSeen = new Set(previous.seen);
    state.quizIndex = 0;
    state.quizCorrect = previous.correctCount;
    state.quizTotal = previous.totalCount;
    refreshSharedStats();
    renderRestoredQuiz(previous);
    updateBackButtons();
  }

  globalThis.goBackFlashcard = goBackFlashcard;
  globalThis.goBackQuiz = goBackQuiz;
  updateBackButtons();
})();
