/* OnlyUs plans-v67.js
   Plans (Free / Couple Pro / Couple Pro Plus), paywall, feature locks, colour themes,
   block + report, delete account.
   The plan comes from Firestore planByUid/{uid} = { plan:'pro'|'plus', status:'active'|'trial'|'grace', until:<ms> }
   which only the server may write (after a verified Google Play purchase).  Until billing is connected, a developer can
   test by writing that document in the Firebase console, or in the browser console:  localStorage['onlyus-dev']='1';
   localStorage['onlyus-dev-plan']='pro'  (remove before release).                                                    */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };
  var U = function () { return window.__us || {}; };
  var toast = function (s) { try { U().toast(s); } catch (e) { } };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- plan state ---------- */
  /* MASTER SWITCH. false = plans are OFF for now: no paywall, no "Your plan" / "Invite a couple" rows, no PRO/PLUS badges or locks;
     every feature works for everyone. Set to true to bring the plans back (also set PLANS_ON in functions/index.js). */
  var PLANS_ON = false;
  var LIM = { free: { video: 15, doc: 10, scenes: 2 }, pro: { video: 50, doc: 25, scenes: 6 }, plus: { video: 200, doc: 100, scenes: 6 } };
  var FREE_GAMES = ['Tic-Tac-Toe', 'Connect 4', 'Rock Paper Scissors', 'Would You Rather', 'Truth or Dare'];
  function current() {
    if (!PLANS_ON) return 'plus';
    if (ls('onlyus-dev') === '1') { var d = ls('onlyus-dev-plan'); if (d === 'pro' || d === 'plus') return d; }
    try { var p = JSON.parse(ls('onlyus-plan') || 'null'); if (p && p.until > Date.now() && ['active', 'trial', 'grace'].indexOf(p.status) > -1 && (p.plan === 'pro' || p.plan === 'plus')) return p.plan; } catch (e) { }
    return 'free';
  }
  var last = current();
  function changed() { var n = current(); if (n !== last) { last = n; } window.dispatchEvent(new CustomEvent('onlyus-plan', { detail: n })); applyAll(); }
  function listen() {
    var u = U().uid && U().uid(), fs = U().fs && U().fs();
    if (!u || !fs || listen.done) return; listen.done = true;
    try { fs.doc('planByUid/' + u).onSnapshot(function (s) { if (s.exists) ls('onlyus-plan', JSON.stringify(s.data())); else ls('onlyus-plan', null); changed(); }, function () { }); } catch (e) { }
    try { fs.collection('users/' + u + '/blocks').get().then(function (q) { var a = []; q.forEach(function (d) { a.push(d.id); }); ls('onlyus-blocked', JSON.stringify(a)); blockUI(); }).catch(function () { }); } catch (e) { }
  }
  window.__plan = { get: current, limits: function () { return LIM[current()]; }, paywall: function (r) { paywall(r); } };

  /* ---------- styles ---------- */
  var PAL = {
    rose: ['Rose', 'free', '#e8436a', '#b83a62'], ocean: ['Ocean', 'free', '#1f8fd6', '#176a9e'],
    sunset: ['Sunset', 'pro', '#f2683c', '#c9462a'], forest: ['Forest', 'pro', '#2f9e6b', '#1f6f4a'], midnight: ['Midnight', 'pro', '#5b7bff', '#263a8a', '#0f1630', '#172044', '#e8ecff', '#98a3d6', '#263055'],
    lavender: ['Lavender', 'pro', '#9b7be0', '#7757c4', '#f4effd'], rosegold: ['Rose Gold', 'pro', '#c98a7e', '#a8665a', '#fbf1ee'], mocha: ['Mocha', 'pro', '#a0714f', '#6f4a33', '#f5ede6'],
    aurora: ['Aurora', 'plus', '#2fd6a6', '#1b7f89', '#0b1a24', '#12303a', '#e6fffa', '#8fc7c0', '#1d4650'], galaxy: ['Galaxy', 'plus', '#a56bff', '#3b1c78', '#120a26', '#1d1240', '#efe6ff', '#a995d8', '#2d1f5e'],
    blossom: ['Cherry Blossom', 'plus', '#ff7fb0', '#e0558a', '#fff0f6'], golden: ['Golden Hour', 'plus', '#e0a200', '#b57800', '#fff8e6'],
    neon: ['Neon Night', 'plus', '#00e5ff', '#141428', '#0a0a16', '#13132a', '#eaffff', '#7fd6e6', '#20204a'], snow: ['Snow', 'plus', '#4a90c2', '#7fb3d9', '#f3f8fc']
  };
  var palCss = '';
  Object.keys(PAL).forEach(function (k) { var p = PAL[k]; palCss += ':root:root[data-pal="' + k + '"]{--acc:' + p[2] + ';--hd:' + p[3] + (p[4] ? ';--bg:' + p[4] : '') + (p[5] ? ';--panel:' + p[5] + ';--ink:' + p[6] + ';--dim:' + p[7] + ';--line:' + p[8] + ';--th:' + p[5] + ';--me:' + p[3] : '') + '}\n'; });
  var css = el('style');
  css.textContent = palCss + [
    '.o67ov{position:fixed;inset:0;z-index:2147482200;background:rgba(20,10,40,.6);display:flex;align-items:center;justify-content:center;padding:16px;animation:o66fade .2s}',
    '.o67box{width:100%;max-width:420px;max-height:92%;overflow:auto;background:var(--panel,#fff);color:var(--ink,#222);border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);animation:o66rise .28s cubic-bezier(.2,.9,.3,1)}',
    '.o67box h3{margin:0 0 6px;font-size:20px}.o67box p{margin:6px 0;font-size:14px;line-height:1.45;color:var(--dim,#667)}',
    '.o67row{display:flex;gap:8px;margin-top:14px}.o67b{all:unset;cursor:pointer;flex:1;text-align:center;padding:13px;border-radius:14px;font-weight:700;font-size:15px;background:var(--acc,#8657d9);color:#fff}.o67b.alt{background:color-mix(in srgb,var(--acc,#8657d9) 14%,transparent);color:var(--acc,#8657d9)}.o67b.red{background:#d93a4a}',
    '.o67in{width:100%;box-sizing:border-box;margin-top:10px;border:1px solid var(--line,#ddd);border-radius:12px;padding:12px;font-size:16px;background:var(--bg,#fff);color:var(--ink,#222)}',
    '.o67chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.o67chips button{all:unset;cursor:pointer;padding:9px 13px;border-radius:999px;background:color-mix(in srgb,var(--acc,#8657d9) 12%,transparent);font-size:14px;font-weight:600}.o67chips button.on{background:var(--acc,#8657d9);color:#fff}',
    /* paywall */
    '#o67Pay{position:fixed;inset:0;z-index:2147482100;background:var(--bg,#f6f1ff);color:var(--ink,#222);overflow:auto;-webkit-overflow-scrolling:touch;animation:o66fade .25s}',
    '#o67Pay .pw{max-width:480px;margin:0 auto;padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(28px + env(safe-area-inset-bottom,0px))}',
    '#o67Pay .x{all:unset;cursor:pointer;float:right;width:38px;height:38px;border-radius:50%;text-align:center;line-height:38px;background:rgba(0,0,0,.08);font-size:20px}',
    '#o67Pay h2{margin:6px 0 4px;font-size:26px;font-weight:800}#o67Pay .why{margin:0 0 12px;color:var(--acc,#8657d9);font-weight:700;font-size:14px;min-height:18px}',
    '.o67tg{display:flex;background:color-mix(in srgb,var(--acc,#8657d9) 12%,transparent);border-radius:999px;padding:4px;margin:8px 0 14px}.o67tg button{all:unset;cursor:pointer;flex:1;text-align:center;padding:10px;border-radius:999px;font-weight:700;font-size:14px}.o67tg button.on{background:var(--acc,#8657d9);color:#fff}',
    '.o67pl{position:relative;margin:10px 0;padding:16px;border-radius:22px;background:var(--panel,#fff);border:2px solid var(--line,#e5e5e5)}.o67pl.hot{border-color:var(--acc,#8657d9);box-shadow:0 10px 28px rgba(110,70,190,.2)}.o67pl.cur{opacity:.85}',
    '.o67pl .tag{position:absolute;top:-11px;inset-inline-end:16px;background:var(--acc,#8657d9);color:#fff;font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px}',
    '.o67pl h4{margin:0;font-size:19px}.o67pl .pr{margin:4px 0 8px;font-size:15px;color:var(--dim,#667)}.o67pl .pr b{font-size:26px;color:var(--ink,#222)}',
    '.o67pl ul{list-style:none;margin:8px 0 12px;padding:0}.o67pl li{padding:4px 0 4px 22px;position:relative;font-size:14px}.o67pl li::before{content:"\\2713";position:absolute;inset-inline-start:0;color:var(--acc,#8657d9);font-weight:800}[dir=rtl] .o67pl li{padding:4px 22px 4px 0}',
    '.o67fine{font-size:12px;color:var(--dim,#667);line-height:1.5;margin-top:14px;text-align:center}.o67fine button{all:unset;cursor:pointer;text-decoration:underline}',
    '.o67pl .o67b{display:block;width:100%;box-sizing:border-box}',
    /* locks */
    '.o67lock{position:relative}.o67lock::after{content:"PRO";position:absolute;top:8px;inset-inline-end:8px;background:linear-gradient(135deg,#ff6fa8,#ff8f6b);color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;z-index:3;pointer-events:none}',
    '.o67lk{position:relative}.o67lk::before{content:"";position:absolute;inset:0;z-index:4;background:rgba(30,10,60,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}.o67lk::after{content:"PRO";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:5;background:linear-gradient(135deg,#ff6fa8,#ff8f6b);color:#fff;font-size:13px;font-weight:800;padding:6px 14px;border-radius:999px}',
    /* palettes */
    '#o67Pal{margin:12px 16px;padding:14px 16px;border-radius:16px;background:var(--panel,#fff);border:1px solid var(--line,#ddd);color:var(--ink,#222)}#o67Pal b{display:block;font-size:15px;margin-bottom:10px}',
    '.o67sw{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.o67sw button{all:unset;cursor:pointer;text-align:center;font-size:11px;font-weight:600;position:relative}.o67sw i{display:block;width:100%;aspect-ratio:1;border-radius:16px;margin-bottom:4px;border:3px solid transparent;box-sizing:border-box}.o67sw button.on i{border-color:var(--ink,#222)}.o67sw .lk{position:absolute;top:3px;inset-inline-end:3px;font-size:9px;font-weight:800;background:#0009;color:#fff;border-radius:6px;padding:1px 5px}',
    '.o67blk{display:none;position:fixed;left:0;right:0;bottom:0;z-index:30;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));background:var(--panel,#fff);border-top:1px solid var(--line,#ddd);text-align:center;color:var(--ink,#222);font-size:14px}.o67blk.on{display:block}.o67blk button{all:unset;cursor:pointer;margin-inline-start:8px;color:var(--acc,#8657d9);font-weight:800}',
    '#setBody .o66langrow,#setBody #o67Pal{margin-left:0;margin-right:0}#setBody #o67Del{margin-left:0;margin-right:0}',
    '#o67Del{margin:18px 16px 30px;padding:14px 16px;border-radius:16px;border:1px solid #d93a4a55;color:#d93a4a;font-weight:700;text-align:center;cursor:pointer}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- small dialog ---------- */
  function dlg(html, wire) { var o = el('div', 'o67ov'); o.innerHTML = '<div class="o67box" role="dialog">' + html + '</div>'; o.addEventListener('click', function (e) { if (e.target === o) o.remove(); }); document.body.appendChild(o); if (wire) wire(o); return o; }

  /* ---------- paywall ---------- */
  var PRICES = { pro: [2.99, 33.99], plus: [5.99, 67.99] };
  function paywall(reason) {
    if (!PLANS_ON) return;
    var old = $('o67Pay'); if (old) old.remove();
    var per = 1, o = el('div'), cur = current(); o.id = 'o67Pay';
    function html() {
      var y = per === 1;
      function card(id, name, feats, hot, tag) {
        var p = PRICES[id], cn = cur === id;
        return '<div class="o67pl' + (hot ? ' hot' : '') + (cn ? ' cur' : '') + '">' + (tag ? '<span class="tag">' + tag + '</span>' : '') + '<h4>' + name + '</h4><div class="pr"><b>$' + (y ? p[1] : p[0]) + '</b> / ' + (y ? 'year' : 'month') + '</div><ul>' + feats.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
          (cn ? '<button class="o67b alt" type="button" disabled>Your plan</button>' : '<button class="o67b" type="button" data-buy="' + id + '">Start 3-day free trial</button>') + '</div>';
      }
      return '<div class="pw"><button class="x" id="o67X" type="button" aria-label="Close">\u00d7</button><h2>Choose your plan</h2><div class="why">' + esc(reason || '') + '</div>' +
        '<div class="o67tg"><button type="button" data-per="0" class="' + (y ? '' : 'on') + '">Monthly</button><button type="button" data-per="1" class="' + (y ? 'on' : '') + '">Yearly \u00b7 save 5%</button></div>' +
        '<div class="o67pl' + (cur === 'free' ? ' cur' : '') + '"><h4>Couple Free</h4><div class="pr"><b>$0</b></div><ul><li>Private chat and pairing</li><li>5 simple games</li><li>Basic themes, stickers and scenes</li><li>Photos are compressed, files up to 10 MB</li><li>Contains ads</li></ul></div>' +
        card('pro', 'Couple Pro', ['No ads', 'All games', 'More themes, stickers and scenes', 'Liquid glass look', 'AI chat: 30 messages a day', 'Original-quality photos, videos up to 50 MB', '10 GB storage, chat backup and export'], false, '') +
        card('plus', 'Couple Pro Plus', ['Everything in Pro', 'All themes, stickers and scenes', 'AI chat: 200 messages a day', 'HD calls', 'Videos up to 200 MB, 50 GB storage', 'Always-on live location and safe arrival'], true, 'Best value') +
        '<div class="o67fine">One person subscribes and both partners get the plan. After the 3-day free trial your Google Play account is charged automatically unless you cancel in Google Play before it ends. Prices are in USD; Google Play shows your local price at checkout. If you unpair, the plan pauses.<br><button id="o67Rs" type="button">Restore purchases</button></div></div>';
    }
    function draw() {
      o.innerHTML = html();
      o.querySelector('#o67X').onclick = function () { o.remove(); };
      o.querySelectorAll('[data-per]').forEach(function (b) { b.onclick = function () { per = +b.getAttribute('data-per'); draw(); }; });
      o.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buy(b.getAttribute('data-buy'), per ? 'yearly' : 'monthly'); }; });
      o.querySelector('#o67Rs').onclick = function () { if (window.__billing && window.__billing.restore) window.__billing.restore(); else toast('Purchases are restored in the OnlyUs app from Google Play.'); };
    }
    document.body.appendChild(o); draw();
  }
  function buy(plan, period) { if (window.__billing && window.__billing.buy) window.__billing.buy(plan, period); else toast('Subscriptions start in the OnlyUs app from Google Play.'); }

  /* ---------- locks ---------- */
  function lockGames() {
    var f = current() === 'free';
    document.querySelectorAll('.gv-card,.gmCard').forEach(function (c) { var b = c.querySelector('b'), n = b && b.textContent.trim(); c.classList.toggle('o67lock', !!(f && n && FREE_GAMES.indexOf(n) < 0)); });
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('.gv-card,.gmCard'); if (c && c.classList.contains('o67lock')) { e.preventDefault(); e.stopImmediatePropagation(); paywall('This game is part of Couple Pro.'); return; }
    var s = e.target.closest && e.target.closest('.o67lk'); if (s) { e.preventDefault(); e.stopImmediatePropagation(); paywall('More scenes are part of Couple Pro.'); return; }
    var x = e.target.closest && e.target.closest('#toolExport'); if (x && current() === 'free') { e.preventDefault(); e.stopImmediatePropagation(); paywall('Chat export is part of Couple Pro.'); }
  }, true);
  function lockScenes() {
    var n = LIM[current()].scenes; document.querySelectorAll('#o64Scenes .o64sc').forEach(function (s, i) { s.classList.toggle('o67lk', i >= n); });
  }
  var R = document.documentElement, glassGuard = 0, lastTap = 0;
  document.addEventListener('pointerdown', function () { lastTap = Date.now(); }, true);
  /* Free users do not get the liquid glass look: it is switched off quietly, and the paywall opens only if they tap to turn it on */
  new MutationObserver(function () { if (current() === 'free' && R.classList.contains('lg')) { R.classList.remove('lg'); if (Date.now() - lastTap < 900 && Date.now() - glassGuard > 4000) { glassGuard = Date.now(); paywall('The liquid glass look is part of Couple Pro.'); } } }).observe(R, { attributes: true, attributeFilter: ['class'] });
  var ai = $('aiOv'); if (ai) new MutationObserver(function () { if (current() === 'free' && ai.classList.contains('on')) { ai.classList.remove('on'); paywall('AI chat is part of Couple Pro.'); } }).observe(ai, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('change', function (e) {
    var i = e.target; if (!i || i.type !== 'file' || !i.files || !i.files.length) return;
    var L = LIM[current()];
    for (var k = 0; k < i.files.length; k++) {
      var f = i.files[k], mb = f.size / 1048576, img = /^image\//.test(f.type), vid = /^video\//.test(f.type);
      if (img) continue;
      var max = vid ? L.video : L.doc;
      if (mb > max) { e.stopImmediatePropagation(); i.value = ''; toast((vid ? 'Videos' : 'Files') + ' can be up to ' + max + ' MB on your plan.'); if (current() !== 'plus') paywall('Upgrade for bigger ' + (vid ? 'videos.' : 'files.')); return; }
    }
  }, true);

  /* ---------- colour themes ---------- */
  function palOk(k) { var t = PAL[k] && PAL[k][1], c = current(); return !!t && (t === 'free' || c === 'plus' || (c === 'pro' && t === 'pro')); }
  function applyPal() { var k = ls('onlyus-pal'); if (k && PAL[k] && palOk(k)) R.setAttribute('data-pal', k); else R.removeAttribute('data-pal'); }
  function palCard() {
    var v = $('vSet'), c = $('o67Pal'); if (!v) return;
    if (!c) { c = el('div'); c.id = 'o67Pal'; var a = $('o67RefRow') || $('o67PlanRow') || $('o66LangRow'); if (a) a.after(c); else return; }
    var cur = ls('onlyus-pal') || '', h = '<b>Colour theme</b><div class="o67sw"><button type="button" data-p="" class="' + (!cur ? 'on' : '') + '"><i style="background:linear-gradient(135deg,#8657d9,#b48cf0)"></i>Violet</button>';
    Object.keys(PAL).forEach(function (k) { var p = PAL[k]; h += '<button type="button" data-p="' + k + '" class="' + (cur === k ? 'on' : '') + '"><i style="background:linear-gradient(135deg,' + p[2] + ',' + p[3] + ')"></i>' + p[0] + (palOk(k) ? '' : '<span class="lk">' + (p[1] === 'plus' ? 'PLUS' : 'PRO') + '</span>') + '</button>'; });
    var s = h + '</div>'; if (c.__s === s + current()) return; c.__s = s + current(); c.innerHTML = s;
    c.onclick = function (e) { var b = e.target.closest('button[data-p]'); if (!b) return; var k = b.getAttribute('data-p'); if (k && !palOk(k)) { paywall(PAL[k][1] === 'plus' ? 'This theme is part of Couple Pro Plus.' : 'This theme is part of Couple Pro.'); return; } ls('onlyus-pal', k || null); applyPal(); c.__s = ''; palCard(); };
  }

  /* ---------- settings rows ---------- */
  function planRow() {
    var v = $('vSet'); if (!v) return;
    if (!PLANS_ON) {
      ['o67PlanRow', 'o67RefRow'].forEach(function (id) { var x = $(id); if (x) x.remove(); });
      var b0 = $('setBody'); if (b0 && !$('o67Del')) { var d0 = el('div'); d0.id = 'o67Del'; d0.setAttribute('role', 'button'); d0.tabIndex = 0; d0.textContent = 'Delete my account'; d0.onclick = deleteDlg; ($('spMenu') || b0).appendChild(d0); }
      return;
    }
    var r = $('o67PlanRow'), n = { free: 'Free', pro: 'Couple Pro', plus: 'Couple Pro Plus' }[current()];
    if (!r) { r = el('div', 'o66langrow'); r.id = 'o67PlanRow'; r.setAttribute('role', 'button'); r.tabIndex = 0; r.onclick = function () { paywall(''); }; var a = $('o66LangRow'); if (a) a.after(r); else return; }
    var s = '<span>Your plan</span><span>' + n + '</span>'; if (r.innerHTML !== s) r.innerHTML = s;
    var rr = $('o67RefRow'); if (!rr) { rr = el('div', 'o66langrow'); rr.id = 'o67RefRow'; rr.setAttribute('role', 'button'); rr.tabIndex = 0; rr.innerHTML = '<span>Invite a couple</span><span>1 week Pro</span>'; rr.onclick = referralDlg; r.after(rr); }
    var body = $('setBody'); if (body && !$('o67Del')) { var d = el('div'); d.id = 'o67Del'; d.setAttribute('role', 'button'); d.tabIndex = 0; d.textContent = 'Delete my account'; d.onclick = deleteDlg; (document.getElementById('spMenu') || body).appendChild(d); }
  }

  /* ---------- block + report ---------- */
  var blocked = function () { try { return JSON.parse(ls('onlyus-blocked') || '[]'); } catch (e) { return []; } };
  function isBlocked() { var u = U().cuid && U().cuid(); return !!u && blocked().indexOf(u) > -1; }
  function setBlocked(uid, on) {
    var a = blocked().filter(function (x) { return x !== uid; }); if (on) a.push(uid); ls('onlyus-blocked', JSON.stringify(a));
    var me = U().uid && U().uid(), fs = U().fs && U().fs();
    try { var ref = fs.doc('users/' + me + '/blocks/' + uid); (on ? ref.set({ at: Date.now() }) : ref.delete()).catch(function () { toast('Could not save. Check your connection.'); }); } catch (e) { }
    blockUI();
  }
  function blockUI() {
    var f = $('cf'), b = $('o67Blk'), nm = U().cname && U().cname();
    if (f && !b) { b = el('div', 'o67blk'); b.id = 'o67Blk'; document.body.appendChild(b); }
    if (!b) return; var on = isBlocked();
    b.classList.toggle('on', on && !!$('vChat') && $('vChat').classList.contains('on'));
    if (on) { b.innerHTML = 'You blocked ' + esc(nm || 'this contact') + '.<button type="button" id="o67Un">Unblock</button>'; $('o67Un').onclick = function () { setBlocked(U().cuid(), false); }; }
    if (f) f.style.display = on ? 'none' : '';
    var t = $('o67ToolBlock'); if (t) t.querySelector('span').textContent = on ? 'Unblock' : 'Block';
  }
  function tools() {
    var g = document.querySelector('#chatTools .tool-grid'); if (!g || $('o67ToolBlock')) return;
    var b = el('button', '', '\u26D4<span>Block</span>'); b.id = 'o67ToolBlock'; b.type = 'button';
    var r = el('button', '', '\u2691<span>Report</span>'); r.id = 'o67ToolReport'; r.type = 'button';
    g.appendChild(b); g.appendChild(r);
    b.onclick = function () {
      var u = U().cuid && U().cuid(); if (!u) { toast('Open a chat first.'); return; }
      if (isBlocked()) { setBlocked(u, false); toast('Unblocked'); return; }
      dlg('<h3>Block ' + esc(U().cname() || 'this contact') + '?</h3><p>They will not be able to send you messages or see your updates in this chat. You can unblock any time.</p><div class="o67row"><button class="o67b alt" type="button" data-c>Cancel</button><button class="o67b red" type="button" data-ok>Block</button></div>', function (o) { o.querySelector('[data-c]').onclick = function () { o.remove(); }; o.querySelector('[data-ok]').onclick = function () { setBlocked(u, true); o.remove(); toast('Blocked'); }; });
    };
    r.onclick = function () {
      var u = U().cuid && U().cuid(); if (!u) { toast('Open a chat first.'); return; }
      var why = 'harassment', R2 = [['harassment', 'Harassment'], ['spam', 'Spam'], ['inappropriate', 'Inappropriate content'], ['underage', 'Under 16'], ['other', 'Other']];
      dlg('<h3>Report ' + esc(U().cname() || 'this contact') + '</h3><div class="o67chips">' + R2.map(function (x, i) { return '<button type="button" data-r="' + x[0] + '"' + (i === 0 ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div><textarea class="o67in" id="o67Note" rows="3" maxlength="300" placeholder="Tell us more (optional)"></textarea><p>Reports are reviewed by the OnlyUs team. Your chat messages are not sent with the report.</p><div class="o67row"><button class="o67b alt" type="button" data-c>Cancel</button><button class="o67b" type="button" data-ok>Send report</button></div>', function (o) {
        o.querySelectorAll('[data-r]').forEach(function (b) { b.onclick = function () { why = b.getAttribute('data-r'); o.querySelectorAll('[data-r]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
        o.querySelector('[data-c]').onclick = function () { o.remove(); };
        o.querySelector('[data-ok]').onclick = function () {
          try { U().fs().collection('reports').add({ by: U().uid(), target: u, cid: U().cid() || '', reason: why, note: ($('o67Note').value || '').slice(0, 300), ts: Date.now() }).then(function () { toast('Thanks. We will review your report.'); }).catch(function () { toast('Could not send the report. Try again.'); }); } catch (e) { }
          o.remove();
        };
      });
    };
    blockUI();
  }

  /* ---------- delete account ---------- */
  function deleteDlg() {
    dlg('<h3>Delete your account?</h3><p>This permanently removes your profile, phone link, devices, backups and the messages and statuses you sent. Your partner keeps their own chat. Files you shared stay on the media host until it is cleaned up. This cannot be undone.</p><p>Type <b>DELETE</b> to confirm.</p><input class="o67in" id="o67Cf" autocomplete="off" autocapitalize="characters"><div class="o67row"><button class="o67b alt" type="button" data-c>Cancel</button><button class="o67b red" type="button" data-ok disabled>Delete account</button></div>', function (o) {
      var ok = o.querySelector('[data-ok]'), inp = o.querySelector('#o67Cf');
      inp.oninput = function () { ok.disabled = inp.value.trim() !== 'DELETE'; }; o.querySelector('[data-c]').onclick = function () { o.remove(); };
      ok.onclick = function () {
        ok.disabled = true; ok.textContent = '...';
        try { window.firebase.functions().httpsCallable('deleteMyAccount', { timeout: 300000 })().then(function () { try { window.firebase.auth().signOut(); } catch (e) { } try { localStorage.clear(); } catch (e) { } location.reload(); }).catch(function (e) { ok.disabled = false; ok.textContent = 'Delete account'; toast('Could not delete: ' + ((e && e.message) || 'try again')); }); } catch (e) { toast('Not available right now.'); ok.disabled = false; }
      };
    });
  }


  /* ---------- signed uploads (plan limits and storage quota are checked on the server) ---------- */
  window.__signUp = async function (blob, type, raw, cid) {
    var kind = raw ? 'doc' : (type && type.indexOf('video/') === 0) ? 'video' : (type && type.indexOf('audio/') === 0) ? 'audio' : 'image';
    try { var r = await window.firebase.functions().httpsCallable('signUpload', { timeout: 15000 })({ kind: kind, size: blob.size, cid: cid || '' }); return r.data; }
    catch (e) {
      if (e && e.code === 'functions/resource-exhausted') { toast(e.message || 'Plan limit reached.'); if (current() !== 'plus') paywall('You reached the limit of your plan.'); var x = new Error('PLAN_LIMIT'); x.planLimit = true; throw x; }
      return null; /* not configured yet or offline: the app falls back to the old unsigned upload */
    }
  };
  window.__maxMedia = function () { var L = LIM[current()]; return Math.max(L.video, L.doc) * 1048576; };

  /* ---------- HD calls: Plus gets 720p, others 480p (the camera picture only) ---------- */
  try {
    var md = navigator.mediaDevices, gum = md && md.getUserMedia;
    if (gum) md.getUserMedia = function (c) {
      try { if (c && c.video && JSON.stringify(c.video.facingMode || '').indexOf('user') > -1 && !c.video.width && !c.video.height) { var plus = current() === 'plus', v = Object.assign({}, c.video, { width: { ideal: plus ? 1280 : 640 }, height: { ideal: plus ? 720 : 480 }, frameRate: { ideal: plus ? 30 : 24 } }); c = Object.assign({}, c, { video: v }); } } catch (e) { }
      return gum.call(md, c);
    };
  } catch (e) { }

  /* ---------- referral ---------- */
  function referralDlg() {
    dlg('<h3>Invite a couple</h3><p>When another couple joins with your code, you and your partner get <b>1 week of Couple Pro</b> (up to 8 weeks).</p><div class="o68ans" id="o67Rc" style="font-size:22px;font-weight:800;letter-spacing:3px;text-align:center">...</div><div class="o67row"><button class="o67b" type="button" id="o67Rs2">Share my code</button></div><p style="margin-top:16px">Have a code from a friend?</p><input class="o67in" id="o67Ri" maxlength="8" placeholder="Enter code" autocapitalize="characters"><div class="o67row"><button class="o67b alt" type="button" id="o67Ra">Apply code</button></div>', function (o) {
      var code = '';
      try { window.firebase.functions().httpsCallable('getReferralCode')().then(function (r) { code = r.data.code; $('o67Rc').textContent = code + (r.data.count ? '   (' + r.data.count + ' joined)' : ''); }).catch(function () { $('o67Rc').textContent = 'Not available right now'; }); } catch (e) { }
      $('o67Rs2').onclick = function () { if (!code) return; var t = 'Join me on OnlyUs, a private space for two. Use my code ' + code + ' when you sign up.'; if (navigator.share) navigator.share({ text: t }).catch(function () { }); else { try { navigator.clipboard.writeText(t); } catch (e) { } toast('Copied'); } };
      $('o67Ra').onclick = function () { var v = $('o67Ri').value.trim(); if (!v) return; try { window.firebase.functions().httpsCallable('claimReferral')({ code: v }).then(function (r) { toast(r.data.gift ? 'Done! Your friend got a week of Pro.' : 'Code saved.'); o.remove(); }).catch(function (e) { toast((e && e.message) || 'Could not apply the code.'); }); } catch (e) { toast('Not available right now.'); } };
    });
  }

  /* ---------- keep everything in sync ---------- */
  function applyAll() { listen(); lockGames(); lockScenes(); planRow(); palCard(); applyPal(); tools(); blockUI(); if (current() === 'free') R.classList.remove('lg'); }
  var q = 0; function soon() { if (q) return; q = setTimeout(function () { q = 0; applyAll(); }, 120); }
  new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  setInterval(function () { listen(); blockUI(); }, 1500);
  window.addEventListener('onlyus-lang', soon);
  applyAll();
})();
