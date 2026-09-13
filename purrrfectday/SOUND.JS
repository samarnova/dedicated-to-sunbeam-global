// SOUND.JS
// Global sound effects for the website.
// No audio files are required; sounds are generated with Web Audio API.

(() => {
  "use strict";

  let audioContext = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function tone(frequency, duration, type, volume, delay = 0, endFrequency = frequency) {
    if (!soundEnabled) return;

    const context = getAudioContext();
    if (!context) return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function click() {
    tone(540, 0.065, "sine", 0.035, 0, 610);
  }

  function flip() {
    tone(300, 0.07, "triangle", 0.035, 0, 430);
    tone(580, 0.075, "triangle", 0.025, 0.045, 700);
  }

  // Bright, rising chime for a correct answer.
  function correct() {
    tone(523, 0.11, "sine", 0.05, 0, 523);
    tone(659, 0.11, "sine", 0.05, 0.09, 659);
    tone(784, 0.18, "sine", 0.06, 0.18, 1047);
  }

  // Lower, descending buzz for an incorrect answer.
  function wrong() {
    tone(250, 0.16, "sawtooth", 0.028, 0, 165);
    tone(175, 0.2, "square", 0.018, 0.1, 120);
  }

  // Longer celebratory melody for finishing a game or round set.
  function complete() {
    tone(523, 0.12, "sine", 0.05, 0, 523);
    tone(659, 0.12, "sine", 0.05, 0.1, 659);
    tone(784, 0.12, "sine", 0.05, 0.2, 784);
    tone(1047, 0.26, "sine", 0.06, 0.3, 1319);
  }

  function isDisabled(element) {
    return element.disabled || element.getAttribute("aria-disabled") === "true";
  }

  // Generic sound for controls across every connected HTML page.
  document.addEventListener("click", (event) => {
    const element = event.target.closest("button, a, .menu-card, [role='button']");
    if (!element || isDisabled(element) || element.closest("#beach-sound-toggle")) return;

    if (element.matches(".memory-card, .jigsaw-piece")) {
      flip();
    } else if (element.matches(".odd-option")) {
      // Odd One Out calls correct()/wrong() itself after checking the answer.
      click();
    } else {
      click();
    }
  }, true);

  window.gameSounds = {
    click,
    flip,
    correct,
    wrong,
    complete,
    enable() {
      soundEnabled = true;
    },
    disable() {
      soundEnabled = false;
    },
    toggle() {
      soundEnabled = !soundEnabled;
      return soundEnabled;
    },
    isEnabled() {
      return soundEnabled;
    }
  };
})();
