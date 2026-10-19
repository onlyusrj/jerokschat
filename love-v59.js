/* OnlyUs love-v59.js  —  💞 Love Corner
   1) 💓 Heartbeat tap (tap = 1 beat, hold = keep beating; partner feels it: glow + vibration + thump + push)
   4) 🌦️ Mood weather (badge next to partner name; stormy/rainy sends a gentle nudge)
   5) 🌙 Good night button (only visible 9 PM – 5 AM) + shared starry-night ritual + night streak
   6) ⏰ Server-side scheduled messages (sent even if both phones are closed)
   8) 🎁 Our Wrapped (stats story) incl. 🥺 Miss-o-meter: who missed whom more
  10) 🍚 Care nudges (Saptiya? / Thanni? / Medicine? ...) + daily auto reminders + optional period tips for partner
   Data: chats/{cid}/coupleHub/lv_*  (already allowed by rules) + top-level lvSched / lvRules (new rules block).  */
(function () {
  'use strict';
  var U = function () { return window.__us || {}; };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var mkey = function (d) { return ymd(d).slice(0, 7); };
  var toast = function (m) { try { U().toast(m); } catch (e) {} };
  var meId = function () { return (U().uid && U().uid()) || ''; };
  var herId = function () { return (U().cuid && U().cuid()) || ''; };
  var herName = function () { return (U().cname && U().cname()) || 'Partner'; };
  var fsx = function () { return U().fs(); };
  var dref = function (cid, n) { return fsx().collection('chats').doc(cid).collection('coupleHub').doc(n); };
  var inc = function (n) { return firebase.firestore.FieldValue.increment(n); };
  var ago = function (t) { var s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' d ago'; };
  var vib = function (p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
  var soundOn = function () { try { return JSON.parse(localStorage.getItem('onlyus-sound-prefs') || '{}').enabled !== false; } catch (e) { return true; } };
  var reduce = function () { try { return matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) { return false; } };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  /* ------------------------------------------------------------ sound (synth, no files) */
  var AC = null;
  function ac() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { ac(); }, { passive: true, capture: true }); });
  function thump(v) {
    if (!soundOn()) return; var a = ac(); if (!a) return; var t = a.currentTime;
    [0, 0.22].forEach(function (d, i) {
      var o = a.createOscillator(), g = a.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(i ? 66 : 88, t + d); o.frequency.exponentialRampToValueAtTime(38, t + d + 0.2);
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime((v || 0.6) * (i ? 0.7 : 1), t + d + 0.025); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.26);
      o.connect(g); g.connect(a.destination); o.start(t + d); o.stop(t + d + 0.3);
    });
  }
  function chime() {
    if (!soundOn()) return; var a = ac(); if (!a) return; var t = a.currentTime;
    [659, 784, 988, 1319].forEach(function (f, i) {
      var o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.22); g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.22 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.22 + 1.1);
      o.connect(g); g.connect(a.destination); o.start(t + i * 0.22); o.stop(t + i * 0.22 + 1.2);
    });
  }

  /* ------------------------------------------------------------ constants */
  var MOODS = [['sun', '☀️', 'Sunny', 'happy'], ['part', '⛅', 'Okay', 'so-so'], ['cloud', '☁️', 'Cloudy', 'low'], ['rain', '🌧️', 'Rainy', 'sad'], ['storm', '⛈️', 'Stormy', 'upset'], ['rbow', '🌈', 'Rainbow', 'so in love']];
  var MO = {}; MOODS.forEach(function (m) { MO[m[0]] = m; });
  var CARE = {
    eat: { e: '🍚', q: 'Saptiya?', yes: 'Ate ✅', no: 'Not yet 🥺' },
    water: { e: '💧', q: 'Thanni kudichiya?', yes: 'Drank ✅', no: 'Will do 🥤' },
    med: { e: '💊', q: 'Medicine edutiya?', yes: 'Took it ✅', no: 'Not yet ⏰' },
    safe: { e: '🚗', q: 'Safe ah reach aayitiya?', yes: 'Reached ✅', no: 'On the way 🛣️' },
    sleep: { e: '😴', q: 'Thoongala? Rest edu da', yes: 'Going to sleep 😴', no: 'Few more min 🥺' }
  };
  var GN = ['Good night da 🌙💤 sweet dreams, naan irukken always 💕', 'Goodnight chellam 🌙 kanavula meet pannuvom 😴💞', 'Night night 🌙✨ unna miss pannuven, thoongu da 😘', 'Good night my love 💤🧸 naalaiku paakalam 💕'];
  var gnOpen = function () { var h = new Date().getHours(); return h >= 21 || h < 5; };
  var nightKey = function () { var d = new Date(); if (d.getHours() < 5) d.setDate(d.getDate() - 1); return ymd(d); };

  /* ------------------------------------------------------------ CSS */
  var css = document.createElement('style');
  css.textContent = [
    '#lvOv{z-index:95;flex-direction:column;background:var(--bg);color:var(--ink);padding-top:env(safe-area-inset-top,0)}',
    '#lvOv .lvTop{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--hd,#8657d9);color:#fff}',
    '#lvOv .lvTop b{flex:1;font-size:18px}#lvOv .lvTop button{all:unset;cursor:pointer;width:40px;height:40px;display:grid;place-items:center;font-size:22px}',
    '#lvBody{flex:1;overflow:auto;padding:14px 12px calc(28px + env(safe-area-inset-bottom,0));font:15px/1.4 system-ui;overscroll-behavior:contain}',
    '.lvCard{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:14px;margin-bottom:12px}',
    '.lvCard h3{margin:0 0 4px;font-size:16px}.lvDim{color:var(--dim);font-size:13px}',
    '.lvBtn{border:0;background:var(--acc);color:#fff;border-radius:13px;padding:10px 16px;font:700 15px system-ui;cursor:pointer;margin:6px 6px 0 0}.lvBtn.g{background:var(--line);color:var(--ink)}.lvBtn:disabled{opacity:.5}',
    '.lvIn{width:100%;box-sizing:border-box;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px 12px;font:16px system-ui;margin:6px 0}',
    '.lvRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lvSp{flex:1}',
    '.lvHeartWrap{display:grid;place-items:center;padding:14px 0 6px}',
    '.lvHeart{all:unset;cursor:pointer;width:132px;height:132px;border-radius:50%;display:grid;place-items:center;font-size:64px;background:radial-gradient(circle at 35% 30%,#ff9bb4,#e0245e);box-shadow:0 10px 30px #e0245e66,inset 0 -6px 14px #0003;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.lvHeart.p{animation:lvPulse .55s ease-out}',
    '@keyframes lvPulse{0%{transform:scale(1)}25%{transform:scale(1.2)}45%{transform:scale(.97)}65%{transform:scale(1.1)}100%{transform:scale(1)}}',
    '.lvMoods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}',
    '.lvMoods button{all:unset;cursor:pointer;text-align:center;padding:10px 4px;border-radius:16px;border:1.5px solid var(--line);background:var(--bg)}',
    '.lvMoods button b{display:block;font-size:28px}.lvMoods button small{font-size:11px;color:var(--dim)}',
    '.lvMoods button.on{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 14%,var(--bg))}',
    '.lvBar{height:14px;border-radius:9px;background:var(--line);overflow:hidden;display:flex;margin:10px 0 4px}.lvBar i{display:block;height:100%;transition:width .6s cubic-bezier(.2,.8,.2,1)}',
    '.lvChips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.lvChips button{all:unset;cursor:pointer;padding:7px 12px;border-radius:14px;border:1.5px solid var(--line);font:600 13px system-ui;background:var(--bg)}.lvChips button.on{background:var(--acc);color:#fff;border-color:var(--acc)}',
    '.lvItem{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;background:var(--bg);border:1px solid var(--line);margin-top:6px;font-size:14px}.lvItem .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lvItem button{all:unset;cursor:pointer;opacity:.6;padding:4px 8px}',
    '.lvGnCard{background:linear-gradient(135deg,#1b1f4d,#3b2a78);color:#fff;border-color:transparent}.lvGnCard .lvDim{color:#cfd2ff}',
    /* floating good-night chip */
    '#lvGn{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 66px);z-index:60;border:0;border-radius:20px;padding:8px 14px;font:700 13px system-ui;color:#fff;background:linear-gradient(135deg,#2a2f7a,#5b3aa8);box-shadow:0 6px 18px #2a2f7a66;display:none;cursor:pointer;animation:lvChipIn .4s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes lvChipIn{from{transform:translateY(-8px) scale(.9);opacity:0}to{transform:none;opacity:1}}',
    /* receive overlays */
    '#lvBeatOv{position:fixed;inset:0;z-index:130;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 45%,#ff3b78cc,#3a0a2ae6);color:#fff;text-align:center;font:600 18px system-ui}',
    '#lvBeatOv.on{display:flex;animation:lvFade .25s ease-out}@keyframes lvFade{from{opacity:0}to{opacity:1}}',
    '#lvBeatOv .big{font-size:120px;line-height:1;animation:lvLub 1.1s ease-in-out infinite;filter:drop-shadow(0 0 28px #ff5c93)}',
    '@keyframes lvLub{0%,100%{transform:scale(1)}14%{transform:scale(1.28)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}',
    '#lvBeatOv small{font-weight:400;opacity:.8;font-size:13px}',
    '#lvNight{position:fixed;inset:0;z-index:125;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(#0a0e2e,#2b1b5e 70%,#4a2a7a);color:#fff;text-align:center;font:600 20px system-ui;overflow:hidden}',
    '#lvNight.on{display:flex;animation:lvFade .5s ease-out}#lvNight .moon{font-size:96px;filter:drop-shadow(0 0 30px #fff8c8);animation:lvFloat 4s ease-in-out infinite}',
    '@keyframes lvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}',
    '#lvNight i{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;animation:lvTw 2.4s ease-in-out infinite}@keyframes lvTw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.4)}}',
    '#lvNight small{font-weight:400;opacity:.8;font-size:14px}',
    '#lvCareOv{position:fixed;inset:0;z-index:128;display:none;align-items:center;justify-content:center;background:#0008;padding:20px}#lvCareOv.on{display:flex}',
    '#lvCareOv .c{width:100%;max-width:340px;background:var(--panel);color:var(--ink);border-radius:26px;padding:22px;text-align:center;box-shadow:0 20px 60px #0006;animation:lvChipIn .35s cubic-bezier(.2,.8,.2,1)}',
    '#lvCareOv .e{font-size:54px}#lvCareOv h2{margin:6px 0 2px;font:700 20px system-ui}#lvCareOv .lvBtn{display:block;width:100%;margin:10px 0 0}',
    '.lvFloat{position:fixed;z-index:131;pointer-events:none;font-size:26px;animation:lvUp 1.8s ease-out forwards}@keyframes lvUp{from{transform:translateY(0) scale(.6);opacity:1}to{transform:translateY(-220px) scale(1.3);opacity:0}}',
    '#lvMoodB{margin-left:6px;font-size:16px;cursor:pointer;vertical-align:middle}',
    /* wrapped story */
    '#lvWr{position:fixed;inset:0;z-index:140;display:none;background:#000}#lvWr.on{display:block}',
    '#lvWr .bars{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;right:10px;display:flex;gap:4px;z-index:3}#lvWr .bars i{flex:1;height:3px;border-radius:2px;background:#fff4;overflow:hidden}#lvWr .bars i b{display:block;height:100%;width:0;background:#fff}#lvWr .bars i.d b{width:100%}',
    '#lvWr .x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);right:10px;z-index:4;all:unset;color:#fff;font-size:24px;padding:6px 10px;cursor:pointer}',
    '#lvWr .st{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:70px 26px 50px;color:#fff;text-align:center;font:600 19px/1.35 system-ui;animation:lvFade .35s ease-out}',
    '#lvWr .st .h{font-size:14px;letter-spacing:.14em;text-transform:uppercase;opacity:.8}#lvWr .st .n{font-size:64px;font-weight:800;line-height:1}#lvWr .st .e{font-size:64px}#lvWr .st small{font-weight:400;opacity:.85;font-size:14px}',
    '#lvWr .z1,#lvWr .z2{position:absolute;top:60px;bottom:0;z-index:2}#lvWr .z1{left:0;width:35%}#lvWr .z2{right:0;width:65%}',
    '#lvWr .bw{width:100%;max-width:340px;text-align:left;font-size:15px}#lvWr .bw .r{display:grid;grid-template-columns:70px 1fr 44px;align-items:center;gap:8px;margin:8px 0}#lvWr .bw .r div{height:16px;border-radius:9px;background:#fff3;overflow:hidden}#lvWr .bw .r div i{display:block;height:100%;background:#fff;border-radius:9px;animation:lvGrow .9s cubic-bezier(.2,.8,.2,1) backwards;transform-origin:left}#lvWr .bw .r b{text-align:right}',
    '@keyframes lvGrow{from{transform:scaleX(0)}}',
    '@media(prefers-reduced-motion:reduce){#lvBeatOv .big,#lvNight .moon,#lvNight i,.lvHeart.p{animation:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ------------------------------------------------------------ DOM shells */
  function mk(tag, id, cls, html) { var e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; if (html != null) e.innerHTML = html; document.body.appendChild(e); return e; }
  var ov = mk('div', 'lvOv', 'ov', '<div class="lvTop"><button id="lvClose" type="button" aria-label="Close">←</button><b>💞 Love Corner</b></div><div id="lvBody"></div>');
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Love Corner');
  var beatOv = mk('div', 'lvBeatOv', '', '<div class="big">💗</div><div id="lvBeatT">…</div><small>tap to close</small>');
  var nightOv = mk('div', 'lvNight', '', '<div class="moon">🌙</div><div id="lvNightT"></div><small id="lvNightS"></small>');
  var careOv = mk('div', 'lvCareOv', '', '<div class="c"><div class="e" id="lvCareE"></div><h2 id="lvCareQ"></h2><div class="lvDim" id="lvCareW"></div><button class="lvBtn" id="lvCareY" type="button"></button><button class="lvBtn g" id="lvCareN" type="button"></button><button class="lvBtn g" id="lvCareL" type="button" style="background:none">Later</button></div>');
  var wrOv = mk('div', 'lvWr', '', '');
  var chip = mk('button', 'lvGn', '', ''); chip.type = 'button';
  (function () { var s = ''; for (var i = 0; i < 42; i++) s += '<i style="left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;animation-delay:' + (Math.random() * 2.4).toFixed(2) + 's"></i>'; nightOv.insertAdjacentHTML('afterbegin', s); })();

  /* ------------------------------------------------------------ per-chat live data */
  var G = {}, SUBS = {}, subUid = '', SEEN = {};
  var NAMES = ['lv_beat', 'lv_mood', 'lv_gn', 'lv_miss', 'lv_care'];
  var gd = function (cid, n) { return (G[cid] && G[cid][n]) || null; };

  async function watchOne(c) {
    if (!c || !c.uid) return null;
    var cid; try { cid = await U().cidOf(c); } catch (e) { return null; }
    if (SUBS[cid]) return cid;
    SUBS[cid] = { c: c, un: [] }; G[cid] = {};
    NAMES.forEach(function (n) {
      var first = true;
      try {
        SUBS[cid].un.push(dref(cid, n).onSnapshot(function (s) {
          var d = s.exists ? s.data() : null, prev = G[cid][n]; G[cid][n] = d;
          try { onDoc(cid, c, n, d, prev, first); } catch (e) { console.error('love', e); }
          first = false;
        }, function () {}));
      } catch (e) {}
    });
    return cid;
  }
  function stopAll() { Object.keys(SUBS).forEach(function (k) { SUBS[k].un.forEach(function (f) { try { f(); } catch (e) {} }); }); SUBS = {}; G = {}; }
  async function watchAll() {
    var u = U(); if (!u.uid || u.demo()) return;
    var uid = u.uid(); if (!uid) return;
    if (uid !== subUid) { stopAll(); subUid = uid; }
    var cs = (u.contacts && u.contacts()) || [];
    for (var i = 0; i < cs.length; i++) await watchOne(cs[i]);
  }
  setInterval(watchAll, 8000); setTimeout(watchAll, 2500);

  /* ------------------------------------------------------------ incoming events */
  function onDoc(cid, c, n, d, prev, first) {
    var me = meId();
    if (n === 'lv_beat' && d && d.by && d.by !== me && Date.now() - d.ts < 15000 && SEEN['b' + cid] !== d.ts) { SEEN['b' + cid] = d.ts; showBeat(c); }
    if (n === 'lv_miss' && d && d.by && d.by !== me && Date.now() - d.ts < 15000 && SEEN['m' + cid] !== d.ts) { SEEN['m' + cid] = d.ts; floatEmoji('🥺'); toast('🥺 ' + (c.name || 'Your love') + ' misses you'); vib([80, 60, 80]); }
    if (n === 'lv_mood' && d) {
      var cur = d[c.uid], was = prev && prev[c.uid];
      if (cur && (!was || was.t !== cur.t) && Date.now() - cur.t < 180000 && (cur.k === 'rain' || cur.k === 'storm')) softMoodCard(cid, c, cur.k);
      paintBadge();
    }
    if (n === 'lv_care' && d) {
      var p = d.ping;
      if (p && p.by !== me && !(d.ack && d.ack.id === p.id) && Date.now() - p.ts < 8 * 3600e3 && SEEN['c' + cid] !== p.id) { SEEN['c' + cid] = p.id; showCare(cid, c, p); }
      if (d.ack && d.ack.by !== me && Date.now() - d.ack.ts < 60000 && SEEN['a' + cid] !== d.ack.id) { SEEN['a' + cid] = d.ack.id; var cc = CARE[d.ack.k] || CARE.eat; toast((c.name || 'Partner') + ': ' + (d.ack.v === 'yes' ? cc.yes : cc.no)); vib([60, 40, 60]); }
    }
    if (n === 'lv_gn' && d) { checkNight(cid, c, d); }
    if (U().cid && U().cid() === cid) refreshCard(n);
    paintChip();
  }

  /* ---- heartbeat received */
  var beatTimer = null;
  function showBeat(c) {
    $('lvBeatT').textContent = (c.name || 'Your love') + ' is thinking of you 💓';
    beatOv.classList.add('on'); thump(0.7); vib([120, 80, 120, 500, 120, 80, 120]);
    clearTimeout(beatTimer); beatTimer = setTimeout(function () { beatOv.classList.remove('on'); }, 3800);
    setTimeout(function () { if (beatOv.classList.contains('on')) { thump(0.5); vib([100, 70, 100]); } }, 1200);
    setTimeout(function () { if (beatOv.classList.contains('on')) thump(0.4); }, 2400);
  }
  beatOv.onclick = function () { beatOv.classList.remove('on'); };
  function floatEmoji(e) {
    if (reduce()) return;
    for (var i = 0; i < 7; i++) (function (i) { setTimeout(function () { var s = document.createElement('div'); s.className = 'lvFloat'; s.textContent = i % 3 === 0 ? '💗' : e; s.style.left = (15 + Math.random() * 70) + '%'; s.style.bottom = '90px'; document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1900); }, i * 110); })(i);
  }

  /* ---- gentle mood nudge (partner is rainy/stormy) */
  function softMoodCard(cid, c, k) {
    var m = MO[k]; $('lvCareE').textContent = m[1]; $('lvCareQ').textContent = (c.name || 'Your love') + '’s heart is ' + m[2].toLowerCase();
    $('lvCareW').textContent = k === 'storm' ? 'Maybe a call, a hug, or just a 💓?' : 'Send some love their way 💕';
    $('lvCareY').textContent = '💓 Send a heartbeat'; $('lvCareN').textContent = 'OK 🤍'; $('lvCareL').style.display = 'none';
    careCtx = { kind: 'mood', cid: cid }; careOv.classList.add('on');
  }

  /* ---- care ping received */
  var careCtx = null;
  function showCare(cid, c, p) {
    var cc = CARE[p.k] || CARE.eat;
    $('lvCareE').textContent = cc.e; $('lvCareQ').textContent = cc.q; $('lvCareW').textContent = (c.name || 'Your love') + (p.auto ? ' (daily reminder)' : '') + ' cares about you 🫶';
    $('lvCareY').textContent = cc.yes; $('lvCareN').textContent = cc.no; $('lvCareL').style.display = '';
    careCtx = { kind: 'care', cid: cid, p: p }; careOv.classList.add('on'); vib([90, 60, 90]);
  }
  function answerCare(v) {
    if (!careCtx) return; var x = careCtx; careCtx = null; careOv.classList.remove('on');
    if (x.kind === 'mood') { if (v === 'yes') { sendBeat(false, x.cid); } return; }
    dref(x.cid, 'lv_care').set({ ack: { id: x.p.id, by: meId(), k: x.p.k, v: v, ts: Date.now() } }, { merge: true }).then(function () { toast('Sent 💕'); }).catch(function () { toast('Could not send. Publish the updated firestore.rules.'); });
  }
  $('lvCareY').onclick = function () { answerCare('yes'); };
  $('lvCareN').onclick = function () { answerCare('no'); };
  $('lvCareL').onclick = function () { careCtx = null; careOv.classList.remove('on'); };

  /* ---- mood badge next to the partner's name in the open chat */
  function paintBadge() {
    var cn = $('cn'), cid = U().cid && U().cid(), c = U().cur && U().cur(), on = $('vChat') && $('vChat').classList.contains('on');
    var b = $('lvMoodB'), m = cid && c ? gd(cid, 'lv_mood') : null, e = m && m[c.uid];
    if (!cn || !on || !e || !MO[e.k] || Date.now() - e.t > 864e5) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.id = 'lvMoodB'; b.onclick = function (ev) { ev.stopPropagation(); openLove(); }; }
    if (b.previousSibling !== cn) cn.after(b);
    b.textContent = MO[e.k][1]; b.title = (c.name || 'Partner') + ' feels ' + MO[e.k][2] + ' (' + ago(e.t) + ')';
  }

  /* ------------------------------------------------------------ good night */
  function myNightDone(cid) { var g = gd(cid, 'lv_gn'); return !!(g && g[meId()] && g[meId()].d === nightKey()); }
  function herNightDone(cid, c) { var g = gd(cid, 'lv_gn'); return !!(g && c && g[c.uid] && g[c.uid].d === nightKey()); }
  function streak(cid, c) {
    var g = gd(cid, 'lv_gn'), h = (g && g.h) || {}, me = meId(), her = c && c.uid, n = 0, d = new Date();
    if (d.getHours() < 5) d.setDate(d.getDate() - 1);
    var k = ymd(d), e = h[k];
    if (!(e && e[me] && e[her])) { d.setDate(d.getDate() - 1); }
    for (var i = 0; i < 800; i++) { e = h[ymd(d)]; if (e && e[me] && e[her]) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }
  function paintChip() {
    var cid = U().cid && U().cid(), c = U().cur && U().cur(), on = $('vChat') && $('vChat').classList.contains('on');
    if (!cid || !c || !on || !gnOpen() || myNightDone(cid) || ov.classList.contains('on')) { chip.style.display = 'none'; return; }
    chip.textContent = herNightDone(cid, c) ? '🌙 ' + (c.name || 'Partner') + ' said good night · say it back' : '🌙 Good night';
    chip.style.display = 'block';
  }
  chip.onclick = function () { goodNight(); };
  setInterval(function () { paintChip(); paintBadge(); }, 2500);

  async function goodNight() {
    var cid = U().cid(); if (!cid) return; if (!gnOpen()) return toast('Good night opens at 9 PM 🌙'); if (myNightDone(cid)) return toast('Already said good night 🌙');
    var nk = nightKey(), me = meId(), up = {}; up[me] = { d: nk, t: Date.now() }; up.h = {}; up.h[nk] = {}; up.h[nk][me] = Date.now();
    try { await dref(cid, 'lv_gn').set(up, { merge: true }); } catch (e) { return toast('Could not save. Publish the updated firestore.rules.'); }
    try { U().send({ type: 'text', text: pick(GN) }); } catch (e) {}
    chime(); vib([60, 40, 60]); toast('Good night 🌙');
    paintChip(); refreshCard('lv_gn');
  }
  function checkNight(cid, c, g) {
    var nk = nightKey(), me = meId(); if (!(g[me] && g[me].d === nk && g[c.uid] && g[c.uid].d === nk)) return;
    var key = 'lv-gn-ok:' + cid + ':' + nk; try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (e) {}
    var n = streak(cid, c);
    $('lvNightT').textContent = 'Good night 🌙 Sweet dreams, ' + (c.name || 'love');
    $('lvNightS').textContent = n > 1 ? '🌙 ' + n + ' nights in a row, together' : 'You both said good night 💞';
    nightOv.classList.add('on'); chime(); vib([80, 60, 80]);
    setTimeout(function () { nightOv.classList.remove('on'); }, 6000);
  }
  nightOv.onclick = function () { nightOv.classList.remove('on'); };

  /* ------------------------------------------------------------ sending: heartbeat / miss / mood / care */
  var lastBeat = 0, holdT = null, holdN = 0;
  function sendBeat(quiet, cidArg) {
    var cid = cidArg || U().cid(); if (!cid) return; var t = Date.now(); if (t - lastBeat < 650) return; lastBeat = t;
    if (!quiet) { thump(0.55); vib([60, 50, 60]); var h = $('lvHeart'); if (h) { h.classList.remove('p'); void h.offsetWidth; h.classList.add('p'); } }
    dref(cid, 'lv_beat').set({ by: meId(), ts: t, c: (function () { var o = {}; o[meId()] = inc(1); return o; })() }, { merge: true })
      .catch(function (e) { toast('Heartbeat failed' + (e && e.code ? ': ' + e.code : '')); });
  }
  function stopHold() { clearInterval(holdT); holdT = null; }
  var lastMiss = 0;
  function sendMiss() {
    var cid = U().cid(); if (!cid) return; var t = Date.now(); if (t - lastMiss < 4000) return toast('Konjam wait pannu da 🥺'); lastMiss = t;
    var o = { by: meId(), ts: t, n: {}, m: {} }; o.n[meId()] = inc(1); o.m[mkey(new Date())] = {}; o.m[mkey(new Date())][meId()] = inc(1);
    dref(cid, 'lv_miss').set(o, { merge: true }).then(function () { floatEmoji('🥺'); vib([40, 30, 40]); toast('Sent 🥺💗 ' + herName() + ' will feel it'); }).catch(function () { toast('Could not send. Publish the updated firestore.rules.'); });
  }
  function setMood(k) {
    var cid = U().cid(); if (!cid) return; var o = {}; o[meId()] = { k: k, t: Date.now() };
    dref(cid, 'lv_mood').set(o, { merge: true }).then(function () { toast('Mood shared ' + MO[k][1]); }).catch(function () { toast('Could not save. Publish the updated firestore.rules.'); });
  }
  function sendCare(k) {
    var cid = U().cid(); if (!cid) return;
    dref(cid, 'lv_care').set({ ping: { id: String(Date.now()), by: meId(), k: k, ts: Date.now() } }, { merge: true }).then(function () { toast(CARE[k].e + ' Asked ' + herName()); }).catch(function () { toast('Could not send. Publish the updated firestore.rules.'); });
  }

  /* ------------------------------------------------------------ Love Corner UI */
  var unSch = null, unRules = null, wrRange = 'month';
  function bodyHtml() {
    return '' +
      '<div class="lvCard"><h3>💓 Heartbeat</h3><div class="lvDim">Tap = one heartbeat. Hold = keep it beating. ' + esc(herName()) + ' feels it, even if the app is closed.</div>' +
      '<div class="lvHeartWrap"><button id="lvHeart" class="lvHeart" type="button" aria-label="Send heartbeat">💗</button></div><div class="lvDim" id="lvBeatCnt" style="text-align:center"></div></div>' +
      '<div class="lvCard"><h3>🌦️ My heart weather</h3><div class="lvDim" id="lvMoodHer"></div><div class="lvMoods" id="lvMoods">' + MOODS.map(function (m) { return '<button type="button" data-k="' + m[0] + '"><b>' + m[1] + '</b><small>' + m[2] + ' · ' + m[3] + '</small></button>'; }).join('') + '</div></div>' +
      '<div class="lvCard"><h3>🥺 Miss-o-meter</h3><div class="lvDim">Tap when you miss them. Wrapped also counts every “miss you” you typed.</div><button class="lvBtn" id="lvMissBtn" type="button">🥺 I miss you</button><div class="lvBar" id="lvMissBar"></div><div class="lvDim" id="lvMissTxt"></div></div>' +
      '<div class="lvCard lvGnCard" id="lvGnCard" style="display:none"><h3>🌙 Good night</h3><div class="lvDim" id="lvGnSt"></div><button class="lvBtn" id="lvGnBtn" type="button" style="background:#fff;color:#2a2f7a">🌙 Say good night</button></div>' +
      '<div class="lvCard"><h3>🍚 Care nudges</h3><div class="lvDim">One tap to ask. They answer with one tap.</div><div class="lvRow" id="lvCareBtns" style="margin-top:6px">' + Object.keys(CARE).map(function (k) { return '<button class="lvBtn g" type="button" data-c="' + k + '">' + CARE[k].e + ' ' + CARE[k].q + '</button>'; }).join('') + '</div><div class="lvDim" id="lvCareSt" style="margin-top:8px"></div>' +
      '<h3 style="margin-top:14px">Daily gentle reminders</h3><div class="lvDim">Every day at this time, ' + esc(herName()) + ' gets the question (works with the app closed).</div>' +
      '<div class="lvRow"><select class="lvIn" id="lvRuleK" style="flex:1">' + Object.keys(CARE).map(function (k) { return '<option value="' + k + '">' + CARE[k].e + ' ' + CARE[k].q + '</option>'; }).join('') + '</select><input class="lvIn" id="lvRuleT" type="time" value="13:00" style="width:120px"><button class="lvBtn" id="lvRuleAdd" type="button">Add</button></div><div id="lvRules"></div>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px"><input type="checkbox" id="lvTip"> <span>🩷 Share my period tips with ' + esc(herName()) + ' (if I use the Period tracker) — “be extra sweet today 🍫”</span></label></div>' +
      '<div class="lvCard" id="lvSchCard"><h3>⏰ Schedule a message</h3><div class="lvDim">Sent by the server at that time, even if both phones are off. Great for midnight birthday wishes 🎂</div>' +
      '<textarea class="lvIn" id="lvSchTxt" rows="3" placeholder="Message, e.g. Happy birthday chellam 🎂💕"></textarea><input class="lvIn" id="lvSchDt" type="datetime-local">' +
      '<div class="lvChips"><button type="button" data-q="night">🌙 Tonight 12:00 AM</button><button type="button" data-q="morn">☀️ Tomorrow 7:00 AM</button></div><button class="lvBtn" id="lvSchGo" type="button">Schedule</button><div id="lvSchList"></div></div>' +
      '<div class="lvCard"><h3>🎁 Our Wrapped</h3><div class="lvDim">Your chat as a story: who said “love you” more, who missed who, night owls, streaks…</div><div class="lvChips" id="lvWrR"><button type="button" data-r="month" class="on">This month</button><button type="button" data-r="year">This year</button><button type="button" data-r="all">All time</button></div><button class="lvBtn" id="lvWrGo" type="button">🎁 Show our Wrapped</button><div class="lvDim" id="lvWrSt"></div></div>';
  }

  function refreshCard(n) {
    if (!ov.classList.contains('on')) return; var cid = U().cid(), me = meId(), her = herId();
    if (n === 'lv_beat' && $('lvBeatCnt')) { var c = (gd(cid, 'lv_beat') || {}).c || {}; $('lvBeatCnt').innerHTML = 'You sent <b>' + (c[me] || 0) + '</b> 💓 · ' + esc(herName()) + ' sent <b>' + (c[her] || 0) + '</b> 💓'; }
    if (n === 'lv_mood' && $('lvMoods')) {
      var m = gd(cid, 'lv_mood') || {}, mine = m[me], hr = m[her];
      document.querySelectorAll('#lvMoods button').forEach(function (b) { b.classList.toggle('on', !!(mine && mine.k === b.dataset.k && Date.now() - mine.t < 864e5)); });
      $('lvMoodHer').textContent = hr && MO[hr.k] ? esc2(herName()) + ' is ' + MO[hr.k][1] + ' ' + MO[hr.k][2] + ' · ' + ago(hr.t) : 'Pick how your heart feels today. ' + herName() + ' sees it next to your name.';
    }
    if (n === 'lv_miss' && $('lvMissBar')) {
      var mm = (gd(cid, 'lv_miss') || {}).n || {}, a = mm[me] || 0, b2 = mm[her] || 0, t = a + b2;
      $('lvMissBar').innerHTML = t ? '<i style="width:' + (a / t * 100) + '%;background:#e0245e"></i><i style="width:' + (b2 / t * 100) + '%;background:#8657d9"></i>' : '';
      $('lvMissTxt').innerHTML = t ? '<b style="color:#e0245e">You ' + a + '</b> · <b style="color:#8657d9">' + esc(herName()) + ' ' + b2 + '</b> taps · ' + (a === b2 ? 'perfectly matched 🤝' : (a > b2 ? 'You miss ' : esc(herName()) + ' misses ') + (a > b2 ? esc(herName()) : 'you') + ' more 🥺') : 'No misses yet. Tap the button 🥺';
    }
    if (n === 'lv_gn' && $('lvGnCard')) {
      var open = gnOpen(), c2 = U().cur(); $('lvGnCard').style.display = open ? '' : 'none';
      if (open) { var done = myNightDone(cid), s = streak(cid, c2); $('lvGnSt').textContent = (herNightDone(cid, c2) ? esc2(herName()) + ' already said good night 🌙 ' : '') + (s ? '🌙 ' + s + ' night' + (s > 1 ? 's' : '') + ' in a row' : 'Start your night streak'); $('lvGnBtn').disabled = done; $('lvGnBtn').textContent = done ? '🌙 Said good night ✓' : '🌙 Say good night'; }
    }
    if (n === 'lv_care' && $('lvCareSt')) {
      var cr = gd(cid, 'lv_care') || {}, ack = cr.ack, p = cr.ping, line = '';
      if (p && p.by === me) { var cc = CARE[p.k] || CARE.eat; line = cc.e + ' You asked “' + cc.q + '” · ' + ago(p.ts) + (ack && ack.id === p.id ? ' → ' + esc2(herName()) + ': ' + (ack.v === 'yes' ? cc.yes : cc.no) : ' · waiting…'); }
      else if (ack && ack.by === me) { var c3 = CARE[ack.k] || CARE.eat; line = 'You replied: ' + (ack.v === 'yes' ? c3.yes : c3.no) + ' · ' + ago(ack.ts); }
      $('lvCareSt').textContent = line;
    }
  }
  function esc2(s) { return String(s); }
  function refreshAll() { NAMES.forEach(refreshCard); }

  async function openLove(focus) {
    var u = U(); if (!u.uid || !u.uid() || u.demo()) return toast('Love Corner needs a connected private chat');
    if (!u.cid()) { try { var c = await window.__fx.pickChat(); if (!c) return; if (!(await u.prep(c))) return; } catch (e) { return; } }
    var cid = u.cid(); await watchOne(u.cur());
    $('lvBody').innerHTML = bodyHtml(); ov.classList.add('on'); chip.style.display = 'none';
    wire(); refreshAll(); subLists(); loadTip();
    if (focus === 'sch') setTimeout(function () { var e = $('lvSchCard'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
  }
  function closeLove() { ov.classList.remove('on'); stopHold(); if (unSch) { unSch(); unSch = null; } if (unRules) { unRules(); unRules = null; } paintChip(); }
  $('lvClose').onclick = closeLove;

  function wire() {
    var h = $('lvHeart');
    h.onpointerdown = function (e) { e.preventDefault(); ac(); sendBeat(); holdN = 0; stopHold(); holdT = setInterval(function () { if (++holdN > 14) return stopHold(); sendBeat(); }, 1000); };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { h.addEventListener(ev, stopHold); });
    h.oncontextmenu = function (e) { e.preventDefault(); };
    $('lvMoods').onclick = function (e) { var b = e.target.closest('button'); if (b) setMood(b.dataset.k); };
    $('lvMissBtn').onclick = sendMiss;
    $('lvGnBtn').onclick = goodNight;
    $('lvCareBtns').onclick = function (e) { var b = e.target.closest('button'); if (b) sendCare(b.dataset.c); };
    $('lvRuleAdd').onclick = addRule;
    $('lvTip').onchange = function () { fsx().collection('users').doc(meId()).collection('period').doc('config').set({ shareTips: $('lvTip').checked }, { merge: true }).then(function () { toast($('lvTip').checked ? 'Period tips will be shared 🩷' : 'Period tips off'); }).catch(function () { toast('Could not save'); }); };
    document.querySelectorAll('.lvChips[data-x],#lvSchCard .lvChips button').forEach(function (b) { b.onclick = function () { var d = new Date(); if (b.dataset.q === 'night') d.setHours(24, 0, 0, 0); else { d.setDate(d.getDate() + 1); d.setHours(7, 0, 0, 0); } $('lvSchDt').value = ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }; });
    $('lvSchGo').onclick = schedule;
    $('lvWrR').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; wrRange = b.dataset.r; document.querySelectorAll('#lvWrR button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
    $('lvWrGo').onclick = runWrapped;
  }
  function loadTip() { fsx().collection('users').doc(meId()).collection('period').doc('config').get().then(function (s) { var t = $('lvTip'); if (t) t.checked = !!(s.exists && s.data().shareTips); }).catch(function () {}); }

  /* ---- scheduled messages + care rules (live lists) */
  function subLists() {
    var cid = U().cid(), me = meId();
    if (unSch) unSch(); if (unRules) unRules();
    unSch = fsx().collection('lvSched').where('fromUid', '==', me).where('cid', '==', cid).onSnapshot(function (s) {
      var el = $('lvSchList'); if (!el) return; var rows = s.docs.map(function (d) { return { id: d.id, d: d.data() }; }).sort(function (a, b) { return a.d.due - b.d.due; });
      el.innerHTML = rows.length ? '<div class="lvDim" style="margin-top:10px"><b>Waiting to be sent</b></div>' + rows.map(function (r) { var t = ''; try { t = (window.__fx.inn(r.d.msg, U().cur()) || {}).text || ''; } catch (e) {} return '<div class="lvItem"><span>⏰</span><span class="t">' + new Date(r.d.due).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) + ' · ' + esc(t.slice(0, 40)) + '</span><button type="button" data-id="' + r.id + '" aria-label="Cancel">✕</button></div>'; }).join('') : '';
      el.querySelectorAll('button[data-id]').forEach(function (b) { b.onclick = function () { fsx().collection('lvSched').doc(b.dataset.id).delete().then(function () { toast('Cancelled'); }); }; });
    }, function () { var el = $('lvSchList'); if (el) el.innerHTML = '<div class="lvDim">Publish the updated firestore.rules to use scheduling.</div>'; });
    unRules = fsx().collection('lvRules').where('fromUid', '==', me).where('cid', '==', cid).onSnapshot(function (s) {
      var el = $('lvRules'); if (!el) return;
      el.innerHTML = s.docs.map(function (d) { var r = d.data(), cc = CARE[r.kind] || CARE.eat, p = String(r.hm || '').split(':'), t = new Date(2000, 0, 1, +p[0], +p[1]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); return '<div class="lvItem"><span>' + cc.e + '</span><span class="t">' + esc(cc.q) + ' · daily ' + t + '</span><button type="button" data-id="' + d.id + '" aria-label="Remove">✕</button></div>'; }).join('');
      el.querySelectorAll('button[data-id]').forEach(function (b) { b.onclick = function () { fsx().collection('lvRules').doc(b.dataset.id).delete(); }; });
    }, function () { var el = $('lvRules'); if (el) el.innerHTML = '<div class="lvDim">Publish the updated firestore.rules to use reminders.</div>'; });
  }
  async function addRule() {
    var cid = U().cid(), to = herId(); if (!to) return toast('Open the chat with your partner first');
    var k = $('lvRuleK').value, hm = $('lvRuleT').value; if (!hm) return toast('Pick a time');
    try { await fsx().collection('lvRules').add({ cid: cid, fromUid: meId(), toUid: to, kind: k, hm: hm, tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'), on: true, createdAt: Date.now() }); toast('Daily reminder added ' + CARE[k].e); }
    catch (e) { toast('Could not add' + (e && e.code ? ': ' + e.code : '') + '. Publish firestore.rules + deploy functions.'); }
  }
  async function schedule() {
    var t = $('lvSchTxt').value.trim(), due = new Date($('lvSchDt').value).getTime();
    if (!t || !due || due < Date.now() + 60000) return toast('Write a message and pick a time at least 1 minute ahead');
    var u = U(), cid = u.cid(), me = u.me && u.me(); if (!me) return;
    var m = { from: me.num, fromUid: meId(), ts: Date.now(), type: 'text', text: t }, ttl = 0;
    try { if (window.__fx) await window.__fx.out(m); if (m.exp) { ttl = m.exp - Date.now(); delete m.exp; } } catch (e) {}
    try { await fsx().collection('lvSched').add({ cid: cid, fromUid: meId(), due: due, ttl: ttl, msg: m, createdAt: Date.now() }); $('lvSchTxt').value = ''; toast('Scheduled ⏰ will be sent even if the phones are off'); }
    catch (e) { toast('Could not schedule' + (e && e.code ? ': ' + e.code : '') + '. Publish firestore.rules + deploy functions.'); }
  }

  /* ------------------------------------------------------------ Wrapped */
  var LOVE_RE = /(\b(i\s*)?(love|luv|lub)\s*(you|u|uu|ya|so much)\b|\bilu\b|\bily\b|love\s*pann?[a-z]*|\bkad?h?aa?l\b|காதல்|லவ்)/i;
  var MISS_RE = /(\bmiss(ing|ed)?\s*(you|u|uu|ya)\b|\bmiss\s*(pann?[a-z]*|pandr[a-z]*)|\bi\s*miss\b|ninaikir[a-z]*|ninaivu|மிஸ்)/i;
  var EMO_RE; try { EMO_RE = new RegExp('\\p{Extended_Pictographic}(?:\\u200d\\p{Extended_Pictographic})*\\ufe0f?', 'gu'); } catch (e) { EMO_RE = /[\u2600-\u27bf]/g; }
  var h12 = function (h) { return ((h % 12) || 12) + (h < 12 ? ' AM' : ' PM'); };

  async function loadMsgs(start, prog) {
    var out = [], last = null, col = U().col();
    for (var i = 0; i < 40; i++) {
      var q = col.where('ts', '>=', start).orderBy('ts').limit(500); if (last) q = q.startAfter(last);
      var s = await q.get(); if (s.empty) break;
      s.docs.forEach(function (d) { out.push(d.data()); }); last = s.docs[s.docs.length - 1]; prog(out.length);
      if (s.size < 500) break;
    }
    return out;
  }
  async function runWrapped() {
    var u = U(); if (!u.cid()) return; var btn = $('lvWrGo'), st = $('lvWrSt'); btn.disabled = true;
    var now = new Date(), start = 0, label = 'All time';
    if (wrRange === 'month') { start = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); label = now.toLocaleString([], { month: 'long', year: 'numeric' }); }
    if (wrRange === 'year') { start = new Date(now.getFullYear(), 0, 1).getTime(); label = String(now.getFullYear()); }
    try {
      var msgs = await loadMsgs(start, function (n) { st.textContent = 'Reading ' + n + ' messages…'; });
      st.textContent = ''; var cards = buildWrapped(msgs, start, label); story(cards);
    } catch (e) { console.error(e); st.textContent = 'Could not read messages' + (e && e.code ? ': ' + e.code : ''); }
    btn.disabled = false;
  }
  function buildWrapped(msgs, start, label) {
    var cid = U().cid(), me = meId(), her = herId(), meN = 'You', herN = herName(), mynum = (U().me() || {}).num;
    var mine = function (m) { return m.fromUid ? m.fromUid === me : m.from === mynum; };
    msgs = msgs.filter(function (m) { return !m.dele; }).sort(function (a, b) { return a.ts - b.ts; });
    var S = { n: [0, 0], love: [0, 0], miss: [0, 0], night: [0, 0], first: [0, 0], aud: [0, 0], audSec: [0, 0], img: [0, 0], stk: [0, 0], reply: [[], []], emo: [{}, {}], hours: new Array(24).fill(0), days: {} };
    var prev = null, lastDay = '';
    msgs.forEach(function (m) {
      var i = mine(m) ? 0 : 1, d = new Date(m.ts), dk = ymd(d), txt = '';
      S.n[i]++; S.hours[d.getHours()]++; (S.days[dk] = S.days[dk] || [0, 0])[i]++;
      if (d.getHours() < 5) S.night[i]++;
      if (dk !== lastDay) { S.first[i]++; lastDay = dk; }
      if (m.type === 'aud') { S.aud[i]++; S.audSec[i] += +m.dur || 0; } else if (m.type === 'img') { if (m.sticker || m.gif) S.stk[i]++; else S.img[i]++; } else if (m.type === 'vid') S.img[i]++;
      if (m.type === 'text' || m.et) { try { txt = (m.et ? (window.__fx.inn(m, U().cur()) || {}).text : m.text) || ''; } catch (e) { txt = ''; } if (/^🔒/.test(txt)) txt = ''; }
      if (txt) { if (LOVE_RE.test(txt)) S.love[i]++; if (MISS_RE.test(txt)) S.miss[i]++; var em = txt.match(EMO_RE); if (em) em.forEach(function (x) { S.emo[i][x] = (S.emo[i][x] || 0) + 1; }); }
      if (prev && prev.i !== i && m.ts - prev.ts < 3 * 3600e3) S.reply[i].push(m.ts - prev.ts);
      prev = { i: i, ts: m.ts };
    });
    /* miss taps from the button (monthly buckets) */
    var tapsMe = 0, tapsHer = 0, mm = (gd(cid, 'lv_miss') || {}).m || {}, sk = start ? mkey(new Date(start)) : '';
    Object.keys(mm).forEach(function (k) { if (!sk || k >= sk) { tapsMe += (mm[k][me] || 0); tapsHer += (mm[k][her] || 0); } });
    var missMe = S.miss[0] + tapsMe, missHer = S.miss[1] + tapsHer;
    /* streak: days both chatted */
    var dk = Object.keys(S.days).filter(function (k) { return S.days[k][0] && S.days[k][1]; }).sort(), best = 0, run = 0, pd = null;
    dk.forEach(function (k) { var d = new Date(k + 'T00:00:00'); if (pd && Math.round((d - pd) / 864e5) === 1) run++; else run = 1; if (run > best) best = run; pd = d; });
    var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length / 60000 : 0; };
    var fmtMin = function (m) { return m < 1 ? '<1 min' : m < 90 ? Math.round(m) + ' min' : (m / 60).toFixed(1) + ' h'; };
    var top = function (o) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, 3); };
    var bars = function (a, b, ua) { var mx = Math.max(a, b, 1); return '<div class="bw"><div class="r"><span>You</span><div><i style="width:' + a / mx * 100 + '%"></i></div><b>' + a + '</b></div><div class="r"><span>' + esc(herN) + '</span><div><i style="width:' + b / mx * 100 + '%"></i></div><b>' + b + '</b></div></div>'; };
    var G1 = 'linear-gradient(160deg,#ff5c93,#8657d9)', G2 = 'linear-gradient(160deg,#1fa2ff,#6a5acd)', G3 = 'linear-gradient(160deg,#ff9a44,#ff3d77)', G4 = 'linear-gradient(160deg,#11998e,#38ef7d)', G5 = 'linear-gradient(160deg,#0f2027,#2c5364)', G6 = 'linear-gradient(160deg,#f7971e,#e0245e)', G7 = 'linear-gradient(160deg,#a18cd1,#fbc2eb)';
    var total = S.n[0] + S.n[1], cards = [];
    if (!total) return [{ bg: G5, html: '<div class="e">🫥</div><div>Not enough chat in this period yet.</div><small>Try “All time”.</small>' }];
    cards.push({ bg: G1, html: '<div class="h">Our Wrapped</div><div class="e">🎁</div><div class="n">' + total + '</div><div>messages in ' + esc(label) + '</div><small>' + Object.keys(S.days).length + ' days of talking. Tap to continue ›</small>' });
    cards.push({ bg: G2, html: '<div class="h">Who talks more</div>' + bars(S.n[0], S.n[1]) + '<div>' + (S.n[0] === S.n[1] ? 'Perfectly balanced 🤝' : (S.n[0] > S.n[1] ? 'You' : esc(herN)) + ' typed more 💬') + '</div>' });
    cards.push({ bg: G3, html: '<div class="h">“I love you” count</div>' + bars(S.love[0], S.love[1]) + '<div>' + (S.love[0] + S.love[1]) + ' times of love 💕</div>' });
    var mt = missMe + missHer, ml = missMe > missHer ? 'You' : esc(herN), pct = mt ? Math.round(Math.max(missMe, missHer) / mt * 100) : 0;
    cards.push({ bg: G7, html: '<div class="h">🥺 Miss-o-meter</div>' + bars(missMe, missHer) + '<div>' + (!mt ? 'No “miss you” yet. Tap 🥺 in Love Corner!' : missMe === missHer ? 'You both missed each other equally 🤝' : (missMe > missHer ? 'You missed ' + esc(herN) : esc(herN) + ' missed you') + ' more · ' + pct + '% 🥺') + '</div><small>typed “miss you” + 🥺 taps (you ' + S.miss[0] + '+' + tapsMe + ', ' + esc(herN) + ' ' + S.miss[1] + '+' + tapsHer + ')</small>' });
    cards.push({ bg: G4, html: '<div class="h">Who starts the chat</div>' + bars(S.first[0], S.first[1]) + '<div>first message of the day ☀️</div>' });
    var ra = avg(S.reply[0]), rb = avg(S.reply[1]);
    if (S.reply[0].length + S.reply[1].length > 3) cards.push({ bg: G6, html: '<div class="h">Reply speed</div><div class="e">⚡</div><div>You reply in ~' + fmtMin(ra) + '</div><div>' + esc(herN) + ' replies in ~' + fmtMin(rb) + '</div><small>' + (ra && rb ? (ra < rb ? 'You are the faster one' : esc(herN) + ' is the faster one') : '') + '</small>' });
    var ph = S.hours.indexOf(Math.max.apply(null, S.hours));
    cards.push({ bg: G5, html: '<div class="h">Night owls 🦉</div>' + bars(S.night[0], S.night[1]) + '<div>messages between 12 AM and 5 AM</div><small>Your favourite time to talk: ' + h12(ph) + '</small>' });
    var te = [top(S.emo[0]), top(S.emo[1])];
    if (te[0].length || te[1].length) cards.push({ bg: G3, html: '<div class="h">Favourite emoji</div><div>You</div><div class="e">' + (te[0].join(' ') || '—') + '</div><div>' + esc(herN) + '</div><div class="e">' + (te[1].join(' ') || '—') + '</div>' });
    if (S.aud[0] + S.aud[1] + S.img[0] + S.img[1] > 0) cards.push({ bg: G2, html: '<div class="h">Voices & photos</div><div class="e">🎤</div><div>' + (S.aud[0] + S.aud[1]) + ' voice notes · ' + Math.round((S.audSec[0] + S.audSec[1]) / 60) + ' min</div><div class="e">📸</div><div>' + (S.img[0] + S.img[1]) + ' photos & videos · ' + (S.stk[0] + S.stk[1]) + ' stickers/GIFs</div>' });
    cards.push({ bg: G4, html: '<div class="h">Longest chat streak</div><div class="e">🔥</div><div class="n">' + best + '</div><div>day' + (best === 1 ? '' : 's') + ' in a row, both of you</div>' });
    var gh = streak(cid, U().cur()), bc = ((gd(cid, 'lv_beat') || {}).c) || {};
    cards.push({ bg: G1, html: '<div class="h">Little things</div><div>💓 ' + ((bc[me] || 0) + (bc[her] || 0)) + ' heartbeats sent (all time)</div><div>🌙 ' + gh + ' night streak right now</div><div class="e">💞</div><div>Made with love for you two</div>' });
    return cards;
  }

  function story(cards) {
    var i = 0, st = wrOv; st.classList.add('on');
    st.innerHTML = '<div class="bars">' + cards.map(function () { return '<i><b></b></i>'; }).join('') + '</div><button class="x" type="button" aria-label="Close">✕</button><div class="z1"></div><div class="z2"></div><div class="st"></div>';
    var stage = st.querySelector('.st'), bars = st.querySelectorAll('.bars i');
    function draw() { stage.style.background = cards[i].bg; stage.style.animation = 'none'; void stage.offsetWidth; stage.style.animation = ''; stage.innerHTML = cards[i].html; bars.forEach(function (b, k) { b.classList.toggle('d', k <= i); }); }
    st.querySelector('.z2').onclick = function () { if (i < cards.length - 1) { i++; draw(); } else close(); };
    st.querySelector('.z1').onclick = function () { if (i > 0) { i--; draw(); } };
    function close() { st.classList.remove('on'); st.innerHTML = ''; }
    st.querySelector('.x').onclick = close; draw();
  }

  /* ------------------------------------------------------------ entry points */
  function addEntries() {
    var grid = document.querySelector('#chatTools .tool-grid');
    if (grid && !$('toolLove')) { var b = document.createElement('button'); b.id = 'toolLove'; b.type = 'button'; b.innerHTML = '💞<span>Love Corner</span>'; b.onclick = function () { $('chatTools').classList.remove('on'); openLove(); }; grid.prepend(b); }
    var sb = $('toolSched');
    if (sb && !sb.__lv) { sb.__lv = 1; sb.addEventListener('click', function (e) { e.stopImmediatePropagation(); e.preventDefault(); $('chatTools').classList.remove('on'); openLove('sch'); }, true); }
    var tabs = $('hubTabs');
    if (tabs && !$('lvHubBtn')) { var h = document.createElement('button'); h.id = 'lvHubBtn'; h.type = 'button'; h.textContent = '💞 Love Corner'; h.onclick = function () { openLove(); }; tabs.prepend(h); }
  }
  addEntries(); setTimeout(addEntries, 1500);
  window.__love = { open: openLove, goodNight: goodNight, beat: sendBeat };
})();
