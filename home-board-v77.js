/* OnlyUs home-board-v77.js  -  the home screen as a glassy "iPhone home screen" board
   Layout (4 columns, like the reference):
     [ photo widget "Us" 2x2 ]  [Chat]    [Calls]
                                [sticker] [sticker]      <- your two animated stickers (cat in love + bird pair)
     [ calendar widget (month grid, today, anniversary day)  |  next-milestone widget ]
     [Games] [Our Space]        [ photo widget "Memories" 2x2 ]
     [Status] [Themes]
     [Sorry] [Maze] [Chess] [Little ones]  [Jar] + every Couple-tools tile ...
   The long "What you can do" list and the Couple tools list that used to sit one below another are now these tiles.
   Every tile just triggers what already exists (tabs, tools, games, sorry, pets, jar), so nothing is duplicated.
   Photos: tap the 📷 on a photo widget (stored on this phone, resized small). Stickers: tap them. Glass follows light / dark theme.
   Registered in Customize home as "Home board" so it can be hidden. Couples mode only. */
(function () {
  'use strict';
  if (window.__h77) return;
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var toast = function (m) { try { U().toast(m); } catch (e) { } };
  var STK = ['sticker-cat-love.svg', 'sticker-bird-pair.svg'];

  /* ------------------------------------------------------------ icons (line style, tinted by the tile) */
  var I = {
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/></svg>',
    calls: '<svg viewBox="0 0 24 24"><path d="M5 4h3l1.6 4-2 1.3a11 11 0 0 0 5.1 5.1L14 12.4l4 1.6v3a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    games: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5"/><circle cx="15.5" cy="11.5" r=".9"/><circle cx="18" cy="13.5" r=".9"/></svg>',
    space: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    status: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2" stroke-dasharray="3.2 2.4"/><circle cx="12" cy="12" r="3.3"/></svg>',
    themes: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.5-2.2-.5-1.2.2-2.3 1.5-2.3H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="8" cy="11" r="1.1"/><circle cx="11.5" cy="7.5" r="1.1"/><circle cx="16" cy="8.5" r="1.1"/></svg>',
    sorry: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    maze: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 20v-9h8v6h-4v-3"/></svg>',
    chess: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="2.8"/><path d="M8.6 19c.2-4 1.6-6 3.4-6s3.2 2 3.4 6zM6.5 19h11v2h-11z"/></svg>',
    pets: '<svg viewBox="0 0 24 24"><circle cx="7" cy="10.5" r="1.8"/><circle cx="11" cy="6.8" r="1.8"/><circle cx="15.5" cy="7.2" r="1.8"/><circle cx="18.6" cy="11.2" r="1.8"/><path d="M12 12.6c3 0 6 3 5 5.6-1 2-3 .9-5 .9s-4 1.1-5-.9c-1-2.600 2-5.600 5-5.600z"/></svg>',
    jar: '<svg viewBox="0 0 24 24"><path d="M8 3h8v3H8zM7 6h10v2c1.5 1 2 2 2 4v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6c0-2 .5-3 2-4z"/><path d="M12 17c-2-1.400-2-3.500 0-3.500s2 2.100 0 3.500z"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l1.6-2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/><path d="M12 17.300c-2.200-1.500-2.200-3.600 0-3.600s2.200 2.100 0 3.600z"/></svg>'
  };

  /* ------------------------------------------------------------ css */
  var css = [
    '.h77{position:relative;margin:12px 16px 26px;isolation:isolate;--g1:rgba(255,255,255,.78);--g2:rgba(255,255,255,.34);--gb:rgba(255,255,255,.75);--gs:color-mix(in srgb,var(--acc) 22%,transparent);--gt:var(--acc);--gi:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -10px 18px color-mix(in srgb,var(--acc) 7%,transparent)}',
    ':root[data-theme="dark"] .h77{--g1:rgba(255,255,255,.17);--g2:rgba(255,255,255,.05);--gb:rgba(255,255,255,.22);--gs:rgba(0,0,0,.35);--gt:color-mix(in srgb,var(--acc) 48%,#fff);--gi:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -10px 18px rgba(0,0,0,.18)}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .h77{--g1:rgba(255,255,255,.17);--g2:rgba(255,255,255,.05);--gb:rgba(255,255,255,.22);--gs:rgba(0,0,0,.35);--gt:color-mix(in srgb,var(--acc) 48%,#fff);--gi:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -10px 18px rgba(0,0,0,.18)}}',
    /* soft coloured light behind the glass so the blur has something to bend */
    '.h77::before{content:"";position:absolute;inset:-22px -16px;z-index:-1;border-radius:40px;pointer-events:none;background:radial-gradient(circle at 10% 6%,color-mix(in srgb,#ff9ecb 62%,transparent),transparent 44%),radial-gradient(circle at 94% 20%,color-mix(in srgb,#8fb4ff 62%,transparent),transparent 46%),radial-gradient(circle at 24% 62%,color-mix(in srgb,#c7a6ff 55%,transparent),transparent 46%),radial-gradient(circle at 90% 90%,color-mix(in srgb,#8ff0d4 48%,transparent),transparent 42%);filter:blur(14px);opacity:.85}',
    '.h77grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding-bottom:6px}',
    '.h77c{position:relative;min-width:0}.h77c.w2{grid-column:span 2;grid-row:span 2;aspect-ratio:1}.h77c.w4{grid-column:1/-1;grid-row:span 2;aspect-ratio:2/1}',
    '.h77l{position:absolute;left:-4px;right:-4px;top:100%;margin-top:4px;font-size:11.5px;line-height:14px;text-align:center;color:var(--ink);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.9}',
    /* glass surface */
    '.h77t,.h77w{background:linear-gradient(145deg,var(--g1),var(--g2));-webkit-backdrop-filter:blur(18px) saturate(1.7);backdrop-filter:blur(18px) saturate(1.7);border:1px solid var(--gb);box-shadow:0 10px 26px var(--gs),var(--gi);box-sizing:border-box}',
    '.h77t{all:unset;box-sizing:border-box;cursor:pointer;display:grid;place-items:center;width:100%;aspect-ratio:1;border-radius:24%;color:var(--gt);-webkit-tap-highlight-color:transparent;background:linear-gradient(145deg,var(--g1),var(--g2));-webkit-backdrop-filter:blur(18px) saturate(1.7);backdrop-filter:blur(18px) saturate(1.7);border:1px solid var(--gb);box-shadow:0 10px 26px var(--gs),var(--gi);transition:scale .18s ' + 'cubic-bezier(.3,1.5,.5,1)}',
    '.h77t:active,.h77st:active,.h77w.tap:active{scale:.92}',
    '.h77t svg{width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;overflow:visible}',
    '.h77t .ic{display:grid;place-items:center;width:52%;height:52%}.h77t .ic svg{width:100%;height:100%;stroke-width:inherit}',
    '.h77t i.pl{position:absolute;right:-3px;top:-3px;font:800 8px/1 system-ui;font-style:normal;padding:3px 5px;border-radius:9px;background:var(--acc);color:#fff;letter-spacing:.3px}',
    /* widgets */
    '.h77w{position:absolute;inset:0;border-radius:11%/11%;overflow:hidden;padding:0}',
    '.h77c.w4 .h77w{border-radius:26px}',
    '.h77w.ph{background-size:cover;background-position:center;cursor:pointer}',
    '.h77w.ph::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,rgba(20,8,40,.55));pointer-events:none}',
    '.h77w .cap{position:absolute;left:14px;right:14px;bottom:12px;z-index:2;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.45);line-height:1.1}.h77w .cap b{font-size:30px;font-weight:800;letter-spacing:-.5px}.h77w .cap span{display:block;font-size:12px;font-weight:600;margin-top:2px;opacity:.95}',
    '.h77cam{all:unset;cursor:pointer;position:absolute;right:9px;top:9px;z-index:3;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.26);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.5)}.h77cam svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    /* calendar widget */
    '.h77cal{display:grid;grid-template-columns:1.55fr 1fr;height:100%}',
    '.h77cal .cl{padding:12px 12px 10px 16px;min-width:0}.h77cal .mon{font-size:10.5px;font-weight:800;letter-spacing:1.4px;color:var(--gt)}',
    '.h77cal .dw,.h77cal .dd{display:grid;grid-template-columns:repeat(7,1fr);text-align:center}.h77cal .dw{margin-top:5px}.h77cal .dw i{font-style:normal;font-size:9px;color:var(--dim);font-weight:700;line-height:15px}',
    '.h77cal .dd i{font-style:normal;font-size:10.5px;line-height:19px;height:19px;color:var(--ink);position:relative}',
    '.h77cal .dd i.t{color:#fff;font-weight:800}.h77cal .dd i.t::before{content:"";position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:var(--acc);z-index:-1;box-shadow:0 3px 8px color-mix(in srgb,var(--acc) 55%,transparent)}',
    '.h77cal .dd i.a::after{content:"♥";position:absolute;left:0;right:0;top:-5px;font-size:6.5px;color:#ff4d86;line-height:7px}',
    '.h77cal .dd{position:relative;z-index:0}',
    '.h77cal .mile{border-left:1px solid color-mix(in srgb,var(--ink) 9%,transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;padding:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.h77cal .mile svg{width:26px;height:26px;fill:none;stroke:var(--gt);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;margin-bottom:2px}',
    '.h77cal .mile b{font-size:26px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.5px}.h77cal .mile span{font-size:10.5px;color:var(--dim);font-weight:600;line-height:1.2}',
    /* stickers */
    '.h77st{all:unset;cursor:pointer;display:block;width:100%;aspect-ratio:1;-webkit-tap-highlight-color:transparent;transition:scale .18s cubic-bezier(.3,1.5,.5,1);filter:drop-shadow(0 6px 10px color-mix(in srgb,var(--acc) 30%,transparent))}',
    '.h77st img{width:132%;height:132%;margin:-16%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none;animation:h77fl 4.6s ease-in-out infinite}',
    '.h77st.b img{animation-delay:-2.3s}',
    '@keyframes h77fl{0%,100%{translate:0 0;rotate:-2deg}50%{translate:0 -4px;rotate:2deg}}',
    '.h77st.pop img{animation:h77pop .6s cubic-bezier(.3,1.6,.5,1)}@keyframes h77pop{40%{scale:1.22;rotate:-6deg}100%{scale:1}}',
    '.h77hp{position:absolute;pointer-events:none;font-size:16px;color:#ff5d8f;animation:h77up 1.3s ease-out forwards;z-index:5}@keyframes h77up{0%{opacity:0;translate:0 0;scale:.6}15%{opacity:1}100%{opacity:0;translate:var(--dx,0) -70px;scale:1.2}}',
    /* entrance, only the first time the board is built */
    '.h77.in .h77c{animation:h77in .55s cubic-bezier(.2,.9,.3,1.2) backwards;animation-delay:calc(var(--i,0) * 38ms)}@keyframes h77in{from{opacity:0;scale:.82;translate:0 16px}}',
    /* the old one-below-another lists are replaced by the tiles */
    'html.h77-on #o68Tools,html.h77-on #o66Feat{display:none!important}',
    'html #vList #h77Board{order:2!important}html #vList .search-wrap{order:3}',
    /* bottom tab bar as a floating glass dock */
    '#tabNav{width:min(700px,calc(100vw - 20px))!important;bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;padding:6px 8px!important;border-radius:28px!important;border:1px solid rgba(255,255,255,.55)!important;background:color-mix(in srgb,var(--panel) 62%,transparent)!important;-webkit-backdrop-filter:blur(24px) saturate(1.7);backdrop-filter:blur(24px) saturate(1.7);box-shadow:0 12px 34px color-mix(in srgb,var(--acc) 22%,transparent),inset 0 1px 0 rgba(255,255,255,.7)!important}',
    ':root[data-theme="dark"] #tabNav{border-color:rgba(255,255,255,.16)!important}',
    '@media (prefers-reduced-motion:reduce){.h77 *{animation:none!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'v77board'; st.textContent = css; document.head.appendChild(st);

  /* ------------------------------------------------------------ actions */
  var tab = function (i) { try { window.__home52.goTab(i); } catch (e) { } };
  var contacts = function () { return (U().contacts && U().contacts()) || []; };
  var inChat = function () { var v = $('vChat'); return v && v.classList.contains('on'); };
  function withChat(fn) { if (inChat()) { fn(); return; } var c = contacts()[0]; if (!c) { toast('Add your partner first'); return; } try { U().open(c); } catch (e) { return; } setTimeout(fn, 520); }
  var scrollTo = function (sel) { var e = document.querySelector(sel); if (e && e.offsetParent !== null) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); else toast('That card is hidden. Turn it on in Customize home.'); };
  var ACT = {
    chat: function () { var c = $('cl'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    calls: function () { try { window.__home52.goAct('calls'); } catch (e) { } }, games: function () { tab(3); }, status: function () { try { window.__home52.goAct('status'); } catch (e) { } },
    space: function () { var b = $('tn_space'); if (b) b.click(); },
    themes: function () { if (window.__h70 && window.__h70.open) window.__h70.open(); else tab(4); },
    sorry: function () { withChat(function () { if (window.__sorry) window.__sorry.open(); }); },
    maze: function () { window.__gmWant = 'maze3d'; var g = $('gmHome'); if (g) g.click(); },
    chess: function () { withChat(function () { var t = $('toolChess'); if (t) t.click(); }); },
    pets: function () { scrollTo('#h75Pets'); }, jar: function () { scrollTo('#h75Jar'); }
  };
  var CORE = [['chat', 'Chat'], ['calls', 'Calls'], ['games', 'Games'], ['space', 'Our Space'], ['status', 'Status'], ['themes', 'Themes'], ['sorry', 'Sorry'], ['maze', 'Love Maze'], ['chess', 'Chess'], ['pets', 'Little ones'], ['jar', 'Reasons jar']];

  /* ------------------------------------------------------------ widgets */
  var DEFART = function (n) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (n === 1 ? '#ffd6e8' : '#d9d0ff') + '"/><stop offset="1" stop-color="' + (n === 1 ? '#b9a6ff' : '#9fd0ff') + '"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="170" cy="30" r="60" fill="#fff" opacity=".18"/><circle cx="20" cy="190" r="70" fill="#fff" opacity=".14"/>' +
      (n === 1 ? '<g transform="translate(18 40)"><ellipse cx="52" cy="104" rx="30" ry="18" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><path d="M20 62 24 30 44 46ZM84 62 80 30 60 46Z" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="52" cy="70" rx="34" ry="29" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="40" cy="70" r="3.4" fill="#3a2a2a"/><circle cx="64" cy="70" r="3.4" fill="#3a2a2a"/><ellipse cx="33" cy="79" rx="6" ry="3.6" fill="#ffb0c4"/><ellipse cx="71" cy="79" rx="6" ry="3.6" fill="#ffb0c4"/><path d="M47 78q2.500 3.500 5 0q2.500 3.500 5 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/></g><g transform="translate(92 28)"><ellipse cx="52" cy="112" rx="30" ry="18" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="38" cy="34" rx="9" ry="24" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="66" cy="34" rx="9" ry="24" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="38" cy="36" rx="4" ry="15" fill="#ffb7c8"/><ellipse cx="66" cy="36" rx="4" ry="15" fill="#ffb7c8"/><ellipse cx="52" cy="76" rx="31" ry="27" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="41" cy="76" r="3.4" fill="#3a2a2a"/><circle cx="63" cy="76" r="3.4" fill="#3a2a2a"/><ellipse cx="34" cy="85" rx="6" ry="3.6" fill="#ffb0c4"/><ellipse cx="70" cy="85" rx="6" ry="3.6" fill="#ffb0c4"/><path d="M47 84q2.500 3.500 5 0q2.500 3.500 5 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/></g><path d="M100 46c-9-6-9-16 0-16 3 0 6 2 6 5 0-3 3-5 6-5 9 0 9 10 0 16z" fill="#ff4d86" transform="translate(-4 -2)"/>'
        : '<g transform="translate(100 100)"><rect x="-44" y="-52" width="88" height="104" rx="8" fill="#fff" transform="rotate(-7)" opacity=".95"/><rect x="-36" y="-44" width="72" height="70" rx="5" fill="#ffc2dc" transform="rotate(-7)"/><path d="M0 8c-14-10-14-26 0-26 5 0 8 3 8 6 0-3 3-6 8-6 14 0 14 16 0 26z" fill="#ff4d86" transform="rotate(-7) translate(-6 -2) scale(1.1)"/></g>') + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
  };
  var P_KEY = { 1: 'onlyus-h77-p1', 2: 'onlyus-h77-p2' };
  function pickPhoto(n) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.cssText = 'position:fixed;left:-9999px;opacity:0';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      var r = new FileReader(); r.onload = function () {
        var im = new Image(); im.onload = function () {
          var S = 640, c = document.createElement('canvas'); c.width = c.height = S; var x = c.getContext('2d'), s = Math.min(im.width, im.height), sx = (im.width - s) / 2, sy = (im.height - s) / 2;
          x.drawImage(im, sx, sy, s, s, 0, 0, S, S); var d = c.toDataURL('image/jpeg', .8);
          if (d.length > 420000) d = c.toDataURL('image/jpeg', .6);
          ls(P_KEY[n], d); if (ls(P_KEY[n]) !== d) { toast('Photo is too big for this phone to keep. Try a smaller one.'); return; }
          rebuild(true); toast('Photo set 💗');
        }; im.onerror = function () { toast('Could not open that photo'); }; im.src = r.result;
      }; r.readAsDataURL(f);
    };
    document.body.appendChild(inp); inp.click();
  }
  var daysTog = function () { var s = ls('onlyus-since'); if (!s) return -1; var d = new Date(s + 'T00:00:00'); return isNaN(d) ? -1 : Math.floor((Date.now() - d.getTime()) / 864e5); };
  var MILE = [30, 50, 100, 150, 200, 250, 300, 365, 500, 600, 730, 1000, 1095, 1461, 1826, 2000, 2555, 3000, 3650];
  function mile() {
    var n = daysTog(); if (n < 0) return null; var next = 0; for (var i = 0; i < MILE.length; i++) if (MILE[i] > n) { next = MILE[i]; break; } if (!next) next = (Math.floor(n / 1000) + 1) * 1000;
    var best = { left: next - n, label: 'to ' + next + ' days 🎉' };
    var a = new Date(ls('onlyus-since') + 'T00:00:00'), t = new Date(); t.setHours(0, 0, 0, 0); var ny = new Date(t.getFullYear(), a.getMonth(), a.getDate()); if (ny <= t) ny.setFullYear(ny.getFullYear() + 1);
    var dA = Math.round((ny - t) / 864e5), yrs = ny.getFullYear() - a.getFullYear(); if (dA < best.left) best = { left: dA, label: 'to ' + yrs + (yrs === 1 ? ' year' : ' years') + ' 🎂' };
    return best;
  }
  function calHtml() {
    var d = new Date(), y = d.getFullYear(), m = d.getMonth(), first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate(), s = ls('onlyus-since'), sd = s ? +s.slice(8, 10) : 0, i, h = '';
    var mon = ''; try { mon = d.toLocaleString([], { month: 'long' }).toUpperCase(); } catch (e) { mon = ''; }
    h += '<div class="mon">' + esc(mon) + ' ' + y + '</div><div class="dw">' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (x) { return '<i>' + x + '</i>'; }).join('') + '</div><div class="dd">';
    for (i = 0; i < first; i++) h += '<i></i>';
    for (i = 1; i <= dim; i++) h += '<i class="' + (i === d.getDate() ? 't' : '') + (sd && i === sd ? ' a' : '') + '">' + i + '</i>';
    return h + '</div>';
  }
  function setDate() {
    var inp = document.createElement('input'); inp.type = 'date'; inp.max = new Date().toISOString().slice(0, 10); inp.value = ls('onlyus-since') || ''; inp.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:50%;top:50%';
    inp.onchange = function () { if (inp.value) { ls('onlyus-since', inp.value); rebuild(true); } inp.remove(); }; document.body.appendChild(inp); try { inp.showPicker ? inp.showPicker() : inp.click(); } catch (x) { inp.click(); }
  }

  /* ------------------------------------------------------------ build */
  var sig = '', built = 0, firstIn = 0;
  function toolTiles() {
    var out = []; document.querySelectorAll('#o68Tools .o68t').forEach(function (b) {
      var ic = b.querySelector('.ic'), t = b.querySelector('b'); if (!t) return;
      out.push({ id: 't:' + (b.dataset.t || t.textContent), label: t.textContent.trim(), icon: ic ? ic.innerHTML : '', lock: b.querySelector('.pill') ? b.querySelector('.pill').textContent : '', el: b });
    }); return out;
  }
  function tile(i, o) {
    return '<div class="h77c" style="--i:' + i + '"><button type="button" class="h77t" data-a="' + esc(o.id) + '" aria-label="' + esc(o.label) + '">' + (o.html || '<span class="ic">' + o.icon + '</span>') + (o.lock ? '<i class="pl">' + esc(o.lock) + '</i>' : '') + '</button><div class="h77l">' + esc(o.label) + '</div></div>';
  }
  function html() {
    var n = daysTog(), m = mile(), p1 = ls(P_KEY[1]), p2 = ls(P_KEY[2]), tools = toolTiles(), k = 0, h = '';
    var core = function (id) { var c = CORE.filter(function (x) { return x[0] === id; })[0]; return { id: c[0], label: c[1], html: I[c[0]] }; };
    var photo = function (num, label, big, sub) {
      var bg = (num === 1 ? p1 : p2) ? 'url(' + JSON.stringify(num === 1 ? p1 : p2) + ')' : DEFART(num);
      return '<div class="h77c w2" style="--i:' + (k++) + '"><div class="h77w ph tap" data-ph="' + num + '" style="background-image:' + bg.replace(/"/g, '&quot;') + '" role="button" aria-label="' + esc(label) + '"><button type="button" class="h77cam" data-cam="' + num + '" aria-label="Change photo">' + I.cam + '</button><div class="cap">' + (big ? '<b>' + esc(big) + '</b>' : '') + '<span>' + esc(sub) + '</span></div></div><div class="h77l">' + esc(label) + '</div></div>';
    };
    h += photo(1, 'Us', n >= 0 ? String(n) : '', n >= 0 ? 'days together 💞' : 'Set the day you met');
    h += tile(k++, core('chat')) + tile(k++, core('calls'));
    h += '<div class="h77c" style="--i:' + (k++) + '"><button type="button" class="h77st" data-st="0" aria-label="Sticker"><img alt="" decoding="async" data-src="' + STK[0] + '"></button></div>';
    h += '<div class="h77c" style="--i:' + (k++) + '"><button type="button" class="h77st b" data-st="1" aria-label="Sticker"><img alt="" decoding="async" data-src="' + STK[1] + '"></button></div>';
    h += '<div class="h77c w4" style="--i:' + (k++) + '"><div class="h77w"><div class="h77cal"><div class="cl">' + calHtml() + '</div><div class="mile" data-mile="1">' + I.cal + (m ? '<b>' + m.left + '</b><span>' + (m.left === 1 ? 'day ' : 'days ') + esc(m.label) + '</span>' : '<b>+</b><span>Add the day<br>you got together</span>') + '</div></div></div><div class="h77l">Our calendar</div></div>';
    h += tile(k++, core('games')) + tile(k++, core('space'));
    h += photo(2, 'Memories', '', p2 ? '' : 'Tap 📷 to add a photo');
    h += tile(k++, core('status')) + tile(k++, core('themes'));
    ['sorry', 'maze', 'chess', 'pets', 'jar'].forEach(function (id) { h += tile(k++, core(id)); });
    tools.forEach(function (t) { h += tile(k++, t); });
    return h;
  }
  function wireImgs(root) { root.querySelectorAll('img[data-src]').forEach(function (im) { if (!im.getAttribute('src')) im.src = im.dataset.src; }); }
  function rebuild(force) {
    var b = $('h77Board'); if (!b) return;
    var tools = toolTiles(), key = [daysTog(), new Date().toDateString(), !!ls(P_KEY[1]), !!ls(P_KEY[2]), ls(P_KEY[1]) ? ls(P_KEY[1]).length : 0, ls(P_KEY[2]) ? ls(P_KEY[2]).length : 0, tools.map(function (t) { return t.id + t.lock; }).join(','), ls('onlyus-since')].join('|');
    if (!force && key === sig) return; sig = key;
    var g = b.querySelector('.h77grid'); g.innerHTML = html(); wireImgs(g);
    if (!built) { built = 1; b.classList.add('in'); setTimeout(function () { b.classList.remove('in'); }, 1400); }
  }
  function mount() {
    var anchor = $('o64Together'), list = $('vList'); if (!anchor || !list || $('h77Board')) return !!$('h77Board');
    var b = document.createElement('div'); b.id = 'h77Board'; b.className = 'h77'; b.setAttribute('data-couple', ''); b.innerHTML = '<div class="h77grid"></div>';
    anchor.after(b);
    b.addEventListener('click', function (e) {
      var cam = e.target.closest('[data-cam]'); if (cam) { e.stopPropagation(); pickPhoto(+cam.dataset.cam); return; }
      var ph = e.target.closest('[data-ph]'); if (ph) { var n = +ph.dataset.ph; if (n === 1) { if (daysTog() < 0) setDate(); else ACT.space(); } else { ACT.space(); setTimeout(function () { var t = document.querySelector('#hubTabs [data-tab="memories"]'); if (t) t.click(); }, 420); } return; }
      if (e.target.closest('[data-mile]')) { if (daysTog() < 0) setDate(); else { ACT.space(); setTimeout(function () { var t = document.querySelector('#hubTabs [data-tab="dates"]'); if (t) t.click(); }, 420); } return; }
      var s = e.target.closest('[data-st]'); if (s) { s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); if (navigator.vibrate) try { navigator.vibrate(14); } catch (x) { } var r = s.getBoundingClientRect(), pr = b.getBoundingClientRect(); for (var i = 0; i < 5; i++) (function (i) { setTimeout(function () { var h = document.createElement('i'); h.className = 'h77hp'; h.textContent = ['♥', '💗', '✨', '💕', '♥'][i]; h.style.left = (r.left - pr.left + r.width * (.2 + Math.random() * .6)) + 'px'; h.style.top = (r.top - pr.top + r.height * .4) + 'px'; h.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); b.appendChild(h); setTimeout(function () { h.remove(); }, 1400); }, i * 70); })(i); return; }
      var t = e.target.closest('[data-a]'); if (!t) return; var id = t.dataset.a;
      if (id.indexOf('t:') === 0) { var o = toolTiles().filter(function (x) { return x.id === id; })[0]; if (o && o.el) o.el.click(); return; }
      if (ACT[id]) ACT[id]();
    });
    return true;
  }

  /* ------------------------------------------------------------ lifecycle */
  var tickN = 0;
  function tick() {
    var list = $('vList'), vis = !!(list && list.classList.contains('on')) && !document.hidden, b = $('h77Board');
    if (!vis) { if (b) b.querySelectorAll('.h77st img').forEach(function (im) { if (im.getAttribute('src')) im.removeAttribute('src'); }); return; }   /* stickers stop animating when home is not on screen */
    if (!b) { if (!mount()) return; b = $('h77Board'); }
    rebuild(false); wireImgs(b);
    document.documentElement.classList.toggle('h77-on', b.offsetParent !== null);
    tickN++;
  }
  setInterval(tick, 1500); setTimeout(tick, 500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(tick, 150); });
  window.__h77 = { tick: tick, rebuild: function () { rebuild(true); } };
})();
