// Ocean Match memory game
// Expected HTML elements:
//   #memory-board
//   #memory-status
//   #memory-moves
//   #memory-score
//   #memory-matches
//   #memory-timer
//   #memory-best-score
//   #memory-new-btn

(() => {
  "use strict";

  const MEMORY_PAIRS = [
    { name: "Dolphin", symbol: "🐬" },
    { name: "Turtle", symbol: "🐢" },
    { name: "Octopus", symbol: "🐙" },
    { name: "Seahorse", symbol: "🐠" },
    { name: "Crab", symbol: "🦀" },
    { name: "Starfish", symbol: "⭐" },
    { name: "Jellyfish", symbol: "🪼" },
    { name: "Whale", symbol: "🐋" }
  ];

  const board = document.getElementById("memory-board");
  const status = document.getElementById("memory-status");
  const movesElement = document.getElementById("memory-moves");
  const scoreElement = document.getElementById("memory-score");
  const matchesElement = document.getElementById("memory-matches");
  const timerElement = document.getElementById("memory-timer");
  const bestScoreElement = document.getElementById("memory-best-score");
  const newGameButton = document.getElementById("memory-new-btn");

  // Do not throw errors if the Ocean Match panel has not been added yet.
  if (!board) return;

  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let matches = 0;
  let score = 0;
  let seconds = 0;
  let timerId = null;
  let gameStarted = false;

  function getBestScore() {
    return Number.parseInt(localStorage.getItem("oceanMatchBestScore"), 10) || 0;
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function updateStats() {
    setText(movesElement, moves);
    setText(scoreElement, score);
    setText(matchesElement, `${matches}/${MEMORY_PAIRS.length}`);
    setText(timerElement, formatTime(seconds));
    setText(bestScoreElement, getBestScore() || "—");
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const remainder = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function shuffle(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }

    return copy;
  }

  function createDeck() {
    return shuffle(
      MEMORY_PAIRS.flatMap((creature, pairIndex) => [
        { ...creature, pairIndex, cardId: `${pairIndex}-a` },
        { ...creature, pairIndex, cardId: `${pairIndex}-b` }
      ])
    );
  }

  function renderBoard() {
    board.innerHTML = "";

    cards.forEach((card, index) => {
      const cardButton = document.createElement("button");
      cardButton.type = "button";
      cardButton.className = "memory-card";
      cardButton.dataset.index = index;
      cardButton.dataset.pair = card.pairIndex;
      cardButton.setAttribute("aria-label", "Hidden ocean creature card");

      cardButton.innerHTML = `
        <span class="memory-card-inner">
          <span class="memory-card-front" aria-hidden="true">${card.symbol}</span>
          <span class="memory-card-back" aria-hidden="true">✦</span>
        </span>
      `;

      cardButton.addEventListener("click", () => handleCardClick(cardButton));
      board.appendChild(cardButton);
    });
  }

  function startTimer() {
    if (timerId !== null) return;

    timerId = window.setInterval(() => {
      seconds += 1;
      updateStats();
    }, 1000);
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function handleCardClick(cardButton) {
    if (
      lockBoard ||
      cardButton === firstCard ||
      cardButton.classList.contains("is-flipped") ||
      cardButton.classList.contains("is-matched")
    ) {
      return;
    }

    if (!gameStarted) {
      gameStarted = true;
      startTimer();
      setText(status, "Find the creature hiding in the matching card.");
    }

    cardButton.classList.add("is-flipped");
    cardButton.setAttribute("aria-label", `${cards[cardButton.dataset.index].name} card`);

    if (!firstCard) {
      firstCard = cardButton;
      return;
    }

    secondCard = cardButton;
    moves += 1;
    updateStats();
    checkForMatch();
  }

  function checkForMatch() {
    const firstIndex = Number(firstCard.dataset.index);
    const secondIndex = Number(secondCard.dataset.index);
    const isMatch = cards[firstIndex].pairIndex === cards[secondIndex].pairIndex;

    if (isMatch) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }

  function handleMatch() {
    window.gameSounds?.correct?.();
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    firstCard.disabled = true;
    secondCard.disabled = true;

    matches += 1;
    score += 100;
    setText(status, "Great match! Keep exploring the ocean.");
    updateStats();
    resetTurn();

    if (matches === MEMORY_PAIRS.length) {
      finishGame();
    }
  }

  function handleMismatch() {
    window.gameSounds?.wrong?.();
    lockBoard = true;
    score = Math.max(0, score - 10);
    setText(status, "Not a match this time. Try another pair.");
    updateStats();

    window.setTimeout(() => {
      if (firstCard) firstCard.classList.remove("is-flipped");
      if (secondCard) secondCard.classList.remove("is-flipped");

      if (firstCard) {
        firstCard.setAttribute("aria-label", "Hidden ocean creature card");
      }
      if (secondCard) {
        secondCard.setAttribute("aria-label", "Hidden ocean creature card");
      }

      resetTurn();
    }, 850);
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function finishGame() {
    window.gameSounds?.complete?.();
    stopTimer();

    // A faster game with fewer moves earns a better score.
    const timeBonus = Math.max(0, 300 - seconds * 2);
    const moveBonus = Math.max(0, (MEMORY_PAIRS.length * 2 - moves) * 20);
    score += timeBonus + moveBonus;

    const oldBestScore = getBestScore();
    if (score > oldBestScore) {
      localStorage.setItem("oceanMatchBestScore", String(score));
    }

    setText(
      status,
      `Ocean explorer complete! Final score: ${score}. You found every sea-creature pair!`
    );
    updateStats();
    board.classList.add("memory-complete");
  }

  function startNewGame() {
    stopTimer();
    cards = createDeck();
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matches = 0;
    score = 0;
    seconds = 0;
    gameStarted = false;

    board.classList.remove("memory-complete");
    setText(status, "Flip two cards to find your first ocean match.");
    renderBoard();
    updateStats();
  }

  if (newGameButton) {
    newGameButton.addEventListener("click", startNewGame);
  }

  startNewGame();
})();
