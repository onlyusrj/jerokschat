/* OnlyUs home-v70.js  -  HOME STUDIO
   1) every home card can be hidden / moved (small ⋯ on the card) and a "Customize home" sheet controls everything
   2) Question of the day: topic, own questions, daily or every open, shuffle
   3) "Our days" card: title, emoji, counter unit, milestone on/off
   4) Couple tools: hide single chips (streak, time, weather...) and single tiles
   5) new chat-list design (cards / classic / compact), avatar shape, preview, time, unread badge style
   Settings are saved on THIS phone (localStorage "onlyus-h70"). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var KEY = 'onlyus-h70', R = document.documentElement;
  var U = function () { return window.__us || {}; };

  /* ------------------------------------------------------------ settings */
  var DEF = {
    sec: { together: 1, question: 1, scenes: 1, tools: 1, feat: 1, search: 1, hearts: 1, ai: 1, qr: 1, hdrheart: 1, greet: 0 },
    order: ['together', 'question', 'scenes', 'tools', 'feat'],
    card: 'gradient', radius: 'round', size: 'comfy', acc: '',
    qsrc: 'all', qmode: 'day', qmine: [], qlabel: '', qshift: 0,
    tLabel: '', tEmoji: '', tUnit: 'days', tMile: 1,
    chips: { streak: 1, time: 1, wx: 1, arr: 1 }, tiles: {},
    greetText: '',
    row: 'cards', av: 'circle', preview: 1, time: 1, ubadge: 'pill', xbtn: 0
  };
  var SEC = {
    together: ['#o64Together', 'Our days'], question: ['#o64Question', 'Question of the day'], scenes: ['#o64Scenes', 'Our little moments'],
    tools: ['#o68Tools', 'Couple tools'], feat: ['#o66Feat', 'What you can do']
  };
  var CHIPS = [['streak', 'Chat streak'], ['time', "Partner's local time"], ['wx', "Partner's weather"], ['arr', 'Reached safely']];
  var TILES = [['map', 'Live map'], ['count', 'Countdown'], ['qa', 'Daily question'], ['bucket', 'Bucket list'], ['cap', 'Time capsule'], ['recap', 'Year recap'], ['ai', 'AI helpers'], ['arrive', 'Safe arrival'], ['vault', 'Private vault']];
  var OTHERS = [['greet', 'Greeting at the top', 'Good evening + the date'], ['search', 'Search bar'], ['hearts', 'Floating hearts'], ['ai', 'AI button (✨)'], ['qr', 'QR button'], ['hdrheart', 'Heart next to OnlyUs']];
  var POOLS = {
    sweet: ['What is the first thing you noticed about me?', 'What is a tiny thing I do that makes your whole day better?', 'Which moment with me do you replay in your head?', 'What nickname for me do you secretly love?', 'What is your favourite thing about our mornings?', 'When do you feel closest to me?', 'What is one thing I said that you will never forget?', 'How do I make you feel when we hug?'],
    fun: ['If we swapped phones for a day, what would you check first?', 'What would our reality show be called?', 'Which cartoon couple are we?', 'What is the silliest thing you want us to do this week?', 'Pick a movie for tonight: which one and why?', 'What snack would you never share with me?', 'If we were a song duet, which song would it be?', 'What is my most annoying cute habit?'],
    deep: ['What do you need more of from me right now?', 'What is something you are afraid to tell me?', 'What do you think we are best at as a couple?', 'When did you feel most understood by me?', 'What is one thing we should talk about more?', 'What does a perfect relationship look like to you in 10 years?', 'What did you learn about love from your family?', 'What is one thing I can do to make you feel safer?'],
    dreams: ['Where do you want us to live one day?', 'What is one trip we must take together?', 'What will our dream home look like?', 'What new thing should we learn together this year?', 'If money did not matter, how would we spend our weekends?', 'What tradition should we start as a couple?', 'What is a goal we can chase together?', 'What is one bucket-list moment you want with me?']
  };
  var TOPICS = [['all', 'All'], ['sweet', 'Sweet'], ['fun', 'Fun'], ['deep', 'Deep'], ['dreams', 'Dreams'], ['mine', 'Mine']];
  var SWATCH = ['', '#e8436a', '#ff7a45', '#e0a200', '#2f9e6b', '#1f8fd6', '#8657d9', '#d6409f'];
  var EMOJIS = ['', '💕', '💍', '🌹', '🐼', '🧸', '✨', '🔥', '🥰'];

  var cfg = load();
  function load() {
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
    return merge(JSON.parse(JSON.stringify(DEF)), s || {});
  }
  function merge(a, b) {
    Object.keys(b).forEach(function (k) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], b[k]);
      else a[k] = b[k];
    });
    return a;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { } }
  function getp(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, cfg); }
  function setp(path, v) { var p = path.split('.'), o = cfg; while (p.length > 1) { var k = p.shift(); if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; } o[p[0]] = v; }
  // keep the order list complete (new sections appended)
  function fixOrder() { var o = cfg.order.filter(function (k) { return SEC[k]; }); Object.keys(SEC).forEach(function (k) { if (o.indexOf(k) < 0) o.push(k); }); cfg.order = o; }

  /* ------------------------------------------------------------ hooks used by couple-v64.js */
  var sessQ = null;
  function pool(QS) {
    var s = cfg.qsrc, mine = cfg.qmine || [], list;
    if (s === 'mine') list = mine.length ? mine.slice() : QS.slice();
    else if (POOLS[s]) list = POOLS[s].concat(mine);
    else list = QS.concat(mine);
    var i;
    if (cfg.qmode === 'open') { if (sessQ == null || sessQ >= list.length) sessQ = Math.floor(Math.random() * list.length); i = sessQ; }
    else i = (Math.floor(Date.now() / 864e5) + (cfg.qshift || 0)) % list.length;
    return { list: list, i: i, label: cfg.qlabel || (cfg.qmode === 'open' ? 'Question for you' : 'Question of the day') };
  }
  function shuffle() { if (cfg.qmode === 'open') sessQ = Math.floor(Math.random() * 1000); else cfg.qshift = (cfg.qshift || 0) + 1; save(); }
  window.__h70 = {
    pool: pool, shuffle: shuffle, cfg: function () { return cfg; }, open: function () { openSheet(); },
    together: function () { return { label: cfg.tLabel, emoji: cfg.tEmoji, unit: cfg.tUnit, mile: !!cfg.tMile }; }
  };

  /* ------------------------------------------------------------ CSS */
  var BASE = [
    '#vList #h70Greet{order:1;margin:10px 18px 0}#h70Greet .g1{font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.01em}#h70Greet .g2{font-size:13px;color:var(--dim);margin-top:2px}',
    '#vList .search-wrap{order:2}#vList #cl{order:3}#vList .welcome-strip,#vList .couple-profile{order:4}',
    '#vList #h70Foot{order:99;margin:10px 16px calc(120px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center}',
    '#h70Foot button{all:unset;cursor:pointer;padding:11px 20px;border-radius:22px;font-size:14px;font-weight:700;color:var(--acc);background:color-mix(in srgb,var(--acc) 12%,transparent);border:1px dashed color-mix(in srgb,var(--acc) 45%,transparent);-webkit-tap-highlight-color:transparent}#h70Foot button:active{transform:scale(.96)}',
    '#o64Scenes,#o68Tools,#o66Feat,.o64card{position:relative}',
    '.h70mb{all:unset;position:absolute;top:8px;right:8px;z-index:4;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:var(--dim);font-size:22px;line-height:1;font-weight:800;letter-spacing:1px;-webkit-tap-highlight-color:transparent}.h70mb:active{background:color-mix(in srgb,var(--acc) 15%,transparent)}',
    '#o64Question .o64btns{margin-right:0!important}.o64btns button{white-space:nowrap;font-size:13.5px!important;padding:10px 6px!important}',
    '.o64card .o64h{right:46px!important}.o64emo{fill:none;font-style:normal;font-size:30px;line-height:34px;text-align:center}.o64btns .o64nx{flex:0 0 46px!important;font-size:18px!important;padding:8px 0!important}',
    '.h70pop{position:fixed;z-index:2147482400;min-width:190px;padding:6px;border-radius:18px;background:var(--bg);color:var(--ink);border:1px solid var(--line);box-shadow:0 14px 40px rgba(0,0,0,.28);animation:h70pop .16s ease-out}',
    '@keyframes h70pop{from{opacity:0;transform:scale(.94) translateY(-4px)}}',
    '.h70pop button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border-radius:12px;font-size:15px;cursor:pointer;color:var(--ink)}.h70pop button:active{background:color-mix(in srgb,var(--acc) 12%,transparent)}.h70pop button[disabled]{opacity:.35}',
    '#h70Snack{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:2147482400;display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:16px;background:#2a2238;color:#fff;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:h70pop .2s ease-out;max-width:90vw}#h70Snack button{all:unset;cursor:pointer;color:#ffb3d0;font-weight:800}',
    /* sheet */
    '#h70Sheet{position:fixed;inset:0;z-index:2147482300;display:flex;align-items:flex-end;justify-content:center}',
    '#h70Sheet .bg{position:absolute;inset:0;background:rgba(15,8,30,.38);animation:o66fade .2s}',
    '#h70Sheet .cd{position:relative;width:100%;max-width:560px;max-height:84%;display:flex;flex-direction:column;background:var(--bg)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:var(--ink);border-radius:28px 28px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.25);animation:h70up .28s cubic-bezier(.2,.9,.3,1)}',
    '@keyframes h70up{from{transform:translateY(40px);opacity:0}}',
    '#h70Sheet .hd{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 10px;font-size:19px}#h70Sheet .hd button{all:unset;cursor:pointer;padding:8px 16px;border-radius:18px;background:var(--acc);color:#fff;font-weight:700;font-size:14px}',
    '#h70Sheet .bd{overflow:auto;-webkit-overflow-scrolling:touch;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px));overscroll-behavior:contain}',
    '#h70Sheet h4{margin:20px 4px 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);font-weight:800}',
    '#h70Sheet .r{display:flex;align-items:center;gap:10px;padding:11px 14px;margin-bottom:6px;border-radius:16px;background:color-mix(in srgb,var(--ink) 4%,var(--panel))!important;box-shadow:none!important;border:1px solid var(--line)}',
    '#h70Sheet .t{flex:1;min-width:0}#h70Sheet .t b{font-size:15px;font-weight:600}#h70Sheet .t small{display:block;color:var(--dim);font-size:12px;margin-top:1px}',
    '#h70Sheet .mv{all:unset;cursor:pointer;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;color:var(--dim);font-size:13px;background:color-mix(in srgb,var(--ink) 6%,transparent)}#h70Sheet .mv[disabled]{opacity:.25}',
    '#h70Sheet .sw{all:unset;cursor:pointer;flex:none;width:46px;height:28px;border-radius:15px;background:color-mix(in srgb,var(--ink) 22%,transparent);position:relative;transition:background .2s}#h70Sheet .sw i{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:transform .2s}#h70Sheet .sw.on{background:var(--acc)}#h70Sheet .sw.on i{transform:translateX(18px)}',
    '#h70Sheet .sg{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}#h70Sheet .sg button{all:unset;cursor:pointer;padding:9px 14px;border-radius:14px;font-size:13.5px;font-weight:600;background:color-mix(in srgb,var(--ink) 6%,transparent);color:var(--ink);border:1px solid transparent}#h70Sheet .sg button.on{background:color-mix(in srgb,var(--acc) 16%,transparent);color:var(--acc);border-color:var(--acc)}',
    '#h70Sheet .lb{margin:10px 4px 2px;font-size:13px;color:var(--dim);font-weight:600}',
    '#h70Sheet .sws{display:flex;gap:10px;flex-wrap:wrap;margin:6px 2px 8px}#h70Sheet .sws button{all:unset;cursor:pointer;width:34px;height:34px;border-radius:50%;border:3px solid transparent;box-sizing:border-box;display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff}#h70Sheet .sws button.on{border-color:var(--ink)}',
    '#h70Sheet input[type=text]{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--ink) 5%,var(--bg));color:var(--ink);font:inherit;font-size:15px}',
    '#h70Sheet .ad{display:flex;gap:8px}#h70Sheet .ad button{all:unset;cursor:pointer;flex:none;padding:0 18px;border-radius:14px;background:var(--acc);color:#fff;font-weight:700;display:grid;place-items:center}',
    '#h70Sheet .qi{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;margin-top:6px;border-radius:14px;border:1px solid var(--line);font-size:14px}#h70Sheet .qi span{flex:1}#h70Sheet .qi button{all:unset;cursor:pointer;color:var(--dim);padding:0 4px}',
    '#h70Sheet .pv{padding:12px 14px;border-radius:16px;background:color-mix(in srgb,var(--acc) 10%,var(--panel));border:1px solid var(--line);font-size:15px;font-weight:600;margin:6px 0}',
    '#h70Sheet .rs{all:unset;cursor:pointer;display:block;text-align:center;margin:22px 0 4px;padding:13px;border-radius:16px;color:#d93a4a;border:1px solid #d93a4a55;font-weight:700}',
    '#h70Sheet .nt{font-size:12.5px;color:var(--dim);margin:2px 4px 8px}'
  ].join('\n');

  var ROWCSS = [
    /* ---- chat list: CARDS (default) ---- */
    'html #vList #cl .ct{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;column-gap:13px;margin:7px 12px;padding:12px 14px;border-radius:calc(var(--h70r,22px) * .95);background:var(--panel);border:1px solid var(--line);box-shadow:0 3px 14px rgba(70,40,130,.07);transition:transform .15s ease,box-shadow .2s ease,border-color .2s}',
    'html #vList #cl .ct:active{transform:scale(.985)}',
    'html #vList #cl .ct .av{width:54px;height:54px;font-size:21px;box-shadow:0 3px 10px color-mix(in srgb,var(--acc) 30%,transparent)}',
    'html #vList #cl .ct b{display:block;font-size:16.5px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    'html #vList #cl .ct small{display:block;margin-top:3px;max-width:none;font-size:13.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    'html #vList #cl .ct .rt{display:flex;flex-direction:column;align-items:flex-end;gap:7px;margin:0;font-size:12px;font-weight:600;color:var(--dim)}html #vList #cl .ct .rt br{display:none}',
    'html #vList #cl .ct .bd{margin:0;min-width:22px;height:22px;line-height:22px;padding:0 7px;border-radius:11px;font-size:12px;font-weight:700;box-sizing:border-box;box-shadow:0 2px 8px color-mix(in srgb,var(--acc) 40%,transparent)}',
    'html #vList #cl .ct:has(.bd){border-color:color-mix(in srgb,var(--acc) 40%,var(--line));background:linear-gradient(100deg,color-mix(in srgb,var(--acc) 10%,var(--panel)),var(--panel) 65%)}',
    'html #vList #cl .ct:has(.bd) small{color:var(--ink);font-weight:600}html #vList #cl .ct:has(.bd) .rt{color:var(--acc)}',
    'html #vList #cl .ct .x{display:none}',
    /* ---- CLASSIC ---- */
    'html[data-h70row="classic"] #vList #cl .ct{margin:0;border-radius:0;box-shadow:none;background:transparent;border:0;border-bottom:1px solid var(--line);padding:11px 16px}',
    'html[data-h70row="classic"] #vList #cl .ct:has(.bd){background:transparent;border-color:var(--line)}html[data-h70row="classic"] #vList #cl .ct .av{width:50px;height:50px;box-shadow:none}',
    /* ---- COMPACT ---- */
    'html[data-h70row="compact"] #vList #cl .ct{margin:3px 10px;padding:7px 11px;column-gap:11px;box-shadow:none}',
    'html[data-h70row="compact"] #vList #cl .ct .av{width:40px;height:40px;font-size:16px;box-shadow:none}html[data-h70row="compact"] #vList #cl .ct b{font-size:15px}html[data-h70row="compact"] #vList #cl .ct small{font-size:12.5px;margin-top:1px}',
    /* ---- avatar shape ---- */
    'html[data-h70av="squircle"] #vList #cl .ct .av{border-radius:34%}html[data-h70av="squircle"] #vList #cl .ct .av.st-has::after{border-radius:38%}',
    'html[data-h70av="square"] #vList #cl .ct .av{border-radius:13px}html[data-h70av="square"] #vList #cl .ct .av.st-has::after{border-radius:17px}',
    /* ---- toggles ---- */
    'html[data-h70pv="off"] #vList #cl .ct small{display:none}',
    'html[data-h70tm="off"] #vList #cl .ct .rt{font-size:0}html[data-h70tm="off"] #vList #cl .ct .rt .bd{font-size:12px}',
    'html[data-h70ub="dot"] #vList #cl .ct .bd{font-size:0;min-width:12px;width:12px;height:12px;line-height:12px;padding:0;border-radius:50%}',
    'html[data-h70x] #vList #cl .ct .x{display:block}',
    /* ---- card looks ---- */
    'html[data-h70r="round"]{--h70r:22px}html[data-h70r="soft"]{--h70r:14px}html[data-h70r="square"]{--h70r:6px}',
    'html[data-h70r] .o64card,html[data-h70r] .o68t,html[data-h70r] .o68chip,html[data-h70r] .o64sc{border-radius:var(--h70r)!important}',
    'html[data-h70c="glass"] .o64card,html[data-h70c="glass"] .o68t,html[data-h70c="glass"] .o68chip{background:color-mix(in srgb,var(--panel) 55%,transparent)!important;-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent)!important}',
    'html[data-h70c="solid"] .o64card,html[data-h70c="solid"] .o68t,html[data-h70c="solid"] .o68chip{background:var(--panel)!important;box-shadow:none!important}',
    'html[data-h70c="outline"] .o64card,html[data-h70c="outline"] .o68t,html[data-h70c="outline"] .o68chip{background:transparent!important;box-shadow:none!important;border:1.5px solid var(--acc)!important}',
    'html[data-h70s="compact"] .o64card{margin:6px 14px!important;padding:11px 14px!important}html[data-h70s="compact"] .o64days b{font-size:32px}html[data-h70s="compact"] .o64q{font-size:15px;margin:5px 0 9px}html[data-h70s="compact"] .o68h,html[data-h70s="compact"] .o66fh{margin-top:10px}'
  ].join('\n');

  var styleEl = null;
  function dynCss() {
    var s = [], i;
    cfg.order.forEach(function (k, idx) { s.push('html #vList ' + SEC[k][0] + '{order:' + (10 + idx * 10) + '}'); if (!cfg.sec[k]) s.push('html #vList ' + SEC[k][0] + '{display:none!important}'); });
    if (!cfg.sec.search) s.push('html #vList .search-wrap{display:none!important}');
    if (!cfg.sec.hearts) s.push('#o64Hearts{display:none!important}');
    if (!cfg.sec.ai) s.push('#aiFab{display:none!important}');
    if (!cfg.sec.qr) s.push('#qrFab{display:none!important}');
    if (!cfg.sec.hdrheart) s.push('html #vList .lb-title::after{display:none!important}');
    CHIPS.forEach(function (c) { if (!cfg.chips[c[0]]) s.push('#o68Strip .o68chip[data-k="' + c[0] + '"]{display:none!important}'); });
    TILES.forEach(function (t) { if (cfg.tiles[t[0]]) s.push('#o68Tools .o68t[data-t="' + t[0] + '"]{display:none!important}'); });
    if (cfg.acc) s.push('html[data-h70acc] .o64card,html[data-h70acc] #o64Scenes,html[data-h70acc] #o68Tools,html[data-h70acc] #o66Feat{--acc:' + cfg.acc + '}');
    return s.join('\n');
  }
  function apply(rebuild) {
    if (!styleEl) { styleEl = el('style'); styleEl.id = 'h70css'; document.head.appendChild(styleEl); }
    fixOrder();
    styleEl.textContent = BASE + '\n' + ROWCSS + '\n' + dynCss();
    var a = function (k, v) { if (v == null || v === false) R.removeAttribute(k); else R.setAttribute(k, v); };
    a('data-h70row', cfg.row); a('data-h70av', cfg.av); a('data-h70c', cfg.card); a('data-h70r', cfg.radius); a('data-h70s', cfg.size);
    a('data-h70pv', cfg.preview ? null : 'off'); a('data-h70tm', cfg.time ? null : 'off'); a('data-h70ub', cfg.ubadge === 'dot' ? 'dot' : null);
    a('data-h70x', cfg.xbtn ? '1' : null); a('data-h70acc', cfg.acc ? '1' : null);
    if (rebuild) try { if (window.__o64) { window.__o64.together(); window.__o64.question(); } } catch (e) { }
    greet(); decorate();
  }

  /* ------------------------------------------------------------ greeting + footer chip */
  function greet() {
    var list = $('vList'); if (!list) return;
    var g = $('h70Greet');
    if (!cfg.sec.greet) { if (g) g.remove(); return; }
    if (!g) { g = el('div'); g.id = 'h70Greet'; var s = list.querySelector('.search-wrap'); if (s) list.insertBefore(g, s); else list.appendChild(g); }
    var h = new Date().getHours(), part = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
    var me = null; try { me = U().me && U().me(); } catch (e) { }
    var nm = me && me.name ? String(me.name).trim().split(/\s+/)[0] : '';
    var date = new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    g.innerHTML = '<div class="g1">' + esc(part + (nm ? ', ' + nm : '')) + ' 👋</div><div class="g2">' + esc(date + (cfg.greetText ? ' · ' + cfg.greetText : '')) + '</div>';
  }
  function foot() {
    var list = $('vList'); if (!list || $('h70Foot')) return;
    var f = el('div'); f.id = 'h70Foot'; var b = el('button', '', '✎ Customize home'); b.type = 'button'; b.onclick = openSheet; f.appendChild(b); list.appendChild(f);
  }
  function settingsRow() {
    var m = $('spMenu'); if (!m || $('h70SetRow')) return;
    var r = el('div', 'o66langrow', '<span>Customize home</span><span>Cards, chats, look</span>'); r.id = 'h70SetRow'; r.setAttribute('role', 'button'); r.tabIndex = 0;
    r.onclick = openSheet; r.onkeydown = function (e) { if (e.key === 'Enter') openSheet(); };
    var a = $('o66LangRow') || m.querySelector('.spsearch'); if (a) a.after(r); else m.prepend(r);
  }

  /* ------------------------------------------------------------ per-card ⋯ button */
  var watched = [];
  function decorate() {
    Object.keys(SEC).forEach(function (k) {
      var e = document.querySelector(SEC[k][0]); if (!e) return;
      if (!Array.prototype.some.call(e.children, function (c) { return c.classList && c.classList.contains('h70mb'); })) {
        var b = el('button', 'h70mb', '⋯'); b.type = 'button'; b.setAttribute('aria-label', 'Customize ' + SEC[k][1]); b.setAttribute('data-sec', k);
        b.onclick = function (ev) { ev.stopPropagation(); ev.preventDefault(); cardMenu(b, k); };
        e.appendChild(b);
      }
      if (watched.indexOf(e) < 0) { watched.push(e); new MutationObserver(soon).observe(e, { childList: true }); }
    });
    foot(); settingsRow();
  }
  var qt = 0; function soon() { if (qt) return; qt = setTimeout(function () { qt = 0; decorate(); }, 90); }
  function closePop() { var p = document.querySelector('.h70pop'); if (p) p.remove(); document.removeEventListener('pointerdown', outside, true); }
  function outside(e) { if (!e.target.closest || !e.target.closest('.h70pop')) closePop(); }
  function cardMenu(btn, k) {
    closePop();
    var i = cfg.order.indexOf(k), p = el('div', 'h70pop');
    p.innerHTML = '<button data-a="hide">🙈 Hide this card</button><button data-a="up"' + (i <= 0 ? ' disabled' : '') + '>⬆️ Move up</button><button data-a="down"' + (i >= cfg.order.length - 1 ? ' disabled' : '') + '>⬇️ Move down</button><button data-a="more">🎨 Customize home…</button>';
    document.body.appendChild(p);
    var r = btn.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
    p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px';
    p.style.top = Math.max(8, Math.min(innerHeight - h - 8, r.bottom + 4)) + 'px';
    p.onclick = function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return; var a = b.getAttribute('data-a'); closePop();
      if (a === 'hide') { hideSec(k); }
      else if (a === 'up' || a === 'down') { move(k, a === 'up' ? -1 : 1); }
      else openSheet();
    };
    setTimeout(function () { document.addEventListener('pointerdown', outside, true); }, 0);
  }
  function move(k, d) { var i = cfg.order.indexOf(k), j = i + d; if (j < 0 || j >= cfg.order.length) return; var t = cfg.order[i]; cfg.order[i] = cfg.order[j]; cfg.order[j] = t; save(); apply(); }
  function hideSec(k) {
    cfg.sec[k] = 0; save(); apply();
    snack('Hidden: ' + SEC[k][1], 'Undo', function () { cfg.sec[k] = 1; save(); apply(); });
  }
  function snack(text, label, fn) {
    var o = $('h70Snack'); if (o) o.remove();
    o = el('div'); o.id = 'h70Snack'; o.innerHTML = '<span>' + esc(text) + '</span>';
    if (fn) { var b = el('button', '', label); b.type = 'button'; b.onclick = function () { o.remove(); fn(); }; o.appendChild(b); }
    document.body.appendChild(o); setTimeout(function () { if (o.parentNode) o.remove(); }, 6000);
  }

  /* ------------------------------------------------------------ customize sheet */
  function seg(k, opts) { var cur = String(getp(k)); return '<div class="sg">' + opts.map(function (o) { return '<button type="button" data-a="set" data-k="' + k + '" data-v="' + esc(o[0]) + '" class="' + (cur === String(o[0]) ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function sw(path, label, sub, inv) { var on = !!getp(path); if (inv) on = !on; return '<div class="r"><div class="t"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><button type="button" class="sw' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-a="tog" data-k="' + path + '"' + (inv ? ' data-inv="1"' : '') + '><i></i></button></div>'; }
  function body() {
    var reg = R.classList.contains('mode-reg'), h = '';
    if (!reg) {
      h += '<h4>Home cards</h4><div class="nt">Switch a card off to remove it, use the arrows to change the order. You can also tap ⋯ on any card.</div>';
      cfg.order.forEach(function (k, i) {
        h += '<div class="r"><div class="t"><b>' + SEC[k][1] + '</b></div><button type="button" class="mv" data-a="mv" data-k="' + k + '" data-d="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move up">▲</button><button type="button" class="mv" data-a="mv" data-k="' + k + '" data-d="1"' + (i === cfg.order.length - 1 ? ' disabled' : '') + ' aria-label="Move down">▼</button>' +
          '<button type="button" class="sw' + (cfg.sec[k] ? ' on' : '') + '" role="switch" aria-checked="' + !!cfg.sec[k] + '" data-a="tog" data-k="sec.' + k + '"><i></i></button></div>';
      });
    }
    h += '<h4>Other things on Home</h4>';
    OTHERS.forEach(function (o) { h += sw('sec.' + o[0], o[1], o[2]); });
    h += '<div class="lb">Greeting note (optional)</div><input type="text" id="h70Gt" maxlength="60" data-in="greetText" placeholder="e.g. Have a lovely day" value="' + esc(cfg.greetText) + '">';

    if (!reg) {
      h += '<h4>Card look</h4><div class="lb">Style</div>' + seg('card', [['gradient', 'Gradient'], ['glass', 'Glass'], ['solid', 'Solid'], ['outline', 'Outline']]);
      h += '<div class="lb">Corners</div>' + seg('radius', [['round', 'Round'], ['soft', 'Soft'], ['square', 'Square']]);
      h += '<div class="lb">Size</div>' + seg('size', [['comfy', 'Comfortable'], ['compact', 'Compact']]);
      h += '<div class="lb">Card colour</div><div class="sws">' + SWATCH.map(function (c) { return '<button type="button" data-a="set" data-k="acc" data-v="' + c + '" class="' + (cfg.acc === c ? 'on' : '') + '" style="background:' + (c || 'linear-gradient(135deg,var(--acc),#ff6fa8)') + '" aria-label="' + (c || 'Theme colour') + '">' + (c ? '' : 'A') + '</button>'; }).join('') + '</div>';

      var qp = pool(['…']);
      h += '<h4>Question of the day</h4><div class="lb">Topic</div>' + seg('qsrc', TOPICS.map(function (t) { return [t[0], t[1] + (t[0] === 'mine' ? ' (' + cfg.qmine.length + ')' : '')]; }));
      h += '<div class="lb">Change</div>' + seg('qmode', [['day', 'Every day'], ['open', 'Every time I open the app']]);
      h += '<div class="lb">Card title</div><input type="text" maxlength="30" data-in="qlabel" placeholder="Question of the day" value="' + esc(cfg.qlabel) + '">';
      h += '<div class="lb">My own questions</div><div class="ad"><input type="text" id="h70Qin" maxlength="140" placeholder="Write a question for the two of you…"><button type="button" data-a="qadd">Add</button></div>';
      cfg.qmine.forEach(function (q, i) { h += '<div class="qi"><span>' + esc(q) + '</span><button type="button" data-a="qdel" data-i="' + i + '" aria-label="Delete">✕</button></div>'; });

      h += '<h4>Our days card</h4><div class="lb">Title</div><input type="text" maxlength="24" data-in="tLabel" placeholder="Together for" value="' + esc(cfg.tLabel) + '">';
      h += '<div class="lb">Icon</div><div class="sg">' + EMOJIS.map(function (e) { return '<button type="button" data-a="set" data-k="tEmoji" data-v="' + e + '" class="' + (cfg.tEmoji === e ? 'on' : '') + '">' + (e || '❤️ Beating heart') + '</button>'; }).join('') + '</div>';
      h += '<div class="lb">Count in</div>' + seg('tUnit', [['days', 'Days'], ['weeks', 'Weeks'], ['months', 'Months'], ['ymd', 'Years + months']]);
      h += sw('tMile', 'Next milestone + progress bar');

      h += '<h4>Couple tools</h4><div class="lb">Info chips</div>';
      CHIPS.forEach(function (c) { h += sw('chips.' + c[0], c[1]); });
      h += '<div class="lb">Tiles</div>';
      TILES.forEach(function (t) { h += sw('tiles.' + t[0], t[1], '', true); });
    }

    h += '<h4>Chat list design</h4><div class="lb">Row style</div>' + seg('row', [['cards', 'Cards'], ['classic', 'Classic'], ['compact', 'Compact']]);
    h += '<div class="lb">Photo shape</div>' + seg('av', [['circle', 'Circle'], ['squircle', 'Rounded'], ['square', 'Square']]);
    h += '<div class="lb">Unread badge</div>' + seg('ubadge', [['pill', 'Number'], ['dot', 'Dot']]);
    h += sw('preview', 'Show last message') + sw('time', 'Show time') + sw('xbtn', 'Show ✕ remove button', 'Off = press and hold a chat to remove it');
    h += '<button type="button" class="rs" data-a="reset">Reset home to default</button>';
    return h;
  }
  var sheet = null;
  function render() { if (!sheet) return; var b = sheet.querySelector('.bd'), st = b.scrollTop; b.innerHTML = body(); b.scrollTop = st; }
  function openSheet() {
    closePop(); if (sheet) return;
    sheet = el('div'); sheet.id = 'h70Sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Customize home');
    sheet.innerHTML = '<div class="bg"></div><div class="cd"><div class="hd"><b>Customize home</b><button type="button" data-a="done">Done</button></div><div class="bd"></div></div>';
    document.body.appendChild(sheet); render();
    sheet.addEventListener('click', onSheet);
    sheet.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
  }
  function closeSheet() { if (!sheet) return; sheet.remove(); sheet = null; document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') closeSheet(); }
  function onInput(e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-in'); if (!k) return;
    cfg[k] = e.target.value; save(); clearTimeout(onInput.t); onInput.t = setTimeout(function () { apply(true); }, 250);
  }
  function onSheet(e) {
    if (e.target.classList.contains('bg')) return closeSheet();
    var b = e.target.closest('[data-a]'); if (!b || b.disabled) return; var a = b.getAttribute('data-a'), k = b.getAttribute('data-k');
    if (a === 'done') return closeSheet();
    if (a === 'set') { var v = b.getAttribute('data-v'); setp(k, v); }
    else if (a === 'tog') { var cur = !!getp(k); setp(k, cur ? 0 : 1); }
    else if (a === 'mv') { move(k, +b.getAttribute('data-d')); render(); return; }
    else if (a === 'qadd') { var inp = $('h70Qin'), t = inp ? inp.value.trim() : ''; if (!t) return; cfg.qmine.push(t.slice(0, 140)); if (cfg.qmine.length === 1) cfg.qsrc = 'mine'; }
    else if (a === 'qdel') { cfg.qmine.splice(+b.getAttribute('data-i'), 1); if (!cfg.qmine.length && cfg.qsrc === 'mine') cfg.qsrc = 'all'; }
    else if (a === 'reset') { if (!confirm('Reset all Home settings to default?')) return; cfg = merge(JSON.parse(JSON.stringify(DEF)), {}); sessQ = null; }
    else return;
    if (k === 'qsrc' || k === 'qmode') sessQ = null;
    save(); apply(true); render();
  }

  /* ------------------------------------------------------------ boot */
  apply(true);
  var boot = 0; new MutationObserver(function () { if (boot) return; boot = setTimeout(function () { boot = 0; decorate(); if (cfg.sec.greet && !$('h70Greet')) greet(); }, 120); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) greet(); });
  window.addEventListener('onlyus-plan', function () { setTimeout(decorate, 200); });
})();
