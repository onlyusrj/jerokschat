/* OnlyUs chat-v51.js
   1) WhatsApp-style CALL screen + INCOMING-call screen (liquid glass)         - CSS here, markup/logic in index.html
   2) Ringtone engine  window.__ring  (phone's own ringtone through the Android bridge, synth fallback in a browser)
   3) Contact info page (tap the name / photo in the chat header)
   4) Favorites + custom lists (chat list shows a heart and list chips)
   5) Advanced chat privacy (per chat)
   6) Message bubble pop animation only for NEW messages (stops the flicker when the tick changes)            */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var LSg = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var LSs = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var toast = function (m) { try { U().toast(m); } catch (e) {} };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ================================================================== CSS */
  var CSS = [
    /* ---- 6) bubble pop only when a bubble is new ---- */
    '@media (prefers-reduced-motion:no-preference){#ms>.m.m:last-child:not(.flash):not(.nw){animation:none}#ms>.m.nw.m{animation:fxMsg .26s ease both}}',

    /* ---- 1) call + incoming call screens ---- */
    '.cscr{position:fixed;inset:0;background:#0b0716;display:none;flex-direction:column;align-items:center;color:#fff;overflow:hidden;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);-webkit-user-select:none;user-select:none;touch-action:manipulation}',
    '.cscr.on{display:flex;animation:csIn .34s cubic-bezier(.2,.9,.3,1) both}',
    '@keyframes csIn{from{opacity:0;transform:translateY(22px) scale(.985)}}',
    '#clView{z-index:26}#clIn{z-index:27}',
    '.cs-bg{position:absolute;inset:-90px;background:radial-gradient(circle at 50% 18%,color-mix(in srgb,var(--acc,#8657d9) 62%,#1a1030) 0,#150d28 62%,#0b0716 100%);background-size:cover;background-position:center;-webkit-filter:blur(34px) saturate(1.3) brightness(.72);filter:blur(34px) saturate(1.3) brightness(.72);transform:translateZ(0)}',
    '.cs-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,4,20,.5) 0%,rgba(8,4,20,.06) 30%,rgba(8,4,20,.12) 60%,rgba(8,4,20,.74) 100%)}',
    '#clR{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;background:#000}',
    '.cscr.vid.conn #clR{display:block}',
    '#clL{position:absolute;z-index:4;right:14px;top:calc(env(safe-area-inset-top,0px) + 66px);width:104px;height:140px;object-fit:cover;border-radius:18px;background:#000;display:none;transform:scaleX(-1);border:1.5px solid rgba(255,255,255,.6);box-shadow:0 8px 24px rgba(0,0,0,.45)}',
    '.cscr.vid #clL{display:block}',
    '.cs-top{position:relative;z-index:3;width:100%;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:10px 14px 0}',
    '.cs-sp{flex:0 0 44px}',
    '.cs-lock{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;font-size:12.5px;opacity:.85}',
    '.cs-lock svg{width:12px;height:12px;fill:currentColor}',
    '.cs-mid{position:relative;z-index:3;flex:1;min-height:0;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px;text-shadow:0 1px 8px rgba(0,0,0,.45)}',
    '.cs-avw{position:relative;width:148px;height:148px;margin-bottom:22px;display:grid;place-items:center}',
    '.cs-avw .cs-ava{width:148px;height:148px;font-size:60px;border:3px solid rgba(255,255,255,.72);box-shadow:0 10px 40px rgba(0,0,0,.4);background-size:cover;background-position:center;position:relative;z-index:1}',
    '.cs-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,255,255,.55);opacity:0;animation:csRing 2.4s ease-out infinite}',
    '.cs-ring.r2{animation-delay:1.2s}',
    '@keyframes csRing{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.85);opacity:0}}',
    '.cscr h1{font-size:30px;font-weight:600;margin:0;letter-spacing:.2px;color:#fff}',
    '#clS,#inK,#clT{margin-top:8px;font-size:17px;opacity:.9;min-height:22px;color:#fff;font-variant-numeric:tabular-nums}',
    '#clT{margin-top:2px;font-size:19px}',
    '.cscr.conn .cs-ring{display:none}',
    '.cscr.vid.conn .cs-avw{display:none}',
    '.cscr.vid.conn .cs-mid{justify-content:flex-start;padding-top:6px}',
    '.cscr.vid.conn h1{font-size:21px}',
    /* liquid-glass control bar + buttons */
    '.cs-ctl{position:relative;z-index:3;display:flex;align-items:center;justify-content:center;gap:13px;padding:12px 15px;margin:0 12px calc(26px + var(--sb,0px));max-width:calc(100% - 24px);box-sizing:border-box;border-radius:42px;background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.05) 55%),rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.36);-webkit-backdrop-filter:blur(calc(var(--lg-blur,14px)*1.3)) saturate(1.6);backdrop-filter:blur(calc(var(--lg-blur,14px)*1.3)) saturate(1.6);box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 14px 38px rgba(0,0,0,.38)}',
    '.cb{all:unset;box-sizing:border-box;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#fff;-webkit-tap-highlight-color:transparent;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.06) 55%),rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.38);box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 6px 16px rgba(0,0,0,.25);transition:transform .15s ease,background .2s ease,color .2s ease}',
    '.cb:active{transform:scale(.9)}',
    '.cb svg{width:26px;height:26px;fill:currentColor}',
    '.cb.sm{width:44px;height:44px}.cb.sm svg{width:24px;height:24px}',
    '.cb .i-off{display:none}.cb.act .i-on{display:none}.cb.act .i-off{display:block}',
    '.cb.act{background:#fff;color:#1a1030;border-color:#fff}',
    '.cb.end,.cb.dec{background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0) 55%),#ff3b30;border-color:rgba(255,255,255,.4)}',
    '.cb.acc{background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0) 55%),#25d366;border-color:rgba(255,255,255,.4);animation:csWob 1.4s ease-in-out infinite}',
    '@keyframes csWob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}',
    '.cscr:not(.vid) #clFl{display:none}',
    '.cs-inb{position:relative;z-index:3;display:flex;justify-content:space-around;width:100%;max-width:420px;box-sizing:border-box;padding:0 24px calc(46px + var(--sb,0px))}',
    '.cs-inc{display:flex;flex-direction:column;align-items:center;gap:10px;font-size:14px;text-shadow:0 1px 6px rgba(0,0,0,.5)}',
    '.cb.big{width:76px;height:76px}.cb.big svg{width:34px;height:34px}',
    '#clMini{position:fixed;top:0;left:0;right:0;z-index:28;display:none;align-items:center;justify-content:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px;background:#1fa855;color:#fff;font-weight:600;font-size:14px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.3)}',
    '#clMini.on{display:flex}#clMini small{font-weight:400;opacity:.92}',
    '@media (prefers-reduced-motion:reduce){.cs-ring,.cb.acc{animation:none}.cscr.on{animation:none}}',

    /* ---- 3) contact info page ---- */
    '[data-ci]{cursor:pointer}',
    '#ciView{background:var(--bg)!important;z-index:19;flex-direction:column;align-items:stretch;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    '#ciView.on{animation:ciIn .28s cubic-bezier(.2,.9,.3,1) both}',
    '@keyframes ciIn{from{opacity:0;transform:translateX(34px)}}',
    '#ciView .bar{gap:14px;flex:none;padding-top:calc(env(safe-area-inset-top,0px) + 8px)}',
    '#ciView .bar b{font-size:18px;font-weight:600}',
    '.ci-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-bottom:calc(30px + var(--sb,0px));color:var(--ink)}',
    '.ci-hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:26px 20px 14px}',
    '.ci-hero .ci-av{width:116px;height:116px;font-size:48px;cursor:pointer;background-size:cover;background-position:center;box-shadow:0 8px 26px rgba(40,22,65,.25)}',
    '.ci-hero h2{margin:14px 0 2px;font-size:25px;font-weight:600;color:var(--ink)}',
    '.ci-hero .ci-ph{color:var(--dim);font-size:16px}',
    '.ci-quick{display:flex;gap:10px;margin-top:18px;width:100%;max-width:380px}',
    '.ci-quick button{all:unset;box-sizing:border-box;flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;border-radius:16px;border:1px solid var(--line);background:var(--panel);color:var(--acc);font-size:13px;cursor:pointer}',
    '.ci-quick button:active{transform:scale(.95)}.ci-quick svg{width:24px;height:24px;fill:currentColor}',
    '.ci-about{padding:14px 20px}.ci-about small{display:block;color:var(--dim);font-size:13px;font-weight:600;margin-bottom:4px}.ci-about div{font-size:16px}',
    '.ci-sep{height:1px;background:var(--line);margin:6px 16px}',
    '.ci-row{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:20px;width:100%;padding:14px 20px;cursor:pointer;color:var(--ink)}',
    '.ci-row:active{background:var(--line)}',
    '.ci-ic{flex:none;width:24px;height:24px;fill:var(--dim)}',
    '.ci-t{flex:1;min-width:0}.ci-t b{display:block;font-weight:500;font-size:16.5px}.ci-t small{display:block;color:var(--dim);font-size:13.5px;margin-top:2px;line-height:1.35}',
    '.ci-r{flex:none;color:var(--dim);font-size:14px}',
    '.ci-row.red{color:#ff6b81}.ci-row.red .ci-ic{fill:#ff6b81}',
    '.ci-sw{flex:none;width:40px;height:22px;border-radius:11px;background:var(--line);position:relative;transition:background .2s}',
    '.ci-sw:after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0004;transition:transform .2s}',
    '.ci-sw.on{background:var(--acc)}.ci-sw.on:after{transform:translateX(18px)}',
    '.ci-code{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 6px;margin:14px 0 6px;font:600 17px/1.2 ui-monospace,Menlo,Consolas,monospace;text-align:center;letter-spacing:.5px}',
    '.ci-lst{display:flex;align-items:center;gap:10px;padding:10px 4px;font-size:16px}.ci-lst input{width:20px;height:20px;accent-color:var(--acc)}',
    '.ci-new{width:100%;box-sizing:border-box;margin-top:8px;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font:inherit}',
    /* ---- 4) list chips ---- */
    '#listChips{display:none;gap:8px;overflow-x:auto;padding:6px 12px 2px;flex:none}#listChips.on{display:flex}',
    '#listChips button{all:unset;cursor:pointer;flex:none;padding:7px 14px;border-radius:18px;background:var(--panel);border:1px solid var(--line);color:var(--ink);font-size:14px}',
    '#listChips button.on{background:color-mix(in srgb,var(--acc) 22%,var(--panel));border-color:var(--acc);color:var(--acc);font-weight:600}',
    /* ---- 5) advanced chat privacy ---- */
    'html.advp #vdl{display:none!important}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'v51css'; st.textContent = CSS; document.head.appendChild(st);

  /* ============================================================== 2) RINGTONE */
  (function () {
    var ctx = null, iv = null, mode = '';
    function AC() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); return ctx; } catch (e) { return null; } }
    function unlock() { var c = AC(); if (c && c.state === 'suspended') c.resume().catch(function () {}); }
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true, capture: true }); });
    function nat(f) { try { if (window.Android && typeof window.Android[f] === 'function') { window.Android[f](); return true; } } catch (e) {} return false; }
    function tone(c, f, t, d, g, type) {
      var o = c.createOscillator(), a = c.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(g, t + 0.02); a.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(a); a.connect(c.destination); o.start(t); o.stop(t + d + 0.05);
    }
    function ringBurst() {
      var c = AC(); if (!c) return; if (c.state === 'suspended') c.resume().catch(function () {});
      var t = c.currentTime + 0.05, seq = [659.25, 783.99, 880, 783.99, 659.25, 783.99, 880, 1046.5];
      seq.forEach(function (f, i) { tone(c, f, t + i * 0.17, 0.3, 0.32, 'triangle'); tone(c, f * 2, t + i * 0.17, 0.2, 0.05, 'sine'); });
      try { if (navigator.vibrate) navigator.vibrate([420, 160, 420]); } catch (e) {}
    }
    function backBurst() {
      var c = AC(); if (!c) return; if (c.state === 'suspended') c.resume().catch(function () {});
      var t = c.currentTime + 0.05; tone(c, 440, t, 1.3, 0.07, 'sine'); tone(c, 480, t, 1.3, 0.07, 'sine');
    }
    function clear() { if (iv) { clearInterval(iv); iv = null; } }
    window.__ring = {
      start: function () {
        this.stopAll();
        if (nat('startRingtone')) { mode = 'native'; return; }
        mode = 'web'; ringBurst(); iv = setInterval(ringBurst, 3000);
      },
      back: function () { if (mode === 'back') return; this.stopAll(); mode = 'back'; backBurst(); iv = setInterval(backBurst, 4200); },
      stop: function () { this.stopAll(); },
      stopAll: function () { clear(); if (mode === 'native' || mode === '') nat('stopRingtone'); mode = ''; try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {} }
    };
  })();

  /* ====================================================== 4) FAVOURITES + LISTS */
  var FK = 'onlyus-fav', LK = 'onlyus-lists';
  window.__fav = {
    has: function (uid) { return !!uid && LSg(FK, []).indexOf(uid) >= 0; },
    toggle: function (uid) { var a = LSg(FK, []), i = a.indexOf(uid); if (i >= 0) a.splice(i, 1); else a.push(uid); LSs(FK, a); try { U().list(); } catch (e) {} return i < 0; }
  };
  var chipFilter = '';
  window.__lists = {
    all: function () { return LSg(LK, {}); },
    apply: function () {
      var cl = $('cl'); if (!cl) return;
      var chips = $('listChips');
      if (!chips) { chips = el('div'); chips.id = 'listChips'; cl.parentNode.insertBefore(chips, cl); }
      var L = LSg(LK, {}), names = Object.keys(L).filter(function (n) { return L[n].length; }), hasFav = LSg(FK, []).length > 0;
      if (!names.length && !hasFav) { chips.className = ''; chips.textContent = ''; chipFilter = ''; show(); return; }
      if (chipFilter && chipFilter !== '__fav' && names.indexOf(chipFilter) < 0) chipFilter = '';
      if (chipFilter === '__fav' && !hasFav) chipFilter = '';
      chips.className = 'on'; chips.textContent = '';
      var mk = function (label, key) { var b = el('button', chipFilter === key ? 'on' : '', label); b.type = 'button'; b.onclick = function () { chipFilter = key; window.__lists.apply(); }; chips.appendChild(b); };
      mk('All', ''); if (hasFav) mk('❤️ Favorites', '__fav'); names.forEach(function (n) { mk(n, n); });
      show();
      function show() {
        var allowed = !chipFilter ? null : (chipFilter === '__fav' ? LSg(FK, []) : (L[chipFilter] || []));
        [].slice.call(cl.querySelectorAll('.ct')).forEach(function (r) { r.style.display = (!allowed || allowed.indexOf(r.dataset.uid) >= 0) ? '' : 'none'; });
      }
    }
  };

  /* ============================================= 5) ADVANCED CHAT PRIVACY */
  function advKey() { return 'onlyus-advp-' + (U().cid ? U().cid() : ''); }
  function advOn() { return !!(U().cid && U().cid()) && LSg(advKey(), 0) === 1; }
  function advSync() { document.documentElement.classList.toggle('advp', advOn()); var d = $('vdl'); if (d) d.style.display = advOn() ? 'none' : ''; }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#toolExport,#ciExport');
    if (t && advOn()) { e.stopImmediatePropagation(); e.preventDefault(); toast('Advanced chat privacy is on: exporting is blocked'); }
  }, true);
  (function () { var v = $('viewer'); if (v) new MutationObserver(advSync).observe(v, { attributes: true, attributeFilter: ['class'] }); })();

  /* ============================================================ 3) CONTACT INFO */
  var P = {
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    call: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
    vid: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    media: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
    star: 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
    timer: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
    shield: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    palette: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    heart: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
    heartOn: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    list: 'M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z',
    dl: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    clear: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z',
    del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    mute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z'
  };
  function svg(p, cls) { return '<svg class="' + (cls || 'ci-ic') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + p + '"/></svg>'; }

  function dlg(title, node, btns) { if (window.__fx && window.__fx.dlg) window.__fx.dlg(title, node, btns); else alert(title); }
  function me() { return U().cur ? U().cur() : null; }
  function mutedNow() { try { return JSON.parse(localStorage.getItem('onlyus-muted') || '{}')[U().cid()] === true; } catch (e) { return false; } }
  function starCount() { try { return ((JSON.parse(localStorage.getItem('onlyus-starred') || '{}'))[U().cid()] || []).length; } catch (e) { return 0; } }
  function mediaCount() {
    var n = 0, M = U().msgs ? U().msgs() : null; if (!M) return 0;
    M.forEach(function (m) { if (!m || m.dele) return; if (m.type === 'img' || m.type === 'vid' || m.type === 'doc') n++; else if (m.text && /https?:\/\//i.test(m.text)) n++; });
    return n;
  }
  function ttlText() { var l = $('ttlLbl'); var t = l ? l.textContent : ''; return (!t || t === 'Disappear') ? 'Off' : t; }
  function e2eOn() { return !!window.nacl && localStorage.getItem('onlyus-e2e') !== '0'; }

  function openTools(boxBtnId) {
    closeCI();
    var cm = $('chatMore'); if (cm) cm.click();
    setTimeout(function () { var b = $(boxBtnId); if (b) b.click(); }, 0);
  }

  function securityDialog() {
    var c = me(), cid = U().cid(); if (!c || !cid) return;
    var w = el('div'), p = el('p', '', e2eOn() ? 'Messages in this chat are end-to-end encrypted. Only the two of you can read them.' : 'End-to-end encryption is turned off for new messages (Settings > Privacy). Older encrypted messages stay readable.');
    p.style.whiteSpace = 'pre-wrap'; w.appendChild(p);
    var g = el('div', 'ci-code'); for (var i = 0; i < 12; i++) g.appendChild(el('span', '', String(parseInt(cid.substr(i * 5, 5), 16) % 100000).padStart(5, '0')));
    w.appendChild(g);
    var q = el('p', '', 'To verify, compare this code with the one on ' + (c.name || 'your partner') + '\u2019s phone. If the numbers match, you are both in the same private chat. Anyone using a different shared code sees different numbers.');
    q.style.fontSize = '13px'; w.appendChild(q);
    dlg('🔒 Encryption', w, [{ l: 'Done' }]);
  }
  function advDialog() {
    var on = advOn();
    dlg('Advanced chat privacy', 'When this is on for this chat, exporting the chat and saving its photos or videos from the viewer are blocked on this phone.\n\nIt cannot stop screenshots or a camera pointed at the screen.\n\nIt is ' + (on ? 'ON now.' : 'OFF now.'),
      [{ l: on ? 'Turn off' : 'Turn on', f: function () { LSs(advKey(), on ? 0 : 1); advSync(); setTimeout(render, 30); } }, { l: 'Cancel', g: 1 }]);
  }
  function listDialog() {
    var c = me(); if (!c) return;
    var L = LSg(LK, {}), w = el('div'), boxes = {};
    var names = Object.keys(L);
    if (!names.length) { var p = el('p', '', 'Make a list (for example \u201CUs\u201D or \u201CAnniversary\u201D) and add this chat to it. Lists show as filters above your chat list.'); w.appendChild(p); }
    names.forEach(function (n) {
      var lab = el('label', 'ci-lst'), cb = el('input'); cb.type = 'checkbox'; cb.checked = L[n].indexOf(c.uid) >= 0; boxes[n] = cb;
      lab.appendChild(cb); lab.appendChild(el('span', '', n)); w.appendChild(lab);
    });
    var inp = el('input', 'ci-new'); inp.placeholder = 'New list name'; inp.maxLength = 24; w.appendChild(inp);
    dlg('Add to list', w, [{
      l: 'Save', f: function () {
        var L2 = LSg(LK, {}), nn = inp.value.trim();
        Object.keys(boxes).forEach(function (n) { var a = L2[n] || [], i = a.indexOf(c.uid); if (boxes[n].checked && i < 0) a.push(c.uid); if (!boxes[n].checked && i >= 0) a.splice(i, 1); L2[n] = a; });
        if (nn) { var a2 = L2[nn] || []; if (a2.indexOf(c.uid) < 0) a2.push(c.uid); L2[nn] = a2; }
        Object.keys(L2).forEach(function (n) { if (!L2[n].length && !(nn && n === nn)) delete L2[n]; });
        LSs(LK, L2); try { U().list(); } catch (e) {} toast('List saved'); setTimeout(render, 30);
      }
    }, { l: 'Cancel', g: 1 }]);
  }
  function listsLabel() {
    var c = me(), L = LSg(LK, {}); if (!c) return '';
    var in_ = Object.keys(L).filter(function (n) { return L[n].indexOf(c.uid) >= 0; });
    return in_.length ? in_.join(', ') : '';
  }
  function deleteChat() {
    var c = me(); if (!c) return;
    if (!confirm('Delete this chat from your list?\n\nYour messages stay saved in the cloud, and you can add ' + (c.name || 'your partner') + ' again with the same shared code.')) return;
    var cs = U().contacts(), i = -1;
    for (var k = 0; k < cs.length; k++) if (cs[k].uid === c.uid && cs[k].code === c.code) { i = k; break; }
    if (i >= 0) { cs.splice(i, 1); LSs('uc-contacts', cs); try { U().save(); } catch (e) {} }
    closeCI(); var bk = $('back'); if (bk) bk.click(); setTimeout(function () { try { U().list(); } catch (e) {} }, 60);
    toast('Chat deleted from your list');
  }

  function rows(c) {
    var fav = window.__fav.has(c.uid), ll = listsLabel();
    return [
      { ic: P.mute, t: 'Mute notifications', sw: mutedNow(), f: function () { var b = $('toolMute'); if (b) b.click(); setTimeout(render, 30); } },
      { ic: P.media, t: 'Media, links and docs', r: String(mediaCount()), f: function () { openTools('toolMedia'); } },
      { ic: P.star, t: 'Starred messages', r: String(starCount() || ''), f: function () { openTools('toolStarred'); } },
      { ic: P.timer, t: 'Disappearing messages', s: ttlText(), f: function () { var b = $('toolTtl'); if (b) b.click(); setTimeout(render, 900); } },
      { ic: P.shield, t: 'Advanced chat privacy', s: advOn() ? 'On' : 'Off', f: advDialog },
      { ic: P.palette, t: 'Chat theme', f: function () { openTools('toolWallpaper'); } },
      { ic: P.lock, t: 'Encryption', s: e2eOn() ? 'Messages are end-to-end encrypted. Tap to verify.' : 'End-to-end encryption is off for new messages. Tap to verify.', f: securityDialog },
      'sep',
      { ic: fav ? P.heartOn : P.heart, t: fav ? 'Remove from Favorites' : 'Add to Favorites', f: function () { var on = window.__fav.toggle(c.uid); toast(on ? 'Added to Favorites ❤️' : 'Removed from Favorites'); render(); } },
      { ic: P.list, t: 'Add to list', s: ll, f: listDialog },
      { ic: P.dl, t: 'Export chat', id: 'ciExport', f: function () { var b = $('toolExport'); if (b) b.click(); } },
      { ic: P.clear, t: 'Clear chat', red: 1, f: function () { var b = $('toolClearLocal'); if (b) b.click(); setTimeout(function () { var ms = $('ms'); if (ms && !ms.children.length) closeCI(); }, 60); } },
      { ic: P.del, t: 'Delete chat', red: 1, f: deleteChat }
    ];
  }

  function build() {
    if ($('ciView')) return;
    var v = el('div', 'ov'); v.id = 'ciView'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Contact info');
    var bar = el('div', 'bar'), x = el('button', 'ic', '✕'); x.type = 'button'; x.id = 'ciX'; x.setAttribute('aria-label', 'Close');
    bar.appendChild(x); bar.appendChild(el('b', '', 'Contact info')); v.appendChild(bar);
    var body = el('div', 'ci-body'); body.id = 'ciBody'; v.appendChild(body);
    document.body.appendChild(v);
    x.onclick = closeCI;
    body.addEventListener('click', function (e) {
      var q = e.target.closest && e.target.closest('[data-q]');
      if (q) { var k = q.getAttribute('data-q'); if (k === 'audio') { closeCI(); $('cab').click(); } else if (k === 'video') { closeCI(); $('cvb').click(); } else if (k === 'search') { openTools('toolSearch'); } return; }
      if (e.target.closest && e.target.closest('#ciAv')) { var c = me(), img = c && window.__pf && window.__pf.getPeer(c.uid); if (img) { var o = el('div', 'pfview'), im = new Image(); im.src = img; o.appendChild(im); o.onclick = function () { o.remove(); }; document.body.appendChild(o); } }
    });
    var fx = $('fxD'); if (fx) new MutationObserver(function () { if (v.classList.contains('on') && !fx.classList.contains('on')) setTimeout(render, 40); }).observe(fx, { attributes: true, attributeFilter: ['class'] });
  }

  function render() {
    var v = $('ciView'), body = $('ciBody'), c = me(); if (!v || !body || !c) return;
    var top = body.scrollTop; body.textContent = '';
    var hero = el('div', 'ci-hero'), av = el('div', 'av ci-av'); av.id = 'ciAv';
    if (window.__pf) window.__pf.paint(av, c.uid, c.name); else av.textContent = (c.name || '?')[0].toUpperCase();
    hero.appendChild(av); hero.appendChild(el('h2', '', c.name || 'Chat')); hero.appendChild(el('div', 'ci-ph', c.phone || c.email || 'Private OnlyUs chat'));
    var q = el('div', 'ci-quick');
    [['audio', P.call, 'Audio'], ['video', P.vid, 'Video'], ['search', P.search, 'Search']].forEach(function (a) { var b = el('button'); b.type = 'button'; b.setAttribute('data-q', a[0]); b.innerHTML = svg(a[1], '') + '<span>' + a[2] + '</span>'; q.appendChild(b); });
    hero.appendChild(q); body.appendChild(hero);
    var st = $('cs'), stx = st ? st.textContent.replace(/\u00a0/g, ' ').trim() : '';
    body.appendChild(el('div', 'ci-sep'));
    var ab = el('div', 'ci-about'); ab.appendChild(el('small', '', 'About')); ab.appendChild(el('div', '', stx || 'Hey there! I am using OnlyUs 💕')); body.appendChild(ab);
    body.appendChild(el('div', 'ci-sep'));
    rows(c).forEach(function (r) {
      if (r === 'sep') { body.appendChild(el('div', 'ci-sep')); return; }
      var b = el('button', 'ci-row' + (r.red ? ' red' : '')); b.type = 'button'; if (r.id) b.id = r.id;
      var html = svg(r.ic) + '<span class="ci-t"><b></b>' + (r.s ? '<small></small>' : '') + '</span>';
      b.innerHTML = html; b.querySelector('b').textContent = r.t; if (r.s) b.querySelector('small').textContent = r.s;
      if (r.r) { var rr = el('span', 'ci-r', r.r); b.appendChild(rr); }
      if (r.sw !== undefined) { var sw = el('span', 'ci-sw' + (r.sw ? ' on' : '')); b.appendChild(sw); }
      b.onclick = r.f; body.appendChild(b);
    });
    body.scrollTop = top;
  }

  function openCI() { if (!me()) return; build(); render(); advSync(); $('ciView').classList.add('on'); }
  function closeCI() { var v = $('ciView'); if (v) v.classList.remove('on'); }

  /* open it by tapping the name or the photo in the chat header */
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var hit = t.closest('#vChat > .bar #cav, #vChat > .bar [data-ci]'); if (!hit) return;
    e.stopImmediatePropagation(); e.preventDefault(); openCI();
  }, true);
  (function () { var cn = $('cn'); if (cn && cn.parentNode) cn.parentNode.setAttribute('data-ci', '1'); })();

  /* contact page must not stay open behind another chat */
  var vc = $('vChat'); if (vc) new MutationObserver(function () { if (!vc.classList.contains('on')) closeCI(); }).observe(vc, { attributes: true, attributeFilter: ['class'] });

  window.__ci = { open: openCI, close: closeCI };
})();
