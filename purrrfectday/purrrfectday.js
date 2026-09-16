function applyThemePreference() {
    const profile = JSON.parse(localStorage.getItem("purrrfect-user-profile") || "{}");
    const theme = profile.theme || "day";
    document.body.classList.toggle("night-theme", theme === "night");
    document.body.classList.toggle("day-theme", theme === "day");

    const soundNote = document.getElementById("soundNote");
    if (soundNote) {
        soundNote.hidden = theme === "night";
    }

    const sun = document.querySelector(".sun");
    if (sun && theme === "night") {
        sun.classList.add("is-visible");
    }

    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
}

function saveThemePreference(theme) {
    const profile = JSON.parse(localStorage.getItem("purrrfect-user-profile") || "{}");
    profile.theme = theme;
    localStorage.setItem("purrrfect-user-profile", JSON.stringify(profile));
    applyThemePreference();

    const modal = document.getElementById("theme-modal");
    if (modal) {
        modal.hidden = true;
    }
}

function toggleTheme() {
    const profile = JSON.parse(localStorage.getItem("purrrfect-user-profile") || "{}");
    const nextTheme = profile.theme === "night" ? "day" : "night";
    saveThemePreference(nextTheme);

    const toggleButton = document.getElementById("floating-theme-toggle");
    if (toggleButton) {
        toggleButton.textContent = nextTheme === "night" ? "🌙" : "☀️";
    }
}

function initThemePrompt(onThemeChosen = null) {
    const modal = document.getElementById("theme-modal");

    if (!modal) {
        return;
    }

    modal.hidden = false;
    const choiceButtons = modal.querySelectorAll(".theme-choice");
    choiceButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const chosenTheme = button.dataset.themeChoice;
            saveThemePreference(chosenTheme);

            if (typeof onThemeChosen === "function") {
                onThemeChosen(chosenTheme);
            }
        });
    });
}

function showInput() {
    document.getElementById("inputSection").hidden = false;
    document.getElementById("userInput").focus();
}

const savedInputsKey = "purrrfectday-user-inputs";
let pendingUserInput = "";

function readSavedInputs() {
    try {
        const savedInputs = JSON.parse(localStorage.getItem(savedInputsKey) || "[]");
        return savedInputs.map((savedInput, index) => {
            if (typeof savedInput === "string") {
                return {
                    id: `legacy-${index}-${Date.now()}`,
                    text: savedInput,
                    createdAt: Date.now(),
                    deletedAt: null
                };
            }

            return {
                id: savedInput.id || `note-${index}-${Date.now()}`,
                text: savedInput.text || "",
                createdAt: savedInput.createdAt || Date.now(),
                deletedAt: savedInput.deletedAt || null
            };
        });
    } catch (error) {
        return [];
    }
}

function writeSavedInputs(savedInputs) {}


function renderSavedInputs() {
    const output = document.getElementById("output");
    const savedInputs = readSavedInputs();

    if (!output) {
        return;
    }

    output.replaceChildren();
    savedInputs.forEach((savedInput) => {
        const note = document.createElement("article");
        note.className = "saved-input-item";

        const paragraph = document.createElement("p");
        paragraph.textContent = savedInput.text;

        note.append(paragraph);
        output.appendChild(note);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    applyThemePreference();

    const tideRefresh = document.getElementById("tide-refresh");
    const puzzleClue = document.getElementById("puzzle-clue");
    const puzzleTitle = document.getElementById("puzzle-title");
    const puzzleResult = document.getElementById("puzzle-result");
    const puzzleChoices = document.querySelectorAll(".puzzle-choices button");

    if (tideRefresh && puzzleClue && puzzleTitle && puzzleResult) {
        const puzzles = [
            {
                title: "Who left the striped shell?",
                clue: "The trail starts beside the surfboard and ends near the umbrella.",
                answer: "starfish",
                choices: [
                    ["sponge", "Sponge friend"],
                    ["starfish", "Starfish"],
                    ["boat", "The boat"]
                ]
            },
            {
                title: "Who is hiding by the tide pool?",
                clue: "Look for the friend with the biggest smile and the yellowest suit.",
                answer: "sponge",
                choices: [
                    ["sponge", "Sponge friend"],
                    ["patrick", "Patrick friend"],
                    ["shell", "A shell"]
                ]
            },
            {
                title: "Which way did the boat drift?",
                clue: "The sail points toward the warm afternoon breeze.",
                answer: "boat",
                choices: [
                    ["boat", "Toward the shore"],
                    ["surfboard", "Toward the surfboard"],
                    ["shell", "Toward the shells"]
                ]
            },
            {
                title: "Who made the steps in the sand?",
                clue: "The prints are small, round, and lead from the water to the tide pool.",
                answer: "patrick",
                choices: [
                    ["patrick", "Patrick friend"],
                    ["starfish", "Starfish"],
                    ["sponge", "Sponge friend"]
                ]
            },
            {
                title: "What is ready for the next big wave?",
                clue: "It has bright stripes and waits beside the foamy water.",
                answer: "surfboard",
                choices: [
                    ["shell", "A shell"],
                    ["surfboard", "The surfboard"],
                    ["boat", "The boat"]
                ]
            }
        ];
        let puzzleIndex = 0;
        let revealTimer;

        const renderPuzzle = () => {
            const puzzle = puzzles[puzzleIndex];
            puzzleTitle.textContent = puzzle.title;
            puzzleClue.textContent = puzzle.clue;
            puzzleChoices.forEach((choice, choiceIndex) => {
                const [answer, label] = puzzle.choices[choiceIndex];
                choice.dataset.answer = answer;
                choice.textContent = label;
            });
        };

        const setPuzzleControlsDisabled = (isDisabled) => {
            tideRefresh.disabled = isDisabled;
            puzzleChoices.forEach((choice) => {
                choice.disabled = isDisabled;
            });
        };

        renderPuzzle();

        puzzleChoices.forEach((choice) => {
            choice.addEventListener("click", () => {
                const puzzle = puzzles[puzzleIndex];
                puzzleResult.textContent = choice.dataset.answer === puzzle.answer
                    ? "You solved it! The tide approves."
                    : "Not quite. Follow the clues and try again.";
                puzzleResult.classList.toggle("is-correct", choice.dataset.answer === puzzle.answer);
            });
        });

        tideRefresh.addEventListener("click", () => {
            if (document.body.classList.contains("tide-refreshing")) {
                return;
            }

            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            document.body.classList.add("tide-refreshing");
            setPuzzleControlsDisabled(true);
            puzzleResult.textContent = "";

            if (reducedMotion) {
                puzzleIndex = (puzzleIndex + 1) % puzzles.length;
                renderPuzzle();
                document.body.classList.remove("tide-refreshing");
                setPuzzleControlsDisabled(false);
                return;
            }

            window.clearTimeout(revealTimer);
            revealTimer = window.setTimeout(() => {
                puzzleIndex = (puzzleIndex + 1) % puzzles.length;
                renderPuzzle();
            }, 700);
        });

        const tideWipe = document.querySelector(".tide-wipe");
        if (tideWipe) {
            tideWipe.addEventListener("animationend", (event) => {
                if (event.animationName !== "tideSweep") {
                    return;
                }

                window.clearTimeout(revealTimer);
                document.body.classList.remove("tide-refreshing");
                setPuzzleControlsDisabled(false);
            });
        }
    }

    initThemePrompt((chosenTheme) => {
        if (chosenTheme !== "day") {
            return;
        }

        const sun = document.querySelector(".sun");
        if (!sun || sun.classList.contains("is-visible")) {
            return;
        }

        sun.classList.add("is-visible");
    });

    const toggleButton = document.getElementById("floating-theme-toggle");
    if (toggleButton) {
        const profile = JSON.parse(localStorage.getItem("purrrfect-user-profile") || "{}");
        toggleButton.textContent = profile.theme === "night" ? "🌙" : "☀️";
        toggleButton.addEventListener("click", toggleTheme);
    }

    const revealItems = document.querySelectorAll(".scroll-reveal");
    const sun = document.querySelector(".sun");
    const soundNote = document.getElementById("soundNote");
    const birdsBackground = document.querySelector(".day-birds-background");
    const beachSoundToggle = document.getElementById("beach-sound-toggle");

    let sunIsReady = false;
    let soundIsUnlocked = false;
    let soundHasPlayed = false;
    let audioContext;
    let cricketSoundIsPlaying = false;
    let cricketSoundIsStarting = false;
    let cricketTimer;
    let birdSoundIsPlaying = false;
    let birdSoundIsStarting = false;
    let birdTimer;
    let birdRevealTimer;
    let beachSoundEnabled = false;
    let beachSoundIsPlaying = false;
    let beachSoundIsStarting = false;
    let beachSoundTimer;
    let beachNoiseSource;
    let pageIsActive = !document.hidden && document.hasFocus();

    function isPageActive() {
        return pageIsActive && !document.hidden && document.hasFocus();
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle("visible", entry.isIntersecting);
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px"
    });

    revealItems.forEach((item) => revealObserver.observe(item));
    renderSavedInputs();

    function playSunChime() {
        if (!document.body.classList.contains("day-theme") || !sunIsReady || !soundIsUnlocked || soundHasPlayed) {
            return;
        }

        soundHasPlayed = true;
        soundNote.hidden = true;
        const now = audioContext.currentTime;
        const duration = 2.8;
        const voiceFrequencies = [261.63, 329.63, 392];
        const masterGain = audioContext.createGain();

        masterGain.gain.setValueAtTime(0.0001, now);
        masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.45);
        masterGain.gain.setValueAtTime(0.18, now + 1.45);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        masterGain.connect(audioContext.destination);

        voiceFrequencies.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const vibrato = audioContext.createOscillator();
            const vibratoDepth = audioContext.createGain();

            oscillator.type = "triangle";
            oscillator.frequency.value = frequency;
            oscillator.detune.value = (index - 1) * 5;
            vibrato.type = "sine";
            vibrato.frequency.value = 5.2;
            vibratoDepth.gain.value = 5;

            vibrato.connect(vibratoDepth);
            vibratoDepth.connect(oscillator.frequency);
            oscillator.connect(masterGain);
            oscillator.start(now);
            vibrato.start(now);
            oscillator.stop(now + duration);
            vibrato.stop(now + duration);
        });

    }

    function scheduleCricketChirp() {
        if (!cricketSoundIsPlaying || !isPageActive() || !document.body.classList.contains("night-theme")) {
            return;
        }

        const startTime = audioContext.currentTime + 0.05;
        const pulseCount = 3 + Math.floor(Math.random() * 3);
        const pulseLength = 0.045;
        const pulseGap = 0.025;
        const frequency = 2600 + Math.random() * 700;

        for (let pulseIndex = 0; pulseIndex < pulseCount; pulseIndex += 1) {
            const pulseStart = startTime + pulseIndex * (pulseLength + pulseGap);
            const chirp = audioContext.createOscillator();
            const chirpGain = audioContext.createGain();

            chirp.type = "triangle";
            chirp.frequency.setValueAtTime(frequency, pulseStart);
            chirp.frequency.linearRampToValueAtTime(frequency + 180, pulseStart + pulseLength);
            chirpGain.gain.setValueAtTime(0.0001, pulseStart);
            chirpGain.gain.exponentialRampToValueAtTime(0.055, pulseStart + 0.006);
            chirpGain.gain.exponentialRampToValueAtTime(0.0001, pulseStart + pulseLength);

            chirp.connect(chirpGain);
            chirpGain.connect(audioContext.destination);
            chirp.start(pulseStart);
            chirp.stop(pulseStart + pulseLength);
        }

        cricketTimer = window.setTimeout(scheduleCricketChirp, 700 + Math.random() * 1800);
    }

    function startCricketSound() {
        if (cricketSoundIsPlaying || cricketSoundIsStarting || !isPageActive() || !document.body.classList.contains("night-theme")) {
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        cricketSoundIsStarting = true;
        audioContext.resume().then(() => {
            cricketSoundIsStarting = false;

            if (!isPageActive() || !document.body.classList.contains("night-theme")) {
                return;
            }

            cricketSoundIsPlaying = true;
            scheduleCricketChirp();
        });
    }

    function stopCricketSound() {
        cricketSoundIsPlaying = false;
        cricketSoundIsStarting = false;
        window.clearTimeout(cricketTimer);
    }

    function scheduleBirdCall() {
        if (!birdSoundIsPlaying || !isPageActive() || !document.body.classList.contains("day-theme")) {
            return;
        }

        const startTime = audioContext.currentTime + 0.02;
        const noteCount = 2 + Math.floor(Math.random() * 2);
        const noteGap = 0.12;
        const notes = [1800, 2350, 2900];

        for (let noteIndex = 0; noteIndex < noteCount; noteIndex += 1) {
            const noteStart = startTime + noteIndex * noteGap;
            const noteLength = 0.16 + Math.random() * 0.06;
            const birdNote = audioContext.createOscillator();
            const noteGain = audioContext.createGain();
            const frequency = notes[Math.floor(Math.random() * notes.length)] + Math.random() * 180;

            birdNote.type = "sine";
            birdNote.frequency.setValueAtTime(frequency * 0.82, noteStart);
            birdNote.frequency.exponentialRampToValueAtTime(frequency, noteStart + noteLength * 0.35);
            birdNote.frequency.exponentialRampToValueAtTime(frequency * 0.72, noteStart + noteLength);
            noteGain.gain.setValueAtTime(0.0001, noteStart);
            noteGain.gain.exponentialRampToValueAtTime(0.035, noteStart + 0.018);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteLength);

            birdNote.connect(noteGain);
            noteGain.connect(audioContext.destination);
            birdNote.start(noteStart);
            birdNote.stop(noteStart + noteLength);
        }

        birdTimer = window.setTimeout(scheduleBirdCall, 8000);
    }

    function startBirdSound() {
        if (birdSoundIsPlaying || birdSoundIsStarting || !isPageActive() || !document.body.classList.contains("day-theme")) {
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        birdSoundIsStarting = true;
        audioContext.resume().then(() => {
            birdSoundIsStarting = false;

            if (!isPageActive() || !document.body.classList.contains("day-theme")) {
                return;
            }

            birdSoundIsPlaying = true;
            scheduleBirdCall();
        });
    }

    function stopBirdSound() {
        birdSoundIsPlaying = false;
        birdSoundIsStarting = false;
        window.clearTimeout(birdTimer);
    }

    function scheduleSeagullCall() {
        if (!beachSoundIsPlaying || !beachSoundEnabled || !isPageActive() || !document.body.classList.contains("beach-theme")) {
            return;
        }

        const startTime = audioContext.currentTime + 0.05;
        const callDuration = 0.72;
        const gullCall = audioContext.createOscillator();
        const gullGain = audioContext.createGain();

        gullCall.type = "sine";
        gullCall.frequency.setValueAtTime(1380, startTime);
        gullCall.frequency.exponentialRampToValueAtTime(2100, startTime + 0.18);
        gullCall.frequency.exponentialRampToValueAtTime(1120, startTime + callDuration);
        gullGain.gain.setValueAtTime(0.0001, startTime);
        gullGain.gain.exponentialRampToValueAtTime(0.045, startTime + 0.06);
        gullGain.gain.setValueAtTime(0.035, startTime + 0.24);
        gullGain.gain.exponentialRampToValueAtTime(0.0001, startTime + callDuration);

        gullCall.connect(gullGain);
        gullGain.connect(audioContext.destination);
        gullCall.start(startTime);
        gullCall.stop(startTime + callDuration);
        beachSoundTimer = window.setTimeout(scheduleSeagullCall, 6500 + Math.random() * 5500);
    }

    function startBeachSound() {
        if (beachSoundIsPlaying || beachSoundIsStarting || !beachSoundEnabled || !isPageActive() || !document.body.classList.contains("beach-theme")) {
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        beachSoundIsStarting = true;
        audioContext.resume().then(() => {
            beachSoundIsStarting = false;

            if (!beachSoundEnabled || !isPageActive() || !document.body.classList.contains("beach-theme")) {
                return;
            }

            const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            const noiseFilter = audioContext.createBiquadFilter();
            const noiseGain = audioContext.createGain();

            for (let index = 0; index < noiseData.length; index += 1) {
                noiseData[index] = Math.random() * 2 - 1;
            }

            beachNoiseSource = audioContext.createBufferSource();
            beachNoiseSource.buffer = noiseBuffer;
            beachNoiseSource.loop = true;
            noiseFilter.type = "lowpass";
            noiseFilter.frequency.value = 720;
            noiseFilter.Q.value = 0.5;
            noiseGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 1.8);

            beachNoiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            beachNoiseSource.start();
            beachSoundIsPlaying = true;
            scheduleSeagullCall();
        });
    }

    function stopBeachSound() {
        beachSoundIsPlaying = false;
        beachSoundIsStarting = false;
        window.clearTimeout(beachSoundTimer);

        if (beachNoiseSource) {
            beachNoiseSource.stop();
            beachNoiseSource.disconnect();
            beachNoiseSource = null;
        }
    }

    function updateBeachSoundButton() {
        if (!beachSoundToggle) {
            return;
        }

        const label = beachSoundToggle.querySelector(".beach-sound-label");
        beachSoundToggle.setAttribute("aria-pressed", String(beachSoundEnabled));
        beachSoundToggle.title = beachSoundEnabled ? "Mute shore sounds" : "Play shore sounds";
        if (label) {
            label.textContent = beachSoundEnabled ? "Mute shore sounds" : "Play shore sounds";
        }
    }

    if (beachSoundToggle) {
        beachSoundToggle.addEventListener("click", () => {
            beachSoundEnabled = !beachSoundEnabled;
            updateBeachSoundButton();

            if (beachSoundEnabled) {
                startBeachSound();
            } else {
                stopBeachSound();
            }
        });
    }

    function revealBirds(delay = 0, onReveal = null) {
        if (!birdsBackground) {
            return;
        }

        window.clearTimeout(birdRevealTimer);
        birdRevealTimer = window.setTimeout(() => {
            if (!isPageActive() || !document.body.classList.contains("day-theme")) {
                return;
            }

            if (!birdsBackground.src) {
                birdsBackground.src = birdsBackground.dataset.src;
            }

            birdsBackground.classList.add("is-visible");

            if (typeof onReveal === "function") {
                onReveal();
            }
        }, delay);
    }

    function stopAmbientSound() {
        stopCricketSound();
        stopBirdSound();
        stopBeachSound();

        if (audioContext && audioContext.state === "running") {
            audioContext.suspend();
        }
    }

    function resumeAmbientSound() {
        if (!isPageActive() || (!soundIsUnlocked && !beachSoundEnabled)) {
            return;
        }

        if (audioContext) {
            audioContext.resume();
        }

        if (beachSoundEnabled) {
            startBeachSound();
        } else if (document.body.classList.contains("night-theme")) {
            startCricketSound();
        } else if (sunIsReady || !sun) {
            revealBirds(0, startBirdSound);
        }
    }

    function unlockSunSound() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        audioContext.resume().then(() => {
            soundIsUnlocked = true;

            if (document.body.classList.contains("day-theme")) {
                if (sunIsReady || !sun) {
                    playSunChime();
                    revealBirds(0, startBirdSound);
                }
            } else {
                startCricketSound();
            }
        });
    }

    document.addEventListener("themechange", (event) => {
        if (!isPageActive()) {
            stopAmbientSound();
            return;
        }

        if (event.detail.theme === "night") {
            stopBirdSound();
            startCricketSound();
        } else {
            stopCricketSound();
            if (sunIsReady || !sun) {
                revealBirds(0, startBirdSound);
            }
        }
    });

    function updatePageActivity() {
        pageIsActive = !document.hidden && document.hasFocus();

        if (pageIsActive) {
            resumeAmbientSound();
        } else {
            stopAmbientSound();
        }
    }

    document.addEventListener("visibilitychange", updatePageActivity);
    window.addEventListener("focus", updatePageActivity);
    window.addEventListener("blur", updatePageActivity);

    function playButtonClick() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        audioContext.resume().then(() => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startTime = audioContext.currentTime;

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(620, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, startTime + 0.08);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.13);
        });
    }

    function playTypingSound(key) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        audioContext.resume().then(() => {
            const startTime = audioContext.currentTime;
            const clickDuration = key === " " ? 0.085 : 0.045;
            const noiseBuffer = audioContext.createBuffer(
                1,
                Math.ceil(audioContext.sampleRate * clickDuration),
                audioContext.sampleRate
            );
            const noiseData = noiseBuffer.getChannelData(0);
            const noiseSource = audioContext.createBufferSource();
            const noiseFilter = audioContext.createBiquadFilter();
            const noiseGain = audioContext.createGain();
            const thock = audioContext.createOscillator();
            const thockGain = audioContext.createGain();

            for (let index = 0; index < noiseData.length; index += 1) {
                noiseData[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / noiseData.length, 2);
            }

            noiseSource.buffer = noiseBuffer;
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = key === " " ? 950 : 1800;
            noiseFilter.Q.value = 0.8;
            noiseGain.gain.setValueAtTime(0.0001, startTime);
            noiseGain.gain.exponentialRampToValueAtTime(key === " " ? 0.14 : 0.1, startTime + 0.003);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + clickDuration);

            thock.type = "sine";
            thock.frequency.setValueAtTime(key === " " ? 105 : 145, startTime);
            thock.frequency.exponentialRampToValueAtTime(70, startTime + 0.07);
            thockGain.gain.setValueAtTime(0.0001, startTime);
            thockGain.gain.exponentialRampToValueAtTime(key === " " ? 0.08 : 0.045, startTime + 0.004);
            thockGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            thock.connect(thockGain);
            thockGain.connect(audioContext.destination);
            noiseSource.start(startTime);
            noiseSource.stop(startTime + clickDuration);
            thock.start(startTime);
            thock.stop(startTime + 0.1);
        });
    }

    function triggerSunReveal() {
        if (!sun || sun.classList.contains("is-visible")) {
            return;
        }

        sun.classList.add("is-visible");

        window.setTimeout(() => {
            if (sunIsReady || !document.body.classList.contains("day-theme")) {
                return;
            }

            sunIsReady = true;
            playSunChime();
            revealBirds(5000, () => {
                if (soundIsUnlocked) {
                    startBirdSound();
                }
            });
        }, 7200);
    }

    if (sun) {
        sun.addEventListener("animationend", () => {
            sunIsReady = true;
            playSunChime();
            if (birdsBackground && document.body.classList.contains("day-theme")) {
                revealBirds(5000, () => {
                    if (soundIsUnlocked) {
                        startBirdSound();
                    }
                });
            }
        }, { once: true });
    }

    document.addEventListener("pointerdown", (event) => {
        if (event.target === sun || event.target.closest(".sun")) {
            triggerSunReveal();
        }
        unlockSunSound();
    }, { capture: true });
    document.addEventListener("click", (event) => {
        if (event.target === sun || event.target.closest(".sun")) {
            triggerSunReveal();
        }
        unlockSunSound();
    }, { capture: true });
    document.addEventListener("keydown", unlockSunSound, { once: true, capture: true });

    const typingFields = [
        document.getElementById("userInput"),
        document.getElementById("displayName")
    ];

    typingFields.forEach((field) => {
        if (!field) {
            return;
        }

        field.addEventListener("keydown", (event) => {
            if (event.key.length === 1 || event.key === "Backspace" || event.key === " ") {
                playTypingSound(event.key);
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest("button")) {
            playButtonClick();
        }
    });
});

function addInput() {
    let input = document.getElementById("userInput").value;

    if (input.trim() === "") {
        alert("Please write something first!");
        return;
    }

    pendingUserInput = input.trim();
    document.getElementById("inputSection").hidden = true;
    document.getElementById("nameSection").hidden = false;
    document.getElementById("displayName").focus();
}

function finishInput() {
    const displayName = document.getElementById("displayName").value.trim();

    if (displayName === "") {
        alert("Please enter a display name first!");
        return;
    }

    const savedInputs = readSavedInputs();
    savedInputs.push({
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: `${pendingUserInput} - ${displayName}`,
        createdAt: Date.now(),
        deletedAt: null
    });
    writeSavedInputs(savedInputs);
    renderSavedInputs();

    pendingUserInput = "";
    document.getElementById("userInput").value = "";
    document.getElementById("displayName").value = "";
    document.getElementById("nameSection").hidden = true;
}

function switchGame(gameType) {
    // 1. Remove active state from all menu cards
    document.querySelectorAll('.menu-card').forEach(card => card.classList.remove('active'));
    // 2. Remove active state from all game panels
    document.querySelectorAll('.game-view').forEach(view => view.classList.remove('active'));
    
    // 3. Highlight the clicked card target
    const clickedCard = event.currentTarget;
    clickedCard.classList.add('active');
    
    // 4. Show the selected game board
    document.getElementById(`${gameType}-game`).classList.add('active');
}

function switchGame(gameType, element)  {  
 document.querySelectorAll('.menu-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.game-view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });

    if (element) element.classList.add('active');

    document.querySelector('.game-selection-panel').style.display = 'none';
        document.querySelector('.hero-header').style.display = 'none';
    document.querySelector('.beach-scene').style.display = 'none';
    document.querySelector('.game-play-area').classList.add('active');

    const targetGame = document.getElementById(`${gameType}-game`);
    if (targetGame) {
        targetGame.classList.add('active');
        targetGame.style.display = gameType === 'wordsearch' ? 'flex' : 'block';
    }
}

