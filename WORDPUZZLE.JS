// Word puzzle logic — all IDs prefixed with wp- to avoid clashing with PERFECTDAY.JS

const WP_WORDS = ["CALM","SOCIAL","ACTIVE","COFFEE","HIKE","MUSIC","FRIENDS","READING","ENERGY"];
const WP_SIZE = 12;

let wpGrid, wpCellEls, wpFoundWords, wpSelecting, wpStartCell;

function wpInit(){
  wpFoundWords = new Set();
  wpSelecting = false;
  wpStartCell = null;
  wpGrid = wpBuildGrid();
  wpRenderGrid();
  wpRenderWordList();
  document.getElementById("wp-status").textContent = "";
}

function wpBuildGrid(){
  const g = Array.from({length: WP_SIZE}, () => Array(WP_SIZE).fill(null));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];

  WP_WORDS.forEach(word => {
    let placed = false, attempts = 0;
    while(!placed && attempts < 300){
      attempts++;
      const dir = dirs[Math.floor(Math.random()*dirs.length)];
      const row = Math.floor(Math.random()*WP_SIZE);
      const col = Math.floor(Math.random()*WP_SIZE);
      const endRow = row + dir[1]*(word.length-1);
      const endCol = col + dir[0]*(word.length-1);
      if(endRow < 0 || endRow >= WP_SIZE || endCol < 0 || endCol >= WP_SIZE) continue;

      let fits = true;
      for(let i=0;i<word.length;i++){
        const r = row + dir[1]*i, c = col + dir[0]*i;
        if(g[r][c] && g[r][c] !== word[i]){ fits = false; break; }
      }
      if(fits){
        for(let i=0;i<word.length;i++){
          const r = row + dir[1]*i, c = col + dir[0]*i;
          g[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<WP_SIZE;r++){
    for(let c=0;c<WP_SIZE;c++){
      if(!g[r][c]) g[r][c] = alphabet[Math.floor(Math.random()*alphabet.length)];
    }
  }
  return g;
}

function wpRenderGrid(){
  const gridEl = document.getElementById("wp-grid");
  gridEl.style.gridTemplateColumns = `repeat(${WP_SIZE}, 32px)`;
  gridEl.innerHTML = "";
  wpCellEls = [];
  for(let r=0;r<WP_SIZE;r++){
    const rowEls = [];
    for(let c=0;c<WP_SIZE;c++){
      const div = document.createElement("div");
      div.className = "wp-cell";
      div.textContent = wpGrid[r][c];
      div.dataset.r = r;
      div.dataset.c = c;
      div.addEventListener("mousedown", () => wpOnStart(r,c));
      div.addEventListener("mouseenter", () => wpOnMove(r,c));
      gridEl.appendChild(div);
      rowEls.push(div);
    }
    wpCellEls.push(rowEls);
  }
  document.addEventListener("mouseup", wpOnEnd);

  gridEl.addEventListener("touchstart", wpHandleTouch, {passive:false});
  gridEl.addEventListener("touchmove", wpHandleTouch, {passive:false});
  gridEl.addEventListener("touchend", wpOnEnd);
}

function wpHandleTouch(e){
  e.preventDefault();
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if(el && el.classList.contains("wp-cell")){
    const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
    if(!wpSelecting) wpOnStart(r,c);
    else wpOnMove(r,c);
  }
}

function wpOnStart(r,c){
  wpSelecting = true;
  wpStartCell = {r,c};
  wpClearTempHighlight();
  wpCellEls[r][c].classList.add("selecting");
}

function wpOnMove(r,c){
  if(!wpSelecting) return;
  wpClearTempHighlight();
  const line = wpGetLine(wpStartCell.r, wpStartCell.c, r, c);
  if(line) line.forEach(({r,c}) => wpCellEls[r][c].classList.add("selecting"));
}

function wpOnEnd(){
  if(!wpSelecting) return;
  wpSelecting = false;
  const selected = document.querySelectorAll(".wp-cell.selecting");
  if(selected.length > 1){
    const cells = Array.from(selected).map(el => ({r:+el.dataset.r, c:+el.dataset.c}));
    wpCheckWord(cells);
  }
  wpClearTempHighlight();
}

function wpClearTempHighlight(){
  document.querySelectorAll(".wp-cell.selecting").forEach(el => el.classList.remove("selecting"));
}

function wpGetLine(r1,c1,r2,c2){
  const dr = r2-r1, dc = c2-c1;
  if(dr === 0 && dc === 0) return [{r:r1,c:c1}];
  if(dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr/Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc/Math.abs(dc);
  const cells = [];
  for(let i=0;i<=steps;i++) cells.push({r:r1+stepR*i, c:c1+stepC*i});
  return cells;
}

function wpCheckWord(cells){
  const forward = cells.map(({r,c}) => wpGrid[r][c]).join("");
  const backward = forward.split("").reverse().join("");
  const match = WP_WORDS.find(w => (w === forward || w === backward) && !wpFoundWords.has(w));
  if(match){
    wpFoundWords.add(match);
    cells.forEach(({r,c}) => wpCellEls[r][c].classList.add("found"));
    wpRenderWordList();
    if(wpFoundWords.size === WP_WORDS.length){
      document.getElementById("wp-status").textContent = "🎉 You found every word!";
    }
  }
}

function wpRenderWordList(){
  const ul = document.getElementById("wp-wordlist");
  ul.innerHTML = "";
  WP_WORDS.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    if(wpFoundWords.has(w)) li.classList.add("done");
    ul.appendChild(li);
  });
}

let wpRevealTimer = null;
let wpSplashContext = null;

// A louder crashing-wave splash for the tidal takeover. Self-contained so it
// does not depend on the ambient audio context owned by PERFECTDAY.JS.
function wpPlayWaveSplash(volume = 1){
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!wpSplashContext) {
    wpSplashContext = new AudioContextClass();
  }

  const ctx = wpSplashContext;

  ctx.resume().then(() => {
    const now = ctx.currentTime;
    const duration = 1.9;
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    // Main body of the crash: broadband noise with a rising-then-falling roar.
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const crash = ctx.createBufferSource();
    crash.buffer = noiseBuffer;

    const crashFilter = ctx.createBiquadFilter();
    crashFilter.type = "bandpass";
    crashFilter.Q.value = 0.7;
    crashFilter.frequency.setValueAtTime(420, now);
    crashFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.35);
    crashFilter.frequency.exponentialRampToValueAtTime(700, now + duration);

    const crashGain = ctx.createGain();
    crashGain.gain.setValueAtTime(0.0001, now);
    crashGain.gain.exponentialRampToValueAtTime(0.6, now + 0.18);
    crashGain.gain.setValueAtTime(0.52, now + 0.55);
    crashGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    crash.connect(crashFilter);
    crashFilter.connect(crashGain);
    crashGain.connect(master);
    crash.start(now);
    crash.stop(now + duration);

    // A deep, wet swell underneath the crash.
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    body.type = "sine";
    body.frequency.setValueAtTime(90, now);
    body.frequency.exponentialRampToValueAtTime(48, now + duration);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.28, now + 0.22);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(now);
    body.stop(now + duration);

    // A short hiss on the crest to make the spray read as a splash.
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = "highpass";
    hissFilter.frequency.value = 3200;

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.0001, now);
    hissGain.gain.exponentialRampToValueAtTime(0.18, now + 0.06);
    hissGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    const hiss = ctx.createBufferSource();
    hiss.buffer = noiseBuffer;
    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(master);
    hiss.start(now);
    hiss.stop(now + 0.7);

    // Drain the curve away, then release the master node.
    window.setTimeout(() => {
      try { master.disconnect(); } catch (error) { /* already gone */ }
    }, (duration + 0.2) * 1000);
  }).catch(() => {
    // Audio is not available yet (no user gesture); the wave still animates.
  });
}

function wpNewPuzzleWithWaves(){
  if (document.body.classList.contains("wave-sweeping")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const takeover = document.getElementById("wave-takeover");

  if (reducedMotion || !takeover) {
    wpInit();
    return;
  }

  document.body.classList.add("wave-sweeping");

  // The crashing splash tracks the animation: loudest as the water covers the page.
  wpPlayWaveSplash(1);

  // Build the fresh puzzle while it is hidden behind the wall of water.
  window.clearTimeout(wpRevealTimer);
  wpRevealTimer = window.setTimeout(wpInit, 720);
}

// Release the overlay once the water has finished retreating.
function wpOnWaveEnd(event){
  if (event.animationName !== "waveTakeoverRise") return;
  document.body.classList.remove("wave-sweeping");
}

const wpWaveOverlay = document.getElementById("wave-takeover");
if (wpWaveOverlay) {
  wpWaveOverlay.addEventListener("animationend", wpOnWaveEnd);
}

document.getElementById("wp-new-btn").addEventListener("click", wpNewPuzzleWithWaves);
wpInit();
