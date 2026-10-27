/* OnlyUs couple-v68.js  -  "Couple tools" on the home screen
   Free : streak, partner time and weather, countdown, daily question (answer together), live map (1 hour at a time)
   Pro  : bucket list, time capsule, year recap, live map without the 1 hour limit
   Plus : AI helpers (date planner, love letter), safe arrival, private vault
   Shared data lives in chats/{cid}/coupleHub/* (readable and writable only by the two chat members, not when blocked).
   Note: those documents are not end-to-end encrypted, so do not put secrets in them.                                */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };
  var U = function () { return window.__us || {}; };
  var toast = function (s) { try { U().toast(s); } catch (e) { } };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var RANK = { free: 0, pro: 1, plus: 2 };
  var plan = function () { return window.__plan ? window.__plan.get() : 'free'; };
  var dayKey = function (t) { return new Date(t).toLocaleDateString('en-CA'); };
  function allow(tier, why) { if (RANK[plan()] >= RANK[tier]) return true; if (window.__plan) window.__plan.paywall(why); return false; }
  function dlg(html, wire) { var o = el('div', 'o67ov'); o.innerHTML = '<div class="o67box" role="dialog">' + html + '</div>'; o.addEventListener('click', function (e) { if (e.target === o) o.remove(); }); document.body.appendChild(o); if (wire) wire(o); return o; }
  function onClose(o, fn) { var mo = new MutationObserver(function () { if (!document.body.contains(o)) { try { fn(); } catch (e) { } mo.disconnect(); } }); mo.observe(document.body, { childList: true }); }
  function ago(t) { var s = Math.max(0, (Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; }

  /* ---------- who am I chatting with ---------- */
  async function ctx() {
    var fs = U().fs && U().fs(), uid = U().uid && U().uid(); if (!fs || !uid) return null;
    var cid = U().cid && U().cid(), pid = U().cuid && U().cuid(), nm = U().cname && U().cname();
    if (!cid || !pid) { var cs = (U().contacts && U().contacts()) || [], c = cs[0]; if (!c) return null; try { cid = await U().cidOf(c); pid = c.uid; nm = c.name; } catch (e) { return null; } }
    if (!cid || !pid) return null;
    return { fs: fs, uid: uid, cid: cid, pid: pid, pname: nm || 'Partner', name: ((U().me && U().me()) || {}).name || 'Me' };
  }
  var hubCol = function (c) { return c.fs.collection('chats').doc(c.cid).collection('coupleHub'); };
  var hub = function (c, id) { return hubCol(c).doc(id); };
  var msgsQ = function (c, n) { return c.fs.collection('chats').doc(c.cid).collection('messages').orderBy('ts', 'desc').limit(n); };
  async function needChat() { var c = await ctx(); if (!c) toast('Add your partner and open your chat first.'); return c; }
  var bothDays = function (qs) { var d = {}; qs.forEach(function (x) { var m = x.data(); if (!m.ts || !m.fromUid) return; var k = dayKey(m.ts); (d[k] = d[k] || {})[m.fromUid] = 1; }); return d; };

  /* ---------- styles ---------- */
  var css = el('style');
  css.textContent = [
    '#o68Tools{margin:6px 0 10px}.o68h{margin:18px 18px 8px;font-size:19px;font-weight:800;color:var(--ink)}',
    '.o68strip{display:flex;gap:8px;margin:0 14px 10px;overflow-x:auto;scrollbar-width:none}.o68strip::-webkit-scrollbar{display:none}',
    '.o68chip{flex:none;padding:10px 14px;border-radius:16px;background:var(--panel);border:1px solid var(--line);font-size:13px;color:var(--ink);white-space:nowrap}.o68chip b{display:block;font-size:17px;color:var(--acc)}.o68chip small{color:var(--dim)}',
    '.o68grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 14px}',
    '.o68t{all:unset;cursor:pointer;position:relative;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;padding:14px;border-radius:20px;background:var(--panel);border:1px solid var(--line);box-shadow:0 6px 18px rgba(80,40,150,.1);animation:o66in .5s ease both;animation-delay:calc(var(--i) * 60ms)}.o68t:active{transform:scale(.97)}',
    '.o68t .ic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--acc),#ff6fa8)}.o68t .ic svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.o68t b{font-size:15px;color:var(--ink)}.o68t span{font-size:12px;line-height:1.35;color:var(--dim)}.o68t .pill{position:absolute;top:10px;inset-inline-end:10px;font-size:10px;font-weight:800;color:#fff;background:linear-gradient(135deg,#ff6fa8,#ff8f6b);padding:2px 8px;border-radius:999px}',
    '.o68t:hover .ic,.o68t:active .ic{animation:o66bb 1s ease-in-out}',
    '.o68list{list-style:none;margin:10px 0 0;padding:0}.o68list li{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line,#eee);font-size:15px}.o68list li.done span{text-decoration:line-through;opacity:.55}.o68list li span{flex:1}.o68list button{all:unset;cursor:pointer;color:#d93a4a;font-size:18px;padding:0 6px}',
    '.o68bar{height:8px;border-radius:9px;background:color-mix(in srgb,var(--acc,#8657d9) 14%,transparent);overflow:hidden;margin:8px 0}.o68bar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc,#8657d9),#ff6fa8);transition:width .6s}',
    '.o68ans{margin:10px 0;padding:12px;border-radius:14px;background:color-mix(in srgb,var(--acc,#8657d9) 10%,transparent);font-size:15px;line-height:1.4}.o68ans small{display:block;color:var(--dim,#667);font-weight:700;margin-bottom:3px}',
    '.o68big{font-size:46px;font-weight:800;color:var(--acc,#8657d9);line-height:1.1}.o68mon{display:flex;align-items:flex-end;gap:5px;height:90px;margin:10px 0}.o68mon i{flex:1;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#ff6fa8,var(--acc,#8657d9));min-height:3px}',
    '.o68stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.o68stats div{padding:12px;border-radius:14px;background:color-mix(in srgb,var(--acc,#8657d9) 10%,transparent);font-size:12px;color:var(--dim,#667)}.o68stats b{display:block;font-size:20px;color:var(--ink,#222)}',
    '.o68th{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.o68th img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px}',
    /* map */
    '#o68Map{position:fixed;inset:0;z-index:2147482000;background:var(--bg,#f6f1ff);display:flex;flex-direction:column;animation:o66fade .25s}',
    '#o68Map .mh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:var(--hd,#8657d9);color:#fff}#o68Map .mh b{flex:1;font-size:18px}#o68Map .mh button{all:unset;cursor:pointer;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.2);font-weight:700;font-size:14px}',
    '#o68Mv{flex:1;position:relative;min-height:200px;background:#e9f4ee}#o68Mv svg.cm{width:100%;height:100%;display:block}',
    '#o68Dock{padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));background:var(--panel,#fff);border-radius:22px 22px 0 0;box-shadow:0 -8px 24px rgba(0,0,0,.12);margin-top:-18px;position:relative;z-index:500}',
    '#o68Dock .dist{font-size:22px;font-weight:800;color:var(--ink)}#o68Dock .sub{font-size:13px;color:var(--dim);margin:2px 0 10px}',
    '.o68on{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;background:#e6f9ee;color:#18794e;font-weight:700;font-size:13px;margin-bottom:10px}.o68on i{width:9px;height:9px;border-radius:50%;background:#2bc16b;animation:o66pl 1.4s infinite}',
    '.o68pin{position:relative;width:44px;height:52px;text-align:center}.o68pin i{display:block;width:44px;height:44px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:linear-gradient(135deg,#ff6fa8,#8657d9);box-shadow:0 6px 14px rgba(80,40,150,.4);border:3px solid #fff}.o68pin b{position:absolute;left:0;right:0;top:9px;color:#fff;font-size:18px}.o68pin.p i{background:linear-gradient(135deg,#4facfe,#00c6ff)}.o68pin::after{content:"";position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-26px 0 0 -22px;border-radius:50%;border:2px solid rgba(255,111,168,.6);animation:o66hl 2s ease-out infinite}',
    '.o68hl{stroke:#ff5c8d;stroke-width:3;stroke-dasharray:2 9;stroke-linecap:round;animation:o68dash 1.2s linear infinite}@keyframes o68dash{to{stroke-dashoffset:-22}}',
    '.leaflet-container{font-family:inherit}#o68Mv .leaflet-tile-pane{filter:saturate(.8) hue-rotate(-10deg) brightness(1.04)}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- tiles ---------- */
  var IC = {
    map: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    count: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
    qa: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .7-1 1.4M12 15h.01"/></svg>',
    bucket: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/></svg>',
    cap: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/></svg>',
    recap: '<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    ai: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
    arrive: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    vault: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };
  var TILES = [
    ['map', 'Live map', 'See each other on a cute map', 'free', openMap, 'Live map is part of Couple Pro.'],
    ['count', 'Countdown', 'Days to your next meeting', 'free', openCountdown],
    ['qa', 'Daily question', 'Answer together, then reveal', 'free', openQA],
    ['bucket', 'Bucket list', 'Dreams to tick off together', 'pro', openBucket, 'The bucket list is part of Couple Pro.'],
    ['cap', 'Time capsule', 'Letters that open on a date', 'pro', openCapsule, 'Time capsule letters are part of Couple Pro.'],
    ['recap', 'Year recap', 'Your chat in numbers', 'pro', openRecap, 'The recap is part of Couple Pro.'],
    ['ai', 'AI helpers', 'Date planner and love letters', 'plus', openAI, 'AI helpers are part of Couple Pro Plus.'],
    ['arrive', 'Safe arrival', 'Tell them you reached safely', 'plus', openArrive, 'Safe arrival is part of Couple Pro Plus.'],
    ['vault', 'Private vault', 'PIN-locked notes and photos', 'plus', openVault, 'The private vault is part of Couple Pro Plus.']
  ];
  function build() {
    var list = $('vList'); if (!list) return;
    var w = $('o68Tools'); if (!w) { w = el('div'); w.id = 'o68Tools'; w.setAttribute('data-couple', ''); var a = $('o64Scenes'); if (a) a.after(w); else list.appendChild(w); }
    var h = '<div class="o68h">Couple tools</div><div class="o68strip" id="o68Strip"></div><div class="o68grid">';
    TILES.forEach(function (t, i) { var lock = RANK[plan()] < RANK[t[3]]; h += '<button type="button" class="o68t" style="--i:' + i + '" data-t="' + t[0] + '"><div class="ic">' + IC[t[0]] + '</div><b>' + t[1] + '</b><span id="o68s-' + t[0] + '">' + t[2] + '</span>' + (lock ? '<em class="pill" style="font-style:normal">' + (t[3] === 'plus' ? 'PLUS' : 'PRO') + '</em>' : '') + '</button>'; });
    w.innerHTML = h + '</div>';
    w.onclick = function (e) { var b = e.target.closest('.o68t'); if (!b) return; var t = TILES.filter(function (x) { return x[0] === b.getAttribute('data-t'); })[0]; if (allow(t[3], t[5])) t[4](); };
    strip();
  }

  /* ---------- status strip: streak, partner time, weather, safe arrival ---------- */
  var WX = function (c) { return c === 0 ? 'Clear' : c < 4 ? 'Cloudy' : c < 50 ? 'Fog' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 90 ? 'Showers' : 'Storm'; };
  async function strip() {
    var s = $('o68Strip'); if (!s) return; var c = await ctx(); if (!c) { s.innerHTML = '<div class="o68chip"><small>Add your partner to see your streak, their local time and more.</small></div>'; return; }
    var chips = {}, draw = function () { s.innerHTML = ['streak', 'time', 'wx', 'arr'].map(function (k) { return chips[k] || ''; }).join(''); };
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone, k = 'o68tz' + c.uid;
    if (ls(k) !== dayKey(Date.now())) { hub(c, 'tz_' + c.uid).set({ tz: tz, ts: Date.now(), name: c.name }).then(function () { ls(k, dayKey(Date.now())); }).catch(function () { }); }
    var sk = JSON.parse(ls('o68streak') || 'null');
    if (sk && sk.d === dayKey(Date.now()) && sk.c === c.cid) { chips.streak = '<div class="o68chip"><b>' + sk.n + ' day' + (sk.n === 1 ? '' : 's') + '</b><small>chat streak</small></div>'; draw(); }
    else msgsQ(c, 300).get().then(function (q) {
      var d = bothDays(q), t = new Date(), n = 0, ok = function (x) { return d[dayKey(+x)] && Object.keys(d[dayKey(+x)]).length >= 2; };
      if (!ok(t)) t.setDate(t.getDate() - 1); while (ok(t)) { n++; t.setDate(t.getDate() - 1); }
      ls('o68streak', JSON.stringify({ d: dayKey(Date.now()), c: c.cid, n: n })); chips.streak = '<div class="o68chip"><b>' + n + ' day' + (n === 1 ? '' : 's') + '</b><small>chat streak</small></div>'; draw();
    }).catch(function () { });
    hub(c, 'tz_' + c.pid).get().then(function (d) { if (!d.exists || !d.data().tz) return; try { chips.time = '<div class="o68chip"><b>' + new Date().toLocaleTimeString([], { timeZone: d.data().tz, hour: 'numeric', minute: '2-digit' }) + '</b><small>' + esc(c.pname) + "'s time</small></div>"; draw(); } catch (e) { } }).catch(function () { });
    hub(c, 'loc_' + c.pid).get().then(function (d) { var x = d.exists && d.data(); if (!x || !x.on || Date.now() - x.ts > 6 * 3600e3) return; return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + x.lat.toFixed(2) + '&longitude=' + x.lng.toFixed(2) + '&current=temperature_2m,weather_code').then(function (r) { return r.json(); }).then(function (j) { if (!j.current) return; chips.wx = '<div class="o68chip"><b>' + Math.round(j.current.temperature_2m) + '\u00b0C</b><small>' + WX(j.current.weather_code) + ' where ' + esc(c.pname) + ' is</small></div>'; draw(); }); }).catch(function () { });
    hub(c, 'arrival').get().then(function (d) { var x = d.exists && d.data(); if (!x || x.by !== c.pid || Date.now() - x.ts > 12 * 3600e3) return; chips.arr = '<div class="o68chip"><b>Reached safely</b><small>' + esc(x.name || c.pname) + ' \u00b7 ' + ago(x.ts) + (x.note ? ' \u00b7 ' + esc(x.note) : '') + '</small></div>'; draw(); }).catch(function () { });
    hub(c, 'countdown').get().then(function (d) { var x = d.exists && d.data(), t = $('o68s-count'); if (x && x.date && t) { var n = Math.ceil((new Date(x.date + 'T00:00:00') - Date.now()) / 864e5); t.textContent = n > 0 ? n + ' days to ' + x.title : n === 0 ? x.title + ' is today!' : x.title + ' was ' + (-n) + ' days ago'; } }).catch(function () { });
  }

  /* ---------- countdown ---------- */
  async function openCountdown() {
    var c = await needChat(); if (!c) return; var ref = hub(c, 'countdown'), cur = (await ref.get().catch(function () { return null; })), x = cur && cur.exists ? cur.data() : {};
    dlg('<h3>Countdown</h3><p>Count the days to your next meeting, a trip or an anniversary. Both of you see it.</p><input class="o67in" id="o68Ti" maxlength="40" placeholder="What are you waiting for?" value="' + esc(x.title || '') + '"><input class="o67in" id="o68Dt" type="date" value="' + esc(x.date || '') + '"><div class="o67row"><button class="o67b alt" type="button" data-rm>Remove</button><button class="o67b" type="button" data-ok>Save</button></div>', function (o) {
      o.querySelector('[data-ok]').onclick = function () { var t = $('o68Ti').value.trim(), d = $('o68Dt').value; if (!t || !d) { toast('Add a name and a date.'); return; } ref.set({ title: t.slice(0, 40), date: d, by: c.uid }).then(function () { toast('Saved'); o.remove(); strip(); }).catch(function () { toast('Could not save.'); }); };
      o.querySelector('[data-rm]').onclick = function () { ref.delete().then(function () { o.remove(); var s = $('o68s-count'); if (s) s.textContent = 'Days to your next meeting'; }).catch(function () { }); };
    });
  }

  /* ---------- daily question, answered together ---------- */
  async function openQA() {
    var c = await needChat(); if (!c) return; var q = (window.__o64 && window.__o64.question && window.__o64.question()) || 'What made you smile today?', ref = hub(c, 'qa_' + dayKey(Date.now()));
    var o = dlg('<h3>Question of the day</h3><p style="font-size:17px;color:var(--ink)">' + esc(q) + '</p><div id="o68Qa"></div>');
    var un = ref.onSnapshot(function (d) {
      var a = (d.exists && d.data().answers) || {}, mine = a[c.uid], her = a[c.pid], box = $('o68Qa'); if (!box) return;
      if (!mine) { box.innerHTML = '<textarea class="o67in" id="o68A" rows="3" maxlength="400" placeholder="Your answer"></textarea><p>' + (her ? esc(c.pname) + ' has answered. Answer to see it.' : 'Both answers are shown once you have both answered.') + '</p><div class="o67row"><button class="o67b" type="button" id="o68Sa">Send my answer</button></div>'; $('o68Sa').onclick = function () { var t = $('o68A').value.trim(); if (!t) return; var m = { answers: {} }; m.q = q; m.answers[c.uid] = { t: t, ts: Date.now() }; ref.set(m, { merge: true }).catch(function () { toast('Could not send.'); }); }; }
      else box.innerHTML = '<div class="o68ans"><small>You</small>' + esc(mine.t) + '</div>' + (her ? '<div class="o68ans"><small>' + esc(c.pname) + '</small>' + esc(her.t) + '</div>' : '<p>Waiting for ' + esc(c.pname) + ' to answer.</p>');
    }, function () { });
    onClose(o, un);
  }

  /* ---------- bucket list (Pro) ---------- */
  async function openBucket() {
    var c = await needChat(); if (!c) return; var ref = hub(c, 'bucket'), items = [];
    var o = dlg('<h3>Our bucket list</h3><div class="o68bar"><i id="o68Bp" style="width:0"></i></div><small id="o68Bc" style="color:var(--dim)"></small><ul class="o68list" id="o68Bl"></ul><input class="o67in" id="o68Bi" maxlength="80" placeholder="Add something to do together"><div class="o67row"><button class="o67b" type="button" id="o68Ba">Add</button></div>');
    var save = function () { ref.set({ items: items }).catch(function () { toast('Could not save.'); }); };
    var un = ref.onSnapshot(function (d) {
      items = (d.exists && d.data().items) || []; var ul = $('o68Bl'); if (!ul) return;
      ul.innerHTML = items.map(function (it, i) { return '<li class="' + (it.done ? 'done' : '') + '"><input type="checkbox" data-i="' + i + '"' + (it.done ? ' checked' : '') + '><span>' + esc(it.t) + '</span><button type="button" data-d="' + i + '" aria-label="Remove">\u00d7</button></li>'; }).join('') || '<li><span style="color:var(--dim)">Nothing yet. Add your first dream.</span></li>';
      var n = items.filter(function (x) { return x.done; }).length; $('o68Bp').style.width = (items.length ? n / items.length * 100 : 0) + '%'; $('o68Bc').textContent = n + ' of ' + items.length + ' done';
    }, function () { });
    o.addEventListener('change', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-i'); if (i != null) { items[+i].done = e.target.checked; save(); } });
    o.addEventListener('click', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-d'); if (i != null) { items.splice(+i, 1); save(); } });
    $('o68Ba').onclick = function () { var t = $('o68Bi').value.trim(); if (!t) return; items.push({ t: t.slice(0, 80), done: false, by: c.uid }); $('o68Bi').value = ''; save(); };
    onClose(o, un);
  }

  /* ---------- time capsule (Pro) ---------- */
  async function openCapsule() {
    var c = await needChat(); if (!c) return;
    var o = dlg('<h3>Time capsule</h3><p>Write a letter that opens on a date you choose. Letters are stored in your shared space and are not end-to-end encrypted.</p><textarea class="o67in" id="o68Cx" rows="4" maxlength="1500" placeholder="Dear you..."></textarea><input class="o67in" id="o68Cd" type="date"><div class="o67row"><button class="o67b" type="button" id="o68Cs">Seal the letter</button></div><div id="o68Cl"></div>');
    var min = new Date(Date.now() + 864e5).toISOString().slice(0, 10); $('o68Cd').min = min;
    var un = hubCol(c).onSnapshot(function (qs) {
      var rows = []; qs.forEach(function (d) { if (d.id.indexOf('cap_') === 0) rows.push(d.data()); }); rows.sort(function (a, b) { return a.openAt - b.openAt; });
      var box = $('o68Cl'); if (!box) return;
      box.innerHTML = rows.map(function (x) { var mine = x.from === c.uid, open = x.openAt <= Date.now(); return '<div class="o68ans"><small>' + (mine ? 'From you' : 'From ' + esc(x.name || c.pname)) + ' \u00b7 opens ' + new Date(x.openAt).toLocaleDateString() + '</small>' + (open || mine ? esc(x.text) : 'Sealed until then \u2764') + '</div>'; }).join('');
    }, function () { });
    $('o68Cs').onclick = function () { var t = $('o68Cx').value.trim(), d = $('o68Cd').value; if (!t || !d) { toast('Write a letter and pick a date.'); return; } var at = new Date(d + 'T09:00:00').getTime(); hub(c, 'cap_' + Date.now()).set({ from: c.uid, name: c.name, text: t, openAt: at, ts: Date.now() }).then(function () { $('o68Cx').value = ''; toast('Sealed'); }).catch(function () { toast('Could not save.'); }); };
    onClose(o, un);
  }

  /* ---------- year recap (Pro) ---------- */
  async function openRecap() {
    var c = await needChat(); if (!c) return; var o = dlg('<h3>Your recap</h3><p>Counting your latest messages...</p><div id="o68Rc"></div>');
    try {
      var q = await msgsQ(c, 1500).get(), n = 0, mine = 0, first = Infinity, mon = {}, wd = [0, 0, 0, 0, 0, 0, 0], per = {};
      q.forEach(function (x) { var m = x.data(); if (!m.ts) return; n++; if (m.fromUid === c.uid) mine++; first = Math.min(first, m.ts); var d = new Date(m.ts); wd[d.getDay()]++; var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); mon[k] = (mon[k] || 0) + 1; var dk = dayKey(m.ts); per[dk] = (per[dk] || 0) + 1; });
      if (!n) { $('o68Rc').innerHTML = '<p>No messages yet. Come back after you have chatted.</p>'; return; }
      var days = bothDays(q), best = 0, run = 0, keys = Object.keys(days).sort(); var prev = null; keys.forEach(function (k) { var both = Object.keys(days[k]).length >= 2; if (both) { run = prev && (new Date(k) - new Date(prev)) / 864e5 === 1 ? run + 1 : 1; best = Math.max(best, run); prev = k; } else { run = 0; prev = null; } });
      var bd = Object.keys(per).sort(function (a, b) { return per[b] - per[a]; })[0], wn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], bw = wd.indexOf(Math.max.apply(null, wd));
      var ms = Object.keys(mon).sort().slice(-12), mx = Math.max.apply(null, ms.map(function (k) { return mon[k]; }));
      var txt = 'Our chat recap: ' + n + ' messages, ' + Object.keys(per).length + ' days chatted, longest streak ' + best + ' days.';
      $('o68Rc').innerHTML = '<div class="o68big">' + n + '</div><p style="margin:0 0 10px">messages in your latest history (' + (n >= 1500 ? 'last 1,500' : 'all') + ')</p><div class="o68stats"><div><b>' + mine + ' / ' + (n - mine) + '</b>you / ' + esc(c.pname) + '</div><div><b>' + Object.keys(per).length + '</b>days you chatted</div><div><b>' + best + '</b>longest streak (days)</div><div><b>' + wn[bw] + '</b>busiest weekday</div><div><b>' + (bd ? per[bd] : 0) + '</b>most messages in a day' + (bd ? ' (' + bd + ')' : '') + '</div><div><b>' + new Date(first).toLocaleDateString() + '</b>earliest message counted</div></div><div class="o68mon">' + ms.map(function (k) { return '<i title="' + k + '" style="height:' + Math.max(4, mon[k] / mx * 100) + '%"></i>'; }).join('') + '</div><div class="o67row"><button class="o67b" type="button" id="o68Sh">Share recap</button></div>';
      $('o68Sh').onclick = function () { if (navigator.share) navigator.share({ text: txt }).catch(function () { }); else { try { navigator.clipboard.writeText(txt); } catch (e) { } toast('Copied'); } };
      o.querySelector('p').remove();
    } catch (e) { $('o68Rc').innerHTML = '<p>Could not load your messages. Check your connection.</p>'; }
  }

  /* ---------- AI helpers (Plus) ---------- */
  async function openAI() {
    var o = dlg('<h3>AI helpers</h3><div class="o67chips"><button type="button" data-k="date" class="on">Date planner</button><button type="button" data-k="letter">Love letter</button></div><textarea class="o67in" id="o68Ai" rows="4" maxlength="400" placeholder=""></textarea><div class="o67row"><button class="o67b" type="button" id="o68Go">Create</button></div><div id="o68Out"></div>'), kind = 'date';
    var ph = { date: 'Tell me your city or place, budget and mood. Example: cosy evening in Chennai, low budget', letter: 'Tell me what you want to say, and a memory to include' };
    var setK = function (k) { kind = k; o.querySelectorAll('[data-k]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === k); }); $('o68Ai').placeholder = ph[k]; }; setK('date');
    o.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { setK(b.getAttribute('data-k')); }; });
    $('o68Go').onclick = function () {
      var t = $('o68Ai').value.trim(); if (!t) { toast('Add a few details first.'); return; }
      var prompt = kind === 'date' ? 'Plan one romantic date for a couple. Give a short step-by-step plan with timings, ideas for a low-cost option and a surprise touch. Details: ' + t : 'Write a short, sincere love letter (under 180 words) for my partner. Do not invent facts beyond these details: ' + t;
      var b = $('o68Go'); b.disabled = true; b.textContent = '...';
      try { window.firebase.functions().httpsCallable('aiChat', { timeout: 70000 })({ messages: [{ role: 'user', content: prompt }], name: c0() }).then(function (r) { var out = (r.data && r.data.reply) || ''; $('o68Out').innerHTML = '<div class="o68ans" style="white-space:pre-wrap">' + esc(out) + '</div><div class="o67row"><button class="o67b alt" type="button" id="o68Cp">Copy</button></div>'; $('o68Cp').onclick = function () { try { navigator.clipboard.writeText(out); toast('Copied'); } catch (e) { } }; }).catch(function (e) { toast((e && e.message) || 'The AI is not available right now.'); }).then(function () { b.disabled = false; b.textContent = 'Create'; }); } catch (e) { toast('Not available right now.'); b.disabled = false; b.textContent = 'Create'; }
    };
    function c0() { return ((U().me && U().me()) || {}).name || ''; }
  }

  /* ---------- safe arrival (Plus) ---------- */
  async function openArrive() {
    var c = await needChat(); if (!c) return;
    dlg('<h3>I reached safely</h3><p>Let ' + esc(c.pname) + ' know you arrived.</p><input class="o67in" id="o68An" maxlength="60" placeholder="Optional note, e.g. Home"><label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px"><input type="checkbox" id="o68Al"> Also share my location this one time</label><div class="o67row"><button class="o67b" type="button" id="o68As">Send</button></div>', function (o) {
      $('o68As').onclick = function () {
        var d = { by: c.uid, name: c.name, ts: Date.now(), note: $('o68An').value.trim().slice(0, 60) }, send = function () { hub(c, 'arrival').set(d).then(function () { toast('Sent'); o.remove(); }).catch(function () { toast('Could not send.'); }); };
        if ($('o68Al').checked && navigator.geolocation) navigator.geolocation.getCurrentPosition(function (p) { d.lat = +p.coords.latitude.toFixed(4); d.lng = +p.coords.longitude.toFixed(4); send(); }, function () { toast('Location is off, sending without it.'); send(); }, { timeout: 8000 }); else send();
      };
    });
  }

  /* ---------- private vault (Plus): PIN, notes and photos stay on this phone only ---------- */
  function idb() { return new Promise(function (res, rej) { var r = indexedDB.open('onlyus-vault', 1); r.onupgradeneeded = function () { r.result.createObjectStore('items', { keyPath: 'id' }); }; r.onsuccess = function () { res(r.result); }; r.onerror = rej; }); }
  function idbDo(mode, fn) { return idb().then(function (db) { return new Promise(function (res, rej) { var t = db.transaction('items', mode), s = t.objectStore('items'), r = fn(s); t.oncomplete = function () { res(r && r.result); }; t.onerror = rej; }); }); }
  async function hashPin(p) { var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('onlyus-vault:' + p)); return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
  function openVault() {
    var has = !!ls('o68pin');
    dlg('<h3>Private vault</h3><p>' + (has ? 'Enter your PIN.' : 'Choose a 4 to 6 digit PIN. Notes and photos in the vault stay on this phone only. If you clear the app data or lose the phone they are gone, and the PIN cannot be recovered.') + '</p><input class="o67in" id="o68Pn" type="password" inputmode="numeric" maxlength="6" placeholder="PIN"><div id="o68Er" style="color:#d93a4a;font-size:13px;min-height:18px"></div><div class="o67row"><button class="o67b" type="button" id="o68Pk">' + (has ? 'Unlock' : 'Set PIN') + '</button></div>', function (o) {
      $('o68Pk').onclick = async function () {
        var p = $('o68Pn').value.trim(); if (!/^\d{4,6}$/.test(p)) { $('o68Er').textContent = 'Use 4 to 6 digits.'; return; }
        var h = await hashPin(p); if (!has) ls('o68pin', h); else if (h !== ls('o68pin')) { $('o68Er').textContent = 'Wrong PIN.'; return; }
        o.remove(); vaultView();
      };
    });
  }
  function vaultView() {
    var o = dlg('<h3>Private vault</h3><textarea class="o67in" id="o68Vn" rows="3" maxlength="2000" placeholder="Write a private note"></textarea><div class="o67row"><button class="o67b" type="button" id="o68Vs">Save note</button><button class="o67b alt" type="button" id="o68Vp">Add photo</button></div><input type="file" id="o68Vf" accept="image/*" hidden><div id="o68Vl"></div><div class="o67row"><button class="o67b alt" type="button" id="o68Vx">Lock</button></div>');
    var load = function () { idbDo('readonly', function (s) { return s.getAll(); }).then(function (rows) { rows = (rows || []).sort(function (a, b) { return b.ts - a.ts; }); var l = $('o68Vl'); if (!l) return; l.innerHTML = rows.filter(function (r) { return r.kind === 'note'; }).map(function (r) { return '<div class="o68ans"><small>' + new Date(r.ts).toLocaleString() + ' <a href="#" data-x="' + r.id + '" style="float:right;color:#d93a4a">Delete</a></small>' + esc(r.data) + '</div>'; }).join('') + '<div class="o68th">' + rows.filter(function (r) { return r.kind === 'photo'; }).map(function (r) { return '<div style="position:relative"><img src="' + r.data + '" alt=""><a href="#" data-x="' + r.id + '" style="position:absolute;top:4px;right:6px;color:#fff;font-weight:800;text-decoration:none">\u00d7</a></div>'; }).join('') + '</div>'; }); };
    load();
    $('o68Vs').onclick = function () { var t = $('o68Vn').value.trim(); if (!t) return; idbDo('readwrite', function (s) { return s.put({ id: 'n' + Date.now(), kind: 'note', data: t, ts: Date.now() }); }).then(function () { $('o68Vn').value = ''; load(); }); };
    $('o68Vp').onclick = function () { $('o68Vf').click(); };
    $('o68Vf').onchange = function () { var f = this.files[0]; if (!f) return; if (f.size > 4 * 1048576) { toast('Photos in the vault can be up to 4 MB.'); return; } var r = new FileReader(); r.onload = function () { idbDo('readwrite', function (s) { return s.put({ id: 'p' + Date.now(), kind: 'photo', data: r.result, ts: Date.now() }); }).then(load); }; r.readAsDataURL(f); };
    o.addEventListener('click', function (e) { var x = e.target.getAttribute && e.target.getAttribute('data-x'); if (x) { e.preventDefault(); idbDo('readwrite', function (s) { return s.delete(x); }).then(load); } });
    $('o68Vx').onclick = function () { o.remove(); };
  }

  /* ---------- live map ---------- */
  var geo = { wid: null, last: 0, timer: null };
  var haversine = function (a, b) { var R = 6371, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r, x = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) * Math.sin(dg / 2); return 2 * R * Math.asin(Math.sqrt(x)); };
  var fmtD = function (km) { return km < 1 ? Math.round(km * 1000) + ' m' : km < 100 ? km.toFixed(1) + ' km' : Math.round(km) + ' km'; };
  async function openMap() {
    var c = await needChat(); if (!c) return;
    if (!ls('o68consent')) { dlg('<h3>Share your live location?</h3><p>If you turn sharing on, <b>only ' + esc(c.pname) + '</b> can see where you are, while the app is open, and you will see when they share too. Your location is saved in your shared space only while sharing is on. You can stop at any time. OnlyUs never shares it with anyone else.</p><div class="o67row"><button class="o67b alt" type="button" data-c>Not now</button><button class="o67b" type="button" data-ok>I understand</button></div>', function (o) { o.querySelector('[data-c]').onclick = function () { o.remove(); }; o.querySelector('[data-ok]').onclick = function () { ls('o68consent', '1'); o.remove(); mapView(c); }; }); return; }
    mapView(c);
  }
  function loadLeaflet() {
    if (window.L) return Promise.resolve(true); if (loadLeaflet.p) return loadLeaflet.p;
    return loadLeaflet.p = new Promise(function (res) { var l = el('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(l); var s = el('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = function () { res(!!window.L); }; s.onerror = function () { res(false); }; document.head.appendChild(s); setTimeout(function () { res(!!window.L); }, 6000); });
  }
  function mapView(c) {
    var old = $('o68Map'); if (old) old.remove();
    var o = el('div'); o.id = 'o68Map'; o.innerHTML = '<div class="mh"><button type="button" id="o68Mb">Back</button><b>Live map</b></div><div id="o68Mv"></div><div id="o68Dock"></div>'; document.body.appendChild(o);
    var me = null, her = null, lmap = null, mk = {}, line = null, usedL = false;
    var myS = hub(c, 'loc_' + c.uid), herS = hub(c, 'loc_' + c.pid);
    var sharing = function () { var s = JSON.parse(ls('o68share') || 'null'); return s && s.cid === c.cid && (!s.until || s.until > Date.now()); };
    function pinHtml(n, cls) { return '<div class="o68pin ' + (cls || '') + '"><i></i><b>' + esc((n || '?').trim().charAt(0).toUpperCase()) + '</b></div>'; }
    function dock() {
      var d = $('o68Dock'); if (!d) return; var h = '';
      if (sharing()) { var s = JSON.parse(ls('o68share')); h += '<div class="o68on"><i></i>Sharing is on' + (s.until ? ' \u00b7 stops in ' + Math.max(1, Math.round((s.until - Date.now()) / 60000)) + ' min' : '') + '</div>'; }
      if (me && her && her.on) { h += '<div class="dist">' + fmtD(haversine(me, her)) + ' apart</div><div class="sub">' + esc(c.pname) + ' updated ' + ago(her.ts) + (her.bat != null ? ' \u00b7 battery ' + Math.round(her.bat * 100) + '%' : '') + '</div>'; }
      else h += '<div class="dist">' + (her && her.on ? 'Locating...' : esc(c.pname) + ' is not sharing') + '</div><div class="sub">' + (sharing() ? 'Waiting for your location...' : 'Turn on sharing to see each other.') + '</div>';
      h += sharing() ? '<button class="o67b red" type="button" id="o68Sh">Stop sharing</button>' : '<button class="o67b" type="button" id="o68Sh">Share my location' + (plan() === 'free' ? ' (1 hour)' : '') + '</button>';
      d.innerHTML = h; $('o68Sh').onclick = function () { sharing() ? stop() : start(); };
    }
    function draw() {
      var box = $('o68Mv'); if (!box) return; var pts = [me && { p: me, n: c.name, c: '' }, her && her.on && { p: her, n: c.pname, c: 'p' }].filter(Boolean);
      if (usedL && lmap) {
        pts.forEach(function (x) { var k = x.c || 'me', ll = [x.p.lat, x.p.lng]; if (mk[k]) mk[k].setLatLng(ll); else mk[k] = window.L.marker(ll, { icon: window.L.divIcon({ className: '', html: pinHtml(x.n, x.c), iconSize: [44, 52], iconAnchor: [22, 50] }) }).addTo(lmap); });
        if (pts.length === 2) { var ll2 = pts.map(function (x) { return [x.p.lat, x.p.lng]; }); if (line) line.setLatLngs(ll2); else line = window.L.polyline(ll2, { color: '#ff5c8d', weight: 3, dashArray: '2 9', className: 'o68hl' }).addTo(lmap); lmap.fitBounds(ll2, { padding: [60, 60], maxZoom: 16 }); }
        else if (pts.length === 1) lmap.setView([pts[0].p.lat, pts[0].p.lng], 15);
        return;
      }
      /* cute fallback map (no tiles): positions are relative to each other */
      var W = 360, H = 360, svg = '<svg class="cm" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"><rect width="360" height="360" fill="#e8f5ec"/><path d="M-10 90q90-50 180 0t200-20" fill="none" stroke="#fff" stroke-width="16"/><path d="M60 -10q30 160 -10 380" fill="none" stroke="#fff" stroke-width="12"/><path d="M-10 270q120-60 380 -20" fill="none" stroke="#fff" stroke-width="14"/><circle cx="290" cy="300" r="46" fill="#cfeaf7"/><circle cx="90" cy="230" r="30" fill="#d3efd8"/>';
      if (pts.length) { var la = pts.map(function (x) { return x.p.lat; }), ln = pts.map(function (x) { return x.p.lng; }), cl = (Math.min.apply(null, la) + Math.max.apply(null, la)) / 2, cg = (Math.min.apply(null, ln) + Math.max.apply(null, ln)) / 2, span = Math.max(Math.max.apply(null, la) - Math.min.apply(null, la), Math.max.apply(null, ln) - Math.min.apply(null, ln), 0.002);
        var xy = pts.map(function (x) { return { x: 180 + (x.p.lng - cg) / span * 220, y: 180 - (x.p.lat - cl) / span * 220, n: x.n, c: x.c }; });
        if (xy.length === 2) svg += '<line class="o68hl" x1="' + xy[0].x + '" y1="' + xy[0].y + '" x2="' + xy[1].x + '" y2="' + xy[1].y + '"/>';
        xy.forEach(function (q) { svg += '<g transform="translate(' + (q.x - 22) + ' ' + (q.y - 50) + ')"><path d="M22 52C6 36 0 28 0 20a22 22 0 0 1 44 0c0 8-6 16-22 32z" fill="' + (q.c ? '#2f9ae8' : '#ff5c8d') + '" stroke="#fff" stroke-width="3"/><text x="22" y="28" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="sans-serif">' + esc((q.n || '?').trim().charAt(0).toUpperCase()) + '</text></g>'; }); }
      box.innerHTML = svg + '</svg>';
    }
    function refresh() { dock(); draw(); }
    function push(p) {
      if (Date.now() - geo.last < 20000) return; geo.last = Date.now(); var s = JSON.parse(ls('o68share') || 'null'); if (!s || s.cid !== c.cid) return;
      var d = { lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy || 0), ts: Date.now(), on: true, name: c.name };
      var go = function () { myS.set(d).catch(function () { }); }; if (navigator.getBattery) navigator.getBattery().then(function (b) { d.bat = b.level; go(); }).catch(go); else go();
      me = { lat: d.lat, lng: d.lng, ts: d.ts }; refresh();
    }
    function start() {
      if (!navigator.geolocation) { toast('Location is not available on this device.'); return; }
      var until = plan() === 'free' ? Date.now() + 3600e3 : 0; ls('o68share', JSON.stringify({ cid: c.cid, until: until })); geo.last = 0;
      geo.wid = navigator.geolocation.watchPosition(push, function () { toast('Allow location access to share.'); stop(true); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
      clearInterval(geo.timer); geo.timer = setInterval(function () { var s = JSON.parse(ls('o68share') || 'null'); if (s && s.until && s.until < Date.now()) { stop(); toast('Free sharing stopped after 1 hour. Pro has no time limit.'); } else dock(); }, 30000); refresh();
    }
    function stop(quiet) { if (geo.wid != null && navigator.geolocation) navigator.geolocation.clearWatch(geo.wid); geo.wid = null; clearInterval(geo.timer); ls('o68share', null); myS.set({ on: false, ts: Date.now(), name: c.name }).catch(function () { }); me = null; refresh(); if (!quiet) toast('Stopped sharing'); }
    $('o68Mb').onclick = function () { o.remove(); };
    var unH = herS.onSnapshot(function (d) { her = d.exists ? d.data() : null; refresh(); }, function () { });
    var unM = myS.onSnapshot(function (d) { var x = d.exists && d.data(); me = x && x.on ? { lat: x.lat, lng: x.lng, ts: x.ts } : null; refresh(); }, function () { });
    onClose(o, function () { unH(); unM(); if (lmap) lmap.remove(); });
    if (sharing() && geo.wid == null) start(); refresh();
    loadLeaflet().then(function (ok) { if (!ok || !$('o68Mv') || usedL) return; var box = $('o68Mv'); box.innerHTML = ''; lmap = window.L.map(box, { zoomControl: false, attributionControl: true }).setView([20, 0], 2); window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(lmap); usedL = true; draw(); setTimeout(function () { lmap && lmap.invalidateSize(); }, 200); });
  }

  /* ---------- keep tiles in the right state ---------- */
  var built = '';
  function sync() { var k = plan() + (window.__i18n ? window.__i18n.get() : ''); if (!$('o68Tools') || built !== k) { built = k; build(); } }
  window.addEventListener('onlyus-plan', function () { built = ''; sync(); });
  var q = 0; new MutationObserver(function () { if (q) return; q = setTimeout(function () { q = 0; if (!$('o68Tools') && $('o64Scenes')) sync(); }, 150); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && $('o68Tools')) strip(); });
  setInterval(function () { var l = $('vList'); if (l && l.classList.contains('on') && $('o68Tools')) strip(); }, 120000);
  setTimeout(sync, 400); setTimeout(strip, 3500);
  window.__o68 = { openMap: openMap, strip: strip, tiles: TILES.length };
})();
