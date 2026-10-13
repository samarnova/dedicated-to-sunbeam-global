// Six-image jigsaw puzzle logic
// The user must complete each puzzle before moving to the next one.

const JW_GRID_SIZE = 4; // 4x4 = 16 pieces
const JW_TOTAL_PUZZLES = 6;

// Replace these six filenames with your actual image paths.
// They must be relative to PERFECTDAY2.HTML.
const JW_IMAGE_SOURCES = [
  "summer.jfif",
  "beach-backdrop.svg",
  "bird.svg",
  "manybirds.svg",
  "hpy.jpg",
  "summer.jfif"
];

let jwPuzzleImages = [];
let jwCurrentPuzzle = 0;
let jwPieces = [];
let jwSelectedIndex = null;
let jwPieceEls = [];
let jwPuzzleSolved = false;

function jwInit() {
  jwSelectedIndex = null;
  jwPuzzleSolved = false;
  jwPieces = jwBuildShuffledOrder();
  jwRenderReference();
  jwRenderBoard();
  jwUpdateProgress();
  jwSetStatus("Arrange the pieces, then click Done to check your answer.", "normal");
  jwUpdateButtons();
}

function jwStartPuzzleSet() {
  // Shuffle the six images once, so the first puzzle is random.
  jwPuzzleImages = [...JW_IMAGE_SOURCES];

  for (let i = jwPuzzleImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jwPuzzleImages[i], jwPuzzleImages[j]] = [jwPuzzleImages[j], jwPuzzleImages[i]];
  }

  jwCurrentPuzzle = 0;
  jwInit();
}

function jwCurrentImage() {
  return jwPuzzleImages[jwCurrentPuzzle] || JW_IMAGE_SOURCES[0];
}

function jwBuildShuffledOrder() {
  const total = JW_GRID_SIZE * JW_GRID_SIZE;
  const order = Array.from({ length: total }, (_, i) => i);

  // Fisher-Yates shuffle.
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Do not begin with an already-completed puzzle.
  if (order.every((value, index) => value === index)) {
    return jwBuildShuffledOrder();
  }

  return order;
}

function jwBackgroundPositionFor(correctIndex) {
  const col = correctIndex % JW_GRID_SIZE;
  const row = Math.floor(correctIndex / JW_GRID_SIZE);
  const step = JW_GRID_SIZE === 1 ? 0 : 100 / (JW_GRID_SIZE - 1);
  return `${col * step}% ${row * step}%`;
}

function jwRenderReference() {
  const reference = document.getElementById("jigsaw-reference");
  reference.src = jwCurrentImage();
  reference.alt = `Preview for jigsaw ${jwCurrentPuzzle + 1}`;

  const label = document.getElementById("jigsaw-puzzle-label");
  if (label) {
    label.textContent = `Jigsaw ${jwCurrentPuzzle + 1} of ${JW_TOTAL_PUZZLES}`;
  }
}

function jwRenderBoard() {
  const board = document.getElementById("jigsaw-board");
  const imageSource = jwCurrentImage();

  board.style.gridTemplateColumns = `repeat(${JW_GRID_SIZE}, 1fr)`;
  board.innerHTML = "";
  jwPieceEls = [];

  jwPieces.forEach((correctIndex, position) => {
    const piece = document.createElement("div");
    piece.className = "jigsaw-piece";
    piece.style.backgroundImage = `url("${imageSource}")`;
    piece.style.backgroundSize = `${JW_GRID_SIZE * 100}% ${JW_GRID_SIZE * 100}%`;
    piece.style.backgroundPosition = jwBackgroundPositionFor(correctIndex);
    piece.dataset.position = position;
    piece.setAttribute("role", "button");
    piece.setAttribute("tabindex", "0");
    piece.setAttribute("aria-label", `Puzzle piece ${position + 1}`);

    piece.addEventListener("click", () => jwHandlePieceClick(position));
    piece.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        jwHandlePieceClick(position);
      }
    });

    board.appendChild(piece);
    jwPieceEls.push(piece);
  });
}

function jwHandlePieceClick(position) {
  if (jwPuzzleSolved) return;

  if (jwSelectedIndex === null) {
    jwSelectedIndex = position;
    jwPieceEls[position].classList.add("selected");
    return;
  }

  if (jwSelectedIndex === position) {
    jwPieceEls[position].classList.remove("selected");
    jwSelectedIndex = null;
    return;
  }

  // Swap the two selected pieces.
  [jwPieces[jwSelectedIndex], jwPieces[position]] = [
    jwPieces[position],
    jwPieces[jwSelectedIndex]
  ];

  jwSelectedIndex = null;
  jwRenderBoard();
  jwSetStatus("Keep going, or click Done when you think it is complete.", "normal");
}

function jwIsSolved() {
  return jwPieces.every((correctIndex, position) => correctIndex === position);
}

function jwCheckDone() {
  if (jwPuzzleSolved) {
    jwSetStatus(
      jwCurrentPuzzle === JW_TOTAL_PUZZLES - 1
        ? "You completed all six jigsaws! Amazing work!"
        : "This jigsaw is already complete. Click Next for another one.",
      "success"
    );
    return;
  }

  if (!jwIsSolved()) {
    window.gameSounds?.wrong?.();
    jwSetStatus("Please finish the jigsaw first to reveal the next puzzle.", "error");
    return;
  }

  jwPuzzleSolved = true;
  window.gameSounds?.correct?.();
  jwUpdateProgress();
  jwUpdateButtons();

  if (jwCurrentPuzzle === JW_TOTAL_PUZZLES - 1) {
    window.gameSounds?.complete?.();
    jwSetStatus("🎉 You completed all six jigsaws! Amazing work!", "success");
    jwCelebrate();
  } else {
    jwSetStatus("🎉 Picture complete! Click Next to enjoy another jigsaw.", "success");
    jwCelebrate();
  }
}

function jwGoToNextPuzzle() {
  if (!jwPuzzleSolved) {
    jwSetStatus("Please finish the current jigsaw first.", "error");
    return;
  }

  if (jwCurrentPuzzle >= JW_TOTAL_PUZZLES - 1) {
    jwSetStatus("You have completed all six jigsaws!", "success");
    return;
  }

  jwCurrentPuzzle += 1;
  jwInit();
}

function jwSetStatus(message, type) {
  const status = document.getElementById("jigsaw-status");
  status.textContent = message;
  status.className = `jigsaw-status-${type}`;
}

function jwUpdateButtons() {
  const doneButton = document.getElementById("jigsaw-done-btn");
  const nextButton = document.getElementById("jigsaw-next-btn");

  doneButton.disabled = false;
  nextButton.disabled = !jwPuzzleSolved || jwCurrentPuzzle >= JW_TOTAL_PUZZLES - 1;
}

function jwUpdateProgress() {
  document.querySelectorAll(".jigsaw-progress-box").forEach((box, index) => {
    box.classList.toggle("current", index === jwCurrentPuzzle);
    box.classList.toggle("completed", index < jwCurrentPuzzle || (index === jwCurrentPuzzle && jwPuzzleSolved));
    box.setAttribute("aria-current", index === jwCurrentPuzzle ? "step" : "false");
  });
}

function jwCelebrate() {
  const panel = document.querySelector(".jigsaw-panel");
  if (!panel) return;

  panel.classList.remove("jigsaw-celebrate");
  void panel.offsetWidth;
  panel.classList.add("jigsaw-celebrate");
}

const jwDoneButton = document.getElementById("jigsaw-done-btn");
const jwNextButton = document.getElementById("jigsaw-next-btn");

if (jwDoneButton) {
  jwDoneButton.addEventListener("click", jwCheckDone);
}

if (jwNextButton) {
  jwNextButton.addEventListener("click", jwGoToNextPuzzle);
}

// Keep this optional compatibility handler if another part of the page
// still references the old New jigsaw button.
const jwOldNewButton = document.getElementById("jigsaw-new-btn");
if (jwOldNewButton) {
  jwOldNewButton.addEventListener("click", jwStartPuzzleSet);
}

jwStartPuzzleSet();
