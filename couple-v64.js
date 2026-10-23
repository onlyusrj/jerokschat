/* OnlyUs couple-v64.js
   1) Home header: no logo, just "OnlyUs" in the top-left corner
   2) Games: cover pictures instead of emojis (img/games/<game>.jpg if you add a real photo, else the bundled .svg cover)
   3) Couple extras (couples mode only): floating hearts, "Together for N days" card, daily question card,
      heart burst on tap, soft pop-in for new chat bubbles
   4) Bottom tab labels fit six tabs on a phone                                                       */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };

  var css = el('style');
  css.textContent = [
    /* header */
    'html #vList .lb-top .brandmark{display:none!important}',
    'html #vList .lb-top{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;width:100%!important;padding-left:2px}',
    'html #vList .lb-top .lb-title{position:static!important;left:auto!important;transform:none!important;pointer-events:auto;order:-1!important;flex:1 1 auto;text-align:left!important;margin:0!important;font-size:29px!important;font-weight:800!important;letter-spacing:-.6px;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 2px 14px rgba(40,10,90,.45)}',
    'html #vList .lb-top #lbMore{margin-left:auto!important;flex:none}',
    '.search-wrap kbd{display:none!important}',
    'html #usb{display:none!important}',
    /* 3-dots menu: opens as a row inside the header (no floating popup behind the page) */
    'html #vList .listbar{flex-direction:column!important;align-items:stretch!important;flex-wrap:nowrap!important;gap:0!important}',
    'html #vList .lb-top{flex:none!important}',
    'html #vList .lb-icons.open{position:static!important;flex:none!important;order:5;width:100%!important;max-width:none!important;justify-content:space-between!important;gap:8px!important;padding:6px 0 4px!important;margin:4px 0 0!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;animation:o64drop .22s cubic-bezier(.2,.9,.3,1) both!important}',
    '@keyframes o64drop{from{opacity:0;transform:translateY(-8px)}}',
    'html #vList .lb-icons.open .ic{flex:1 1 0!important;width:auto!important;max-width:none!important;height:46px!important;background:rgba(255,255,255,.2)!important;color:#fff!important;border:1px solid rgba(255,255,255,.28)!important}',
    'html #vList .lb-icons.open .ic.add-toggle{background:#fff!important;color:#65409a!important}',
    'html #vList .lb-icons .o64hide{font-size:14px!important;font-weight:700}',
    /* bottom tabs: six on a phone */
    '#tabNav button{font-size:10.5px!important;letter-spacing:-.1px}#tabNav button svg{width:23px!important;height:23px!important}',
    'html.hub-open #tabNav{z-index:90}html.hub-open #coupleHub{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}',
    '#tn_space.on svg{animation:o64beat 1.6s ease-in-out infinite}',
    '@keyframes o64beat{0%,100%{transform:scale(1.1)}14%{transform:scale(1.28)}28%{transform:scale(1.1)}42%{transform:scale(1.22)}}',
    /* games pictures */
    '#vGames .gv-card .gi,.gmCard .gi{display:block;width:100%;font-size:0!important;line-height:0}',
    '.gv-card .gi img,.gmCard .gi img{width:100%;aspect-ratio:16/11;object-fit:cover;border-radius:14px;display:block;box-shadow:0 6px 16px rgba(60,30,110,.22)}',
    '#vGames .gv-card,.gmCard{padding:8px 8px 12px!important;gap:8px!important;overflow:visible!important}',
    '#vGames .gv-grid{grid-auto-rows:max-content!important;grid-template-rows:none!important}.gmGrid{align-items:start}',
    '.gv-card:active .gi img,.gmCard:active .gi img{transform:scale(.97)}.gi img{transition:transform .2s ease}',
    /* floating hearts */
    '#o64Hearts{display:none;position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}#vList.on #o64Hearts{display:block}',
    '#o64Hearts i{position:absolute;bottom:-40px;font-style:normal;color:var(--acc);opacity:0;animation:o64float linear infinite}',
    '@keyframes o64float{0%{transform:translateY(0) translateX(0) scale(.7);opacity:0}12%{opacity:.28}50%{transform:translateY(-55vh) translateX(18px) scale(1)}100%{transform:translateY(-112vh) translateX(-14px) scale(1.15);opacity:0}}',
    /* cards */
    '.o64card{position:relative;margin:10px 14px;padding:16px 18px;border-radius:22px;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 16%,var(--panel)),var(--panel));border:1px solid var(--line);box-shadow:0 8px 24px rgba(110,70,190,.12);overflow:hidden;animation:o64up .5s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes o64up{from{opacity:0;transform:translateY(14px)}}',
    '.o64card small{display:block;color:var(--dim);font-size:12px;letter-spacing:.4px;text-transform:uppercase;font-weight:700}',
    '.o64days{display:flex;align-items:baseline;gap:8px;margin-top:6px}.o64days b{font-size:42px;line-height:1;color:var(--acc);font-weight:800}.o64days span{font-size:15px;color:var(--ink);font-weight:600}',
    '.o64sub{margin-top:6px;font-size:13px;color:var(--dim)}',
    '.o64bar{margin-top:10px;height:7px;border-radius:9px;background:color-mix(in srgb,var(--acc) 14%,transparent);overflow:hidden}.o64bar i{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,var(--acc),#ff6fa8);transition:width 1.2s cubic-bezier(.2,.8,.2,1)}',
    '.o64h{position:absolute;right:16px;top:14px;width:34px;height:34px;fill:#ff5c8d;animation:o64beat 1.6s ease-in-out infinite}',
    '.o64q{margin:8px 0 12px;font-size:17px;line-height:1.4;font-weight:600;color:var(--ink)}',
    '.o64btns{display:flex;gap:8px;margin-right:78px}.o64btns button{all:unset;cursor:pointer;flex:1;text-align:center;padding:10px;border-radius:14px;font-size:14px;font-weight:700;background:var(--acc);color:#fff}.o64btns button.alt{background:color-mix(in srgb,var(--acc) 14%,transparent);color:var(--acc)}',
    /* burst + bubbles */
    '.o64b{position:fixed;z-index:2147480000;pointer-events:none;font-size:20px;color:#ff5c8d;animation:o64burst .9s ease-out forwards}',
    '@keyframes o64burst{from{transform:translate(-50%,-50%) scale(.4);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.3) rotate(var(--r));opacity:0}}',
    '#ms .m:nth-last-child(-n+2){animation:o64pop .32s cubic-bezier(.2,1.2,.4,1) both}',
    '@keyframes o64pop{from{opacity:0;transform:translateY(10px) scale(.94)}}',
    '.heart-orb{animation:o64beat 2s ease-in-out infinite;cursor:pointer}',
    '@media (prefers-reduced-motion:reduce){#o64Hearts{display:none!important}.o64h,.heart-orb,#tn_space.on svg,html #vList .lb-title{animation:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- 2) games pictures instead of emojis ---------- */
  var KEY = { 'Tic-Tac-Toe': 'ttt', 'Connect 4': 'c4', 'Rock Paper Scissors': 'rps', 'Memory Match': 'memory', 'Quick Duel': 'duel', 'Draw & Guess': 'draw', 'Would You Rather': 'wyr', 'Truth or Dare': 'tod', 'Ludo': 'ludo', 'Dots & Boxes': 'dots', 'Battleship': 'bship', 'Trivia Duel': 'trivia', 'Color Cards': 'cards' };
  function photoize() {
    document.querySelectorAll('.gv-card .gi,.gmCard .gi').forEach(function (g) {
      if (g.querySelector('img')) return;
      var b = g.parentNode && g.parentNode.querySelector('b'), k = b && KEY[b.textContent.trim()];
      if (!k) return;
      var im = new Image(); im.alt = b.textContent.trim(); im.loading = 'lazy'; im.decoding = 'async';
      im.onerror = function () { if (!im.__f) { im.__f = 1; im.src = 'img/games/' + k + '.svg'; } };
      im.src = 'img/games/' + k + '.jpg';
      g.textContent = ''; g.appendChild(im);
    });
  }
  var raf = 0;
  new MutationObserver(function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; photoize(); }); }).observe(document.body, { childList: true, subtree: true });
  photoize();


  /* ---------- 3-dots menu: Hide button + working toggle ---------- */
  function fixMenu() {
    var list = $('vList'), more = $('lbMore'), icons = list && list.querySelector('.lb-icons');
    if (!more || !icons || icons.__o64) return; icons.__o64 = 1;
    var hide = el('button', 'ic o64hide', 'Hide'); hide.type = 'button'; hide.setAttribute('aria-label', 'Hide menu');
    var shut = function () { icons.classList.remove('open'); more.classList.remove('open'); };
    hide.onclick = function (e) { e.stopPropagation(); shut(); };
    icons.appendChild(hide);
    var was = false;
    more.addEventListener('pointerdown', function () { was = icons.classList.contains('open'); }, true);
    more.addEventListener('click', function (e) { if (was) { was = false; e.stopImmediatePropagation(); e.stopPropagation(); shut(); } }, true);
  }
  fixMenu(); setTimeout(fixMenu, 300); setTimeout(fixMenu, 1200);

  /* ---------- burst hearts ---------- */
  function burst(x, y) {
    for (var i = 0; i < 9; i++) {
      var h = el('span', 'o64b', '♥'), a = Math.PI * 2 * i / 9 + Math.random() * .5, d = 50 + Math.random() * 50;
      h.style.left = x + 'px'; h.style.top = y + 'px';
      h.style.setProperty('--dx', Math.cos(a) * d + 'px'); h.style.setProperty('--dy', Math.sin(a) * d - 20 + 'px'); h.style.setProperty('--r', (Math.random() * 60 - 30) + 'deg');
      h.style.fontSize = 14 + Math.random() * 14 + 'px';
      document.body.appendChild(h); setTimeout(function (n) { n.remove(); }.bind(null, h), 950);
    }
    try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) { }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.heart-orb,.o64card,#tn_space');
    if (t) burst(e.clientX, e.clientY);
  }, true);

  /* ---------- 3) couple extras on the home screen ---------- */
  var QS = ['What is your favourite memory of us so far?', 'What small thing do I do that makes you smile?', 'Where would you take me for a surprise trip?', 'What song reminds you of us?', 'What is one thing you want us to try together this month?', 'When did you first realise you liked me?', 'What is your idea of a perfect lazy Sunday with me?', 'What is something I do that you secretly love?', 'If we could live anywhere for a year, where would it be?', 'What is one dream you have that I should know about?', 'What made you laugh the most with me?', 'What is your comfort food and who should cook it?', 'Which of our photos is your favourite and why?', 'What is one thing you are grateful for about us today?', 'What is the sweetest thing anyone has done for you?', 'Which movie should we watch together next?', 'What is your love language, in your own words?', 'What is one thing you want to improve about us?', 'Describe our first date in three words.', 'What do you miss most when we are apart?', 'What tiny ritual should we start as a couple?', 'What is a fear you would like me to help you with?', 'What would our dream home look like?', 'What is a skill you would like us to learn together?', 'What is your favourite nickname for me?', 'What is one thing you are proud of me for?', 'What was the best day we have had together?', 'What do you want us to be doing in five years?', 'How do you like to be comforted on a bad day?', 'What is one thing you have never told me but want to?'];

  var days = function (iso) { var d = new Date(iso + 'T00:00:00'); return isNaN(d) ? -1 : Math.floor((Date.now() - d.getTime()) / 864e5); };
  var MILE = [30, 50, 100, 150, 200, 250, 300, 365, 500, 600, 730, 1000, 1095, 1461, 1826, 2000, 2555, 3000, 3650];

  function buildTogether() {
    var c = $('o64Together'); if (!c) { c = el('div', 'o64card'); c.id = 'o64Together'; c.setAttribute('data-couple', ''); }
    var since = ls('onlyus-since'), n = since ? days(since) : -1;
    var heart = '<svg class="o64h" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    if (n < 0) {
      c.innerHTML = heart + '<small>Our days</small><div class="o64q">Set the day you became a couple and watch the days add up.</div><div class="o64btns"><button type="button" id="o64Set">Set our date</button></div>';
    } else {
      var next = MILE.filter(function (m) { return m > n; })[0] || (Math.ceil((n + 1) / 365) * 365), prev = MILE.filter(function (m) { return m <= n; }).pop() || 0;
      var y = Math.floor(n / 365), mo = Math.floor((n % 365) / 30), d = (n % 365) % 30;
      c.innerHTML = heart + '<small>Together for</small><div class="o64days"><b>' + n + '</b><span>days</span></div><div class="o64sub">' + (y ? y + ' yr ' : '') + mo + ' mo ' + d + ' d · next milestone: day ' + next + ' (' + (next - n) + ' to go)</div><div class="o64bar"><i style="width:0"></i></div><div class="o64btns" style="margin-top:12px"><button type="button" class="alt" id="o64Set">Change date</button></div>';
      var f = c.querySelector('.o64bar i'); setTimeout(function () { f.style.width = Math.max(4, Math.min(100, (n - prev) / (next - prev) * 100)) + '%'; }, 120);
    }
    var st = c.querySelector('#o64Set');
    if (st) st.onclick = function (e) {
      e.stopPropagation();
      var inp = el('input'); inp.type = 'date'; inp.max = new Date().toISOString().slice(0, 10); inp.value = ls('onlyus-since') || '';
      inp.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:50%;top:50%';
      inp.onchange = function () { if (inp.value) { ls('onlyus-since', inp.value); buildTogether(); } inp.remove(); };
      document.body.appendChild(inp);
      try { inp.showPicker ? inp.showPicker() : inp.click(); } catch (x) { inp.click(); }
    };
    return c;
  }

  function buildQuestion() {
    var c = $('o64Question'); if (!c) { c = el('div', 'o64card'); c.id = 'o64Question'; c.setAttribute('data-couple', ''); }
    var i = Math.floor(Date.now() / 864e5) % QS.length;
    c.innerHTML = '<small>Question of the day</small><div class="o64q">' + QS[i] + '</div><div class="o64btns"><button type="button" id="o64Ask">Send to chat</button><button type="button" class="alt" id="o64Copy">Copy</button></div>';
    c.querySelector('#o64Ask').onclick = function () {
      var inp = document.querySelector('#cf textarea,#cf input[type="text"],#cf [contenteditable="true"]'), q = QS[i];
      var ok = false;
      if (inp) { if (inp.isContentEditable) inp.textContent = q; else inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true })); ok = true; }
      try { navigator.clipboard && navigator.clipboard.writeText(q); } catch (e) { }
      try { window.__us && window.__us.toast && window.__us.toast(ok ? 'Open a chat and tap send 💌' : 'Copied. Paste it in your chat 💌'); } catch (e) { }
    };
    c.querySelector('#o64Copy').onclick = function () { try { navigator.clipboard && navigator.clipboard.writeText(QS[i]); window.__us && window.__us.toast && window.__us.toast('Copied'); } catch (e) { } };
    return c;
  }

  function mount() {
    var list = $('vList'); if (!list || $('o64Hearts')) return;
    var layer = el('div'); layer.id = 'o64Hearts'; layer.setAttribute('data-couple', ''); layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 10; i++) {
      var h = el('i', '', '♥'); h.style.left = (Math.random() * 94 + 2) + '%'; h.style.fontSize = (12 + Math.random() * 16) + 'px';
      h.style.animationDuration = (11 + Math.random() * 10) + 's'; h.style.animationDelay = (-Math.random() * 16) + 's'; layer.appendChild(h);
    }
    list.appendChild(layer);
    var anchor = list.querySelector('.couple-profile') || list.querySelector('.welcome-strip');
    if (anchor) { anchor.after(buildQuestion()); anchor.after(buildTogether()); }
  }
  mount();
  /* the day counter refreshes at midnight / when the app comes back */
  document.addEventListener('visibilitychange', function () { if (!document.hidden && $('o64Together')) { buildTogether(); buildQuestion(); } });
})();
