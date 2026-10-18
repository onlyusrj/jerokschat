/* liquid-glass.js — OnlyUs v49
   1) iPhone-26 "liquid glass" buttons / bars / panels, with the chat messages blurred behind them
   2) Settings > Chats > Liquid glass: on/off, Light<->Dark shade, blur strength (saved on this phone)
   3) Slim, full-width top bar on phones (Rok💕Jeru header)
   4) A single emoji (or up to 3) sent alone is shown BIG, with an animation
   5) Search bar inside the emoji panel
*/
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var R = document.documentElement;
  var KEY = 'onlyus-lg';
  var DEF = { on: 1, shade: 30, blur: 55 };

  function load() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load();

  /* ------------------------------------------------------------------ CSS */
  var GLASS_CIRCLE = 'html.lg .bar .ic, html.lg .hub-close, html.lg .cal-head button';
  var GLASS_CHIP = 'html.lg .btn.l, html.lg .hub-btn.alt, html.lg .hub-tabs button:not(.on), html.lg .game-tabs button:not(.on), html.lg .tool-grid button, html.lg .media-tabs button:not(.on), html.lg .tool-foot button, html.lg .seg button:not(.on), html.lg .pfbtn, html.lg .status-actions button:not(.primary), html.lg .period-actions button:not(.primary), html.lg .row, html.lg .spm, html.lg #emT button:not(.on), html.lg #stkT button:not(.on), html.lg .status-bottom button:not(.on), html.lg .period-bottom button:not(.on)';
  var GLASS_ACCENT = 'html.lg .btn:not(.l), html.lg .hub-btn:not(.alt), html.lg .status-actions .primary, html.lg .period-actions .primary, html.lg .seg button.on, html.lg .hub-tabs button.on, html.lg .game-tabs button.on, html.lg .media-tabs button.on, html.lg #emT button.on, html.lg #stkT button.on, html.lg #cf .ic.g, html.lg .status-bottom button.on, html.lg .period-bottom button.on';
  var GLASS_PANEL = 'html.lg #emo, html.lg #stkP, html.lg #attMenu, html.lg #sheet>div, html.lg .card, html.lg #toast, html.lg #inboxBanner, html.lg #rep, html.lg #rbar';

  var CSS = [
    /* ---- variables (filled in by JS) ---- */
    'html{--lg-bg:rgba(255,255,255,.30);--lg-bd:rgba(255,255,255,.55);--lg-ink:#2a1d44;--lg-blur:22px;--lg-sheen:.40;--lg-panel:rgba(255,255,255,.72);--lg-bar:rgba(60,38,100,.60);--lg-sh:rgba(30,12,60,.20)}',

    /* ---- shared glass look ---- */
    GLASS_CIRCLE + ',' + GLASS_CHIP + '{box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,var(--lg-sheen)) 0%,rgba(255,255,255,.07) 42%,rgba(255,255,255,0) 62%),var(--lg-bg)!important;border:1px solid var(--lg-bd)!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);box-shadow:inset 0 1px 1px rgba(255,255,255,.55),inset 0 -1px 2px rgba(255,255,255,.14),inset 1px 0 1px rgba(255,255,255,.18),0 8px 22px var(--lg-sh)!important;color:var(--lg-ink);transition:transform .22s cubic-bezier(.3,1.6,.5,1),background .2s,box-shadow .2s}',
    /* circle buttons inside the (always dark-purple) bars keep white icons */
    'html.lg .bar .ic,html.lg .hub-close{color:#fff;--lg-bg:rgba(255,255,255,.20);--lg-bd:rgba(255,255,255,.38)}',
    'html.lg .bar .ic.add-toggle{color:#65409a;--lg-bg:rgba(255,255,255,.88)}',
    GLASS_ACCENT + '{box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,.08) 45%,rgba(255,255,255,0) 65%),color-mix(in srgb,var(--acc) 82%,transparent)!important;border:1px solid rgba(255,255,255,.45)!important;color:#fff!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);box-shadow:inset 0 1px 1px rgba(255,255,255,.6),inset 0 -1px 2px rgba(0,0,0,.12),0 8px 22px color-mix(in srgb,var(--acc) 45%,transparent)!important;transition:transform .22s cubic-bezier(.3,1.6,.5,1)}',
    'html.lg .ic:active,html.lg .btn:active,html.lg .hub-btn:active,html.lg .tool-grid button:active,html.lg .seg button:active,html.lg .row:active,html.lg .pfbtn:active{transform:scale(.92)}',

    /* ---- panels (cards, emoji panel, menus) ---- */
    GLASS_PANEL + '{background:var(--lg-panel)!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(170%);backdrop-filter:blur(var(--lg-blur)) saturate(170%);border:1px solid var(--lg-bd)!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.45),0 14px 40px var(--lg-sh)!important}',
    'html.lg .ov{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}',
    'html.lg .status-bottom,html.lg .period-bottom{background:var(--lg-panel)!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(170%);backdrop-filter:blur(var(--lg-blur)) saturate(170%)}',

    /* ---- top bars: slim, full width, glass ---- */
    'html.lg .bar{background:var(--lg-bar)!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);border-bottom:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 6px 18px var(--lg-sh);margin:0;border-radius:0 0 20px 20px}',
    'html.lg #vList,html.lg #vChat{padding-top:0}',
    'html.lg #vList>.bar,html.lg #vChat>.bar{padding-top:calc(var(--sa) + 6px)}',

    /* ---- chat: messages scroll UNDER the glass bar and the glass composer ---- */
    'html.lg #vChat>.bar{position:absolute;top:0;left:0;right:0;z-index:6}',
    'html.lg #vChat #ms{position:absolute;inset:0;padding:calc(var(--lg-top,64px) + 10px) 10px calc(var(--lg-dock,72px) + 12px)}',
    'html.lg #lgDock{position:absolute;left:0;right:0;bottom:0;z-index:6;display:flex;flex-direction:column;pointer-events:none}',
    'html.lg #lgDock>*{pointer-events:auto}',
    'html.lg #cf{background:transparent!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    'html.lg #cf .pill{background:linear-gradient(180deg,rgba(255,255,255,var(--lg-sheen)) 0%,rgba(255,255,255,.06) 50%),var(--lg-bg)!important;-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);border:1px solid var(--lg-bd)!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 8px 22px var(--lg-sh)!important}',
    'html.lg #cf .pill textarea,html.lg #cf .pill .ic{color:var(--lg-ink)!important}',
    'html.lg #cf .pill textarea::placeholder{color:var(--lg-ink);opacity:.55}',
    'html.lg #cf .ic.g{width:46px;height:46px;border-radius:50%}',
    'html.lg #rbar{margin:0 10px calc(8px + var(--sb));border-radius:26px;padding:8px 14px}',

    /* ---- phone sizing: slim header ---- */
    '@media(max-width:600px){',
    ' html.lg .bar{min-height:46px;padding:5px 8px;gap:5px}',
    ' html.lg #vList>.bar,html.lg #vChat>.bar{padding-top:calc(var(--sa) + 5px)}',
    ' html.lg .bar .ic{width:34px;height:34px;font-size:16px}',
    ' html.lg .bar .ic.add-toggle{font-size:21px}',
    ' html.lg .bar b{font-size:17px}',
    ' html.lg #vList .brandmark{width:32px;height:32px;border-radius:11px}',
    ' html.lg #vList .brandmark img{width:100%;height:100%;border-radius:inherit;object-fit:cover}',
    ' html.lg #vList .brandcopy small{display:none}',
    ' html.lg #vList .brandcopy b{font-size:16px;white-space:nowrap}',
    ' html.lg #vList>.bar{flex-wrap:nowrap;overflow:hidden}',
    ' html.lg #vList .listbar .sound-toggle{width:34px;height:34px;font-size:18px}',
    ' html.lg #vChat .av{width:34px;height:34px;font-size:15px}',
    ' html.lg #vChat #cn{font-size:16px!important}',
    ' html.lg #vChat #cs{font-size:11px!important}',
    '}',
    '@media(max-width:420px){',
    ' html.lg .bar{gap:4px;padding-left:7px;padding-right:7px}',
    ' html.lg #vList .bar .ic,html.lg #vList .listbar .sound-toggle{width:31px;height:31px;font-size:15px}',
    ' html.lg #vList .bar .ic.add-toggle{font-size:20px}',
    ' html.lg #vList .brandmark{width:30px;height:30px}',
    ' html.lg #vList .brandcopy{flex:1 1 auto;min-width:0}',
    ' html.lg #vList .brandcopy b{font-size:15px;overflow:hidden;text-overflow:ellipsis}',
    ' html.lg #vList>.bar .sp{display:none}',
    '}',

    /* ---- emoji search bar ---- */
    '#emo{grid-template-rows:auto auto 1fr!important}',
    '#emS{display:flex;align-items:center;gap:8px;margin:8px 8px 4px;padding:0 12px;height:38px;border-radius:19px;background:var(--field,rgba(120,120,140,.14));border:1px solid var(--glass-border,var(--line))}',
    '#emS svg{width:17px;height:17px;flex:none;opacity:.6;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
    '#emS input{all:unset;flex:1;min-width:0;font-size:15px;color:var(--ink)}',
    '#emS input::placeholder{color:var(--dim)}',
    '#emS input::-webkit-search-cancel-button,#emS input::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}',
    '#emS button{all:unset;cursor:pointer;display:none;width:20px;height:20px;border-radius:50%;background:var(--dim);color:var(--panel,#fff);text-align:center;font-size:13px;line-height:20px}',
    '#emS.has button{display:block}',
    '#emNone{grid-column:1/-1;text-align:center;padding:26px 10px;color:var(--dim);font-size:14px}',

    /* ---- big emoji messages ---- */
    '.m.bigemo{background:transparent!important;border-color:transparent!important;box-shadow:none!important;padding:2px 8px 0!important;max-width:none}',
    '.m.bigemo .mt{float:none;margin:0;justify-content:flex-end;font-size:10px;opacity:.75}',
    '.m.bigemo.th .mt{justify-content:flex-start}',
    '.m.bigemo .bge{display:block;line-height:1.08;text-align:center;cursor:pointer;-webkit-user-select:none;user-select:none;transform-origin:50% 70%;will-change:transform}',
    '.m.bigemo.n1 .bge{font-size:92px}.m.bigemo.n2 .bge{font-size:62px}.m.bigemo.n3 .bge{font-size:48px}',
    '.m.bigemo.a-pop .bge{animation:bgPop .85s cubic-bezier(.2,1.4,.4,1) both}',
    '.m.bigemo.a-beat .bge{animation:bgBeat 1.9s ease-in-out both}',
    '.m.bigemo.a-shake .bge{animation:bgShake 1.1s ease-in-out both}',
    '.m.bigemo.a-fire .bge{animation:bgFire 1.4s ease-in-out both}',
    '.m.bigemo.a-spin .bge{animation:bgSpin 1.1s cubic-bezier(.3,1.3,.5,1) both}',
    '@keyframes bgPop{0%{transform:scale(.1) rotate(-18deg);opacity:0}45%{transform:scale(1.45) rotate(8deg);opacity:1}65%{transform:scale(.88) rotate(-4deg)}82%{transform:scale(1.08) rotate(2deg)}100%{transform:scale(1) rotate(0)}}',
    '@keyframes bgBeat{0%{transform:scale(.1);opacity:0}25%{transform:scale(1.4);opacity:1}38%{transform:scale(1)}52%{transform:scale(1.28)}66%{transform:scale(1)}80%{transform:scale(1.18)}100%{transform:scale(1)}}',
    '@keyframes bgShake{0%{transform:scale(.1) rotate(0);opacity:0}25%{transform:scale(1.35) rotate(0);opacity:1}35%{transform:scale(1.2) rotate(-14deg)}47%{transform:scale(1.2) rotate(14deg)}59%{transform:scale(1.15) rotate(-10deg)}71%{transform:scale(1.1) rotate(10deg)}100%{transform:scale(1) rotate(0)}}',
    '@keyframes bgFire{0%{transform:translateY(30px) scale(.2);opacity:0}30%{transform:translateY(-10px) scale(1.4);opacity:1}45%{transform:scale(1.1) skewX(-6deg)}60%{transform:scale(1.3) skewX(6deg)}80%{transform:scale(1.1) skewX(-3deg)}100%{transform:scale(1)}}',
    '@keyframes bgSpin{0%{transform:scale(.1) rotate(-360deg);opacity:0}60%{transform:scale(1.35) rotate(15deg);opacity:1}100%{transform:scale(1) rotate(0)}}',
    '.bgp{position:absolute;left:50%;top:48%;font-size:20px;pointer-events:none;z-index:2;animation:bgPart 1.05s ease-out forwards}',
    '@keyframes bgPart{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}15%{opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1) rotate(var(--rot));opacity:0}}',
    '@media(prefers-reduced-motion:reduce){.m.bigemo .bge,.bgp{animation:none!important}.bgp{display:none}}',

    /* ---- settings: glass section ---- */
    '#lgPrev{position:relative;height:104px;border-radius:20px;overflow:hidden;margin:4px 0 12px;background:radial-gradient(circle at 18% 30%,#ff7ac6 0 22%,transparent 23%),radial-gradient(circle at 78% 70%,#5ec8ff 0 24%,transparent 25%),radial-gradient(circle at 55% 25%,#ffd36a 0 16%,transparent 17%),linear-gradient(135deg,#7b4bd8,#e0508a);display:flex;align-items:center;justify-content:center;gap:12px}',
    '#lgPrev .pc{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:21px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,var(--lg-sheen)) 0%,rgba(255,255,255,.07) 42%,rgba(255,255,255,0) 62%),var(--lg-bg);border:1px solid var(--lg-bd);-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 8px 22px var(--lg-sh);color:var(--lg-ink)}',
    '#lgPrev .pp{height:48px;padding:0 20px;border-radius:24px;display:flex;align-items:center;font-size:14px;font-weight:600;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,var(--lg-sheen)) 0%,rgba(255,255,255,.07) 42%,rgba(255,255,255,0) 62%),var(--lg-bg);border:1px solid var(--lg-bd);-webkit-backdrop-filter:blur(var(--lg-blur)) saturate(180%);backdrop-filter:blur(var(--lg-blur)) saturate(180%);box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 8px 22px var(--lg-sh);color:var(--lg-ink)}',
    '.lgsl{padding:6px 4px 10px}.lgsl label{display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;color:var(--ink)}.lgsl label small{color:var(--dim);font-size:12px}',
    '.lgsl input[type=range]{width:100%;accent-color:var(--acc);height:28px;margin:0}'
  ].join('\n');

  var st = document.createElement('style');
  st.id = 'lgCss';
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ------------------------------------------------------- apply settings */
  function isDarkTheme() {
    var t = R.dataset.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  var lerp = function (a, b, t) { return Math.round(a + (b - a) * t); };

  function apply() {
    R.classList.toggle('lg', !!S.on);
    var sh = Math.max(0, Math.min(100, +S.shade)) / 100;
    var bl = Math.max(0, Math.min(100, +S.blur)) / 100;
    var dark = isDarkTheme();

    /* control tint: white -> deep purple-black as shade goes up */
    var r = lerp(255, 22, sh), g = lerp(255, 12, sh), b = lerp(255, 44, sh);
    var a = (0.20 + 0.34 * sh).toFixed(3);
    var tintL = 1 - 0.97 * sh;                       // 1 = white, ~0 = black
    var pageL = dark ? 0.07 : 0.93;
    var effL = (1 - +a) * pageL + (+a) * tintL;      // rough brightness behind the icon
    var ink = effL < 0.5 ? '#ffffff' : '#2a1d44';

    var s = R.style;
    s.setProperty('--lg-bg', 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')');
    s.setProperty('--lg-ink', ink);
    s.setProperty('--lg-bd', 'rgba(255,255,255,' + (0.55 - 0.27 * sh).toFixed(2) + ')');
    s.setProperty('--lg-sheen', (0.42 - 0.22 * sh).toFixed(2));
    s.setProperty('--lg-blur', Math.round(6 + 34 * bl) + 'px');
    s.setProperty('--lg-sh', 'rgba(20,8,40,' + (0.14 + 0.16 * sh).toFixed(2) + ')');
    /* bars stay purple (white text); shade only changes how see-through they are */
    s.setProperty('--lg-bar', 'linear-gradient(115deg,rgba(48,32,79,' + (0.45 + 0.45 * sh).toFixed(2) + '),rgba(107,62,158,' + (0.40 + 0.45 * sh).toFixed(2) + '))');
    /* big panels follow the theme (so long text stays readable) */
    var pa = (0.50 + 0.38 * sh).toFixed(2);
    s.setProperty('--lg-panel', dark ? 'rgba(34,25,60,' + pa + ')' : 'rgba(255,255,255,' + pa + ')');

    var el = $('lgSt'); if (el) el.textContent = S.on ? 'On' : 'Off';
    var sl = $('lgShade'); if (sl && +sl.value !== +S.shade) sl.value = S.shade;
    var bs = $('lgBlur'); if (bs && +bs.value !== +S.blur) bs.value = S.blur;
    var pv = $('lgPrev'); if (pv) pv.style.opacity = S.on ? '1' : '.45';
    measure();
  }
  new MutationObserver(apply).observe(R, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply); } catch (e) {} }

  /* ------------------------------- chat layout: dock + overlay measuring */
  var dock = null;
  function buildDock() {
    var vc = $('vChat'), ms = $('ms');
    if (!vc || !ms) return;
    if (!dock) { dock = document.createElement('div'); dock.id = 'lgDock'; vc.appendChild(dock); }
    var kids = Array.prototype.slice.call(vc.children);
    var after = false;
    kids.forEach(function (n) {
      if (n === ms) { after = true; return; }
      if (!after || ['rep', 'emo', 'stkP', 'rbar', 'cf'].indexOf(n.id) < 0) return;
      dock.appendChild(n);   /* #rep, #emo, #stkP, #rbar, #cf keep their order */
    });
    /* #attMenu is positioned against #vChat; keep it there, above the dock */
    var am = $('attMenu'); if (am && am.parentNode !== vc) vc.appendChild(am);
  }
  function measure() {
    var vc = $('vChat'), ms = $('ms'), bar = vc && vc.querySelector(':scope > .bar');
    if (!vc || !ms || !R.classList.contains('lg')) return;
    var top = bar ? bar.offsetHeight : 64, d = dock ? dock.offsetHeight : 72;
    if (!top || !d) return;                          /* chat view hidden right now */
    if (vc.__t === top && vc.__d === d) return;
    var wasBottom = ms.scrollHeight - ms.scrollTop - ms.clientHeight < 90;
    vc.__t = top; vc.__d = d;
    vc.style.setProperty('--lg-top', top + 'px');
    vc.style.setProperty('--lg-dock', d + 'px');
    if (wasBottom) ms.scrollTop = ms.scrollHeight;
  }
  function watchLayout() {
    buildDock();
    var vc = $('vChat');
    if (!vc) return;
    new MutationObserver(function () { buildDock(); measure(); }).observe(vc, { childList: true });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(measure);
      var bar = vc.querySelector(':scope > .bar');
      if (bar) ro.observe(bar);
      if (dock) ro.observe(dock);
    }
    addEventListener('resize', measure);
    if (window.visualViewport) visualViewport.addEventListener('resize', measure);
    new MutationObserver(function () { setTimeout(measure, 30); }).observe(vc, { attributes: true, attributeFilter: ['class'] });
    setTimeout(measure, 50); setTimeout(measure, 400);
  }

  /* ----------------------------------------------------- settings section */
  function buildSettings() {
    var pg = $('spPg_chat');
    if (!pg || $('lgRow')) return;
    var box = document.createElement('div');
    box.id = 'lgBox';
    box.innerHTML =
      '<h3>Liquid glass</h3>' +
      '<div id="lgPrev"><div class="pc">💬</div><div class="pp">Glass button</div><div class="pc">❤️</div></div>' +
      '<button class="row" id="lgRow" type="button">Glass buttons<span id="lgSt">On</span></button>' +
      '<div class="lgsl"><label>Shade<small>Light ⟷ Dark</small></label><input id="lgShade" type="range" min="0" max="100" step="1" aria-label="Glass shade, light to dark"></div>' +
      '<div class="lgsl"><label>Blur<small>Soft ⟷ Strong</small></label><input id="lgBlur" type="range" min="0" max="100" step="1" aria-label="Glass blur strength"></div>' +
      '<button class="row" id="lgReset" type="button">Reset glass</button>';
    pg.appendChild(box);
    $('lgRow').onclick = function () { S.on = S.on ? 0 : 1; save(); apply(); };
    $('lgShade').oninput = function () { S.shade = +this.value; save(); apply(); };
    $('lgBlur').oninput = function () { S.blur = +this.value; save(); apply(); };
    $('lgReset').onclick = function () { S = Object.assign({}, DEF); save(); apply(); };
    apply();
  }

  /* -------------------------------------------------------- big emoji msg */
  var EMO_RE = /^(?:\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}\uFE0F]*(?:\u200D\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}\uFE0F]*)*|\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3)+$/u;
  var seg = null;
  try { if (window.Intl && Intl.Segmenter) seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' }); } catch (e) {}
  function graphemes(t) {
    if (seg) { var out = []; for (var x of seg.segment(t)) out.push(x.segment); return out; }
    return t.match(/\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}\uFE0F]*(?:\u200D\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}\uFE0F]*)*|\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3/gu) || [];
  }
  var HEARTS = /[❤💕💖💗💓💞💘💝💟🥰😍😘😻💑💏]/u, LAUGH = /[😂🤣😆😹😄]/u, FIRE = /[🔥💥⚡]/u, SPIN = /[🎉🎊🥳🌀⭐🌟✨💫]/u;
  var seen = new Set();

  function burst(d, e) {
    var n = 7;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'bgp';
      p.textContent = e;
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      var dist = 60 + Math.random() * 46;
      p.style.setProperty('--dx', Math.round(Math.cos(ang) * dist) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(ang) * dist - 20) + 'px');
      p.style.setProperty('--rot', Math.round((Math.random() - 0.5) * 80) + 'deg');
      p.style.fontSize = (14 + Math.random() * 14) + 'px';
      p.style.animationDelay = (Math.random() * 0.15) + 's';
      d.appendChild(p);
      setTimeout(function (el) { return function () { el.remove(); }; }(p), 1500);
    }
  }
  function play(d, cls, first) {
    var span = d.querySelector('.bge');
    if (!span) return;
    ['a-pop', 'a-beat', 'a-shake', 'a-fire', 'a-spin'].forEach(function (c) { d.classList.remove(c); });
    void d.offsetWidth;
    d.classList.add(cls);
    if (first) burst(d, span.textContent.replace(/\s/g, '').slice(0, 2));
  }

  /* called from bubble() in index.html; returns true when it drew the text itself */
  window.__bigEmo = function (d, m, id) {
    try {
      if (m.dele || m.rep || m.once || (m.type && m.type !== 'text')) return false;
      var t = (m.text || '').trim();
      if (!t || t.length > 40 || !EMO_RE.test(t)) return false;
      var n = graphemes(t).length;
      if (n < 1 || n > 3) return false;
      d.classList.add('bigemo', 'n' + n);
      var span = document.createElement('span');
      span.className = 'bge';
      span.textContent = t;
      d.appendChild(span);
      var cls = HEARTS.test(t) ? 'a-beat' : LAUGH.test(t) ? 'a-shake' : FIRE.test(t) ? 'a-fire' : SPIN.test(t) ? 'a-spin' : 'a-pop';
      var key = (m.from || '') + ':' + (m.ts || id);
      var fresh = (Date.now() - (m.ts || 0)) < 9000 && !seen.has(key);
      seen.add(key);
      if (fresh) { d.classList.add(cls); setTimeout(function () { if (d.isConnected) burst(d, t.slice(0, 2)); }, 120); }
      span.addEventListener('click', function (e) { e.stopPropagation(); play(d, cls, true); });
      return true;
    } catch (e) { return false; }
  };

  /* ------------------------------------------------------ emoji search bar */
  var NAMES = null;
  var RULES = [
    [/tears of joy|rolling on the floor|grinning squinting/, 'laugh lol lmao funny haha sirippu'],
    [/smil|grin|beaming/, 'happy smile santhosam'],
    [/heart|love/, 'love kadhal luv anbu'],
    [/kiss/, 'kiss muah ummah muthham'],
    [/crying|sob|disappointed|pensive/, 'cry sad tears azhugai'],
    [/angry|pouting|rage|enraged/, 'angry mad kovam'],
    [/sleep|zzz|yawn/, 'sleep tired thookam'],
    [/folded hands/, 'pray thanks please namaste'],
    [/thumbs up/, 'ok good yes like super'],
    [/clapping/, 'clap applause'],
    [/party|confetti|tada/, 'party celebrate congrats'],
    [/birthday|cake/, 'birthday bday cake'],
    [/rose|blossom|flower|tulip|hibiscus/, 'flower poo'],
    [/hugging/, 'hug anbu'],
    [/fire\b/, 'fire hot lit'],
    [/pizza|hamburger|french fries|rice|curry|sandwich|taco/, 'food saapadu hungry'],
    [/dog|puppy/, 'dog pet naai'],
    [/cat\b|kitty/, 'cat pet poonai'],
    [/sun\b|sunny/, 'sun day velicham'],
    [/moon|night/, 'moon night nila'],
    [/winking/, 'wink'],
    [/eyes/, 'look eyes kann'],
    [/money/, 'money cash'],
    [/skull|ghost/, 'dead scary']
  ];
  function ensureNames() {
    if (NAMES) return NAMES;
    NAMES = new Map();
    var raw = window.__EMO_NAMES || '';
    raw.split('|').forEach(function (r) { var i = r.indexOf(':'); if (i > 0) NAMES.set(parseInt(r.slice(0, i), 16), r.slice(i + 1)); });
    return NAMES;
  }
  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) {}
  var hayCache = new Map();
  function hay(e) {
    var h = hayCache.get(e);
    if (h !== undefined) return h;
    var names = ensureNames(), cps = Array.from(e).map(function (c) { return c.codePointAt(0); }), words = [];
    if (cps.length === 2 && cps[0] >= 0x1F1E6 && cps[0] <= 0x1F1FF && cps[1] >= 0x1F1E6 && cps[1] <= 0x1F1FF) {
      var code = String.fromCharCode(cps[0] - 0x1F1E6 + 65, cps[1] - 0x1F1E6 + 65);
      words.push('flag', code.toLowerCase());
      try { if (regionNames) words.push((regionNames.of(code) || '').toLowerCase()); } catch (x) {}
    } else {
      var skin = false;
      cps.forEach(function (c) {
        if (c === 0x200D || c === 0xFE0F) return;
        if (c >= 0x1F3FB && c <= 0x1F3FF) { skin = true; return; }
        if (c === 0x20E3) { words.push('keycap'); return; }
        var n = names.get(c);
        if (n && words.indexOf(n) < 0) words.push(n);
        else if (!n && c < 0x80) words.push(String.fromCharCode(c));
      });
      if (skin) words.push('skin tone');
    }
    h = words.join(' ');
    RULES.forEach(function (r) { if (r[0].test(h)) h += ' ' + r[1]; });
    hayCache.set(e, h);
    return h;
  }

  function buildEmojiSearch() {
    var emo = $('emo'), eT = $('emT'), eG = $('emG');
    if (!emo || !eT || !eG || $('emS')) return false;
    var row = document.createElement('div');
    row.id = 'emS';
    row.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="emQ" type="search" placeholder="Search emoji" aria-label="Search emoji" autocomplete="off" autocapitalize="off" enterkeyhint="search"><button type="button" aria-label="Clear">×</button>';
    emo.insertBefore(row, eT);
    var inp = row.querySelector('input'), clr = row.querySelector('button');
    var lastTab = null;

    function show(q) {
      row.classList.toggle('has', !!q);
      if (!q) {
        if (lastTab) { lastTab.click(); lastTab = null; }
        return;
      }
      if (!lastTab) lastTab = Array.prototype.find.call(eT.children, function (b) { return b.classList.contains('on'); }) || eT.children[1] || eT.children[0];
      Array.prototype.forEach.call(eT.children, function (b) { b.classList.remove('on'); });
      eG.style.gridTemplateColumns = '';
      eG.textContent = '';
      var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
      var all = window.__emoAll || [], out = [];
      for (var i = 0; i < all.length && out.length < 160; i++) {
        var h = hay(all[i]);
        if (h && toks.every(function (t) { return h.indexOf(t) >= 0; })) out.push(all[i]);
      }
      if (!out.length) { var nn = document.createElement('div'); nn.id = 'emNone'; nn.textContent = 'No emoji found 🙈'; eG.appendChild(nn); return; }
      out.forEach(function (e) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = e;
        b.onclick = function () { if (window.__emoPick) window.__emoPick(e); try { inp.focus({ preventScroll: true }); } catch (x) { inp.focus(); } };
        eG.appendChild(b);
      });
      eG.scrollTop = 0;
    }
    inp.addEventListener('input', function () { show(inp.value.trim()); });
    clr.onclick = function () { inp.value = ''; show(''); inp.focus(); };
    /* tapping a category tab leaves search mode */
    eT.addEventListener('click', function () { if (inp.value) { inp.value = ''; row.classList.remove('has'); lastTab = null; } }, true);
    /* closing the emoji panel resets the search */
    new MutationObserver(function () { if (emo.style.display === 'none' && inp.value) { inp.value = ''; row.classList.remove('has'); lastTab = null; } })
      .observe(emo, { attributes: true, attributeFilter: ['style'] });
    return true;
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    apply();
    buildSettings();
    watchLayout();
    if (!buildEmojiSearch()) setTimeout(buildEmojiSearch, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
