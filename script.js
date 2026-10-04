// ===== LUDO KING STYLE — Complete Game =====
(function() {
  'use strict';

  function $(id) { return document.getElementById(id); }

  const canvas = $('board');
  if (!canvas) { console.error('❌ Canvas নেই'); return; }
  const ctx = canvas.getContext('2d');

  const menuScreen = $('menuScreen');
  const gameScreen = $('gameScreen');
  const winScreen = $('winScreen');
  const statusText = $('statusText');
  const turnIndicator = $('turnIndicator');
  const diceBtn = $('diceBtn');
  const diceFace = $('diceFace');
  const winTitle = $('winTitle');
  const winText = $('winText');
  const winConfetti = $('winConfetti');

  // ===== বোর্ড =====
  const GRID = 15;
  let CELL = 26;
  let W = 0, H = 0;

  // ===== খেলোয়াড় =====
  const PLAYERS = [
    { id: 0, name: 'তুমি',  color: '#e63946', dark: '#9d1f2b', light: '#ff8a8a', emoji: '🔴' },
    { id: 1, name: 'বট 1',  color: '#06d6a0', dark: '#048f6c', light: '#6eecb8', emoji: '🟢' },
    { id: 2, name: 'বট 2',  color: '#ffd60a', dark: '#ccaa00', light: '#ffe680', emoji: '🟡' },
    { id: 3, name: 'বট 3',  color: '#4cc9f0', dark: '#2596be', light: '#a5e4f7', emoji: '🔵' }
  ];

  // ===== 52-ঘরের পাথ =====
  // লাল এর হোম path[0] থেকে শুরু, ডানে ঘুরে
  const PATH = [
    // লাল হোম এরিয়া থেকে ডান দিকে (row 6, col 1→5)
    {x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
    // উপরের col (col 6, row 5→0)
    {x:6,y:5},{x:6,y:4},{x:6,y:3},{x:6,y:2},{x:6,y:1},{x:6,y:0},
    // উপরে ডানে (row 0, col 7, 8)
    {x:7,y:0},{x:8,y:0},
    // নিচে ডানে (col 8, row 1→6)
    {x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},
    // সবুজ হোম থেকে ডানে (row 6, col 9→13)
    {x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6},
    // ডানে col 14, row 6→8
    {x:14,y:6},{x:14,y:7},{x:14,y:8},
    // নিচে বামে (row 8, col 13→9)
    {x:13,y:8},{x:12,y:8},{x:11,y:8},{x:10,y:8},{x:9,y:8},
    // নিচের col (col 8, row 9→14)
    {x:8,y:9},{x:8,y:10},{x:8,y:11},{x:8,y:12},{x:8,y:13},{x:8,y:14},
    // নিচে বামে (row 14, col 7, 6)
    {x:7,y:14},{x:6,y:14},
    // উপরে বামে (col 6, row 13→9)
    {x:6,y:13},{x:6,y:12},{x:6,y:11},{x:6,y:10},{x:6,y:9},
    // হলুদ হোম থেকে বামে (row 8, col 5→1)
    {x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8},
    // বামে col 0, row 8→6
    {x:0,y:8},{x:0,y:7},{x:0,y:6}
  ];

  // স্টার্ট পজিশন (প্রতি প্লেয়ারের জন্য)
  const START_POS = [0, 13, 26, 39];

  // হোম কলাম (শেষ 5 ঘর)
  const HOME_PATH = {
    0: [{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7}],
    1: [{x:7,y:1},{x:7,y:2},{x:7,y:3},{x:7,y:4},{x:7,y:5}],
    2: [{x:13,y:7},{x:12,y:7},{x:11,y:7},{x:10,y:7},{x:9,y:7}],
    3: [{x:7,y:13},{x:7,y:12},{x:7,y:11},{x:7,y:10},{x:7,y:9}]
  };

  // হোম বেস (৪টি টোকেন এর পজিশন)
  const HOME_BASE = {
    0: [{x:2,y:2},{x:4,y:2},{x:2,y:4},{x:4,y:4}],       // লাল — বাম-উপরে
    1: [{x:10,y:2},{x:12,y:2},{x:10,y:4},{x:12,y:4}],   // সবুজ — ডান-উপরে
    2: [{x:10,y:10},{x:12,y:10},{x:10,y:12},{x:12,y:12}], // হলুদ — ডান-নিচে
    3: [{x:2,y:10},{x:4,y:10},{x:2,y:12},{x:4,y:12}]    // নীল — বাম-নিচে
  };

  // সেফ স্পট (৮টি)
  const SAFE = [0, 8, 13, 21, 26, 34, 39, 47];

  // হোম এরিয়ার রঙ (বোর্ডে দেখানোর জন্য)
  const HOME_AREA = {
    0: { x: 0, y: 0, color: '#e63946' },
    1: { x: 9, y: 0, color: '#06d6a0' },
    2: { x: 9, y: 9, color: '#ffd60a' },
    3: { x: 0, y: 9, color: '#4cc9f0' }
  };

  // ===== State =====
  let playerCount = 3;
  let botLevel = 'easy';
  let playerName = 'তুমি';
  let players = [];
  let currentPlayer = 0;
  let diceValue = 0;
  let hasRolled = false;
  let mustMoveToken = false;
  let gameOver = false;
  let statusTimeout = null;
  let consecutiveSixes = 0;
  let moveAnimation = null;
  let lastMovedToken = null;

  // ===== টোকেন =====
  function createToken() {
    return { state: 'base', pos: 0, homeIdx: -1 }; // base | path | home | done
  }

  // ===== সাউন্ড =====
  let audioCtx = null;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}

  function playSound(freq, duration, type, volume) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume || 0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function diceSound() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playSound(300 + Math.random() * 400, 0.04, 'square', 0.06), i * 70);
    }
  }
  function moveSound() { playSound(700, 0.06, 'sine', 0.07); }
  function killSound() {
    playSound(300, 0.1, 'sawtooth', 0.12);
    setTimeout(() => playSound(180, 0.2, 'sawtooth', 0.12), 100);
  }
  function homeSound() {
    playSound(880, 0.1, 'triangle', 0.1);
    setTimeout(() => playSound(1320, 0.15, 'triangle', 0.1), 100);
  }
  function winSound() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => playSound(f, 0.25, 'triangle', 0.09), i * 130);
    });
  }
  function clickSound() { playSound(600, 0.05, 'square', 0.04); }
  function safeSound() { playSound(1200, 0.08, 'sine', 0.08); }

  // ===== Canvas resize =====
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const size = Math.min(wrap.clientWidth, wrap.clientHeight) - 16;
    if (size <= 0) return;
    canvas.width = size;
    canvas.height = size;
    W = canvas.width;
    H = canvas.height;
    CELL = size / GRID;
    draw();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.__rsz);
    window.__rsz = setTimeout(resizeCanvas, 100);
  });

  // ===== আঁকা =====
  function draw() {
    if (!W) return;

    // ব্যাকগ্রাউন্ড
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, W, H);

    // 4টি হোম এরিয়া (রঙিন)
    for (let pid in HOME_AREA) {
      const a = HOME_AREA[pid];
      const color = a.color;

      // বাইরের ফ্রেম
      ctx.fillStyle = color;
      ctx.fillRect(a.x * CELL, a.y * CELL, 6 * CELL, 6 * CELL);

      // ভিতরের সাদা
      ctx.fillStyle = '#fff';
      ctx.fillRect((a.x + 0.35) * CELL, (a.y + 0.35) * CELL, 5.3 * CELL, 5.3 * CELL);

      // 4টি টোকেন স্লট
      const slots = HOME_BASE[pid];
      slots.forEach(s => {
        const cx = (s.x + 0.5) * CELL;
        const cy = (s.y + 0.5) * CELL;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ভিতরের হাইলাইট
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // পাথ সেল (সাদা ঘর)
    PATH.forEach((p, i) => {
      const x = p.x * CELL;
      const y = p.y * CELL;

      // কোন প্লেয়ারের স্টার্ট?
      const starterPid = START_POS.indexOf(i);

      if (starterPid !== -1) {
        // স্টার্ট সেলে রঙ
        ctx.fillStyle = PLAYERS[starterPid].color;
      } else {
        // সাধারণ সাদা
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillRect(x, y, CELL, CELL);

      // বর্ডার
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);

      // সেফ স্পট মার্ক (স্টার)
      if (SAFE.includes(i)) {
        drawStar(x + CELL/2, y + CELL/2, CELL * 0.32, 5, '#333');
      }
    });

    // হোম কলাম (রঙিন)
    for (let pid in HOME_PATH) {
      const path = HOME_PATH[pid];
      const color = PLAYERS[pid].color;
      path.forEach(p => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.75;
        ctx.fillRect(p.x * CELL, p.y * CELL, CELL, CELL);
        ctx.globalAlpha = 1;

        // ভিতরে হালকা শেড
        ctx.fillStyle = PLAYERS[pid].light;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(p.x * CELL + 4, p.y * CELL + 4, CELL - 8, CELL - 8);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x * CELL + 0.5, p.y * CELL + 0.5, CELL - 1, CELL - 1);
      });
    }

    // সেন্টার (4টি ত্রিভুজ)
    drawCenter();

    // টোকেন
    players.forEach((player, pid) => {
      player.tokens.forEach((token, tIdx) => {
        let pos = null;
        if (token.state === 'base') pos = HOME_BASE[pid][tIdx];
        else if (token.state === 'path') pos = PATH[token.pos];
        else if (token.state === 'home') pos = HOME_PATH[pid][token.homeIdx];
        else if (token.state === 'done') {
          // হোম কলামের শেষ ঘরে
          pos = HOME_PATH[pid][4];
        }
        if (pos) drawToken(pid, pos.x, pos.y, tIdx, token);
      });
    });
  }

  function drawStar(cx, cy, r, points, color) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawCenter() {
    const cx = 6 * CELL;
    const cy = 6 * CELL;
    const size = 3 * CELL;

    // সবুজ ত্রিভুজ (উপরে)
    ctx.fillStyle = PLAYERS[1].color;
    ctx.beginPath();
    ctx.moveTo(cx + size/2, cy);
    ctx.lineTo(cx + size, cy + size/2);
    ctx.lineTo(cx, cy + size/2);
    ctx.closePath();
    ctx.fill();

    // হলুদ (ডানে)
    ctx.fillStyle = PLAYERS[2].color;
    ctx.beginPath();
    ctx.moveTo(cx + size, cy + size/2);
    ctx.lineTo(cx + size/2, cy + size);
    ctx.lineTo(cx + size/2, cy);
    ctx.closePath();
    ctx.fill();

    // নীল (নিচে)
    ctx.fillStyle = PLAYERS[3].color;
    ctx.beginPath();
    ctx.moveTo(cx + size/2, cy + size);
    ctx.lineTo(cx, cy + size/2);
    ctx.lineTo(cx + size, cy + size/2);
    ctx.closePath();
    ctx.fill();

    // লাল (বামে)
    ctx.fillStyle = PLAYERS[0].color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + size/2);
    ctx.lineTo(cx + size/2, cy);
    ctx.lineTo(cx + size/2, cy + size);
    ctx.closePath();
    ctx.fill();

    // সেন্টার হাইলাইট
    ctx.beginPath();
    ctx.arc(cx + size/2, cy + size/2, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawToken(pid, gx, gy, tIdx, token) {
    const cx = (gx + 0.5) * CELL;
    const cy = (gy + 0.5) * CELL;
    const r = CELL * 0.36;

    // ছায়া
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 3, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    // টোকেন বডি
    const grad = ctx.createRadialGradient(
      cx - r * 0.4, cy - r * 0.4, r * 0.1,
      cx, cy, r
    );
    grad.addColorStop(0, PLAYERS[pid].light);
    grad.addColorStop(0.6, PLAYERS[pid].color);
    grad.addColorStop(1, PLAYERS[pid].dark);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = PLAYERS[pid].dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // হাইলাইট
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();

    // যদি এই টোকেন চালানো যায় (মানুষের পালা)
    if (mustMoveToken && pid === currentPlayer && !players[pid].isBot &&
        isValidMove(pid, tIdx, diceValue)) {
      // সবুজ রিং
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // স্পন্দন
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, (r + 8) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // ডাবল টোকেন হলে ছোট করে দুইটা আঁকা
    const stacked = players[pid].tokens.filter(t => {
      if (t === token) return false;
      if (t.state === 'base') return false;
      if (token.state === 'path' && t.state === 'path' && t.pos === token.pos) return true;
      if (token.state === 'home' && t.state === 'home' && t.homeIdx === token.homeIdx) return true;
      return false;
    });

    if (stacked.length > 0) {
      // বাম-উপরে ছোট টোকেন দেখাও
      const offset = CELL * 0.15;
      ctx.beginPath();
      ctx.arc(cx - offset, cy - offset, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = PLAYERS[pid].color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // ===== Game Init =====
  function initGame() {
    players = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: i,
        name: i === 0 ? playerName : 'বট ' + i,
        isBot: i !== 0,
        tokens: [createToken(), createToken(), createToken(), createToken()],
        finished: 0
      });
    }
    currentPlayer = 0;
    diceValue = 0;
    hasRolled = false;
    mustMoveToken = false;
    gameOver = false;
    consecutiveSixes = 0;

    updatePlayersBar();
    updateTurnIndicator();
    clearStatus();

    diceBtn.disabled = false;
    diceBtn.classList.remove('rolling');
    diceFace.textContent = '🎲';

    draw();
  }

  function updatePlayersBar() {
    document.querySelectorAll('.player-pill').forEach(el => {
      const pid = parseInt(el.dataset.pid);
      if (pid < playerCount) {
        el.style.display = 'flex';
        el.querySelector('.pill-name').textContent =
          pid === 0 ? playerName : 'বট ' + pid;
      } else {
        el.style.display = 'none';
      }
    });
  }

  function updateActivePlayer() {
    document.querySelectorAll('.player-pill').forEach(el => {
      const pid = parseInt(el.dataset.pid);
      if (pid === currentPlayer) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function updateTurnIndicator() {
    const p = PLAYERS[currentPlayer];
    const name = players[currentPlayer].name;
    turnIndicator.textContent = p.emoji + ' ' + name + ' এর পালা';
    turnIndicator.style.color = p.color;
    updateActivePlayer();
  }

  function showStatus(text, isGreen) {
    statusText.textContent = text;
    statusText.className = 'status-text' + (isGreen ? ' playing' : '');
    statusText.classList.remove('hidden');
    if (statusTimeout) clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      statusText.classList.add('hidden');
    }, 2000);
  }

  function clearStatus() {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusText.classList.add('hidden');
  }

  // ===== ডাইস রোল =====
  function rollDice() {
    if (gameOver) return;
    if (hasRolled) return;
    if (players[currentPlayer].isBot) return;

    diceBtn.disabled = true;
    diceBtn.classList.add('rolling');
    diceSound();

    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    let count = 0;
    const interval = setInterval(() => {
      diceFace.textContent = faces[Math.floor(Math.random() * 6)];
      count++;
      if (count > 10) {
        clearInterval(interval);
        diceBtn.classList.remove('rolling');

        diceValue = Math.floor(Math.random() * 6) + 1;
        diceFace.textContent = faces[diceValue - 1];
        hasRolled = true;

        setTimeout(() => handleRollResult(), 200);
      }
    }, 60);
  }

  function handleRollResult() {
    // 3 বার 6 → টার্ন বাতিল
    if (diceValue === 6) {
      consecutiveSixes++;
      if (consecutiveSixes >= 3) {
        showStatus('3 বার 6! টার্ন বাতিল', false);
        setTimeout(() => nextTurn(), 1200);
        return;
      }
    } else {
      consecutiveSixes = 0;
    }

    const moves = getValidMoves(currentPlayer, diceValue);

    if (moves.length === 0) {
      showStatus('নড়া যায় না!', false);
      setTimeout(() => nextTurn(), 1200);
      return;
    }

    // শুধু একটাই মুভ থাকলে অটো চালাও (মানুষের জন্যও)
    if (moves.length === 1) {
      setTimeout(() => {
        executeMove(currentPlayer, moves[0], diceValue);
      }, 400);
      return;
    }

    // বট হলে AI থেকে চালাও
    if (players[currentPlayer].isBot) {
      setTimeout(() => {
        const bestMove = botChooseMove(moves);
        executeMove(currentPlayer, bestMove, diceValue);
      }, 700);
      return;
    }

    // মানুষ — টোকেন ক্লিকের জন্য অপেক্ষা
    mustMoveToken = true;
    showStatus('টোকেন বাছাই করো', true);
    draw();
  }

  // ===== Valid Move =====
  function isValidMove(pid, tIdx, dice) {
    const token = players[pid].tokens[tIdx];
    const startOffset = START_POS[pid];

    if (token.state === 'base') {
      return dice === 6;
    }
    if (token.state === 'path') {
      const rel = (token.pos - startOffset + 52) % 52;
      // হোমে ঢোকার জন্য: 51 হলে পাথের শেষ, তারপর হোম
      if (rel + dice > 56) return false;
      return true;
    }
    if (token.state === 'home') {
      if (token.homeIdx + dice > 4) return false;
      return true;
    }
    return false;
  }

  function getValidMoves(pid, dice) {
    const valid = [];
    players[pid].tokens.forEach((token, tIdx) => {
      if (isValidMove(pid, tIdx, dice)) valid.push(tIdx);
    });
    return valid;
  }

  // ===== Move Execute =====
  function executeMove(pid, tIdx, dice) {
    const player = players[pid];
    const token = player.tokens[tIdx];
    const startOffset = START_POS[pid];

    let enteredHome = false;
    let killed = false;

    if (token.state === 'base') {
      // বেস থেকে বের
      token.state = 'path';
      token.pos = startOffset;
      safeSound();

    } else if (token.state === 'path') {
      const rel = (token.pos - startOffset + 52) % 52;
      const newRel = rel + dice;

      if (newRel === 56) {
        // সেন্টারে পৌঁছেছে
        token.state = 'done';
        token.homeIdx = 4;
        player.finished++;
        enteredHome = true;
        homeSound();
      } else if (newRel > 50) {
        // হোম কলামে ঢুকছে
        token.state = 'home';
        token.homeIdx = newRel - 51;
        enteredHome = true;
        homeSound();
      } else {
        // পাথে চলা
        token.pos = (token.pos + dice) % 52;

        // মার খাওয়া চেক করো
        if (!SAFE.includes(token.pos)) {
          players.forEach((p, otherPid) => {
            if (otherPid === pid) return;
            p.tokens.forEach(otherToken => {
              if (otherToken.state === 'path' &&
                  otherToken.pos === token.pos) {
                otherToken.state = 'base';
                otherToken.pos = 0;
                killed = true;
              }
            });
          });
        }

        if (killed) {
          killSound();
          showStatus('💥 টোকেন কাটা!', false);
        }
      }
    } else if (token.state === 'home') {
      const newIdx = token.homeIdx + dice;
      if (newIdx >= 5) {
        token.state = 'done';
        token.homeIdx = 4;
        player.finished++;
        enteredHome = true;
        homeSound();
      } else {
        token.homeIdx = newIdx;
      }
    }

    if (!killed && !enteredHome) moveSound();

    lastMovedToken = { pid, tIdx };
    mustMoveToken = false;
    draw();

    // জেতার চেক
    if (player.finished === 4) {
      gameOver = true;
      setTimeout(() => showWin(pid), 600);
      return;
    }

    // 6 পেলে বোনাস টার্ন, কিল করলে বোনাস, হোমে গেলে বোনাস
    const bonusTurn = (dice === 6) || killed || enteredHome;

    if (bonusTurn) {
      if (dice === 6) {
        showStatus('🎲 6! আবার পালা', true);
      } else if (killed) {
        showStatus('💥 কিল! আবার পালা', true);
      } else if (enteredHome) {
        showStatus('🏠 হোম! আবার পালা', true);
      }
      hasRolled = false;
      diceValue = 0;

      setTimeout(() => {
        if (players[currentPlayer].isBot) {
          diceBtn.disabled = true;
          botTurn();
        } else {
          diceBtn.disabled = false;
          diceBtn.classList.remove('rolling');
          diceFace.textContent = '🎲';
        }
      }, 900);
    } else {
      setTimeout(() => nextTurn(), 500);
    }
  }

  function nextTurn() {
    currentPlayer = (currentPlayer + 1) % playerCount;
    hasRolled = false;
    diceValue = 0;
    mustMoveToken = false;
    consecutiveSixes = 0;
    diceFace.textContent = '🎲';
    diceBtn.classList.remove('rolling');
    updateTurnIndicator();
    clearStatus();
    draw();

    if (players[currentPlayer].isBot) {
      diceBtn.disabled = true;
      setTimeout(() => botTurn(), 700);
    } else {
      diceBtn.disabled = false;
    }
  }

  // ===== বট AI =====
  function botTurn() {
    if (gameOver) return;
    if (hasRolled) return;

    diceBtn.classList.add('rolling');
    diceSound();

    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    let count = 0;
    const interval = setInterval(() => {
      diceFace.textContent = faces[Math.floor(Math.random() * 6)];
      count++;
      if (count > 10) {
        clearInterval(interval);
        diceBtn.classList.remove('rolling');

        diceValue = Math.floor(Math.random() * 6) + 1;
        diceFace.textContent = faces[diceValue - 1];
        hasRolled = true;

        setTimeout(() => handleRollResult(), 300);
      }
    }, 60);
  }

  function botChooseMove(moves) {
    const player = players[currentPlayer];
    const startOffset = START_POS[currentPlayer];

    // === EXPERT LEVEL ===
    if (botLevel === 'expert') {
      // 1. কিল করতে পারে?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          for (let opid = 0; opid < players.length; opid++) {
            if (opid === currentPlayer) continue;
            for (const ot of players[opid].tokens) {
              if (ot.state === 'path' && ot.pos === newPos &&
                  !SAFE.includes(newPos)) {
                return tIdx;
              }
            }
          }
        }
      }
      // 2. হোমে পৌঁছাবে?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'home') {
          if (token.homeIdx + diceValue >= 5) return tIdx;
        }
        if (token.state === 'path') {
          const rel = (token.pos - startOffset + 52) % 52;
          if (rel + diceValue === 56) return tIdx;
          if (rel + diceValue > 50) return tIdx;
        }
      }
      // 3. বেস থেকে বের হবে?
      for (const tIdx of moves) {
        if (player.tokens[tIdx].state === 'base' && diceValue === 6) return tIdx;
      }
      // 4. সেফ স্পটে যাবে?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          if (SAFE.includes(newPos)) return tIdx;
        }
      }
    }

    // === HARD LEVEL ===
    if (botLevel === 'hard' || botLevel === 'expert') {
      // কিল চেক
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          for (let opid = 0; opid < players.length; opid++) {
            if (opid === currentPlayer) continue;
            for (const ot of players[opid].tokens) {
              if (ot.state === 'path' && ot.pos === newPos &&
                  !SAFE.includes(newPos)) {
                return tIdx;
              }
            }
          }
        }
      }
      // বেস থেকে বের
      for (const tIdx of moves) {
        if (player.tokens[tIdx].state === 'base') return tIdx;
      }
    }

    // === EASY LEVEL — র‍্যান্ডম ===
    // সর্বোচ্চ advance যেটা সেটা বেছে নাও
    let best = moves[0];
    let bestScore = -1;
    for (const tIdx of moves) {
      const token = player.tokens[tIdx];
      let sc = 0;
      if (token.state === 'home') sc = 100 + token.homeIdx * 10;
      else if (token.state === 'path') {
        const rel = (token.pos - startOffset + 52) % 52;
        sc = rel * 2;
      } else if (token.state === 'base') sc = 30;
      if (sc > bestScore) { bestScore = sc; best = tIdx; }
    }
    return best;
  }

  // ===== টোকেন ক্লিক =====
  canvas.addEventListener('click', e => {
    if (!mustMoveToken) return;
    if (players[currentPlayer].isBot) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;

    const pid = currentPlayer;
    const player = players[pid];

    // সবচেয়ে কাছের টোকেন খুঁজে বের করো
    let closest = null;
    let closestDist = Infinity;

    for (let tIdx = 0; tIdx < player.tokens.length; tIdx++) {
      const token = player.tokens[tIdx];
      if (!isValidMove(pid, tIdx, diceValue)) continue;

      let pos = null;
      if (token.state === 'base') pos = HOME_BASE[pid][tIdx];
      else if (token.state === 'path') pos = PATH[token.pos];
      else if (token.state === 'home') pos = HOME_PATH[pid][token.homeIdx];
      if (!pos) continue;

      const cx = (pos.x + 0.5) * CELL;
      const cy = (pos.y + 0.5) * CELL;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist < CELL * 0.9 && dist < closestDist) {
        closest = tIdx;
        closestDist = dist;
      }
    }

    if (closest !== null) {
      executeMove(pid, closest, diceValue);
    }
  });

  // ===== Win =====
  function showWin(pid) {
    winSound();
    const p = PLAYERS[pid];
    const name = players[pid].name;

    winTitle.textContent = '🎉 ' + (pid === 0 ? 'VICTORY!' : 'DEFEAT!') + ' 🎉';
    winText.textContent = pid === 0 ? 'তুমি জিতেছ! 🏆' : name + ' জিতেছে!';
    winText.style.color = p.color;

    createConfetti();

    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    winScreen.classList.remove('hidden');

    // 6 সেকেন্ড পর confetti বন্ধ
    setTimeout(() => {
      winConfetti.innerHTML = '';
    }, 6000);
  }

  function createConfetti() {
    winConfetti.innerHTML = '';
    const colors = ['#e63946', '#06d6a0', '#ffd60a', '#4cc9f0', '#ffcc00', '#ff69b4'];

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + '%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (2 + Math.random() * 3) + 's';
      el.style.animationDelay = Math.random() * 2 + 's';
      el.style.width = el.style.height = (6 + Math.random() * 8) + 'px';
      if (Math.random() > 0.5) el.style.borderRadius = '50%';
      winConfetti.appendChild(el);
    }
  }

  // ===== Screen Nav =====
  function showScreen(name) {
    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    winScreen.classList.add('hidden');

    if (name === 'menu') menuScreen.classList.remove('hidden');
    if (name === 'game') gameScreen.classList.remove('hidden');
    if (name === 'win') winScreen.classList.remove('hidden');

    if (name === 'game') {
      setTimeout(resizeCanvas, 50);
      setTimeout(resizeCanvas, 300);
      setTimeout(resizeCanvas, 600);
    }
  }

  // ===== Menu Controls =====
  document.querySelectorAll('#playerCountRow .chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#playerCountRow .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playerCount = parseInt(btn.dataset.count);
      clickSound();
    };
  });

  document.querySelectorAll('#botLevelRow .chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#botLevelRow .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      botLevel = btn.dataset.level;
      clickSound();
    };
  });

  $('playBtn').onclick = () => {
    clickSound();
    const nameInput = $('playerNameInput').value.trim();
    playerName = nameInput || 'তুমি';
    if (playerName.length > 12) playerName = playerName.substring(0, 12);

    showScreen('game');
    setTimeout(() => {
      initGame();
      resizeCanvas();
    }, 100);
  };

  $('howBtn').onclick = () => {
    clickSound();
    alert(
      "🎲 লুডু কিং — কিভাবে খেলবেন:\n\n" +
      "• ডাইসে ট্যাপ করে রোল করো\n" +
      "• 6 পেলে টোকেন বেস থেকে বের হবে\n" +
      "• সবুজ রিং দিয়ে চিহ্নিত টোকেন ট্যাপ করে চালাও\n" +
      "• 6 পেলে / টোকেন কাটলে / হোমে গেলে আবার পালা\n" +
      "• তারকা চিহ্নিত ঘর সেফ — সেখানে মার খাবে না\n" +
      "• 4টি টোকেন সেন্টারে পৌঁছালে জিতে যাবে!\n\n" +
      "🤖 বটের 3 লেভেল:\n" +
      "• Easy — সাধারণ\n" +
      "• Hard — স্মার্ট\n" +
      "• Expert — বুদ্ধিমান\n\n" +
      "🏆 শুভ কামনা!"
    );
  };

  diceBtn.onclick = rollDice;

  $('backToMenuBtn').onclick = () => {
    clickSound();
    gameOver = true;
    showScreen('menu');
  };

  $('playAgainBtn').onclick = () => {
    clickSound();
    showScreen('game');
    setTimeout(() => {
      initGame();
      resizeCanvas();
    }, 100);
  };

  $('menuBtn').onclick = () => {
    clickSound();
    showScreen('menu');
  };

  // ===== PWA Install =====
  let deferredPrompt = null;
  const installBtn = $('installBtn');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert(
          "📲 ইনস্টল করার নিয়ম:\n\n" +
          "• Android Chrome: মেনু (⋮) → 'Install app'\n" +
          "• iPhone Safari: Share (□↑) → 'Add to Home Screen'"
        );
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
  });

  try {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (installBtn) installBtn.classList.add('hidden');
    }
  } catch(e) {}

  // ===== Continuous animation for pulse =====
  setInterval(() => {
    if (mustMoveToken) draw();
  }, 100);

  // ===== Init =====
  showScreen('menu');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

})();
