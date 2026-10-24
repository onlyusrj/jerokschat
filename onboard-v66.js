/* OnlyUs onboard-v66.js
   1) Premium intro on first launch (before sign-in) with language picker
   2) After sign-up + name: welcome, age / gender / love start date, short animated tour, then into the app
   3) Home: animated heart next to "OnlyUs", animated "What you can do" feature cards
   4) Our Space: your own title instead of a fixed one (tap the title to change it)             */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var T = function (k) { return window.__i18n ? window.__i18n.t(k) : k; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };
  var U = function () { return window.__us || {}; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var HP = 'M0 8c-10-9-14-14-14-20 0-6 5-9 9-9 3 0 5 2 5 4 0-2 2-4 5-4 4 0 9 3 9 9 0 6-4 11-14 20z';

  /* ---------- animated icons ---------- */
  var ICO = {
    chat: '<svg viewBox="0 0 120 120"><rect x="12" y="20" width="70" height="46" rx="18" fill="#fff" opacity=".95"/><rect x="38" y="52" width="70" height="44" rx="18" fill="#ff6fa8"/><circle class="o66d" cx="60" cy="74" r="4.5" fill="#fff"/><circle class="o66d" style="animation-delay:.2s" cx="73" cy="74" r="4.5" fill="#fff"/><circle class="o66d" style="animation-delay:.4s" cx="86" cy="74" r="4.5" fill="#fff"/></svg>',
    calls: '<svg viewBox="0 0 120 120"><g class="o66shake"><path d="M36 24c-9 4-11 15-5 31 8 21 27 39 48 47 14 5 23 2 25-7L90 82l-10 6c-12-6-22-17-28-29l6-10-14-14z" fill="#fff"/></g><path class="o66ping" d="M78 30a28 28 0 0 1 16 16" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path class="o66ping" style="animation-delay:.4s" d="M76 12a46 46 0 0 1 32 32" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
    games: '<svg viewBox="0 0 120 120"><g class="o66bob"><rect x="26" y="26" width="68" height="68" rx="16" fill="#fff"/><circle cx="48" cy="48" r="6" fill="#7a5cff"/><circle cx="72" cy="48" r="6" fill="#7a5cff"/><circle cx="60" cy="60" r="6" fill="#ff6fa8"/><circle cx="48" cy="72" r="6" fill="#7a5cff"/><circle cx="72" cy="72" r="6" fill="#7a5cff"/></g></svg>',
    space: '<svg viewBox="0 0 120 120"><g transform="translate(60 62) scale(3.4)"><path class="o66pulse" d="' + HP + '" fill="#ff6fa8"/></g><path class="o66d" d="M96 20l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/><path class="o66d" style="animation-delay:.5s" d="M22 78l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff"/></svg>',
    status: '<svg viewBox="0 0 120 120"><circle class="o66ring" cx="60" cy="60" r="38" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="40 20"/><circle cx="60" cy="52" r="12" fill="#fff"/><path d="M36 88c4-14 14-18 24-18s20 4 24 18z" fill="#fff"/></svg>',
    themes: '<svg viewBox="0 0 120 120"><circle class="o66pulse" cx="38" cy="50" r="18" fill="#ff6fa8"/><circle class="o66pulse" style="animation-delay:.3s" cx="82" cy="50" r="18" fill="#ffd23f"/><circle class="o66pulse" style="animation-delay:.6s" cx="60" cy="84" r="18" fill="#4facfe"/></svg>'
  };
  var FEATS = [['chat', 's1'], ['calls', 's2'], ['games', 's3'], ['space', 's4'], ['status', 's5'], ['themes', 's6']];
  var HEART = '<svg viewBox="0 0 120 120"><circle class="o66halo" cx="60" cy="60" r="44" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><g transform="translate(60 64) scale(3.6)"><path class="o66pulse" d="' + HP + '" fill="#ff5c8d"/></g><ellipse cx="46" cy="44" rx="7" ry="4" fill="#fff" opacity=".6" transform="rotate(-35 46 44)"/></svg>';

  var css = el('style');
  css.textContent = [
    '#o66Intro,#o66Ob{position:fixed;inset:0;z-index:2147481500;display:flex;align-items:center;justify-content:center;color:#fff;font-family:system-ui,-apple-system,sans-serif;background:radial-gradient(120% 90% at 20% 0%,#7a4bd8 0%,#3b2178 55%,#1d1040 100%);overflow:hidden;animation:o66fade .5s}',
    '#o66Intro::before,#o66Ob::before{content:"";position:absolute;inset:-20%;background:radial-gradient(circle at 80% 90%,rgba(255,111,168,.35),transparent 45%),radial-gradient(circle at 10% 70%,rgba(79,172,254,.22),transparent 40%);animation:o66drift 12s ease-in-out infinite alternate}',
    '.o66c{position:relative;width:100%;max-width:420px;padding:28px 26px calc(28px + env(safe-area-inset-bottom,0px));text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}',
    '.o66logo{width:132px;height:132px}.o66logo svg,.o66ico svg{width:100%;height:100%;display:block;overflow:visible}',
    '#o66Intro h1{margin:4px 0 0;font-size:44px;letter-spacing:-1.2px;font-weight:800;background:linear-gradient(90deg,#fff,#ffd1e6,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}',
    '.o66c p{margin:0;font-size:16px;line-height:1.45;opacity:.9}.o66c h2{margin:0;font-size:26px;font-weight:800;letter-spacing:-.4px}',
    '.o66btn{all:unset;box-sizing:border-box;cursor:pointer;width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,#ff6fa8,#ff8f6b);color:#fff;font-size:17px;font-weight:800;text-align:center;box-shadow:0 12px 30px rgba(255,111,168,.4);margin-top:10px}.o66btn:active{transform:scale(.97)}.o66btn:disabled{opacity:.45;box-shadow:none}',
    '.o66ghost{all:unset;cursor:pointer;padding:10px 16px;border-radius:14px;background:rgba(255,255,255,.14);font-size:14px;font-weight:600}',
    '.o66link{all:unset;cursor:pointer;font-size:14px;opacity:.8;padding:6px}',
    '.o66glass{width:100%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-radius:22px;padding:16px;text-align:start}',
    '.o66glass label{display:block;font-size:13px;opacity:.85;margin:0 0 8px;font-weight:600}.o66glass input[type=number],.o66glass input[type=date]{width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:13px 14px;font-size:17px;background:rgba(255,255,255,.95);color:#2b1a5e}',
    '.o66chips{display:flex;flex-wrap:wrap;gap:8px}.o66chips button{all:unset;cursor:pointer;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.16);font-size:14px;font-weight:600}.o66chips button.on{background:#fff;color:#4a2a9a}',
    '.o66err{color:#ffd1e6;font-size:13px;min-height:18px;margin-top:6px}',
    '.o66ico{width:150px;height:150px;border-radius:38px;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.25);padding:20px;box-sizing:border-box;animation:o66pop .5s cubic-bezier(.2,1.3,.4,1)}',
    '.o66dots{display:flex;gap:7px;margin-top:6px}.o66dots i{width:7px;height:7px;border-radius:9px;background:rgba(255,255,255,.35);transition:all .3s}.o66dots i.on{width:22px;background:#fff}',
    '.o66step{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;animation:o66in .4s ease both}',
    '@keyframes o66fade{from{opacity:0}}@keyframes o66in{from{opacity:0;transform:translateY(16px)}}@keyframes o66pop{from{opacity:0;transform:scale(.7)}}@keyframes o66drift{to{transform:translate(4%,-3%) scale(1.08)}}',
    '.o66d{animation:o66dd 1.2s ease-in-out infinite}@keyframes o66dd{50%{opacity:.25}}',
    '.o66shake{transform-box:fill-box;transform-origin:center;animation:o66sh 1.6s ease-in-out infinite}@keyframes o66sh{0%,60%,100%{transform:rotate(0)}10%,30%,50%{transform:rotate(-12deg)}20%,40%{transform:rotate(12deg)}}',
    '.o66ping{animation:o66pg 1.6s ease-out infinite}@keyframes o66pg{from{opacity:1}to{opacity:0}}',
    '.o66bob{transform-box:fill-box;transform-origin:center;animation:o66bb 1.8s ease-in-out infinite}@keyframes o66bb{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-10px) rotate(8deg)}}',
    '.o66pulse{transform-box:fill-box;transform-origin:center;animation:o66pl 1.4s ease-in-out infinite}@keyframes o66pl{50%{transform:scale(1.18)}}',
    '.o66ring{transform-box:fill-box;transform-origin:center;animation:o66sp 3.5s linear infinite}@keyframes o66sp{to{transform:rotate(360deg)}}',
    '.o66halo{transform-box:fill-box;transform-origin:center;animation:o66hl 2s ease-out infinite}@keyframes o66hl{from{transform:scale(.8);opacity:.7}to{transform:scale(1.35);opacity:0}}',
    '.o66fl{position:absolute;bottom:-30px;color:#ff8fbf;opacity:0;animation:o66up linear infinite;pointer-events:none}@keyframes o66up{0%{transform:translateY(0);opacity:0}15%{opacity:.5}100%{transform:translateY(-110vh) translateX(20px);opacity:0}}',
    /* header heart */
    'html #vList .lb-title::after{content:"";display:inline-block;width:.85em;height:.85em;margin-inline-start:9px;vertical-align:-.08em;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-20 -20 40 40\'%3E%3Cpath d=\'M0 14C-14 3-17-4-17-10-17-17-11-20-6-20-3-20-1-18 0-16 1-18 3-20 6-20 11-20 17-17 17-10 17-4 14 3 0 14z\' fill=\'%23ff5c8d\'/%3E%3Cellipse cx=\'-8\' cy=\'-11\' rx=\'4\' ry=\'2.4\' fill=\'%23fff\' opacity=\'.65\' transform=\'rotate(-35 -8 -11)\'/%3E%3C/svg%3E") center/contain no-repeat;animation:o66hb 1.3s ease-in-out infinite;filter:drop-shadow(0 2px 6px rgba(255,92,141,.55))}',
    '@keyframes o66hb{0%,100%{transform:scale(1)}15%{transform:scale(1.28)}30%{transform:scale(1.02)}45%{transform:scale(1.2)}}',
    /* home feature cards */
    '#o66Feat{margin:6px 0 10px}.o66fh{margin:18px 18px 8px;font-size:19px;font-weight:800;color:var(--ink)}',
    '.o66f{display:flex;align-items:center;gap:14px;margin:10px 14px;padding:14px;border-radius:22px;background:var(--panel);border:1px solid var(--line);box-shadow:0 8px 22px rgba(80,40,150,.1);animation:o66in .5s ease both;animation-delay:calc(var(--i) * 90ms)}',
    '.o66f .o66fi{flex:none;width:72px;height:72px;border-radius:20px;padding:11px;box-sizing:border-box}.o66f .o66fi svg{width:100%;height:100%;display:block;overflow:visible}',
    '.o66f b{display:block;font-size:16px;color:var(--ink)}.o66f span{display:block;margin-top:3px;font-size:13px;line-height:1.35;color:var(--dim)}',
    '.o66f:nth-child(1) .o66fi{background:linear-gradient(135deg,#a18cd1,#7a5cff)}.o66f:nth-child(2) .o66fi{background:linear-gradient(135deg,#43e97b,#1f9e8a)}.o66f:nth-child(3) .o66fi{background:linear-gradient(135deg,#ffb347,#ff5e62)}.o66f:nth-child(4) .o66fi{background:linear-gradient(135deg,#ff9ec4,#e8436a)}.o66f:nth-child(5) .o66fi{background:linear-gradient(135deg,#56ccf2,#2f80ed)}.o66f:nth-child(6) .o66fi{background:linear-gradient(135deg,#f093fb,#f5576c)}',
    /* Our Space */
    '#hubTitle{cursor:pointer}#hubTitle::after{content:" \\270E";font-size:.7em;opacity:.55}',
    '#coupleHub.on .hub-tabs button,#coupleHub.on .hub-content>*{animation:o66in .45s ease both}#coupleHub.on .hub-tabs button:nth-child(2){animation-delay:.05s}#coupleHub.on .hub-tabs button:nth-child(3){animation-delay:.1s}#coupleHub.on .hub-tabs button:nth-child(4){animation-delay:.15s}#coupleHub.on .hub-tabs button:nth-child(5){animation-delay:.2s}',
    '#coupleHub.on .hub-head>div:first-child{animation:o66hb 1.6s ease-in-out infinite;display:inline-block}',
    '.o66ti{width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:13px 14px;font-size:17px;background:rgba(255,255,255,.95);color:#2b1a5e}',
    '@media (prefers-reduced-motion:reduce){#o66Intro *,#o66Ob *,.o66f,.o66f *,html #vList .lb-title::after,#coupleHub *{animation:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- saved answers ---------- */
  var uid = function () { try { return U().uid && U().uid(); } catch (e) { return null; } };
  var getOb = function () { try { return JSON.parse(ls('onlyus-ob-' + uid()) || 'null'); } catch (e) { return null; } };
  function saveOb(patch) {
    var u = uid(); if (!u) return;
    var o = getOb() || {}; Object.keys(patch).forEach(function (k) { o[k] = patch[k]; });
    ls('onlyus-ob-' + u, JSON.stringify(o));
    if (o.since) ls('onlyus-since', o.since);
    try { if (window.firebase) { var c = { age: o.age, gender: o.gender, since: o.since, title: o.title, lang: o.lang }; Object.keys(c).forEach(function (k) { if (c[k] == null || c[k] === '') delete c[k]; }); window.firebase.firestore().doc('users/' + u).set({ ob: c }, { merge: true }).catch(function () { }); } } catch (e) { }
  }

  /* ---------- floating hearts backdrop ---------- */
  function floaters(root) { for (var i = 0; i < 9; i++) { var h = el('i', 'o66fl', '♥'); h.style.left = (Math.random() * 94 + 2) + '%'; h.style.fontSize = (12 + Math.random() * 18) + 'px'; h.style.animationDuration = (9 + Math.random() * 9) + 's'; h.style.animationDelay = (-Math.random() * 12) + 's'; root.appendChild(h); } }

  /* ---------- 1) intro ---------- */
  function showIntro() {
    if ($('o66Intro') || ls('onlyus-intro')) return;
    var o = el('div'); o.id = 'o66Intro';
    o.innerHTML = '<div class="o66c"><div class="o66logo">' + HEART + '</div><h1>OnlyUs</h1><p data-i18n="tag"></p><button class="o66btn" id="o66Go" type="button" data-i18n="start"></button><button class="o66ghost" id="o66Lg" type="button"><span data-i18n="lang"></span>: <b id="o66L2"></b></button></div>';
    floaters(o); document.body.appendChild(o);
    var lbl = function () { $('o66L2').textContent = window.__i18n.name(window.__i18n.get()); window.__i18n.apply(); };
    lbl(); window.addEventListener('onlyus-lang', lbl);
    $('o66Lg').onclick = function () { window.__i18n.pick(lbl); };
    $('o66Go').onclick = function () { ls('onlyus-intro', '1'); window.removeEventListener('onlyus-lang', lbl); o.style.transition = 'opacity .4s'; o.style.opacity = '0'; setTimeout(function () { o.remove(); }, 420); };
  }

  /* ---------- 2) onboarding ---------- */
  var ob = { age: 0, gender: '', since: '' };
  function start() {
    if ($('o66Ob')) return;
    var o = el('div'); o.id = 'o66Ob'; o.innerHTML = '<div class="o66c" id="o66Body"></div>'; floaters(o); document.body.appendChild(o);
    var body = $('o66Body'), step = 0, total = 2 + FEATS.length;
    var dots = function () { var h = '<div class="o66dots">'; for (var i = 0; i < total; i++) h += '<i' + (i === step ? ' class="on"' : '') + '></i>'; return h + '</div>'; };
    var name = (U().me && U().me() && U().me().name) || '';
    function render() {
      var h = '';
      if (step === 0) h = '<div class="o66step"><div class="o66logo">' + HEART + '</div><h2>' + T('welcome') + (name ? ', ' + esc(name) : '') + '</h2><p>' + T('setup') + '</p><button class="o66btn" id="o66N" type="button">' + T('next') + '</button></div>';
      else if (step === 1) h = '<div class="o66step"><div class="o66glass"><label>' + T('age') + '</label><input id="o66Age" type="number" inputmode="numeric" min="12" max="120" value="' + (ob.age || '') + '"><div class="o66err" id="o66Err"></div>' +
        '<label style="margin-top:8px">' + T('gender') + '</label><div class="o66chips" id="o66G">' + [['m', 'g_m'], ['f', 'g_f'], ['n', 'g_n'], ['p', 'g_p']].map(function (g) { return '<button type="button" data-g="' + g[0] + '"' + (ob.gender === g[0] ? ' class="on"' : '') + '>' + T(g[1]) + '</button>'; }).join('') + '</div>' +
        '<label style="margin-top:16px">' + T('since') + '</label><input id="o66Since" type="date" value="' + esc(ob.since) + '"></div><button class="o66btn" id="o66N" type="button" disabled>' + T('cont') + '</button><button class="o66link" id="o66Later" type="button">' + T('later') + '</button></div>';
      else { var f = FEATS[step - 2]; h = '<div class="o66step"><div class="o66ico">' + ICO[f[0]] + '</div><h2>' + T(f[1] + 't') + '</h2><p>' + T(f[1] + 'd') + '</p><button class="o66btn" id="o66N" type="button">' + T(step === total - 1 ? 'cont' : 'next') + '</button>' + (step < total - 1 ? '<button class="o66link" id="o66Skip" type="button">' + T('skip') + '</button>' : '') + '</div>'; }
      body.innerHTML = h + dots(); wire();
    }
    function wire() {
      var n = $('o66N'); if (n) n.onclick = function () { if (step === total - 1) return finish(); step++; render(); };
      var sk = $('o66Skip'); if (sk) sk.onclick = finish;
      if (step === 1) {
        var age = $('o66Age'), err = $('o66Err'), go = $('o66N');
        var check = function () { var a = parseInt(age.value, 10); ob.age = a || 0; var bad = a > 0 && a < 12; err.textContent = bad ? T('minage') : ''; go.disabled = !(a >= 12 && a <= 120); };
        age.oninput = check; check();
        $('o66G').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; ob.gender = b.getAttribute('data-g'); this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
        $('o66Since').onchange = function () { ob.since = this.value; };
        $('o66Since').max = new Date().toISOString().slice(0, 10);
        $('o66Later').onclick = function () { ob.since = ''; $('o66Since').value = ''; if (!go.disabled) go.click(); };
        go.addEventListener('click', function () { saveOb({ age: ob.age, gender: ob.gender, since: ob.since, lang: window.__i18n.get() }); });
      }
    }
    function finish() {
      saveOb({ done: 1, lang: window.__i18n.get() }); ls('onlyus-ob-done-' + uid(), '1');
      o.style.transition = 'opacity .4s'; o.style.opacity = '0'; setTimeout(function () { o.remove(); }, 420);
      try { window.__o64 && window.__o64.refresh(); } catch (e) { } setHub();
    }
    window.addEventListener('onlyus-lang', function () { if ($('o66Ob')) render(); });
    render();
  }
  window.__o66 = { start: start, intro: showIntro };

  /* ---------- 4) Our Space title ---------- */
  function defaultTitle() {
    var me = (U().me && U().me() && U().me().name) || '', her = (U().cname && U().cname()) || '';
    return me && her ? me + ' \uD83D\uDC95 ' + her : T('s4t');
  }
  function setHub() {
    var b = $('hubTitle'); if (!b) return; var o = getOb() || {};
    var v = (o.title && o.title.trim()) || defaultTitle(); if (b.firstChild && b.firstChild.nodeValue !== v) b.firstChild.nodeValue = v; else if (!b.firstChild) b.textContent = v;
    var s = $('hubSub'); if (s) s.textContent = T('hubsub');
  }
  function editTitle() {
    var o = el('div'); o.id = 'o66Ob'; o.style.zIndex = 2147482000;
    o.innerHTML = '<div class="o66c"><div class="o66glass"><label>' + T('titleph') + '</label><input class="o66ti" id="o66T" maxlength="40" value="' + esc((getOb() || {}).title || '') + '" placeholder="' + esc(defaultTitle()) + '"></div><button class="o66btn" id="o66S" type="button">' + T('save') + '</button></div>';
    document.body.appendChild(o); $('o66T').focus();
    $('o66S').onclick = function () { saveOb({ title: $('o66T').value.trim().slice(0, 40) }); o.remove(); setHub(); };
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#hubTitle'); if (b) editTitle(); });
  var hub = $('coupleHub'); if (hub) new MutationObserver(function () { if (hub.classList.contains('on')) setHub(); }).observe(hub, { attributes: true, attributeFilter: ['class'] });

  /* ---------- 3) home feature cards ---------- */
  function feat() {
    var list = $('vList'); if (!list) return;
    var w = $('o66Feat'); if (!w) { w = el('div'); w.id = 'o66Feat'; var a = $('o64Scenes'); if (a) a.after(w); else list.appendChild(w); }
    w.innerHTML = '<div class="o66fh">' + T('show') + '</div>' + FEATS.map(function (f, i) { return '<div class="o66f" style="--i:' + i + '"><div class="o66fi">' + ICO[f[0]] + '</div><div><b>' + T(f[1] + 't') + '</b><span>' + T(f[1] + 'd') + '</span></div></div>'; }).join('');
  }
  feat(); window.addEventListener('onlyus-lang', function () { feat(); setHub(); });

  /* ---------- when to show things ---------- */
  var tries = 0, introT = setInterval(function () {
    tries++; var a = $('vAuth');
    if (a && a.classList.contains('on') && !ls('onlyus-intro')) { showIntro(); clearInterval(introT); }
    else if (tries > 240 || ls("onlyus-intro")) clearInterval(introT);
  }, 500);
  setInterval(function () {
    var l = $('vList'), u = uid();
    if (!l || !l.classList.contains('on') || !u || $('o66Ob')) return;
    if (ls('onlyus-ob-done-' + u) || (getOb() || {}).done) return;
    var me = U().me && U().me(); if (!me || !me.name) return;
    start();
  }, 1200);
  setHub();
})();
