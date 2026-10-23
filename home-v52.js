/* OnlyUs home-v52.js
   1) Home header: "Only Us" on top, a bigger icon row under it
   2) Bottom tabs: Chats | Status | Games  (one shared bar with a sliding highlight)
   3) Swipe right-to-left / left-to-right between the tabs, following your finger
   4) Smooth screen transitions + press feedback everywhere
   5) Games tab (all live games, opens the same games hub)
   6) Period moved into Our Space                                                      */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ===================================================================== CSS */
  var css = el('style');
  css.textContent = [
    /* ---- touch feel ---- */
    'html,body{overscroll-behavior-y:none;-webkit-tap-highlight-color:transparent}',
    'button,.row,.ic,.gmCard,.gv-card,#cl>*,.status-card,.hub-tabs button{touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .16s cubic-bezier(.2,.8,.2,1),background-color .22s ease,opacity .2s ease,box-shadow .22s ease}',
    'button:active:not(:disabled),.ic:active,.gmCard:active,.gv-card:active{transform:scale(.93)}',
    '.row:active,#cl>*:active,.status-card:active{transform:scale(.985)}',
    '#cl,.status-list,.gv-grid,.period-scroll,.hub-content,#ms,.ci-body{overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch}',

    /* ---- screen transitions ---- */
    '@keyframes vtFR{from{transform:translateX(26px)}to{transform:none}}',
    '@keyframes vtFL{from{transform:translateX(-26px)}to{transform:none}}',
    '@keyframes vtUP{from{transform:translateY(10px)}to{transform:none}}',
    '.view.vt-fr{animation:vtFR .26s cubic-bezier(.2,.8,.2,1) backwards}',
    '.view.vt-fl{animation:vtFL .26s cubic-bezier(.2,.8,.2,1) backwards}',
    '.view.vt-up{animation:vtUP .24s cubic-bezier(.2,.8,.2,1) backwards}',
    '@media(prefers-reduced-motion:reduce){.view.vt-fr,.view.vt-fl,.view.vt-up{animation:none}}',

    /* ---- header: Only Us + bigger icons ---- */
    '#vList>.listbar{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important;padding-top:calc(env(safe-area-inset-top,0px) + 12px)!important;padding-bottom:14px!important}',
    '#vList .lb-top{display:flex;align-items:center;justify-content:center;gap:11px}',
    '#vList .lb-top .brandmark{width:38px!important;height:38px!important;border-radius:13px!important;flex:none}',
    '#vList .lb-title{font-size:27px!important;font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1;text-shadow:0 2px 10px rgba(30,10,60,.25)}',
    '#vList .lb-icons{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '#vList .lb-icons .ic{flex:1 1 0;min-width:0;width:auto!important;max-width:78px;height:52px!important;border-radius:19px!important;font-size:25px!important;display:grid;place-items:center}',
    '#vList .lb-icons .ic.add-toggle{font-size:28px!important}',
    '#vList .lb-icons .ic#soundb,#vList .lb-icons .ic#themeb{font-size:30px!important}',

    /* ---- bottom tabs ---- */
    '.status-bottom,.period-bottom{display:none!important}',
    '#tabNav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(720px,100vw);box-sizing:border-box;z-index:8;display:none;padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line);box-shadow:0 -6px 18px rgba(30,16,56,.08)}',
    '#tabNav.on{display:block}',
    '#tabNav .tn-in{position:relative;display:flex}',
    '#tabNav .tn-pill{position:absolute;top:0;bottom:0;left:0;width:calc(100% / 5);border-radius:18px;background:color-mix(in srgb,var(--acc) 17%,transparent);transition:transform .34s cubic-bezier(.3,1.25,.4,1);pointer-events:none}',
    '#tabNav button{all:unset;cursor:pointer;position:relative;flex:1 1 0;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px 7px;border-radius:18px;color:var(--dim);font-size:11.5px;font-weight:600;-webkit-tap-highlight-color:transparent;transition:color .25s,transform .16s}',
    '#tabNav button svg{width:25px;height:25px;fill:currentColor;transition:transform .3s cubic-bezier(.3,1.5,.4,1)}',
    '#tabNav button.on{color:var(--acc);font-weight:700}#tabNav button.on svg{transform:translateY(-1px) scale(1.12)}',
    '#tabNav button:active{transform:scale(.92)}',

    /* ---- games tab ---- */
    '#vGames .gv-hero{padding:18px 18px 6px}#vGames .gv-hero h2{margin:0 0 4px;font-size:25px;letter-spacing:-.02em}#vGames .gv-hero p{margin:0;color:var(--dim);font-size:14.5px}',
    '#vGames .gv-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start;flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:14px 16px calc(110px + env(safe-area-inset-bottom,0px))}#vGames .gv-hero{flex:0 0 auto}',
    '#vGames .gv-card{all:unset;cursor:pointer;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:128px;padding:16px 10px;border-radius:22px;background:var(--panel);border:1px solid var(--line);text-align:center;box-shadow:0 8px 22px rgba(36,20,70,.10)}',
    '#vGames .gv-card .gi{font-size:38px;line-height:1}#vGames .gv-card b{font-size:15px;color:var(--ink)}',
    '#vGames .gv-card:active{transform:scale(.95)}',
    '@media(min-width:640px){#vGames .gv-grid{grid-template-columns:repeat(3,1fr)}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ============================================================ tab bar */
  var ICONS = {
    chats: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 9h10v2H7V9zm6 5H7v-2h6v2zm4-6H7V6h10v2z"/></svg>',
    status: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" opacity=".95"/></svg>',
    calls: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.74 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>',
    games: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0 0 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66A2.995 2.995 0 0 0 5.4 19.5c.78 0 1.5-.3 2.04-.83L9.12 17h5.76l1.68 1.67c.54.53 1.26.83 2.04.83 1.8 0 3.2-1.57 2.98-3.41zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4.5 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>'
  };
  var TABS = [
    { id: 'vList', key: 'chats', label: 'Chats' },
    { id: 'vStatus', key: 'status', label: 'Status' },
    { id: 'vGames', key: 'games', label: 'Games' },
    { id: 'vCalls', key: 'calls', label: 'Calls' },
    { id: 'vSet', key: 'settings', label: 'Settings' }
  ];
  var nav = el('div'); nav.id = 'tabNav'; nav.setAttribute('role', 'tablist');
  nav.innerHTML = '<div class="tn-in"><span class="tn-pill"></span>' + TABS.map(function (t, i) {
    return '<button type="button" role="tab" data-i="' + i + '" id="tn_' + t.key + '" aria-label="' + t.label + '">' + ICONS[t.key] + t.label + '</button>';
  }).join('') + '</div>';
  document.body.appendChild(nav);
  var pill = nav.querySelector('.tn-pill');

  var tabIndex = function (id) { for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) return i; return -1; };
  var curView = function () { var v = document.querySelector('.view.on'); return v ? v.id : ''; };

  function goTab(i) {
    var t = TABS[i]; if (!t) return;
    if (t.id === 'vList') { U().show('vList'); }
    else if (t.id === 'vStatus') { var b = $('listStatus'); if (b) b.click(); else U().show('vStatus'); }
    else if (t.id === 'vCalls') { U().show('vCalls'); }
    else if (t.id === 'vSet') { var sb = $('setb'); if (sb) sb.click(); else U().show('vSet'); }
    else { buildGames(); U().show('vGames'); }
  }
  nav.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-i]') : null; if (!b) return;
    var i = +b.getAttribute('data-i'); if (tabIndex(curView()) === i) { var sc = document.querySelector('#' + TABS[i].id + ' #cl,#' + TABS[i].id + ' .status-list,#vGames .gv-grid'); if (sc && sc.scrollTo) sc.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    goTab(i);
  });

  function syncNav() {
    var id = curView(), i = tabIndex(id);
    var lock = $('lock'), locked = lock && lock.classList.contains('on');
    nav.classList.toggle('on', i >= 0 && !locked);
    if (i >= 0) {
      pill.style.transform = 'translateX(' + (i * 100) + '%)';
      nav.querySelectorAll('button').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    }
  }

  /* ===================================================== screen transitions */
  var prevId = curView();
  function animate(v, prev) {
    var a = tabIndex(prev), b = tabIndex(v.id), cls = 'vt-up';
    if (a >= 0 && b >= 0) cls = b > a ? 'vt-fr' : 'vt-fl';
    else if (b >= 0 && a < 0) cls = 'vt-fl';       // coming back to a tab
    else if (a >= 0 && b < 0) cls = 'vt-fr';       // going deeper from a tab (chat, settings, period…)
    else if (prev === 'vChat') cls = 'vt-fl';
    v.classList.remove('vt-fr', 'vt-fl', 'vt-up'); void v.offsetWidth; v.classList.add(cls);
    clearTimeout(v.__vt); v.__vt = setTimeout(function () { v.classList.remove(cls); }, 360);
  }
  function onViewChange() {
    var now = curView();
    if (now && now !== prevId) { var v = $(now); if (v && !dragging) animate(v, prevId); prevId = now; }
    syncNav();
  }
  var mo = new MutationObserver(onViewChange);
  function watchViews() { document.querySelectorAll('.view').forEach(function (v) { mo.observe(v, { attributes: true, attributeFilter: ['class'] }); }); }
  watchViews();
  var lk = $('lock'); if (lk) mo.observe(lk, { attributes: true, attributeFilter: ['class'] });
  syncNav();

  /* ===================================================== swipe between tabs */
  var dragging = false, sx = 0, sy = 0, st = 0, dx = 0, locked = false, dragView = null, cancelled = false;
  function blockedTarget(t) {
    for (var n = t; n && n !== document.body; n = n.parentElement) {
      var tag = n.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'CANVAS' || n.isContentEditable || n.hasAttribute && n.hasAttribute('data-noswipe')) return true;
      if (n.scrollWidth > n.clientWidth + 6) { var ox = getComputedStyle(n).overflowX; if (ox === 'auto' || ox === 'scroll') return true; }
    }
    return false;
  }
  function overlayOpen() {
    var o = document.querySelectorAll('.ov.on,#coupleHub.on,.hub-view.on,.cscr.on');
    for (var i = 0; i < o.length; i++) if (getComputedStyle(o[i]).display !== 'none') return true;
    var hub = $('coupleHub'); if (hub && getComputedStyle(hub).display !== 'none') return true;
    return false;
  }
  document.addEventListener('touchstart', function (e) {
    dragging = false; locked = false; cancelled = false; dx = 0;
    if (e.touches.length !== 1) { cancelled = true; return; }
    var id = curView(); if (tabIndex(id) < 0 || overlayOpen() || blockedTarget(e.target)) { cancelled = true; return; }
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); dragView = $(id);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (cancelled || !dragView) return;
    var t = e.touches[0], mx = t.clientX - sx, my = t.clientY - sy;
    if (!locked) {
      if (Math.abs(my) > 14 && Math.abs(my) > Math.abs(mx)) { cancelled = true; return; }
      if (Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.4) { locked = true; dragging = true; dragView.style.transition = 'none'; dragView.style.willChange = 'transform,opacity'; }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    var i = tabIndex(dragView.id), edge = (mx > 0 && i === 0) || (mx < 0 && i === TABS.length - 1);
    dx = edge ? mx * 0.18 : mx * 0.5;
    dragView.style.transform = 'translateX(' + dx + 'px)';
    dragView.style.opacity = String(Math.max(.55, 1 - Math.abs(dx) / 420));
  }, { passive: false });
  function endDrag() {
    if (!dragging || !dragView) { dragView = null; return; }
    var v = dragView, i = tabIndex(v.id), mx = dx / 0.5, fast = Math.abs(mx) / Math.max(1, Date.now() - st) > 0.45;
    var go = (Math.abs(mx) > 70 || (fast && Math.abs(mx) > 30)) ? (mx < 0 ? i + 1 : i - 1) : -1;
    v.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s ease';
    v.style.transform = ''; v.style.opacity = '';
    setTimeout(function () { v.style.transition = ''; v.style.willChange = ''; }, 260);
    dragging = false; dragView = null; locked = false;
    if (go >= 0 && go < TABS.length) { v.style.transition = 'none'; goTab(go); }
  }
  document.addEventListener('touchend', endDrag, { passive: true });
  document.addEventListener('touchcancel', endDrag, { passive: true });

  /* ============================================================== games tab */
  var GAMES = [['ttt', '❌⭕', 'Tic-Tac-Toe'], ['c4', '🔴🟡', 'Connect 4'], ['rps', '✊✋✌️', 'Rock Paper Scissors'], ['memory', '🧠', 'Memory Match'], ['duel', '⚡', 'Quick Duel'], ['draw', '🎨', 'Draw & Guess'], ['wyr', '🤔💞', 'Would You Rather'], ['tod', '💬🔥', 'Truth or Dare'], ['ludo', '🎲', 'Ludo'], ['dots', '🔲', 'Dots & Boxes'], ['bship', '🚢', 'Battleship'], ['trivia', '❓', 'Trivia Duel'], ['cards', '🃏', 'Color Cards']];
  var built = false;
  function buildGames() {
    if (built) return; var g = $('gvGrid'); if (!g) return; built = true;
    GAMES.forEach(function (x) {
      var b = el('button', 'gv-card', '<span class="gi">' + x[1] + '</span><b>' + x[2] + '</b>'); b.type = 'button';
      b.onclick = function () { launch(x[0]); };
      g.appendChild(b);
    });
  }
  function launch(key) {
    var open = $('gmHome'); if (!open) return;
    window.__gmWant = key; // the games hub reads this and starts exactly this game
    open.click();          // existing flow: pick the chat, open the games hub
  }
  buildGames();

  /* ===================================================== Period in Our Space */
  var tabs = $('hubTabs');
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-tab="period"]') : null; if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var c = $('hubClose'); if (c) c.click();
    setTimeout(function () { var p = $('listPeriod'); if (p) p.click(); }, 60);
  }, true);

  window.__home52 = { goTab: goTab, tabs: TABS };
})();
