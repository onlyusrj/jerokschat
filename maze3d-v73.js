/* OnlyUs maze3d-v73.js  -  🌹 Love Maze 3D  (first-person 3D maze for two)
   You and your partner start in opposite corners of the SAME maze (same seed for both phones).
   Walk in first person, collect 💗 hearts (each heart lights up a radar for a few seconds) and FIND EACH OTHER.
   The partner is a glowing figure you can see down the corridors. Game ends when you meet.
   Uses the same request / accept / play-again flow as the other games (hub: Games > Love Maze 3D), no rules change.
   Position sync: one small write about every 1.4 s while moving.
   Rendering: software raycaster on a 320x200 canvas (textured hedge/brick walls, floor + ceiling casting, fog, sprites). */
(function () {
  'use strict';
  var G = window.__gmApi;
  if (!G || window.__maze3d) return;
  var h = G.h, my = G.my, opp = G.opp, idx = G.idx, upd = G.upd, fin = G.fin;

  var N = 10, M = 2 * N + 1, HEARTS = 12, PL = 0.72;
  var FR = 22, FG = 10, FB = 40;                      /* fog colour */
  var FW = 320, FH = 200, VS = 222;   /* VS = vertical focal scale = FW / (2*PL) */

  /* ------------------------------------------------------------ utils */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fmt(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  var AC;
  function beep(f, d, type, delay) {
    setTimeout(function () {
      try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(AC.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.stop(AC.currentTime + d); } catch (e) { }
    }, delay || 0);
  }

  /* ------------------------------------------------------------ maze */
  function build(seed) {
    var r = rng(seed), g = new Uint8Array(M * M).fill(1), seen = new Uint8Array(N * N), st = [[0, 0]], i, k;
    seen[0] = 1; g[M + 1] = 0;
    while (st.length) {
      var c = st[st.length - 1], x = c[0], y = c[1], nb = [];
      if (x > 0 && !seen[y * N + x - 1]) nb.push([x - 1, y]);
      if (x < N - 1 && !seen[y * N + x + 1]) nb.push([x + 1, y]);
      if (y > 0 && !seen[(y - 1) * N + x]) nb.push([x, y - 1]);
      if (y < N - 1 && !seen[(y + 1) * N + x]) nb.push([x, y + 1]);
      if (!nb.length) { st.pop(); continue; }
      var n = nb[(r() * nb.length) | 0]; seen[n[1] * N + n[0]] = 1;
      g[(2 * y + 1 + (n[1] - y)) * M + (2 * x + 1 + (n[0] - x))] = 0;
      g[(2 * n[1] + 1) * M + (2 * n[0] + 1)] = 0; st.push(n);
    }
    for (k = 0; k < N * N * 0.4; k++) {            /* a few loops so there is more than one way */
      var wx = 1 + ((r() * (M - 2)) | 0), wy = 1 + ((r() * (M - 2)) | 0);
      if (g[wy * M + wx] === 1 && ((wx % 2 === 0 && wy % 2 === 1 && !g[wy * M + wx - 1] && !g[wy * M + wx + 1]) || (wx % 2 === 1 && wy % 2 === 0 && !g[(wy - 1) * M + wx] && !g[(wy + 1) * M + wx]))) g[wy * M + wx] = 0;
    }
    var wt = new Uint8Array(M * M);
    for (var yy = 0; yy < M; yy++) for (var xx = 0; xx < M; xx++) {
      var hh = (((xx * 73856093) ^ (yy * 19349663) ^ seed) >>> 0) % 100;
      wt[yy * M + xx] = (xx === 0 || yy === 0 || xx === M - 1 || yy === M - 1) ? 0 : hh < 66 ? 0 : hh < 90 ? 1 : 2;
    }
    var cells = []; for (yy = 0; yy < N; yy++) for (xx = 0; xx < N; xx++) if ((xx + yy) > 1 && (xx + yy) < 2 * N - 3) cells.push([2 * xx + 1.5, 2 * yy + 1.5]);
    for (i = cells.length - 1; i > 0; i--) { var j = (r() * (i + 1)) | 0, t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
    return { g: g, wt: wt, hearts: cells.slice(0, HEARTS).map(function (c) { return { x: c[0], y: c[1], got: 0 }; }) };
  }

  /* ------------------------------------------------------------ textures (drawn once with canvas, sampled by the raycaster) */
  function mk(w, hh, fn, sc) { var c = document.createElement('canvas'); c.width = w * (sc || 1); c.height = hh * (sc || 1); var x = c.getContext('2d'); if (sc) x.scale(sc, sc); fn(x, w, hh); var d = x.getImageData(0, 0, c.width, c.height); return new Uint32Array(d.data.buffer.slice(0)); }
  function rose(x, cx, cy, r) { [-64, 0, 64].forEach(function (o) { var X = cx + o; x.fillStyle = '#c2185b'; x.beginPath(); x.arc(X, cy, r, 0, 6.3); x.fill(); x.fillStyle = '#ff6fa5'; x.beginPath(); x.arc(X, cy, r * .72, 0, 6.3); x.fill(); x.strokeStyle = '#ffd6e6'; x.lineWidth = 1; x.beginPath(); x.arc(X, cy, r * .36, .6, 5.2); x.stroke(); }); }
  function heartPath(x, cx, cy, s) { x.beginPath(); x.moveTo(cx, cy + s * .9); x.bezierCurveTo(cx - s * 1.5, cy - s * .1, cx - s * .9, cy - s * 1.2, cx, cy - s * .35); x.bezierCurveTo(cx + s * .9, cy - s * 1.2, cx + s * 1.5, cy - s * .1, cx, cy + s * .9); x.closePath(); }
  var TEX = null, FLR, CEL, SPR_HEART, SPR_P = [];
  function makeTextures() {
    if (TEX) return;
    var hedge = mk(64, 64, function (x, w, hh) {
      var g = x.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#216e3d'); g.addColorStop(1, '#15492b'); x.fillStyle = g; x.fillRect(0, 0, w, hh);
      var rs = rng(7), i;
      for (i = 0; i < 280; i++) { var px = rs() * w, py = rs() * hh, rr = 2 + rs() * 5, gl = 70 + rs() * 120; x.fillStyle = 'rgb(' + ((18 + rs() * 34) | 0) + ',' + (gl | 0) + ',' + ((36 + rs() * 44) | 0) + ')'; [-w, 0, w].forEach(function (o) { x.beginPath(); x.ellipse(px + o, py, rr, rr * .55, rs() * 3, 0, 6.3); x.fill(); }); }
      for (i = 0; i < 5; i++) rose(x, rs() * w, 7 + rs() * (hh - 14), 4 + rs() * 3);
    }, 2);
    var brick = mk(64, 64, function (x, w, hh) {
      x.fillStyle = '#2f1626'; x.fillRect(0, 0, w, hh); var rs = rng(11);
      for (var r = 0; r < 8; r++) for (var c = -1; c < 5; c++) { var bx = c * 16 + (r % 2) * 8, sh = (rs() * 38) | 0; x.fillStyle = 'rgb(' + (128 + sh) + ',' + (62 + (sh >> 1)) + ',' + (82 + (sh >> 1)) + ')'; x.fillRect(bx + 1, r * 8 + 1, 14, 6); x.fillStyle = 'rgba(255,200,220,.12)'; x.fillRect(bx + 1, r * 8 + 1, 14, 1); }
    }, 2);
    var stone = mk(64, 64, function (x, w, hh) {
      var g = x.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#4a3566'); g.addColorStop(1, '#2d2044'); x.fillStyle = g; x.fillRect(0, 0, w, hh);
      var rs = rng(23); for (var i = 0; i < 90; i++) { x.fillStyle = 'rgba(255,255,255,' + (rs() * .07) + ')'; x.fillRect(rs() * w, rs() * hh, 2, 2); }
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, hh - 2);
      var gl = x.createRadialGradient(32, 32, 2, 32, 32, 30); gl.addColorStop(0, 'rgba(255,90,150,.65)'); gl.addColorStop(1, 'rgba(255,90,150,0)'); x.fillStyle = gl; x.fillRect(0, 0, w, hh);
      heartPath(x, 32, 31, 14); x.fillStyle = '#ff4f8b'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#ffc2d9'; x.stroke();
    }, 2);
    TEX = [hedge, brick, stone];
    FLR = mk(64, 64, function (x, w, hh) {
      var rs = rng(5); x.fillStyle = '#2a1b3d'; x.fillRect(0, 0, w, hh);
      var g = x.createLinearGradient(0, 0, w, hh); g.addColorStop(0, '#42305c'); g.addColorStop(1, '#33244b'); x.fillStyle = g; x.fillRect(3, 3, w - 6, hh - 6);
      for (var i = 0; i < 160; i++) { x.fillStyle = 'rgba(255,255,255,' + (rs() * .07) + ')'; x.fillRect(rs() * w, rs() * hh, 1 + rs() * 2, 1); }
      x.strokeStyle = 'rgba(255,170,205,.12)'; x.lineWidth = 1; x.beginPath(); x.moveTo(32, 8); x.lineTo(56, 32); x.lineTo(32, 56); x.lineTo(8, 32); x.closePath(); x.stroke();
      for (i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,140,185,.6)'; x.beginPath(); x.ellipse(8 + rs() * 48, 8 + rs() * 48, 2.2, 1.2, rs() * 3, 0, 6.3); x.fill(); }
    }, 2);
    CEL = mk(64, 64, function (x, w, hh) {
      var g = x.createLinearGradient(0, 0, w, hh); g.addColorStop(0, '#17123a'); g.addColorStop(1, '#2b1553'); x.fillStyle = g; x.fillRect(0, 0, w, hh); var rs = rng(41);
      for (var i = 0; i < 34; i++) { var s = rs(); x.fillStyle = 'rgba(255,' + (230 + (s * 25 | 0)) + ',210,' + (.55 + s * .45) + ')'; x.fillRect(rs() * w, rs() * hh, s > .8 ? 2 : 1, s > .8 ? 2 : 1); }
    }, 2);
    SPR_HEART = mk(64, 64, function (x) {
      var g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(255,90,150,.6)'); g.addColorStop(1, 'rgba(255,90,150,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      heartPath(x, 32, 31, 15); var f = x.createLinearGradient(0, 14, 0, 50); f.addColorStop(0, '#ff8fb8'); f.addColorStop(1, '#e0245e'); x.fillStyle = f; x.fill(); x.lineWidth = 2; x.strokeStyle = '#fff0f6'; x.stroke();
      x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(24, 23, 4, 2.4, -.7, 0, 6.3); x.fill();
    }, 2);
    [['#59c8ff', '#2a7cc9'], ['#ff7fb0', '#d62f78']].forEach(function (cl) {
      SPR_P.push(mk(64, 112, function (x) {
        var g = x.createRadialGradient(32, 56, 6, 32, 56, 56); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.5, cl[0] + '55'); g.addColorStop(1, cl[0] + '00'); x.fillStyle = g; x.fillRect(0, 0, 64, 112);
        var b = x.createLinearGradient(0, 52, 0, 100); b.addColorStop(0, cl[0]); b.addColorStop(1, cl[1]);
        x.fillStyle = b; x.beginPath(); x.moveTo(14, 100); x.quadraticCurveTo(14, 54, 32, 54); x.quadraticCurveTo(50, 54, 50, 100); x.closePath(); x.fill();
        x.fillStyle = '#ffd9b8'; x.beginPath(); x.arc(32, 36, 18, 0, 6.3); x.fill();
        x.fillStyle = cl[1]; x.beginPath(); x.arc(32, 28, 19, Math.PI, 0); x.fill(); x.fillRect(13, 27, 6, 10); x.fillRect(45, 27, 6, 10);
        x.fillStyle = '#3a2a4a'; x.beginPath(); x.arc(25, 38, 2.3, 0, 6.3); x.arc(39, 38, 2.3, 0, 6.3); x.fill();
        x.strokeStyle = '#3a2a4a'; x.lineWidth = 1.6; x.beginPath(); x.arc(32, 43, 4, .2, 2.9); x.stroke();
        x.fillStyle = 'rgba(255,120,160,.55)'; x.beginPath(); x.arc(20, 43, 3.2, 0, 6.3); x.arc(44, 43, 3.2, 0, 6.3); x.fill();
        heartPath(x, 32, 72, 7); x.fillStyle = '#fff'; x.fill();
      }, 2));
    });
  }

  /* ------------------------------------------------------------ overlay (DOM) */
  var RES = { land: [320, 200], port: [240, 304] };
  var css = '#mz3{position:fixed;inset:0;z-index:90;background:#0b0615;display:none;flex-direction:column;color:#fff;font-family:system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}#mz3.on{display:flex}' +
    '#mz3 .mzTop{display:flex;align-items:center;gap:10px;padding:8px 12px;padding-top:calc(8px + env(safe-area-inset-top,0px));font-size:14px;z-index:3}#mz3 .mzTop b{flex:1}' +
    '#mz3 .mzTop button{border:0;background:#ffffff1f;color:#fff;border-radius:99px;width:34px;height:34px;font-size:16px}' +
    '#mz3 .mzStage{position:relative;margin:0 auto;width:min(100vw,calc((100vh - 190px)*var(--mzr,1.6)));aspect-ratio:var(--mzar,16/10);background:#000;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px #ffffff1a,0 12px 40px #000a}' +
    '#mz3 canvas{display:block;position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:auto}' +
    '#mz3 #mzMap{left:auto;right:6px;top:6px;width:84px;height:84px;border-radius:10px;background:#0b0615b0;border:1px solid #ffffff2a}' +
    '#mz3 .mzVig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,#0b061599 100%)}' +
    '#mz3 #mzHot{position:absolute;left:8px;top:8px;padding:4px 9px;border-radius:99px;background:#0b0615b0;font-size:12px;border:1px solid #ffffff2a}' +
    '#mz3 #mzArrow{position:absolute;left:50%;top:6px;margin-left:-14px;width:28px;height:28px;font-size:24px;line-height:28px;text-align:center;color:#59e6ff;text-shadow:0 0 10px #59e6ff;opacity:0;transition:opacity .2s}' +
    '#mz3 #mzMsg{position:absolute;left:0;right:0;bottom:10px;text-align:center;font-size:13px;opacity:0;transition:opacity .4s;text-shadow:0 1px 6px #000}' +
    '#mz3 .mzPad{flex:1;position:relative;min-height:120px}#mz3 .mzHelp{position:absolute;left:0;right:0;top:10px;text-align:center;font-size:12px;opacity:.55;pointer-events:none}' +
    '#mz3 #mzRadar{position:absolute;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:64px;height:64px;border-radius:50%;border:2px solid #59e6ff;background:#59e6ff22;color:#fff;font-size:12px;font-weight:700;z-index:2}#mz3 #mzRadar:disabled{opacity:.45}' +
    '#mz3 .mzJoy{position:absolute;width:88px;height:88px;margin:-44px 0 0 -44px;border-radius:50%;border:2px solid #ffffff44;background:#ffffff10;display:none;pointer-events:none}#mz3 .mzJoy i{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:#ff7fb0cc;box-shadow:0 0 16px #ff7fb0}' +
    '#mz3 #mzEnd{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#0b0615d9;z-index:5;text-align:center;padding:24px}#mz3 #mzEnd.on{display:flex}#mz3 #mzEnd h2{margin:0;font-size:26px}#mz3 #mzEnd p{margin:0;opacity:.85}' +
    '#mz3 #mzEnd button{border:0;border-radius:14px;background:#ff7fb0;color:#fff;padding:12px 22px;font:700 16px system-ui}' +
    '@media (orientation:landscape) and (max-height:520px){#mz3 .mzStage{width:min(100vw,calc((100vh - 52px)*var(--mzr,1.6)))}#mz3 .mzPad{position:absolute;left:0;right:0;top:50px;bottom:0;min-height:0}#mz3 .mzHelp{display:none}}';
  var st = document.createElement('style'); st.id = 'v73maze'; st.textContent = css; document.head.appendChild(st);

  var L = { n: 0, min: false };       /* local: game number, user minimised */
  var S = null;                        /* running session */
  var ov, cv, ctx, img, buf, zb, ov2, ctx2, mapc, mapx;

  function oppUid() { return opp().uid; }

  function ensureDom() {
    if (ov) return;
    ov = document.createElement('div'); ov.id = 'mz3'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Love Maze 3D');
    ov.innerHTML = '<div class="mzTop"><button id="mzBack" type="button" aria-label="Pause">‹</button><b>🌹 Love Maze</b><span id="mzTime">0:00</span><span id="mzHs">💗 0/' + HEARTS + '</span><button id="mzQuit" type="button" aria-label="Quit">✕</button></div>' +
      '<div class="mzStage" id="mzStage"><canvas id="mzC"></canvas><canvas id="mzO"></canvas><div class="mzVig"></div><canvas id="mzMap" width="126" height="126"></canvas><div id="mzHot"></div><div id="mzArrow">➤</div><div id="mzMsg"></div></div>' +
      '<div class="mzPad" id="mzPad"><div class="mzHelp">Left side: walk · Right side: look around · find each other 💞</div><button id="mzRadar" type="button">📡<br>Radar</button><div class="mzJoy" id="mzJoy"><i></i></div></div>' +
      '<div id="mzEnd"></div>';
    document.body.appendChild(ov);
    cv = ov.querySelector('#mzC'); ctx = cv.getContext('2d'); ov2 = ov.querySelector('#mzO'); ctx2 = ov2.getContext('2d'); mapc = ov.querySelector('#mzMap'); mapx = mapc.getContext('2d');
    fitShape(true);
    ov.querySelector('#mzBack').onclick = function () { L.min = true; hide(); G.render(); };
    ov.querySelector('#mzQuit').onclick = function () { if (confirm('End this game?')) { hide(); upd({ st: 'idle' }); } };
    ov.querySelector('#mzRadar').onclick = radar;
    bindInput();
  }
  function fitShape(force) {
    var port = window.innerHeight > window.innerWidth * 1.1, q = (S && S.q) || 1;
    if (!force && S && S.port === port && S.qApplied === q) return;
    var r = port ? RES.port : RES.land; if (S) { S.port = port; S.qApplied = q; }
    ov.style.setProperty('--mzar', port ? '30/38' : '16/10'); ov.style.setProperty('--mzr', port ? '0.789' : '1.6');
    setRes(Math.round(r[0] * q / 2) * 2, Math.round(r[1] * q / 2) * 2);
  }
  function setRes(w, hh) { FW = w; FH = hh; VS = w / (2 * PL); cv.width = w; cv.height = hh; img = ctx.createImageData(w, hh); buf = new Uint32Array(img.data.buffer); zb = new Float32Array(w); }

  /* ------------------------------------------------------------ input */
  var keys = {}, joy = null, look = null;
  function bindInput() {
    var pad = ov.querySelector('#mzPad'), jv = ov.querySelector('#mzJoy'), stage = ov.querySelector('#mzStage');
    function down(e) { var k = e.key.toLowerCase(); keys[k] = 1; if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0 && S) e.preventDefault(); if (k === 'r' && S) radar(); }
    function up(e) { keys[e.key.toLowerCase()] = 0; }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    [pad, stage].forEach(function (z) {
      z.addEventListener('pointerdown', function (e) {
        if (e.target.closest('#mzRadar')) return;
        var r = ov.getBoundingClientRect(), left = (e.clientX - r.left) < r.width / 2;
        if (left && !joy) { joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 }; var pr = pad.getBoundingClientRect(); jv.style.display = 'block'; jv.style.left = (e.clientX - pr.left) + 'px'; jv.style.top = (e.clientY - pr.top) + 'px'; jv.firstElementChild.style.transform = ''; }
        else if (!left && !look) look = { id: e.pointerId, x: e.clientX };
        try { z.setPointerCapture(e.pointerId); } catch (x) { }
      });
      z.addEventListener('pointermove', function (e) {
        if (joy && e.pointerId === joy.id) { var dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, m = Math.hypot(dx, dy), c = Math.min(1, m / 46); if (m > 0) { dx = dx / m * c * 46; dy = dy / m * c * 46; } joy.dx = dx / 46; joy.dy = dy / 46; jv.firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
        else if (look && e.pointerId === look.id && S) { S.me.a += (e.clientX - look.x) * 0.0085; look.x = e.clientX; }
      });
      function end(e) { if (joy && e.pointerId === joy.id) { joy = null; jv.style.display = 'none'; } if (look && e.pointerId === look.id) look = null; }
      z.addEventListener('pointerup', end); z.addEventListener('pointercancel', end);
    });
  }

  /* ------------------------------------------------------------ session */
  function startPos(i) {
    var gx = i ? M - 2 : 1, gy = i ? M - 2 : 1, a;
    if (!i) a = S.maze.g[gy * M + gx + 1] ? Math.PI / 2 : 0; else a = S.maze.g[gy * M + gx - 1] ? -Math.PI / 2 : Math.PI;
    return { x: gx + .5, y: gy + .5, a: a };
  }
  function openOv() {
    ensureDom(); makeTextures();
    if (S && S.n === D().n) { show(); return; }
    var d = D(), i = idx(), seed = (d.n % 2147483647) | 0;
    S = { n: d.n, i: i, maze: build(seed), hs: 0, t0: Date.now(), last: 0, radarUntil: 0, radarCool: 0, explored: new Uint8Array(M * M), part: null, me: null, parts: [], sent: 0, lastSend: 0, ended: false, hot: '', hotT: 0, frames: 0, ftime: 0, label: null, msgT: 0 };
    var sp = startPos(i); S.me = { x: sp.x, y: sp.y, a: sp.a, hs: 0 };
    var op = startPos(1 - i); S.part = { x: op.x, y: op.y, tx: op.x, ty: op.y, a: op.a, hs: 0, seen: 0 };
    for (var k = 0; k < 18; k++) S.parts.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .03, vy: .03 + Math.random() * .04, r: Math.random() * 6, s: 3 + Math.random() * 3 });
    show(); say('Find your partner 💞  Collect 💗 for radar');
  }
  function show() { ov.classList.add('on'); ov.querySelector('#mzEnd').classList.remove('on'); if (S && !S.raf) { S.last = 0; S.raf = requestAnimationFrame(frame); } }
  function hide() { if (ov) ov.classList.remove('on'); if (S && S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; } joy = null; look = null; }
  function D() { return G.D(); }
  function say(t) { var m = ov.querySelector('#mzMsg'); m.textContent = t; m.style.opacity = 1; clearTimeout(S && S.msgT); if (S) S.msgT = setTimeout(function () { m.style.opacity = 0; }, 2600); }
  function radar() { if (!S || S.ended) return; var n = Date.now(); if (n < S.radarCool) return; S.radarUntil = n + 5000; S.radarCool = n + 22000; beep(660, .2, 'sine'); say('📡 Radar on'); }

  function syncFromDoc() {
    if (!S) return; var d = D(); if (!d || !d.s) return;
    var p = d.s.pos && d.s.pos[oppUid()];
    if (p && p.length >= 4) { S.part.tx = p[0]; S.part.ty = p[1]; S.part.a = p[2]; S.part.hs = p[3] | 0; if (!S.part.seen) { S.part.x = p[0]; S.part.y = p[1]; } S.part.seen = 1; }
  }

  /* ------------------------------------------------------------ update */
  function open_(x, y) { return !S.maze.g[(y | 0) * M + (x | 0)]; }
  function canMove(x, y) { var r = .22; return open_(x - r, y - r) && open_(x + r, y - r) && open_(x - r, y + r) && open_(x + r, y + r); }
  function bfs() {
    var g = S.maze.g, sx = S.me.x | 0, sy = S.me.y | 0, tx = S.part.x | 0, ty = S.part.y | 0, dist = new Int16Array(M * M).fill(-1), q = [sy * M + sx], qi = 0; dist[q[0]] = 0;
    while (qi < q.length) { var c = q[qi++], cx = c % M, cy = (c / M) | 0; if (cx === tx && cy === ty) return dist[c]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = cx + d[0], ny = cy + d[1], ni = ny * M + nx; if (nx >= 0 && ny >= 0 && nx < M && ny < M && !g[ni] && dist[ni] < 0) { dist[ni] = dist[c] + 1; q.push(ni); } }); }
    return 99;
  }
  function update(dt) {
    var m = S.me, now = Date.now(), fwd = 0, trn = 0, str = 0;
    if (keys.w || keys.arrowup) fwd += 1; if (keys.s || keys.arrowdown) fwd -= 1;
    if (keys.arrowleft) trn -= 1; if (keys.arrowright) trn += 1;
    if (keys.a || keys.q) str -= 1; if (keys.d || keys.e) str += 1;
    if (joy) { fwd += -joy.dy * 1.15; trn += joy.dx * 1.1; }
    fwd = Math.max(-1, Math.min(1, fwd)); trn = Math.max(-1.3, Math.min(1.3, trn));
    m.a += trn * 2.4 * dt;
    var sp = 2.1 * dt, vx = Math.cos(m.a) * fwd * sp - Math.sin(m.a) * str * sp, vy = Math.sin(m.a) * fwd * sp + Math.cos(m.a) * str * sp;
    if (vx || vy) { if (canMove(m.x + vx, m.y)) m.x += vx; if (canMove(m.x, m.y + vy)) m.y += vy; S.moving = 1; } else S.moving = 0;
    S.bob = S.moving ? (S.bob || 0) + dt * 9 : 0;
    /* explore (fog of war) */
    var cx = m.x | 0, cy = m.y | 0; for (var yy = -2; yy <= 2; yy++) for (var xx = -2; xx <= 2; xx++) { var X = cx + xx, Y = cy + yy; if (X > 0 && Y > 0 && X < M - 1 && Y < M - 1) S.explored[Y * M + X] = 1; }
    S.maze.hearts.forEach(function (hh) { if (!hh.got && Math.hypot(hh.x - m.x, hh.y - m.y) < .5) { hh.got = 1; S.hs++; m.hs = S.hs; S.radarUntil = Math.max(S.radarUntil, now) + 3000; beep(880, .14, 'sine'); beep(1320, .26, 'sine', 90); if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) { } say('+1 💗  radar boost'); S.pop = { t: 0, x: .5, y: .45 }; sendPos(true); } });
    /* partner smoothing + meet check */
    var p = S.part; p.x += (p.tx - p.x) * Math.min(1, dt * 4); p.y += (p.ty - p.y) * Math.min(1, dt * 4);
    if (!S.ended && Math.hypot(p.x - m.x, p.y - m.y) < 1.0 && p.seen) finish();
    /* hot / cold */
    if (now - S.hotT > 500) { S.hotT = now; S.pd = bfs(); var d = S.pd; S.hot = d <= 4 ? '🔥 Very close' : d <= 10 ? '☀️ Warm' : d <= 18 ? '🌤 Cool' : '❄️ Far away'; }
    sendPos(false);
  }
  function sendPos(force) {
    var now = Date.now(), m = S.me;
    var moved = Math.abs(m.x - (S.sx || 0)) + Math.abs(m.y - (S.sy || 0)) + Math.abs(m.a - (S.sa || 0)) > .12;
    if (!force && (!moved || now - S.lastSend < 1400)) return;
    S.lastSend = now; S.sx = m.x; S.sy = m.y; S.sa = m.a;
    var o = {}; o['s.pos.' + my()] = [Math.round(m.x * 100) / 100, Math.round(m.y * 100) / 100, Math.round(m.a * 100) / 100, S.hs]; upd(o);
  }
  function finish() {
    if (S.ended) return; S.ended = true; var ms = Date.now() - S.t0, hs = {}; hs[my()] = S.hs; hs[oppUid()] = S.part.hs;
    beep(784, .18, 'triangle'); beep(988, .18, 'triangle', 150); beep(1175, .3, 'triangle', 300);
    fin('d', { pos: (D().s && D().s.pos) || {}, done: { ms: ms, by: my(), hs: hs } });
  }

  /* ------------------------------------------------------------ raycaster */
  function sh(c, f, ff) { return 0xFF000000 | ((((c >> 16 & 255) * f + FB * ff) | 0) << 16) | ((((c >> 8 & 255) * f + FG * ff) | 0) << 8) | (((c & 255) * f + FR * ff) | 0); }
  function render3d() {
    var m = S.me, px = m.x, py = m.y, a = m.a, dx = Math.cos(a), dy = Math.sin(a), plx = -dy * PL, ply = dx * PL, half = FH >> 1, g = S.maze.g, wt = S.maze.wt, x, y;
    for (y = half + 1; y < FH; y++) {
      var p = y - half, rd = (0.5 * VS) / p, f = 1 / (1 + 0.11 * rd * rd), ff = 1 - f;
      var stx = rd * 2 * plx / FW, sty = rd * 2 * ply / FW, fx = px + rd * (dx - plx), fy = py + rd * (dy - ply), oF = y * FW, oC = (FH - 1 - y) * FW;
      for (x = 0; x < FW; x++) {
        var tx = ((fx - (fx | 0)) * 128) | 0, ty = ((fy - (fy | 0)) * 128) | 0, ti = (ty << 7) + tx;
        buf[oF + x] = sh(FLR[ti], f, ff); buf[oC + x] = sh(CEL[ti], f * .9, 1 - f * .9);
        fx += stx; fy += sty;
      }
    }
    var mid = half * FW, mid2 = (half - 1) * FW; for (x = 0; x < FW; x++) buf[mid + x] = buf[mid2 + x] = 0xFF000000 | (FB << 16) | (FG << 8) | FR;
    for (x = 0; x < FW; x++) {
      var cam = 2 * x / FW - 1, rx = dx + plx * cam, ry = dy + ply * cam, mx = px | 0, my_ = py | 0, ddx = Math.abs(1 / (rx || 1e-9)), ddy = Math.abs(1 / (ry || 1e-9)), sx, sy, sdx, sdy;
      if (rx < 0) { sx = -1; sdx = (px - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - px) * ddx; }
      if (ry < 0) { sy = -1; sdy = (py - my_) * ddy; } else { sy = 1; sdy = (my_ + 1 - py) * ddy; }
      var side = 0, hit = 0, guard = 0;
      while (!hit && guard++ < 64) { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my_ += sy; side = 1; } if (g[my_ * M + mx]) hit = 1; }
      var pd = side === 0 ? sdx - ddx : sdy - ddy; if (pd < 0.05) pd = 0.05; zb[x] = pd;
      var lh = (VS / pd) | 0, ds = half - (lh >> 1), de = ds + lh, wx = side === 0 ? py + pd * ry : px + pd * rx; wx -= Math.floor(wx);
      var tex = TEX[wt[my_ * M + mx]], tcx = (wx * 128) | 0; if (side === 0 && rx > 0) tcx = 127 - tcx; if (side === 1 && ry < 0) tcx = 127 - tcx;
      var wf = 1 / (1 + 0.09 * pd * pd) * (side ? 0.78 : 1), wff = 1 - wf, step = 128 / lh, y0 = ds < 0 ? 0 : ds, y1 = de > FH ? FH : de, tp = (y0 - ds) * step;
      for (y = y0; y < y1; y++) { buf[y * FW + x] = sh(tex[((tp & 127) << 7) + tcx], wf, wff); tp += step; }
    }
    /* sprites: hearts + partner */
    var list = [], t = performance.now() / 1000;
    S.maze.hearts.forEach(function (hh) { if (!hh.got) list.push({ x: hh.x, y: hh.y, tex: SPR_HEART, tw: 128, th: 128, sc: .42, hc: .5 + Math.sin(t * 2.4 + hh.x * 3) * .05, emis: 1, d: 0 }); });
    list.push({ x: S.part.x, y: S.part.y, tex: SPR_P[1 - S.i], tw: 128, th: 224, sc: .82, hc: .47, emis: 1, d: 0, partner: 1 });
    var inv = 1 / (plx * dy - dx * ply); S.label = null;
    list.forEach(function (s) { var sx = s.x - px, sy = s.y - py; s.tx = inv * (dy * sx - dx * sy); s.ty = inv * (-ply * sx + plx * sy); });
    list.sort(function (A, B) { return B.ty - A.ty; });
    list.forEach(function (s) {
      var ty = s.ty; if (ty < .15) return;
      var scr = ((FW / 2) * (1 + s.tx / ty)) | 0, sh_ = Math.abs(VS / ty) * s.sc, sw = sh_ * (s.tw / s.th), cy = half + (.5 - s.hc) * (VS / ty), y0 = (cy - sh_ / 2) | 0, y1 = (cy + sh_ / 2) | 0, x0 = (scr - sw / 2) | 0, x1 = (scr + sw / 2) | 0;
      var f = 1 / (1 + 0.09 * ty * ty); f = s.emis ? .55 + .45 * f : f; var ff = 1 - f, vis = 0;
      for (var X = Math.max(0, x0); X < Math.min(FW, x1); X++) {
        if (zb[X] < ty) continue; var u = (((X - x0) / (x1 - x0)) * s.tw) | 0;
        for (var Y = Math.max(0, y0); Y < Math.min(FH, y1); Y++) {
          var v = (((Y - y0) / (y1 - y0)) * s.th) | 0, c = s.tex[v * s.tw + u], al = (c >>> 24); if (al < 10) continue;
          var o = buf[Y * FW + X], aa = al / 255, ia = 1 - aa;
          var r = ((c & 255) * f + FR * ff) * aa + (o & 255) * ia, gg = ((c >> 8 & 255) * f + FG * ff) * aa + (o >> 8 & 255) * ia, b = ((c >> 16 & 255) * f + FB * ff) * aa + (o >> 16 & 255) * ia;
          buf[Y * FW + X] = 0xFF000000 | ((b | 0) << 16) | ((gg | 0) << 8) | (r | 0); vis = 1;
        }
      }
      if (s.partner && vis) S.label = { x: scr / FW, y: y0 / FH, f: f };
    });
    ctx.putImageData(img, 0, 0);
    ov.querySelector('#mzStage').style.transform = S.moving ? 'translateY(' + (Math.sin(S.bob) * 1.2).toFixed(2) + 'px)' : '';
  }

  /* ------------------------------------------------------------ HUD / overlay canvas / minimap */
  function drawHud(dt) {
    var now = Date.now(), w = ov2.clientWidth, hh = ov2.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (ov2.width !== Math.round(w * dpr) || ov2.height !== Math.round(hh * dpr)) { ov2.width = Math.round(w * dpr); ov2.height = Math.round(hh * dpr); }
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0); ctx2.clearRect(0, 0, w, hh);
    /* drifting rose petals */
    S.parts.forEach(function (p) { p.x += p.vx * dt * 6; p.y += p.vy * dt * 6; p.r += dt * 2; if (p.y > 1.05) { p.y = -.05; p.x = Math.random(); } if (p.x < -.05) p.x = 1.05; if (p.x > 1.05) p.x = -.05; ctx2.save(); ctx2.translate(p.x * w, p.y * hh); ctx2.rotate(p.r); ctx2.fillStyle = 'rgba(255,150,190,.55)'; ctx2.beginPath(); ctx2.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.3); ctx2.fill(); ctx2.restore(); });
    if (S.pop) { S.pop.t += dt; var k = S.pop.t / 1.1; if (k >= 1) S.pop = null; else { ctx2.globalAlpha = 1 - k; ctx2.font = '700 ' + Math.round(hh * .09) + 'px system-ui'; ctx2.textAlign = 'center'; ctx2.fillStyle = '#ff8fb8'; ctx2.fillText('+1 💗', S.pop.x * w, (S.pop.y - k * .15) * hh); ctx2.globalAlpha = 1; } }
    if (S.label) { var lx = S.label.x * w, ly = Math.max(14, S.label.y * hh - 6); ctx2.font = '700 ' + Math.max(11, Math.min(15, Math.round(hh * .03))) + 'px system-ui'; ctx2.textAlign = 'center'; ctx2.fillStyle = 'rgba(11,6,21,.65)'; var nm = opp().name || 'Partner', tw = ctx2.measureText(nm).width + 14; ctx2.fillRect(lx - tw / 2, ly - 14, tw, 18); ctx2.fillStyle = '#fff'; ctx2.fillText(nm, lx, ly); }
    /* top bar + hot/cold */
    ov.querySelector('#mzTime').textContent = fmt(now - S.t0); ov.querySelector('#mzHs').textContent = '💗 ' + S.hs + '/' + HEARTS;
    var hot = ov.querySelector('#mzHot'); if (hot.textContent !== S.hot) hot.textContent = S.hot;
    var rb = ov.querySelector('#mzRadar'), rem = Math.ceil((S.radarCool - now) / 1000); rb.disabled = rem > 0; rb.innerHTML = rem > 0 ? rem + 's' : '📡<br>Radar';
    var ra = S.radarUntil > now, ar = ov.querySelector('#mzArrow');
    if (ra) { var ang = Math.atan2(S.part.y - S.me.y, S.part.x - S.me.x) - S.me.a; ar.style.opacity = 1; ar.style.transform = 'rotate(' + (ang * 180 / Math.PI) + 'deg)'; } else ar.style.opacity = 0;
    drawMap(ra);
  }
  function drawMap(ra) {
    var cs = Math.floor(126 / M), g = S.maze.g; mapx.clearRect(0, 0, 126, 126);
    for (var y = 0; y < M; y++) for (var x = 0; x < M; x++) if (S.explored[y * M + x]) { mapx.fillStyle = g[y * M + x] ? '#6b4a9a' : '#241a3d'; mapx.fillRect(x * cs, y * cs, cs, cs); }
    S.maze.hearts.forEach(function (hh) { if (!hh.got && S.explored[(hh.y | 0) * M + (hh.x | 0)]) { mapx.fillStyle = '#ff7fb0'; mapx.fillRect(hh.x * cs - 1.5, hh.y * cs - 1.5, 3, 3); } });
    if (ra) { mapx.fillStyle = '#59e6ff'; mapx.beginPath(); mapx.arc(S.part.x * cs, S.part.y * cs, 3.4, 0, 6.3); mapx.fill(); }
    mapx.save(); mapx.translate(S.me.x * cs, S.me.y * cs); mapx.rotate(S.me.a); mapx.fillStyle = '#fff'; mapx.beginPath(); mapx.moveTo(4, 0); mapx.lineTo(-3, -3); mapx.lineTo(-3, 3); mapx.closePath(); mapx.fill(); mapx.restore();
  }
  function frame(ts) {
    if (!S || !ov.classList.contains('on')) return;
    var dt = Math.min(.05, ((ts - (S.last || ts)) / 1000) || .016); S.last = ts;
    var t0 = performance.now(); if (!S.ended) update(dt); render3d(); drawHud(dt);
    S.ftime += performance.now() - t0; if (++S.frames === 90) { if (S.ftime / 90 > 20 && (S.q || 1) > .7) { S.q = .78; } S.frames = 0; S.ftime = 0; }
    fitShape(false);
    S.raf = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ end screen */
  function showEnd() {
    if (!ov) return; var d = D(), dn = d.s && d.s.done, e = ov.querySelector('#mzEnd');
    var tot = dn ? Object.keys(dn.hs || {}).reduce(function (a, k) { return a + (dn.hs[k] | 0); }, 0) : 0;
    e.innerHTML = '<div style="font-size:54px">💞</div><h2>You found each other!</h2><p>' + (dn ? 'Time ' + fmt(dn.ms) + ' · hearts ' + tot + '/' + (HEARTS) : '') + '</p><button type="button" id="mzDone">Continue</button>';
    e.classList.add('on'); e.querySelector('#mzDone').onclick = function () { hide(); G.render(); };
    if (S && S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    if (S) S.ended = true; beep(784, .18, 'triangle'); beep(988, .18, 'triangle', 150); beep(1319, .35, 'triangle', 300);
  }

  /* ------------------------------------------------------------ hub integration */
  function init() { return { pos: {} }; }
  function render(B) {
    var d = D();
    if (d.n !== L.n) { L.n = d.n; L.min = false; }
    if (d.st === 'play') {
      syncFromDoc();
      if (!L.min) openOv();
      B.appendChild(h('div', 'gmSt', '3D maze in progress 🌹'));
      var b = h('button', 'btn', 'Resume maze'); b.type = 'button'; b.onclick = function () { L.min = false; openOv(); }; B.appendChild(b);
    } else if (d.st === 'end') {
      if (ov && S && S.n === d.n && ov.classList.contains('on')) showEnd();
      B.appendChild(h('div', 'gmSt', 'You found each other 💞'));
    }
  }
  function sum() { var dn = D().s && D().s.done; if (!dn) return 'You found each other 💞'; var tot = Object.keys(dn.hs || {}).reduce(function (a, k) { return a + (dn.hs[k] | 0); }, 0); return 'Found each other in ' + fmt(dn.ms) + ' · hearts ' + tot + '/' + HEARTS + ' 💞'; }

  G.reg('maze3d', { name: 'Love Maze 3D', icon: '🌹', init: init, render: render, coop: 1, sum: sum });
  window.__maze3d = { build: build, alive: function () { return !!S; }, _S: function () { return S; } };
})();
