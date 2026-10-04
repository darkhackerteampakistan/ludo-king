// ===== LUDO KING ULTIMATE =====
(function() {
  'use strict';

  function $(id) { return document.getElementById(id); }

  const canvas = $('board');
  if (!canvas) { console.error('❌ Canvas নেই'); return; }
  const ctx = canvas.getContext('2d');

  const menuScreen = $('menuScreen');
  const customScreen = $('customScreen');
  const gameScreen = $('gameScreen');
  const winScreen = $('winScreen');
  const statusText = $('statusText');
  const turnIndicator = $('turnIndicator');
  const diceBtn = $('diceBtn');
  const diceFace = $('diceFace');
  const winTitle = $('winTitle');
  const winText = $('winText');
  const winStats = $('winStats');
  const winConfetti = $('winConfetti');
  const tokenPreview = $('tokenPreview');

  // ===== বোর্ড =====
  const GRID = 15;
  let CELL = 26;
  let W = 0, H = 0;

  // ===== Color Schemes =====
  const COLOR_SCHEMES = {
    classic: [
      { color: '#e63946', dark: '#9d1f2b', light: '#ff8a8a', emoji: '🔴' },
      { color: '#06d6a0', dark: '#048f6c', light: '#6eecb8', emoji: '🟢' },
      { color: '#ffd60a', dark: '#ccaa00', light: '#ffe680', emoji: '🟡' },
      { color: '#4cc9f0', dark: '#2596be', light: '#a5e4f7', emoji: '🔵' }
    ],
    neon: [
      { color: '#ff006e', dark: '#a30048', light: '#ff66a3', emoji: '💗' },
      { color: '#00f5d4', dark: '#009e89', light: '#66ffeb', emoji: '💚' },
      { color: '#fee440', dark: '#b09a00', light: '#fff199', emoji: '💛' },
      { color: '#00bbf9', dark: '#0077a3', light: '#66d9ff', emoji: '💙' }
    ],
    royal: [
      { color: '#9d0208', dark: '#5e0004', light: '#e85d68', emoji: '👑' },
      { color: '#2d6a4f', dark: '#1b4332', light: '#74c69d', emoji: '🌿' },
      { color: '#ffba08', dark: '#b08000', light: '#ffd76b', emoji: '⭐' },
      { color: '#023e8a', dark: '#012a5e', light: '#4a9eff', emoji: '💎' }
    ],
    pastel: [
      { color: '#ff8fab', dark: '#cc5f7a', light: '#ffb8c9', emoji: '🌸' },
      { color: '#a0e7e5', dark: '#5fb3b1', light: '#c5f1ef', emoji: '🌊' },
      { color: '#fbe7c6', dark: '#c9b88e', light: '#fdf2dc', emoji: '🌙' },
      { color: '#b4f8c8', dark: '#71c785', light: '#d9fce3', emoji: '🍃' }
    ]
  };

  // ===== Token Shapes =====
  const TOKEN_SHAPES = [
    { id: 'pawn',    name: '♟️ Pawn' },
    { id: 'circle',  name: '⚪ Circle' },
    { id: 'diamond', name: '💎 Diamond' },
    { id: 'star',    name: '⭐ Star' },
    { id: 'hex',     name: '⬡ Hexagon' }
  ];

  // ===== Token Styles =====
  const TOKEN_STYLES = [
    { id: '3d',      name: '🎨 3D' },
    { id: 'glow',    name: '✨ Glow' },
    { id: 'glass',   name: '🔮 Glass' },
    { id: 'flat',    name: '⬛ Flat' }
  ];

  // ===== State =====
  let playerCount = 3;
  let botLevel = 'easy';
  let playerName = 'তুমি';
  let colorScheme = 'classic';
  let tokenShape = 'pawn';
  let tokenStyle = '3d';

  let players = [];
  let currentPlayer = 0;
  let diceValue = 0;
  let hasRolled = false;
  let mustMoveToken = false;
  let gameOver = false;
  let statusTimeout = null;
  let consecutiveSixes = 0;

  // ===== বোর্ড পাথ =====
  const PATH = [
    {x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
    {x:6,y:5},{x:6,y:4},{x:6,y:3},{x:6,y:2},{x:6,y:1},{x:6,y:0},
    {x:7,y:0},{x:8,y:0},
    {x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},
    {x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6},
    {x:14,y:6},{x:14,y:7},{x:14,y:8},
    {x:13,y:8},{x:12,y:8},{x:11,y:8},{x:10,y:8},{x:9,y:8},
    {x:8,y:9},{x:8,y:10},{x:8,y:11},{x:8,y:12},{x:8,y:13},{x:8,y:14},
    {x:7,y:14},{x:6,y:14},
    {x:6,y:13},{x:6,y:12},{x:6,y:11},{x:6,y:10},{x:6,y:9},
    {x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8},
    {x:0,y:8},{x:0,y:7},{x:0,y:6}
  ];

  const START_POS = [0, 13, 26, 39];

  const HOME_PATH = {
    0: [{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7}],
    1: [{x:7,y:1},{x:7,y:2},{x:7,y:3},{x:7,y:4},{x:7,y:5}],
    2: [{x:13,y:7},{x:12,y:7},{x:11,y:7},{x:10,y:7},{x:9,y:7}],
    3: [{x:7,y:13},{x:7,y:12},{x:7,y:11},{x:7,y:10},{x:7,y:9}]
  };

  const HOME_BASE = {
    0: [{x:2,y:2},{x:4,y:2},{x:2,y:4},{x:4,y:4}],
    1: [{x:10,y:2},{x:12,y:2},{x:10,y:4},{x:12,y:4}],
    2: [{x:10,y:10},{x:12,y:10},{x:10,y:12},{x:12,y:12}],
    3: [{x:2,y:10},{x:4,y:10},{x:2,y:12},{x:4,y:12}]
  };

  const SAFE = [0, 8, 13, 21, 26, 34, 39, 47];

  const HOME_AREA = {
    0: { x: 0, y: 0 },
    1: { x: 9, y: 0 },
    2: { x: 9, y: 9 },
    3: { x: 0, y: 9 }
  };

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

  // ===== localStorage =====
  function saveConfig() {
    try {
      localStorage.setItem('ludoConfig', JSON.stringify({
        colorScheme, tokenShape, tokenStyle, playerCount, botLevel, playerName
      }));
    } catch(e) {}
  }
  function loadConfig() {
    try {
      const saved = localStorage.getItem('ludoConfig');
      if (saved) {
        const c = JSON.parse(saved);
        if (c.colorScheme) colorScheme = c.colorScheme;
        if (c.tokenShape) tokenShape = c.tokenShape;
        if (c.tokenStyle) tokenStyle = c.tokenStyle;
        if (c.playerCount) playerCount = c.playerCount;
        if (c.botLevel) botLevel = c.botLevel;
        if (c.playerName) playerName = c.playerName;
      }
    } catch(e) {}
  }

  // ===== Token Class =====
  function createToken() {
    return { state: 'base', pos: 0, homeIdx: -1 };
  }

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

  // ===== Helper: রাউন্ডেড rect =====
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ===== বোর্ড আঁকা =====
  function draw() {
    if (!W) return;
    const cs = CELL;
    const scheme = COLOR_SCHEMES[colorScheme];

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#f8f8f8');
    bgGrad.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 4টি হোম এরিয়া
    for (let pid = 0; pid < 4; pid++) {
      const a = HOME_AREA[pid];
      const c = scheme[pid];

      // Outer frame with gradient
      const grad = ctx.createLinearGradient(
        a.x * cs, a.y * cs,
        (a.x + 6) * cs, (a.y + 6) * cs
      );
      grad.addColorStop(0, c.light);
      grad.addColorStop(0.5, c.color);
      grad.addColorStop(1, c.dark);

      ctx.fillStyle = grad;
      roundRect(ctx, a.x * cs, a.y * cs, 6 * cs, 6 * cs, cs * 0.4);
      ctx.fill();

      // Inner white area
      ctx.fillStyle = '#fff';
      roundRect(ctx,
        (a.x + 0.4) * cs, (a.y + 0.4) * cs,
        5.2 * cs, 5.2 * cs,
        cs * 0.3
      );
      ctx.fill();

      // Slot circles with 3D effect
      const slots = HOME_BASE[pid];
      slots.forEach(s => {
        const cx = (s.x + 0.5) * cs;
        const cy = (s.y + 0.5) * cs;
        const r = cs * 0.55;

        // Shadow
        ctx.beginPath();
        ctx.arc(cx + 1, cy + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();

        // Circle with gradient
        const slotGrad = ctx.createRadialGradient(
          cx - r * 0.3, cy - r * 0.3, r * 0.1,
          cx, cy, r
        );
        slotGrad.addColorStop(0, c.light);
        slotGrad.addColorStop(0.6, c.color);
        slotGrad.addColorStop(1, c.dark);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = slotGrad;
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight ring
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // পাথ সেল
    PATH.forEach((p, i) => {
      const x = p.x * cs;
      const y = p.y * cs;
      const starterPid = START_POS.indexOf(i);

      // Cell background
      if (starterPid !== -1) {
        const grad = ctx.createLinearGradient(x, y, x + cs, y + cs);
        grad.addColorStop(0, scheme[starterPid].light);
        grad.addColorStop(1, scheme[starterPid].color);
        ctx.fillStyle = grad;
      } else if (SAFE.includes(i)) {
        ctx.fillStyle = '#fffaeb';
      } else {
        ctx.fillStyle = '#ffffff';
      }

      roundRect(ctx, x + 1, y + 1, cs - 2, cs - 2, cs * 0.15);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Safe star
      if (SAFE.includes(i)) {
        drawStar(x + cs/2, y + cs/2, cs * 0.32, 5, '#ffcc00');
      }

      // Arrow on start cells
      if (starterPid !== -1) {
        drawArrow(x + cs/2, y + cs/2, cs * 0.3, scheme[starterPid].dark);
      }
    });

    // হোম কলাম (colored paths)
    for (let pid = 0; pid < 4; pid++) {
      const path = HOME_PATH[pid];
      const c = scheme[pid];
      path.forEach((p, idx) => {
        const x = p.x * cs;
        const y = p.y * cs;

        const grad = ctx.createLinearGradient(x, y, x + cs, y + cs);
        grad.addColorStop(0, c.light);
        grad.addColorStop(1, c.color);

        ctx.fillStyle = grad;
        roundRect(ctx, x + 1, y + 1, cs - 2, cs - 2, cs * 0.15);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        roundRect(ctx, x + 3, y + 3, cs - 6, (cs - 6) * 0.4, cs * 0.1);
        ctx.fill();
      });
    }

    // Center (4 triangles)
    drawCenter(cs, scheme);

    // All tokens
    players.forEach((player, pid) => {
      player.tokens.forEach((token, tIdx) => {
        let pos = null;
        if (token.state === 'base') pos = HOME_BASE[pid][tIdx];
        else if (token.state === 'path') pos = PATH[token.pos];
        else if (token.state === 'home') pos = HOME_PATH[pid][token.homeIdx];
        else if (token.state === 'done') pos = HOME_PATH[pid][4];
        if (pos) drawToken(pid, pos.x, pos.y, tIdx, token, scheme);
      });
    });
  }

  function drawArrow(cx, cy, size, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.5, cy + size * 0.5);
    ctx.lineTo(cx + size * 0.5, cy + size * 0.5);
    ctx.lineTo(cx, cy - size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawStar(cx, cy, r, points, color) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
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
    ctx.restore();
  }

  function drawCenter(cs, scheme) {
    const cx = 6 * cs;
    const cy = 6 * cs;
    const size = 3 * cs;

    // 4 triangles with gradients
    const colors = [
      { color: scheme[0].color, light: scheme[0].light },
      { color: scheme[1].color, light: scheme[1].light },
      { color: scheme[2].color, light: scheme[2].light },
      { color: scheme[3].color, light: scheme[3].light }
    ];

    // Top (green - player 1)
    let grad = ctx.createLinearGradient(cx + size/2, cy, cx + size/2, cy + size/2);
    grad.addColorStop(0, colors[1].light);
    grad.addColorStop(1, colors[1].color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx + size/2, cy);
    ctx.lineTo(cx + size, cy + size/2);
    ctx.lineTo(cx, cy + size/2);
    ctx.closePath();
    ctx.fill();

    // Right (yellow - player 2)
    grad = ctx.createLinearGradient(cx + size/2, cy + size/2, cx + size, cy + size/2);
    grad.addColorStop(0, colors[2].light);
    grad.addColorStop(1, colors[2].color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx + size, cy + size/2);
    ctx.lineTo(cx + size/2, cy + size);
    ctx.lineTo(cx + size/2, cy);
    ctx.closePath();
    ctx.fill();

    // Bottom (blue - player 3)
    grad = ctx.createLinearGradient(cx + size/2, cy + size/2, cx + size/2, cy + size);
    grad.addColorStop(0, colors[3].light);
    grad.addColorStop(1, colors[3].color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx + size/2, cy + size);
    ctx.lineTo(cx, cy + size/2);
    ctx.lineTo(cx + size, cy + size/2);
    ctx.closePath();
    ctx.fill();

    // Left (red - player 0)
    grad = ctx.createLinearGradient(cx, cy + size/2, cx + size/2, cy + size/2);
    grad.addColorStop(0, colors[0].light);
    grad.addColorStop(1, colors[0].color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy + size/2);
    ctx.lineTo(cx + size/2, cy);
    ctx.lineTo(cx + size/2, cy + size);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, size, size);

    // Center circle with glow
    ctx.beginPath();
    ctx.arc(cx + size/2, cy + size/2, size * 0.18, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(
      cx + size/2 - size*0.05, cy + size/2 - size*0.05, 0,
      cx + size/2, cy + size/2, size * 0.18
    );
    centerGrad.addColorStop(0, '#fff');
    centerGrad.addColorStop(1, '#ffcc00');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = '#886600';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Star in center
    drawStar(cx + size/2, cy + size/2, size * 0.12, 5, '#886600');
  }

  function drawToken(pid, gx, gy, tIdx, token, scheme) {
    const c = scheme[pid];
    const cx = (gx + 0.5) * CELL;
    const cy = (gy + 0.5) * CELL;

    ctx.save();

    // Determine size
    const baseR = CELL * 0.36;
    const r = baseR;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 3, r * 0.95, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Draw by shape
    if (tokenShape === 'pawn') {
      drawPawnToken(cx, cy, r, c, pid, token);
    } else if (tokenShape === 'circle') {
      drawCircleToken(cx, cy, r, c, pid, token);
    } else if (tokenShape === 'diamond') {
      drawDiamondToken(cx, cy, r, c, pid, token);
    } else if (tokenShape === 'star') {
      drawStarToken(cx, cy, r, c, pid, token);
    } else if (tokenShape === 'hex') {
      drawHexToken(cx, cy, r, c, pid, token);
    }

    // Move highlight
    if (mustMoveToken && pid === currentPlayer && !players[pid].isBot &&
        isValidMove(pid, tIdx, diceValue)) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, (r + 9) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  function applyTokenStyle(cx, cy, r, c) {
    // returns fill style based on tokenStyle
    if (tokenStyle === 'flat') {
      return c.color;
    }
    const grad = ctx.createRadialGradient(
      cx - r * 0.4, cy - r * 0.4, r * 0.1,
      cx, cy, r
    );
    if (tokenStyle === 'glow') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, c.light);
      grad.addColorStop(1, c.color);
    } else if (tokenStyle === 'glass') {
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.4, c.light + 'aa');
      grad.addColorStop(1, c.dark + 'cc');
    } else {
      grad.addColorStop(0, c.light);
      grad.addColorStop(0.5, c.color);
      grad.addColorStop(1, c.dark);
    }
    return grad;
  }

  function drawPawnToken(cx, cy, r, c, pid, token) {
    // Main circular body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = applyTokenStyle(cx, cy, r, c);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glass effect if selected
    if (tokenStyle === 'glass') {
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    }

    // Highlight
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
  }

  function drawCircleToken(cx, cy, r, c, pid, token) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = applyTokenStyle(cx, cy, r, c);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }

  function drawDiamondToken(cx, cy, r, c, pid, token) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.75, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.75, cy);
    ctx.closePath();
    ctx.fillStyle = applyTokenStyle(cx, cy, r, c);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.2, cy);
    ctx.lineTo(cx, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.2, cy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  }

  function drawStarToken(cx, cy, r, c, pid, token) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = applyTokenStyle(cx, cy, r, c);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }

  function drawHexToken(cx, cy, r, c, pid, token) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = applyTokenStyle(cx, cy, r, c);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  }

  // ===== Game Init =====
  function initGame() {
    const scheme = COLOR_SCHEMES[colorScheme];
    players = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: i,
        name: i === 0 ? playerName : 'বট ' + i,
        isBot: i !== 0,
        tokens: [createToken(), createToken(), createToken(), createToken()],
        finished: 0,
        colors: scheme[i]
      });
    }
    currentPlayer = 0;
    diceValue = 0;
    hasRolled = false;
    mustMoveToken = false;
    gameOver = false;
    consecutiveSixes = 0;

    // Update player bar colors
    document.querySelectorAll('.player-pill').forEach(el => {
      const pid = parseInt(el.dataset.pid);
      if (pid < playerCount) {
        el.style.display = 'flex';
        const c = scheme[pid];
        el.querySelector('.pill-color').style.background = c.color;
        el.querySelector('.pill-name').textContent =
          pid === 0 ? playerName : 'বট ' + pid;
      } else {
        el.style.display = 'none';
      }
    });

    updateTurnIndicator();
    clearStatus();

    diceBtn.disabled = false;
    diceBtn.classList.remove('rolling');
    diceFace.textContent = '🎲';

    draw();
  }

  function updateActivePlayer() {
    document.querySelectorAll('.player-pill').forEach(el => {
      const pid = parseInt(el.dataset.pid);
      if (pid === currentPlayer) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function updateTurnIndicator() {
    const scheme = COLOR_SCHEMES[colorScheme];
    const c = scheme[currentPlayer];
    const name = players[currentPlayer].name;
    turnIndicator.textContent = c.emoji + ' ' + name + ' এর পালা';
    turnIndicator.style.color = c.color;
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

    if (moves.length === 1) {
      setTimeout(() => executeMove(currentPlayer, moves[0], diceValue), 400);
      return;
    }

    if (players[currentPlayer].isBot) {
      setTimeout(() => {
        const bestMove = botChooseMove(moves);
        executeMove(currentPlayer, bestMove, diceValue);
      }, 700);
      return;
    }

    mustMoveToken = true;
    showStatus('টোকেন বাছাই করো', true);
    draw();
  }

  function isValidMove(pid, tIdx, dice) {
    const token = players[pid].tokens[tIdx];
    const startOffset = START_POS[pid];

    if (token.state === 'base') return dice === 6;
    if (token.state === 'path') {
      const rel = (token.pos - startOffset + 52) % 52;
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

  function executeMove(pid, tIdx, dice) {
    const player = players[pid];
    const token = player.tokens[tIdx];
    const startOffset = START_POS[pid];

    let enteredHome = false;
    let killed = false;

    if (token.state === 'base') {
      token.state = 'path';
      token.pos = startOffset;
      safeSound();
    } else if (token.state === 'path') {
      const rel = (token.pos - startOffset + 52) % 52;
      const newRel = rel + dice;

      if (newRel === 56) {
        token.state = 'done';
        token.homeIdx = 4;
        player.finished++;
        enteredHome = true;
        homeSound();
      } else if (newRel > 50) {
        token.state = 'home';
        token.homeIdx = newRel - 51;
        enteredHome = true;
        homeSound();
      } else {
        token.pos = (token.pos + dice) % 52;

        if (!SAFE.includes(token.pos)) {
          players.forEach((p, otherPid) => {
            if (otherPid === pid) return;
            p.tokens.forEach(otherToken => {
              if (otherToken.state === 'path' && otherToken.pos === token.pos) {
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
    mustMoveToken = false;
    draw();

    if (player.finished === 4) {
      gameOver = true;
      setTimeout(() => showWin(pid), 600);
      return;
    }

    const bonusTurn = (dice === 6) || killed || enteredHome;
    if (bonusTurn) {
      if (dice === 6) showStatus('🎲 6! আবার পালা', true);
      else if (killed) showStatus('💥 কিল! আবার পালা', true);
      else if (enteredHome) showStatus('🏠 হোম! আবার পালা', true);

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

    if (botLevel === 'expert') {
      // Kill?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          for (let opid = 0; opid < players.length; opid++) {
            if (opid === currentPlayer) continue;
            for (const ot of players[opid].tokens) {
              if (ot.state === 'path' && ot.pos === newPos && !SAFE.includes(newPos)) return tIdx;
            }
          }
        }
      }
      // Home soon?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const rel = (token.pos - startOffset + 52) % 52;
          if (rel + diceValue === 56) return tIdx;
          if (rel + diceValue > 50) return tIdx;
        }
        if (token.state === 'home' && token.homeIdx + diceValue >= 5) return tIdx;
      }
      // Leave base?
      for (const tIdx of moves) {
        if (player.tokens[tIdx].state === 'base' && diceValue === 6) return tIdx;
      }
      // Safe?
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          if (SAFE.includes(newPos)) return tIdx;
        }
      }
    }

    if (botLevel === 'hard' || botLevel === 'expert') {
      for (const tIdx of moves) {
        const token = player.tokens[tIdx];
        if (token.state === 'path') {
          const newPos = (token.pos + diceValue) % 52;
          for (let opid = 0; opid < players.length; opid++) {
            if (opid === currentPlayer) continue;
            for (const ot of players[opid].tokens) {
              if (ot.state === 'path' && ot.pos === newPos && !SAFE.includes(newPos)) return tIdx;
            }
          }
        }
      }
      for (const tIdx of moves) {
        if (player.tokens[tIdx].state === 'base') return tIdx;
      }
    }

    // Easy — pick max advance
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

  // ===== Canvas click =====
  canvas.addEventListener('click', e => {
    if (!mustMoveToken) return;
    if (players[currentPlayer].isBot) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;

    const pid = currentPlayer;
    const player = players[pid];

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

      if (dist < CELL * 0.95 && dist < closestDist) {
        closest = tIdx;
        closestDist = dist;
      }
    }

    if (closest !== null) executeMove(pid, closest, diceValue);
  });

  // ===== Win =====
  function showWin(pid) {
    winSound();
    const scheme = COLOR_SCHEMES[colorScheme];
    const c = scheme[pid];
    const name = players[pid].name;

    winTitle.textContent = '🎉 ' + (pid === 0 ? 'VICTORY!' : 'DEFEAT!') + ' 🎉';
    winText.textContent = pid === 0 ? 'তুমি জিতেছ! 🏆' : name + ' জিতেছে!';
    winText.style.color = c.color;
    winStats.innerHTML = '<p>🏆 ' + name + ' — সব টোকেন হোম</p>';

    createConfetti();

    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    winScreen.classList.remove('hidden');

    setTimeout(() => { winConfetti.innerHTML = ''; }, 6000);
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
    customScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    winScreen.classList.add('hidden');

    if (name === 'menu') menuScreen.classList.remove('hidden');
    if (name === 'custom') customScreen.classList.remove('hidden');
    if (name === 'game') gameScreen.classList.remove('hidden');
    if (name === 'win') winScreen.classList.remove('hidden');

    if (name === 'game') {
      setTimeout(resizeCanvas, 50);
      setTimeout(resizeCanvas, 300);
      setTimeout(resizeCanvas, 600);
    }
  }

  // ===== Customize UI =====
  function buildCustomUI() {
    // Shape row
    const shapeRow = $('shapeRow');
    if (shapeRow) {
      shapeRow.innerHTML = '';
      TOKEN_SHAPES.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'chip' + (tokenShape === s.id ? ' active' : '');
        btn.textContent = s.name;
        btn.onclick = () => {
          tokenShape = s.id; saveConfig(); buildCustomUI(); clickSound();
          renderTokenPreview();
        };
        shapeRow.appendChild(btn);
      });
    }

    // Style row
    const styleRow = $('styleRow');
    if (styleRow) {
      styleRow.innerHTML = '';
      TOKEN_STYLES.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'chip' + (tokenStyle === s.id ? ' active' : '');
        btn.textContent = s.name;
        btn.onclick = () => {
          tokenStyle = s.id; saveConfig(); buildCustomUI(); clickSound();
          renderTokenPreview();
        };
        styleRow.appendChild(btn);
      });
    }

    // Color row
    const colorRow = $('colorRow');
    if (colorRow) {
      colorRow.innerHTML = '';
      Object.keys(COLOR_SCHEMES).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'chip' + (colorScheme === key ? ' active' : '');
        btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        btn.onclick = () => {
          colorScheme = key; saveConfig(); buildCustomUI(); clickSound();
          renderTokenPreview();
        };
        colorRow.appendChild(btn);
      });
    }
  }

  function renderTokenPreview() {
    if (!tokenPreview) return;
    const ctx2 = tokenPreview.getContext('2d');
    const w = tokenPreview.width;
    const h = tokenPreview.height;
    const scheme = COLOR_SCHEMES[colorScheme];

    ctx2.clearRect(0, 0, w, h);

    // 4 tokens
    const spacing = w / 4;
    for (let i = 0; i < 4; i++) {
      const cx = spacing * (i + 0.5);
      const cy = h / 2;
      const r = 22;

      // Shadow
      ctx2.beginPath();
      ctx2.ellipse(cx + 2, cy + 3, r * 0.95, r * 0.5, 0, 0, Math.PI * 2);
      ctx2.fillStyle = 'rgba(0,0,0,0.4)';
      ctx2.fill();

      // Save context for reuse (use main draw functions)
      const saveCtx = ctx;
      const saveShape = tokenShape;
      const saveStyle = tokenStyle;

      // Temporary swap - draw here using functions (they use main ctx)
      // Simple custom drawing:
      drawPreviewToken(ctx2, cx, cy, r, scheme[i]);
    }
  }

  function drawPreviewToken(c, cx, cy, r, colors) {
    // Simple circular token preview
    const grad = c.createRadialGradient(
      cx - r * 0.4, cy - r * 0.4, r * 0.1,
      cx, cy, r
    );
    grad.addColorStop(0, colors.light);
    grad.addColorStop(0.5, colors.color);
    grad.addColorStop(1, colors.dark);

    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.fillStyle = grad;
    c.fill();
    c.strokeStyle = colors.dark;
    c.lineWidth = 2;
    c.stroke();

    c.beginPath();
    c.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fill();
  }

  // ===== Menu Controls =====
  document.querySelectorAll('#playerCountRow .chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#playerCountRow .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playerCount = parseInt(btn.dataset.count);
      saveConfig();
      clickSound();
    };
  });

  document.querySelectorAll('#botLevelRow .chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#botLevelRow .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      botLevel = btn.dataset.level;
      saveConfig();
      clickSound();
    };
  });

  $('playBtn').onclick = () => {
    clickSound();
    const nameInput = $('playerNameInput').value.trim();
    playerName = nameInput || 'তুমি';
    if (playerName.length > 12) playerName = playerName.substring(0, 12);
    saveConfig();

    showScreen('game');
    setTimeout(() => {
      initGame();
      resizeCanvas();
    }, 100);
  };

  $('customBtn').onclick = () => {
    clickSound();
    buildCustomUI();
    renderTokenPreview();
    showScreen('custom');
  };

  $('customBackBtn').onclick = () => {
    clickSound();
    const nameInput = $('playerNameInput').value.trim();
    playerName = nameInput || 'তুমি';
    if (playerName.length > 12) playerName = playerName.substring(0, 12);
    saveConfig();

    showScreen('game');
    setTimeout(() => {
      initGame();
      resizeCanvas();
    }, 100);
  };

  $('customMenuBtn').onclick = () => {
    clickSound();
    showScreen('menu');
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
      "🎨 কাস্টমাইজ:\n" +
      "• গুটির আকার (5টি)\n" +
      "• গুটির স্টাইল (4টি)\n" +
      "• রঙের স্কিম (4টি)\n\n" +
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

  // ===== Init =====
  loadConfig();

  // Apply loaded settings
  document.getElementById('playerNameInput').value = playerName;
  document.querySelectorAll('#playerCountRow .chip').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.count) === playerCount);
  });
  document.querySelectorAll('#botLevelRow .chip').forEach(b => {
    b.classList.toggle('active', b.dataset.level === botLevel);
  });

  showScreen('menu');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Pulse animation for movable tokens
  setInterval(() => {
    if (mustMoveToken) draw();
  }, 100);

})();
