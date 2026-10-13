// Odd One Out game logic
// Replace the image filenames in ODD_ROUNDS with your own files.
// All image files should be in the same folder as PERFECTDAY2.HTML,
// unless you provide a folder path such as "images/sponge-1.jpg".

(() => {
  "use strict";

  const ODD_ROUNDS = [
    {
      hint: "SpongeBob is always in the sea, right?",
      oddIndex: 1,
      images: [
        "workingSB.jfif",
        "beachSB.jfif",
        "halloweenSB.jfif",
        "roamingSB.jfif"
      ]
    },
    {
      hint: "Dory?",
      oddIndex: 3,
      images: [
        "FRNDS BEACH.jfif",
        "Snoopy BEACH.jfif",
        "VOLLEYBALL BEACH.jfif",
        "ODD SNOOPY.jfif"
      ]
    },
    {
      hint:"Dory?",
      oddIndex: 2,
      images: [
        "turtlesND.jfif",
        "scaredND.jfif",
        "oddND.jfif",
        "jellyfishND.jfif"
      ]
    }
  ];

  const optionsContainer = document.getElementById("odd-options");
  const statusElement = document.getElementById("odd-status");
  const hintElement = document.getElementById("odd-hint");
  const hintButton = document.getElementById("odd-hint-btn");
  const nextButton = document.getElementById("odd-next-btn");
  const newGameButton = document.getElementById("odd-new-btn");
  const roundElement = document.getElementById("odd-round");
  const scoreElement = document.getElementById("odd-score");
  const correctElement = document.getElementById("odd-correct");

  if (!optionsContainer) return;

  let currentRound = 0;
  let score = 0;
  let correctAnswers = 0;
  let roundSolved = false;

  function setStatus(message, type = "normal") {
    statusElement.textContent = message;
    statusElement.className = "odd-instructions";

    if (type === "error") statusElement.classList.add("is-error");
    if (type === "success") statusElement.classList.add("is-success");
  }

  function updateStats() {
    roundElement.textContent = `${currentRound + 1} / ${ODD_ROUNDS.length}`;
    scoreElement.textContent = score;
    correctElement.textContent = correctAnswers;
  }

  function renderRound() {
    const round = ODD_ROUNDS[currentRound];
    roundSolved = false;
    optionsContainer.innerHTML = "";
    hintElement.hidden = true;
    hintElement.textContent = "";
    nextButton.disabled = true;
    hintButton.disabled = false;
    setStatus("Choose the picture that does not belong.");
    updateStats();

    round.images.forEach((imageName, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "odd-option";
      option.dataset.index = index;
      option.setAttribute("aria-label", `Odd One Out option ${index + 1}`);

      const image = document.createElement("img");
      image.src = imageName;
      image.alt = `Odd One Out option ${index + 1}`;
      image.loading = "lazy";
      image.onerror = () => {
        image.alt = `Placeholder: ${imageName}`;
        image.classList.add("image-placeholder");
      };

      const number = document.createElement("span");
      number.className = "odd-option-number";
      number.textContent = index + 1;

      option.append(image, number);
      option.addEventListener("click", () => handleAnswer(index, option));
      optionsContainer.appendChild(option);
    });
  }

  function handleAnswer(selectedIndex, selectedButton) {
    if (roundSolved) return;

    const correctIndex = ODD_ROUNDS[currentRound].oddIndex;

    if (selectedIndex === correctIndex) {
      window.gameSounds?.correct?.();
      roundSolved = true;
      correctAnswers += 1;
      score += 100;
      selectedButton.classList.add("is-correct");
      setStatus(
        currentRound === ODD_ROUNDS.length - 1
          ? "Excellent! You solved every Odd One Out round!"
          : "Correct! You found the odd one out.",
        "success"
      );

      document.querySelectorAll(".odd-option").forEach((button) => {
        button.disabled = true;
      });

      nextButton.disabled = false;
      hintButton.disabled = true;
      updateStats();
      return;
    }

    window.gameSounds?.wrong?.();
    score = Math.max(0, score - 10);
    selectedButton.classList.add("is-wrong");
    setStatus("Not that one — look closely and try again.", "error");
    updateStats();

    window.setTimeout(() => {
      selectedButton.classList.remove("is-wrong");
    }, 500);
  }

  function showHint() {
    const round = ODD_ROUNDS[currentRound];
    hintElement.textContent = `Hint: ${round.hint}`;
    hintElement.hidden = false;
    hintButton.disabled = true;
  }

  function goToNextRound() {
    if (!roundSolved) return;

    if (currentRound >= ODD_ROUNDS.length - 1) {
      setStatus(`Final score: ${score}. You are a true beach detective!`, "success");
      nextButton.disabled = true;
      return;
    }

    currentRound += 1;
    renderRound();
  }

  function startNewGame() {
    currentRound = 0;
    score = 0;
    correctAnswers = 0;
    renderRound();
  }

  hintButton.addEventListener("click", showHint);
  nextButton.addEventListener("click", goToNextRound);
  newGameButton.addEventListener("click", startNewGame);

  startNewGame();
})();
