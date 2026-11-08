/* OnlyUs home-cute-v75.js  -  three cute living cards for the couple home screen
   1) 🏝️ Our two islands : you and your partner on two floating islands. The sky over each island follows that person's local time
                           (sun, moon, stars). Between you: the distance if both of you share live location, else the time difference.
   2) 🐰🐱 Our little ones : a shared kitty + bunny. They nap at night, get hungry if nobody feeds them, jump when your partner opens the
                           app, hug when one of you sends a hug. Feed / hug / rename. Love level grows with every feed and hug.
   3) 🫙 Reasons I love you: a jar of little notes. Add a note (3 a day each), pull a random one, read all of them.
   Data lives in chats/{cid}/coupleHub/{pets|jar} (already allowed for chat members), tz_/loc_ docs are the ones the couple tools already write.
   Cards appear in couples mode, are registered in Customize home (hide / reorder) and pause when the app is hidden or the card is off screen. */
(function () {
  'use strict';
  if (window.__h75) return;
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } return null; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var toast = function (m) { try { U().toast(m); } catch (e) { } };
  var dayKey = function (t) { return new Date(t).toLocaleDateString('en-CA'); };
  var FV = function () { try { return window.firebase.firestore.FieldValue; } catch (e) { return null; } };

  /* ------------------------------------------------------------ css */
  var css = [
    '.h75card{content-visibility:auto;contain-intrinsic-size:auto 230px}',
    '.h75card .h75t{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.h75card .h75t b{font-size:16px;color:var(--ink)}.h75chip{font-size:12px;font-weight:700;padding:4px 10px;border-radius:99px;background:color-mix(in srgb,var(--acc) 14%,transparent);color:var(--acc);white-space:nowrap}',
    '.h75btns{display:flex;gap:8px;margin-top:10px}.h75btns button{all:unset;box-sizing:border-box;flex:1;text-align:center;cursor:pointer;padding:10px 6px;border-radius:14px;font-size:13.5px;font-weight:700;color:var(--ink);background:color-mix(in srgb,var(--ink) 6%,transparent);white-space:nowrap}.h75btns button.p{background:var(--acc);color:#fff}.h75btns button:active{transform:scale(.97)}.h75btns button.off{opacity:.55}',
    '.h75empty{font-size:14px;color:var(--dim);padding:6px 2px}',
    /* ---- islands ---- */
    '.h75isle{position:relative;height:172px;border-radius:18px;overflow:hidden;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}',
    '.h75isle .sky{position:absolute;top:0;bottom:0;width:50%;overflow:hidden}.h75isle .sky.L{left:0}.h75isle .sky.R{right:0}',
    '.sky.ph-night{background:linear-gradient(#1a1446,#3b2b7c)}.sky.ph-dawn{background:linear-gradient(#ff9a8b,#ffd9a8)}.sky.ph-day{background:linear-gradient(#5fbfff,#d9f2ff)}.sky.ph-dusk{background:linear-gradient(#7b5cff,#ff8f6b 70%,#ffc08a)}',
    '.sky i{position:absolute;display:none}.ph-night i.mn{display:block;right:22%;top:14%;width:26px;height:26px;border-radius:50%;background:#fff6d6;box-shadow:inset -8px -3px 0 0 #e2d4a0,0 0 18px #fff6d680}',
    '.ph-night i.st{display:block;inset:0;background-image:radial-gradient(1.4px 1.4px at 12% 20%,#fff,transparent),radial-gradient(1.2px 1.2px at 30% 55%,#fff,transparent),radial-gradient(1.5px 1.5px at 58% 18%,#ffe9a8,transparent),radial-gradient(1.2px 1.2px at 74% 48%,#fff,transparent),radial-gradient(1.3px 1.3px at 88% 26%,#fff,transparent),radial-gradient(1px 1px at 44% 36%,#fff,transparent);animation:h75tw 3.4s ease-in-out infinite}',
    '.ph-day i.sn,.ph-dawn i.sn,.ph-dusk i.sn{display:block;width:30px;height:30px;border-radius:50%;background:#ffe27a;box-shadow:0 0 26px #ffe27acc}.ph-day i.sn{right:20%;top:12%}.ph-dawn i.sn{left:14%;top:46%}.ph-dusk i.sn{right:14%;top:46%;background:#ffb06b;box-shadow:0 0 26px #ff8f6bcc}',
    '.sky i.cl{display:block;height:14px;width:46px;border-radius:12px;background:#ffffffcc;filter:blur(.6px);animation:h75cl 24s linear infinite}.sky i.cl.a{top:24%;left:-20%}.sky i.cl.b{top:42%;left:-60%;width:36px;animation-duration:34s;animation-delay:-12s}.ph-night i.cl{background:#ffffff22}',
    '@keyframes h75cl{to{transform:translateX(330px)}}@keyframes h75tw{50%{opacity:.45}}',
    '.h75isle svg.sc{position:absolute;inset:0;width:100%;height:100%}',
    '.h75isle .isl{animation:h75fl 4.2s ease-in-out infinite}.h75isle .isl.r{animation-delay:-2.1s}@keyframes h75fl{50%{transform:translateY(-4px)}}',
    '.h75isle .lab{position:absolute;bottom:5px;font-size:12px;line-height:1.15;color:#fff;text-shadow:0 1px 4px #0008;text-align:center;width:50%}.h75isle .lab.L{left:0}.h75isle .lab.R{right:0}.h75isle .lab b{display:block;font-size:13px}',
    '.h75isle .mid{position:absolute;left:50%;top:10px;transform:translateX(-50%);padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;color:#fff;background:#0006;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);white-space:nowrap}',
    /* ---- pets ---- */
    '.h75stage{position:relative;height:178px;border-radius:18px;overflow:hidden;background:linear-gradient(#bfe8ff,#fff4e0 75%);user-select:none;-webkit-user-select:none}.h75stage.night{background:linear-gradient(#1c1646,#3c2d7d)}',
    '.h75stage .grass{position:absolute;left:-10%;right:-10%;bottom:-34px;height:90px;border-radius:50%;background:radial-gradient(ellipse at 50% 0,#9be58d,#6fcf7e)}.h75stage.night .grass{background:radial-gradient(ellipse at 50% 0,#3f8f5a,#2c6e48)}',
    '.h75stage .fl{position:absolute;bottom:10px;font-size:14px}.h75stage .zz{position:absolute;font-size:15px;font-weight:800;color:#fff;opacity:0;pointer-events:none}.h75stage.night .zz{color:#cfd6ff}',
    '.h75pets{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;align-items:flex-end;gap:12px}',
    '.h75pet{position:relative;width:104px;text-align:center;cursor:pointer;transition:transform .45s cubic-bezier(.3,1.4,.5,1);-webkit-tap-highlight-color:transparent}',
    '.h75pet .svgw{animation:h75bob 3.2s ease-in-out infinite;transform-origin:50% 100%}.h75pet.cat .svgw{animation-delay:-1.4s}',
    '.h75pet svg{width:100%;display:block;overflow:visible}.h75pet .nm{display:block;margin-top:-4px;font-size:12px;font-weight:800;color:#5b4038;text-shadow:0 1px 0 #fff8}.h75stage.night .nm{color:#e9e4ff;text-shadow:none}',
    '@keyframes h75bob{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-3px) scale(1.015,.985)}}',
    '.h75pet .eh,.h75pet .ec,.h75pet .m-d{display:none}',
    '.h75stage.hap .eo,.h75stage.eat .eo{display:none}.h75stage.hap .eh,.h75stage.eat .eh{display:inline}',
    '.h75stage.slp .eo{display:none}.h75stage.slp .ec{display:inline}',
    '.h75stage.hun .m-s,.h75stage.sad .m-s{display:none}.h75stage.hun .m-d,.h75stage.sad .m-d{display:inline}',
    '.h75stage.hap .svgw,.h75stage.eat .svgw{animation:h75jump .55s ease-in-out 4}@keyframes h75jump{0%,100%{transform:translateY(0)}45%{transform:translateY(-18px) scale(.98,1.04)}}',
    '.h75stage.slp .svgw{animation:h75brt 4.2s ease-in-out infinite}@keyframes h75brt{50%{transform:scale(1.03,.97)}}',
    '.h75stage.slp .zz{animation:h75z 3s ease-in infinite}@keyframes h75z{0%{opacity:0;transform:translate(0,0) scale(.7)}30%{opacity:1}100%{opacity:0;transform:translate(14px,-30px) scale(1.2)}}',
    '.h75stage.sad .svgw,.h75stage.hun .svgw{animation:h75sad 3.6s ease-in-out infinite;transform:scaleY(.97)}@keyframes h75sad{50%{transform:translateY(1px) scaleY(.95)}}',
    '.h75stage.hug .h75pet.cat{transform:translateX(26px)}.h75stage.hug .h75pet.bun{transform:translateX(-26px)}',
    '.h75stage.spin .svgw{animation:h75spin .8s ease-in-out 1}@keyframes h75spin{to{transform:rotate(360deg)}}',
    '.h75say{position:absolute;top:10px;left:50%;transform:translate(-50%,-6px);max-width:86%;padding:7px 12px;border-radius:14px;background:#fff;color:#4a3a46;font-size:13px;font-weight:700;box-shadow:0 4px 14px #0003;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;text-align:center;z-index:3}.h75say.on{opacity:1;transform:translate(-50%,0)}',
    '.h75hp{position:absolute;pointer-events:none;font-size:18px;color:#ff5d8f;animation:h75up 1.5s ease-out forwards;z-index:4}@keyframes h75up{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translateY(-90px) scale(1.2) rotate(14deg)}}',
    '.h75status{margin-top:8px;font-size:13px;color:var(--dim);min-height:18px}',
    /* ---- jar ---- */
    '.h75jarrow{display:flex;gap:14px;align-items:center}.h75jar{flex:none;width:104px;cursor:pointer;-webkit-tap-highlight-color:transparent}.h75jar svg{width:100%;display:block;overflow:visible;animation:h75sway 5s ease-in-out infinite;transform-origin:50% 100%}@keyframes h75sway{50%{transform:rotate(1.6deg)}}',
    '.h75jar.pop svg{animation:h75shake .6s ease-in-out}@keyframes h75shake{20%{transform:rotate(-7deg)}45%{transform:rotate(6deg)}70%{transform:rotate(-3deg)}}',
    '.h75jarinfo{flex:1;min-width:0}.h75jarinfo p{margin:2px 0 0;font-size:13px;color:var(--dim);line-height:1.35}',
    '.h75new{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:99px;background:#ff5d8f;color:#fff;font-size:11px;font-weight:800;animation:h75pulse 1.6s ease-in-out infinite}@keyframes h75pulse{50%{transform:scale(1.12)}}',
    /* ---- dialogs ---- */
    '.h75ov{position:fixed;inset:0;z-index:2147482500;background:#0009;display:flex;align-items:center;justify-content:center;padding:18px;animation:h75fade .2s}@keyframes h75fade{from{opacity:0}}',
    '.h75box{width:100%;max-width:400px;max-height:84vh;overflow:auto;background:var(--bg);color:var(--ink);border-radius:24px;padding:20px;box-shadow:0 20px 60px #0007}.h75box h3{margin:0 0 6px;font-size:19px}.h75box p{margin:0 0 10px;color:var(--dim);font-size:13.5px}',
    '.h75box textarea{width:100%;box-sizing:border-box;min-height:96px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--ink) 5%,var(--bg));color:var(--ink);padding:12px;font:15px/1.4 system-ui,sans-serif;resize:none}',
    '.h75paper{margin:10px 0;padding:22px 20px;border-radius:6px 18px 6px 18px;background:#fff8df;color:#4b3b2a;font:600 18px/1.5 "Segoe Print","Comic Sans MS",system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px #0003;transform-origin:50% 0;animation:h75unf .6s cubic-bezier(.2,.9,.3,1.2)}@keyframes h75unf{from{transform:scaleY(.05) rotate(-4deg);opacity:0}}',
    '.h75from{font-size:12.5px;color:var(--dim);text-align:center;margin-bottom:4px}',
    '.h75li{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;margin-bottom:6px;border-radius:14px;background:color-mix(in srgb,var(--ink) 5%,var(--bg))}.h75li span{flex:1;font-size:14.5px;line-height:1.4;word-break:break-word}.h75li small{display:block;margin-top:3px;font-size:11px;color:var(--dim)}.h75li button{all:unset;cursor:pointer;color:var(--dim);padding:2px 6px}',
    '@media (prefers-reduced-motion:reduce){.h75card *{animation:none!important;transition:none!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'v75cute'; st.textContent = css; document.head.appendChild(st);

  /* ------------------------------------------------------------ couple context + docs */
  var C = null, ctxT = 0;
  async function getCtx() {
    if (C && Date.now() - ctxT < 60000 && C.uid === (U().uid && U().uid())) return C;
    var fs = U().fs && U().fs(), uid = U().uid && U().uid(); if (!fs || !uid) return (C = null);
    var cid = U().cid && U().cid(), pid = U().cuid && U().cuid(), nm = U().cname && U().cname();
    if (!cid || !pid) { var cs = (U().contacts && U().contacts()) || [], c = cs[0]; if (!c) return (C = null); try { cid = await U().cidOf(c); pid = c.uid; nm = c.name; } catch (e) { return (C = null); } }
    if (!cid || !pid) return (C = null);
    ctxT = Date.now();
    return (C = { fs: fs, uid: uid, cid: cid, pid: pid, pname: nm || 'Partner', name: ((U().me && U().me()) || {}).name || 'Me' });
  }
  var hub = function (c, id) { return c.fs.collection('chats').doc(c.cid).collection('coupleHub').doc(id); };
  var inc = function (n) { var f = FV(); return f && f.increment ? f.increment(n) : null; };

  /* ------------------------------------------------------------ cards: dom */
  var cards = {};
  function card(id, title) {
    var c = $(id); if (c) return c;
    c = document.createElement('div'); c.id = id; c.className = 'o64card h75card o64rv in'; c.setAttribute('data-couple', ''); c.setAttribute('data-h75', title);
    return c;
  }
  function mount() {
    var anchor = $('o64Together'), list = $('vList'); if (!anchor || !list || $('h75Isle')) return false;
    var a = card('h75Isle', 'isle'), b = card('h75Pets', 'pets'), c = card('h75Jar', 'jar');
    anchor.after(a); a.after(b); b.after(c);
    renderEmpty(); return true;
  }
  function renderEmpty() {
    ['h75Isle', 'h75Pets', 'h75Jar'].forEach(function (id) { var c = $(id); if (c && !c.dataset.ready) c.innerHTML = '<small>' + ({ h75Isle: 'Our two islands', h75Pets: 'Our little ones', h75Jar: 'Reasons I love you' })[id] + '</small><div class="h75empty">Add your partner and open your chat first. Then this card comes alive 💞</div>'; });
  }
  function burst(host, n, x0, x1) {
    for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { var h = document.createElement('i'); h.className = 'h75hp'; h.textContent = ['♥', '💗', '💕', '✨'][i % 4]; h.style.left = (x0 + Math.random() * (x1 - x0)) + '%'; h.style.bottom = (10 + Math.random() * 30) + '%'; h.style.fontSize = (14 + Math.random() * 12) + 'px'; host.appendChild(h); setTimeout(function () { h.remove(); }, 1600); }, i * 90); })(i);
  }

  /* ------------------------------------------------------------ 1) islands */
  var kitty = function (w) { return '<svg viewBox="0 0 120 120" width="' + w + '"><use href="#h75k"/></svg>'; };
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<g id="h75k"><ellipse cx="60" cy="102" rx="26" ry="17" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><path d="M84 104q18-4 16-22" fill="none" stroke="#5b4038" stroke-width="3.5" stroke-linecap="round"/><path d="M26 56 30 26 52 42ZM94 56 90 26 68 42Z" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5" stroke-linejoin="round"/><path d="M33 40 35 33 44 40ZM87 40 85 33 76 40Z" fill="#ffb7c8"/><ellipse cx="60" cy="66" rx="38" ry="31" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="46" cy="66" r="3.6" fill="#3a2a2a"/><circle cx="74" cy="66" r="3.6" fill="#3a2a2a"/><ellipse cx="38" cy="76" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><ellipse cx="82" cy="76" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><path d="M54 76q3 4 6 0q3 4 6 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/></g>' +
    '<g id="h75b"><ellipse cx="60" cy="102" rx="28" ry="17" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="90" cy="104" r="7" fill="#fffdfb" stroke="#5b4038" stroke-width="3"/><ellipse cx="44" cy="30" rx="10" ry="26" transform="rotate(-8 44 30)" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="76" cy="30" rx="10" ry="26" transform="rotate(8 76 30)" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="44" cy="32" rx="4.5" ry="16" transform="rotate(-8 44 32)" fill="#ffb7c8"/><ellipse cx="76" cy="32" rx="4.5" ry="16" transform="rotate(8 76 32)" fill="#ffb7c8"/><ellipse cx="60" cy="68" rx="34" ry="29" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="47" cy="68" r="3.6" fill="#3a2a2a"/><circle cx="73" cy="68" r="3.6" fill="#3a2a2a"/><ellipse cx="40" cy="78" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><ellipse cx="80" cy="78" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><path d="M55 78q2.5 3.5 5 0q2.5 3.5 5 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/></g>' +
    '</defs></svg>';
  var ISL = null, islT = 0, islDocs = { tz: null, myloc: null, ploc: null }, islLoaded = 0;
  function phase(tz) { var h; try { h = +new Date().toLocaleString('en-GB', { timeZone: tz || undefined, hour: '2-digit', hour12: false }) % 24; } catch (e) { h = new Date().getHours(); } return h < 5 || h >= 21 ? 'night' : h < 8 ? 'dawn' : h < 17 ? 'day' : 'dusk'; }
  function clock(tz) { try { return new Date().toLocaleTimeString([], { timeZone: tz || undefined, hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function offsetMin(tz) { try { var f = function (z) { var p = new Intl.DateTimeFormat('en-US', { timeZone: z, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date()), g = function (t) { return +p.filter(function (x) { return x.type === t; })[0].value; }; return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute')); }; return Math.round((f(tz) - f(Intl.DateTimeFormat().resolvedOptions().timeZone)) / 60000); } catch (e) { return 0; } }
  function km(a, b) { var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r, x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2); return 2 * R * Math.asin(Math.sqrt(x)); }
  function renderIsle() {
    var el = $('h75Isle'), c = C; if (!el || !c) return;
    var myTz = Intl.DateTimeFormat().resolvedOptions().timeZone, pTz = islDocs.tz && islDocs.tz.tz, pn = c.pname;
    var mid = '', ml = islDocs.myloc, pl = islDocs.ploc, fresh = function (x) { return x && x.on && x.lat != null && Date.now() - x.ts < 6 * 3600e3; };
    if (fresh(ml) && fresh(pl)) { var d = km(ml, pl); mid = d < 1 ? 'together 💞' : (d < 10 ? d.toFixed(1) : Math.round(d).toLocaleString()) + ' km apart'; }
    else if (pTz) { var o = offsetMin(pTz); mid = o === 0 ? 'same time zone' : (Math.floor(Math.abs(o) / 60) + 'h' + (Math.abs(o) % 60 ? ' ' + Math.abs(o) % 60 + 'm' : '') + (o > 0 ? ' ahead of you' : ' behind you')); }
    else mid = 'Add your partner';
    var key = [phase(myTz), phase(pTz || myTz), clock(myTz), clock(pTz), mid, pn].join('|'); if (el.dataset.k === key) return; el.dataset.k = key;
    var sky = function (p, side) { return '<div class="sky ' + side + ' ph-' + p + '"><i class="st"></i><i class="mn"></i><i class="sn"></i><i class="cl a"></i><i class="cl b"></i></div>'; };
    el.dataset.ready = '1';
    el.innerHTML = '<div class="h75t"><small style="margin:0">Our two islands</small><span class="h75chip">tap me 💗</span></div>' +
      '<div class="h75isle" id="h75IsleBox">' + sky(phase(myTz), 'L') + sky(phase(pTz || myTz), 'R') +
      '<svg class="sc" viewBox="0 0 340 172" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<path id="h75Path" d="M92 84 Q170 14 248 84" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>' +
      '<text font-size="15" text-anchor="middle"><animateMotion dur="5s" repeatCount="indefinite" rotate="0"><mpath href="#h75Path"/></animateMotion>💗</text>' +
      '<g transform="translate(0 -14)"><g class="isl" style="transform-origin:85px 130px"><ellipse cx="85" cy="128" rx="52" ry="12" fill="#7bd88f"/><path d="M33 128q52 54 104 0z" fill="#9b6a4a"/><path d="M60 140q25 20 50 0" fill="#7d5239" opacity=".6"/><g transform="translate(60 70) scale(.48)"><use href="#h75k"/></g><circle cx="122" cy="108" r="11" fill="#4fbf7a"/><rect x="120" y="116" width="4" height="12" fill="#7d5239"/></g></g>' +
      '<g transform="translate(0 -14)"><g class="isl r" style="transform-origin:255px 130px"><ellipse cx="255" cy="128" rx="52" ry="12" fill="#7bd88f"/><path d="M203 128q52 54 104 0z" fill="#9b6a4a"/><path d="M230 140q25 20 50 0" fill="#7d5239" opacity=".6"/><g transform="translate(228 70) scale(.48)"><use href="#h75b"/></g><circle cx="216" cy="112" r="3" fill="#ff7fb0"/><circle cx="224" cy="116" r="3" fill="#ffd166"/><circle cx="290" cy="114" r="3.2" fill="#ff7fb0"/></g></g></svg>' +
      '<div class="lab L"><b>You</b>' + esc(clock(myTz)) + '</div><div class="lab R"><b>' + esc(pn) + '</b>' + esc(pTz ? clock(pTz) : '--:--') + '</div><div class="mid">' + esc(mid) + '</div></div>';
    el.querySelector('#h75IsleBox').onclick = function (e) { burst(this, 8, 20, 80); if (navigator.vibrate) try { navigator.vibrate(15); } catch (x) { } };
  }
  function loadIsleDocs() {
    var c = C; if (!c || Date.now() - islT < 4 * 60e3 && islLoaded) return; islT = Date.now(); islLoaded = 1;
    hub(c, 'tz_' + c.pid).get().then(function (d) { islDocs.tz = d.exists ? d.data() : null; }).catch(function () { })
      .then(function () { return hub(c, 'loc_' + c.uid).get().then(function (d) { islDocs.myloc = d.exists ? d.data() : null; }).catch(function () { }); })
      .then(function () { return hub(c, 'loc_' + c.pid).get().then(function (d) { islDocs.ploc = d.exists ? d.data() : null; }).catch(function () { }); })
      .then(function () { var el = $('h75Isle'); if (el) el.dataset.k = ''; renderIsle(); });
  }

  /* ------------------------------------------------------------ 2) pets */
  var SAY = ['Naan unna miss pannuren 🥺', 'Innaikku saapteengala? 🍚', 'Rendu perum romba cute 💕', 'Konjam thanni kudiga 💧', 'Love you da 💗', 'Vaanga vilayaadalam 🎾', 'Oru hug kudunga 🤗', 'Ippo enna pannureenga? 👀', 'Sanda venaam, please 🥹', 'Chellam, vaa vaa 🐰'];
  var P = null, pets = { seenPid: 0, hugTs: 0, mounted: Date.now(), awake: 0, say: 0, taps: [], un: null, last: '' };
  function petSvg(kind) {
    var cat = kind === 'cat';
    var ears = cat ? '' : '';
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      (cat ? '<ellipse cx="60" cy="102" rx="26" ry="17" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><path d="M84 104q18-4 16-22" fill="none" stroke="#5b4038" stroke-width="3.5" stroke-linecap="round"/><path d="M26 56 30 26 52 42ZM94 56 90 26 68 42Z" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5" stroke-linejoin="round"/><path d="M33 40 35 33 44 40ZM87 40 85 33 76 40Z" fill="#ffb7c8"/><ellipse cx="60" cy="66" rx="38" ry="31" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/>' :
        '<ellipse cx="60" cy="102" rx="28" ry="17" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><circle cx="90" cy="104" r="7" fill="#fffdfb" stroke="#5b4038" stroke-width="3"/><ellipse cx="44" cy="30" rx="10" ry="26" transform="rotate(-8 44 30)" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="76" cy="30" rx="10" ry="26" transform="rotate(8 76 30)" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/><ellipse cx="44" cy="32" rx="4.5" ry="16" transform="rotate(-8 44 32)" fill="#ffb7c8"/><ellipse cx="76" cy="32" rx="4.5" ry="16" transform="rotate(8 76 32)" fill="#ffb7c8"/><ellipse cx="60" cy="68" rx="34" ry="29" fill="#fffdfb" stroke="#5b4038" stroke-width="3.5"/>') +
      (function () { var y = cat ? 66 : 68, xl = cat ? 46 : 47, xr = cat ? 74 : 73; return '<g class="eo"><circle cx="' + xl + '" cy="' + y + '" r="3.6" fill="#3a2a2a"/><circle cx="' + xr + '" cy="' + y + '" r="3.6" fill="#3a2a2a"/></g><g class="ec" fill="none" stroke="#3a2a2a" stroke-width="2.6" stroke-linecap="round"><path d="M' + (xl - 5) + ' ' + (y + 1) + 'q5 4 10 0M' + (xr - 5) + ' ' + (y + 1) + 'q5 4 10 0"/></g><g class="eh" fill="none" stroke="#3a2a2a" stroke-width="2.8" stroke-linecap="round"><path d="M' + (xl - 5) + ' ' + (y + 3) + 'q5-8 10 0M' + (xr - 5) + ' ' + (y + 3) + 'q5-8 10 0"/></g><ellipse cx="' + (cat ? 38 : 40) + '" cy="' + (y + 10) + '" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><ellipse cx="' + (cat ? 82 : 80) + '" cy="' + (y + 10) + '" rx="6.5" ry="4" fill="#ffb0c4" opacity=".85"/><path class="m-s" d="M' + (cat ? 54 : 55) + ' ' + (y + 10) + 'q3 4 6 0q3 4 6 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/><path class="m-d" d="M' + (cat ? 54 : 55) + ' ' + (y + 14) + 'q3-4 6 0q3-4 6 0" fill="none" stroke="#5b4038" stroke-width="3" stroke-linecap="round"/>' + (cat ? '<path d="M20 70h10M20 76l9-2M100 70h-10M100 76l-9-2" stroke="#5b4038" stroke-width="2" stroke-linecap="round"/>' : ''); })() +
      '</svg>';
  }
  function nowMood() {
    var d = P || {}, now = Date.now(), hr = new Date().getHours(), fed = d.fed || {}, last = Math.max(+d.born || now, +fed[C.uid] || 0, +fed[C.pid] || 0), hunger = (now - last) / 36e5;
    if (d.hug && now - d.hug.ts < 9000) return 'hug hap';
    if (pets.say > now) return 'hap';
    var here = d.seen && d.seen[C.pid] && now - d.seen[C.pid] < 100000;
    if (here && now - pets.seenAt < 8000) return 'hap';
    if ((hr >= 23 || hr < 6) && pets.awake < now) return 'slp';
    if (hunger > 18) return 'sad';
    if (hunger > 8) return 'hun';
    return '';
  }
  function statusText(m) {
    var d = P || {}, here = d.seen && d.seen[C.pid] && Date.now() - d.seen[C.pid] < 100000, nm = d.names || {};
    if (m.indexOf('hug') >= 0) return 'Group hug! 🤗';
    if (m === 'slp') return 'Shh… sleeping 🌙 (tap to wake)';
    if (m === 'sad') return (nm.cat || 'Kutty') + ' & ' + (nm.bun || 'Chellam') + ' are very hungry 🥺 Feed them 🍓';
    if (m === 'hun') return 'Tummies rumbling… 🍓';
    if (here) return esc(C.pname) + ' is here too 💕';
    return (nm.cat || 'Kutty') + ' & ' + (nm.bun || 'Chellam') + ' are playing 🌸';
  }
  function buildPets() {
    var el = $('h75Pets'); if (!el || !C || el.dataset.built === C.cid) return; el.dataset.built = C.cid; el.dataset.ready = '1';
    el.innerHTML = '<div class="h75t"><small style="margin:0">Our little ones</small><span class="h75chip" id="h75Lv">Lv 1</span></div>' +
      '<div class="h75stage" id="h75Stage"><div class="grass"></div><span class="fl" style="left:10%">🌼</span><span class="fl" style="left:86%">🌷</span><span class="fl" style="left:3%;bottom:40px">🌸</span>' +
      '<div class="h75say" id="h75Say"></div><div class="h75pets"><div class="h75pet cat" data-p="cat"><span class="zz" style="left:62%;top:6px">z</span><div class="svgw">' + petSvg('cat') + '</div><b class="nm" id="h75NmC">Kutty</b></div><div class="h75pet bun" data-p="bun"><span class="zz" style="left:62%;top:-4px">Z</span><div class="svgw">' + petSvg('bun') + '</div><b class="nm" id="h75NmB">Chellam</b></div></div></div>' +
      '<div class="h75status" id="h75St"></div><div class="h75btns"><button type="button" id="h75Feed" class="p">🍓 Feed</button><button type="button" id="h75Hug">🤗 Hug</button></div>';
    var stage = el.querySelector('#h75Stage');
    el.querySelectorAll('.h75pet').forEach(function (p) {
      p.onclick = function (e) {
        var n = Date.now(); pets.awake = n + 40000; pets.taps = pets.taps.filter(function (t) { return n - t < 1500; }); pets.taps.push(n);
        if (pets.taps.length >= 3) { pets.taps = []; stage.classList.add('spin'); setTimeout(function () { stage.classList.remove('spin'); }, 900); burst(stage, 10, 25, 75); }
        var q = el.querySelector('#h75Say'); q.textContent = SAY[(Math.random() * SAY.length) | 0]; q.classList.add('on'); pets.say = n + 2600; burst(stage, 3, 30, 70); paintPets(true);
        setTimeout(function () { q.classList.remove('on'); paintPets(true); }, 2700);
      };
    });
    el.querySelectorAll('.nm').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); rename(b.parentNode.dataset.p); }; });
    el.querySelector('#h75Feed').onclick = feed; el.querySelector('#h75Hug').onclick = hug;
  }
  function paintPets(force) {
    var el = $('h75Pets'), stage = el && el.querySelector('#h75Stage'); if (!stage || !C) return;
    var m = nowMood(), d = P || {}, nm = d.names || {}, hr = new Date().getHours(), night = hr >= 20 || hr < 6, love = +d.love || 0, lv = Math.floor(Math.sqrt(love / 2)) + 1;
    var cls = 'h75stage' + (night ? ' night' : '') + (m ? ' ' + m : ''); if (stage.className !== cls) stage.className = cls;
    var sx = statusText(m); var s = el.querySelector('#h75St'); if (s.innerHTML !== sx) s.innerHTML = sx;
    var a = el.querySelector('#h75NmC'), b = el.querySelector('#h75NmB'); if (a.textContent !== (nm.cat || 'Kutty')) a.textContent = nm.cat || 'Kutty'; if (b.textContent !== (nm.bun || 'Chellam')) b.textContent = nm.bun || 'Chellam';
    el.querySelector('#h75Lv').textContent = 'Lv ' + lv + ' · ' + love + ' 💗';
    var fed = d.fed && d.fed[C.uid], left = fed ? 4 * 36e5 - (Date.now() - fed) : 0, fb = el.querySelector('#h75Feed');
    if (left > 0) { var h = Math.floor(left / 36e5), mi = Math.ceil((left % 36e5) / 6e4); fb.textContent = '🍓 in ' + (h ? h + 'h ' : '') + mi + 'm'; fb.classList.add('off'); } else { fb.textContent = '🍓 Feed'; fb.classList.remove('off'); }
  }
  function setPets(patch) { if (!C) return Promise.resolve(); return hub(C, 'pets').set(patch, { merge: true }).catch(function () { toast('Could not save. Check your internet.'); }); }
  function feed() {
    var d = P || {}, fed = d.fed && d.fed[C.uid], left = fed ? 4 * 36e5 - (Date.now() - fed) : 0;
    if (left > 0) { toast('They are full 😋 Come back later'); return; }
    var stage = $('h75Stage'), o = { fed: {} }; o.fed[C.uid] = Date.now(); var i = inc(1); if (i) o.love = i; if (!d.born) o.born = Date.now();
    P = Object.assign({}, d, { fed: Object.assign({}, d.fed, o.fed), love: (+d.love || 0) + 1 }); stage.classList.add('eat'); setTimeout(function () { stage.classList.remove('eat'); }, 2400); burst(stage, 8, 30, 70); paintPets(true);
    setPets(o); if (!i) { /* no increment support: fallback */ setPets({ love: (+P.love || 0) }); }
  }
  function hug() {
    var d = P || {}, n = Date.now(); if (d.hug && d.hug.by === C.uid && n - d.hug.ts < 20000) { toast('Hug sent 🤗'); return; }
    var o = { hug: { by: C.uid, ts: n } }, i = inc(1); if (i) { o.hugs = i; o.love = i; } if (!d.born) o.born = n;
    P = Object.assign({}, d, { hug: o.hug }); hugAnim(); setPets(o); toast('Hug sent to ' + C.pname + ' 🤗');
  }
  function hugAnim() { var st = $('h75Stage'); if (!st) return; st.classList.add('hug', 'hap'); burst(st, 14, 10, 90); setTimeout(function () { st.classList.remove('hug', 'hap'); paintPets(true); }, 3200); }
  function rename(which) {
    var d = P || {}, nm = Object.assign({ cat: 'Kutty', bun: 'Chellam' }, d.names || {}), v = prompt('Name for the ' + (which === 'cat' ? 'kitty' : 'bunny') + ' (max 14 letters)', nm[which]); if (v == null) return; v = v.trim().slice(0, 14); if (!v) return;
    nm[which] = v; P = Object.assign({}, d, { names: nm }); paintPets(true); setPets({ names: nm });
  }
  function onPets(d) {
    var was = P; P = d || {};
    var now = Date.now(), sp = P.seen && P.seen[C.pid];
    if (sp && sp !== pets.seenPid) { var first = pets.seenPid === 0; pets.seenPid = sp; if (!first && now - sp < 100000) { pets.seenAt = now; if (navigator.vibrate) try { navigator.vibrate(18); } catch (e) { } } else if (first && now - sp < 100000) pets.seenAt = now; }
    if (P.hug && P.hug.by === C.pid && P.hug.ts > pets.mounted && P.hug.ts !== pets.hugTs) { pets.hugTs = P.hug.ts; hugAnim(); if (navigator.vibrate) try { navigator.vibrate([30, 40, 30]); } catch (e) { } toast(C.pname + ' sent you a hug 🤗'); }
    paintPets();
  }
  function heartbeat() {
    if (!C) return; var n = Date.now(); if (pets.hb && n - pets.hb < 75000) return; pets.hb = n; var o = { seen: {} }; o.seen[C.uid] = n; if (!P || !P.born) o.born = (P && P.born) || n; hub(C, 'pets').set(o, { merge: true }).catch(function () { });
  }

  /* ------------------------------------------------------------ 3) jar */
  var J = null, jar = { un: null, n: -1 };
  var NOTECOL = ['#ffd1dc', '#ffe9a8', '#c9f0d5', '#d5e1ff', '#f3d1ff', '#ffd9b8'];
  var jarSvg = function (n) {
    var k = Math.min(14, n), s = '';
    for (var i = 0; i < k; i++) { var x = 26 + (i * 37) % 52, y = 120 - Math.floor(i / 3) * 14 - (i % 3) * 4, r = ((i * 53) % 70) - 35; s += '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><rect x="-9" y="-6" width="18" height="12" rx="2" fill="' + NOTECOL[i % 6] + '" stroke="#00000022"/><path d="M0 2C-5-1-4-4 0-2 4-4 5-1 0 2z" fill="#ff5d8f"/></g>'; }
    return '<svg viewBox="0 0 104 140" aria-hidden="true"><rect x="20" y="8" width="64" height="16" rx="6" fill="#d9a066" stroke="#5b4038" stroke-width="3"/><path d="M26 24h52v8c14 8 18 20 18 36v54c0 8-6 14-14 14H22c-8 0-14-6-14-14V68c0-16 4-28 18-36z" fill="#ffffff55" stroke="#5b4038" stroke-width="3.2" stroke-linejoin="round"/>' + s + '<path d="M18 70v44" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/><text x="52" y="52" text-anchor="middle" font-size="15">💌</text></svg>';
  };
  function notes() { return (J && J.notes) || []; }
  function readSet() { try { return JSON.parse(ls('onlyus-jar-read-' + C.cid) || '[]') || []; } catch (e) { return []; } }
  function unread() { var r = readSet(); return notes().filter(function (x) { return x.by === C.pid && r.indexOf(x.id) < 0; }); }
  function buildJar() {
    var el = $('h75Jar'); if (!el || !C) return; var n = notes().length, un = unread().length, key = n + '|' + un + '|' + C.pname; if (el.dataset.k === key) return; el.dataset.k = key; el.dataset.ready = '1';
    var sub = n ? (n + (n === 1 ? ' note' : ' notes') + ' in the jar') : 'The jar is empty. Be the first to write one 💗';
    el.innerHTML = '<div class="h75t"><small style="margin:0">Reasons I love you</small>' + (un ? '<span class="h75new">' + un + ' new 💌</span>' : '') + '</div>' +
      '<div class="h75jarrow"><div class="h75jar" id="h75JarArt">' + jarSvg(n) + '</div><div class="h75jarinfo"><p>' + esc(sub) + '</p><p style="margin-top:6px">Write one small reason a day. Pull one out when you miss each other.</p></div></div>' +
      '<div class="h75btns"><button type="button" class="p" id="h75Pull">🎲 Pull a note</button><button type="button" id="h75Add">✍️ Add</button><button type="button" id="h75All">📖 All</button></div>';
    el.querySelector('#h75Pull').onclick = pull; el.querySelector('#h75JarArt').onclick = pull; el.querySelector('#h75Add').onclick = addNote; el.querySelector('#h75All').onclick = allNotes;
  }
  function ov(html, wire) { var o = document.createElement('div'); o.className = 'h75ov'; o.innerHTML = '<div class="h75box" role="dialog" aria-modal="true">' + html + '</div>'; o.addEventListener('click', function (e) { if (e.target === o) o.remove(); }); document.body.appendChild(o); if (wire) wire(o); return o; }
  var whoName = function (x) { return x.by === C.uid ? 'You' : C.pname; };
  var dateTxt = function (t) { try { return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  function pull() {
    var all = notes(); if (!all.length) { toast('The jar is empty. Add the first note ✍️'); return addNote(); }
    var art = $('h75JarArt'); if (art) { art.classList.add('pop'); setTimeout(function () { art.classList.remove('pop'); }, 700); }
    var r = readSet(), pool = all.filter(function (x) { return x.by === C.pid && r.indexOf(x.id) < 0; });
    if (!pool.length) pool = all.filter(function (x) { return x.by === C.pid; }); if (!pool.length) pool = all;
    var x = pool[(Math.random() * pool.length) | 0];
    if (r.indexOf(x.id) < 0) { r.push(x.id); ls('onlyus-jar-read-' + C.cid, JSON.stringify(r.slice(-400))); $('h75Jar') && ($('h75Jar').dataset.k = ''); buildJar(); }
    if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) { }
    ov('<div class="h75from">From ' + esc(whoName(x)) + ' · ' + esc(dateTxt(x.t)) + '</div><div class="h75paper">' + esc(x.x) + '</div><div class="h75btns"><button type="button" id="h75Again" class="p">🎲 Another</button><button type="button" id="h75Close">Close</button></div>', function (o) {
      o.querySelector('#h75Close').onclick = function () { o.remove(); }; o.querySelector('#h75Again').onclick = function () { o.remove(); pull(); };
    });
  }
  function addNote() {
    var today = dayKey(Date.now()), mine = notes().filter(function (x) { return x.by === C.uid && dayKey(x.t) === today; }).length;
    if (mine >= 3) { toast('3 notes a day is plenty. Come back tomorrow 💗'); return; }
    ov('<h3>A reason I love you ✍️</h3><p>Short and sweet. ' + esc(C.pname) + ' will find it in the jar. (' + (3 - mine) + ' left today)</p><textarea id="h75Tx" maxlength="200" placeholder="I love how you…"></textarea><div class="h75btns"><button type="button" id="h75Save" class="p">Put it in the jar 🫙</button><button type="button" id="h75X">Cancel</button></div>', function (o) {
      o.querySelector('#h75X').onclick = function () { o.remove(); }; var ta = o.querySelector('#h75Tx'); setTimeout(function () { ta.focus(); }, 80);
      o.querySelector('#h75Save').onclick = function () {
        var t = ta.value.trim(); if (!t) { toast('Write something sweet first'); return; } if (notes().length >= 300) { toast('The jar is full! Delete an old note first.'); return; }
        var note = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), by: C.uid, t: Date.now(), x: t.slice(0, 200) }, f = FV(), ref = hub(C, 'jar'), done = function () { o.remove(); toast('Added to the jar 💌'); var a = $('h75JarArt'); if (a) { a.classList.add('pop'); setTimeout(function () { a.classList.remove('pop'); }, 700); } };
        J = Object.assign({}, J, { notes: notes().concat([note]) }); buildJar();
        if (f && f.arrayUnion) ref.set({ notes: f.arrayUnion(note) }, { merge: true }).then(done).catch(function () { toast('Could not save. Check your internet.'); });
        else ref.get().then(function (d) { var cur = (d.exists && d.data().notes) || []; return ref.set({ notes: cur.concat([note]) }, { merge: true }); }).then(done).catch(function () { toast('Could not save. Check your internet.'); });
      };
    });
  }
  function allNotes() {
    var list = notes().slice().sort(function (a, b) { return b.t - a.t; });
    var r = readSet(); list.forEach(function (x) { if (r.indexOf(x.id) < 0) r.push(x.id); }); ls('onlyus-jar-read-' + C.cid, JSON.stringify(r.slice(-400))); var el = $('h75Jar'); if (el) { el.dataset.k = ''; buildJar(); }
    ov('<h3>All our reasons 💞</h3><p>' + list.length + ' in the jar</p><div id="h75Ls">' + (list.length ? list.map(function (x) { return '<div class="h75li" data-id="' + esc(x.id) + '"><span>' + esc(x.x) + '<small>' + esc(whoName(x)) + ' · ' + esc(dateTxt(x.t)) + '</small></span>' + (x.by === C.uid ? '<button type="button" aria-label="Delete" data-del="' + esc(x.id) + '">✕</button>' : '') + '</div>'; }).join('') : '<div class="h75empty">Nothing here yet.</div>') + '</div><div class="h75btns"><button type="button" id="h75Cl">Close</button></div>', function (o) {
      o.querySelector('#h75Cl').onclick = function () { o.remove(); };
      o.querySelector('#h75Ls').onclick = function (e) {
        var b = e.target.closest('[data-del]'); if (!b || !confirm('Take this note out of the jar?')) return; var id = b.dataset.del, ref = hub(C, 'jar');
        ref.get().then(function (d) { var cur = (d.exists && d.data().notes) || []; return ref.set({ notes: cur.filter(function (x) { return x.id !== id; }) }, { merge: true }); }).then(function () { var row = o.querySelector('[data-id="' + id + '"]'); row && row.remove(); }).catch(function () { toast('Could not delete'); });
      };
    });
  }
  function onJar(d) {
    var prev = jar.n; J = d || {}; var n = notes().length;
    if (prev >= 0 && n > prev) { var last = notes().slice().sort(function (a, b) { return b.t - a.t; })[0]; if (last && last.by === C.pid) { toast('💌 ' + C.pname + ' put a new note in the jar'); var a = $('h75JarArt'); if (a) { a.classList.add('pop'); setTimeout(function () { a.classList.remove('pop'); }, 700); } } }
    jar.n = n; var el = $('h75Jar'); if (el) el.dataset.k = ''; buildJar();
  }

  /* ------------------------------------------------------------ lifecycle */
  var started = '', tickN = 0;
  function stop() { if (pets.un) { pets.un(); pets.un = null; } if (jar.un) { jar.un(); jar.un = null; } started = ''; pets.hb = 0; pets.seenPid = 0; jar.n = -1; }
  function start() {
    getCtx().then(function (c) {
      if (!c) { renderEmpty(); return; } var key = c.uid + '|' + c.cid; if (started === key) return; stop(); started = key; pets.mounted = Date.now();
      ['h75Isle', 'h75Pets', 'h75Jar'].forEach(function (id) { var e = $(id); if (e) { e.dataset.ready = ''; e.dataset.built = ''; e.dataset.k = ''; } });
      var host = $('h75Isle'); if (host && !document.getElementById('h75Defs')) { var d = document.createElement('div'); d.id = 'h75Defs'; d.innerHTML = DEFS; document.body.appendChild(d); }
      islLoaded = 0; renderIsle(); loadIsleDocs(); buildPets(); paintPets(); buildJar();
      pets.un = hub(c, 'pets').onSnapshot(function (s) { onPets(s.exists ? s.data() : {}); }, function () { });
      jar.un = hub(c, 'jar').onSnapshot(function (s) { onJar(s.exists ? s.data() : {}); }, function () { });
      heartbeat();
    });
  }
  function tick() {
    var list = $('vList'), vis = list && list.classList.contains('on') && !document.hidden;
    if (!vis) { if (started) stop(); return; }
    if (!$('h75Isle')) { if (!mount()) return; }
    if (!started) { start(); return; }
    tickN++; if (C) { if (tickN % 120 === 0) loadIsleDocs(); paintPets(); heartbeat(); renderIsle(); }
  }
  setInterval(tick, 2000); setTimeout(tick, 600);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { islT = 0; setTimeout(tick, 200); } });
  window.__h75 = { tick: tick, stop: stop };
})();
