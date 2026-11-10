/* OnlyUs home-edit-v80.js - hold any home box to edit like a phone home screen.
   Hold = wiggle mode. Drag = move. Drop a small box onto another = make a folder ("Box"). Tap a Box = open it.
   (-) hides a box, x on a Box dissolves it, arrows on a photo switch it between square and wide. "+ Add" brings hidden boxes back.
   Layout is stored on this phone (onlyus-h80). Works on top of home-board-v77.js without changing it. */
(function () {
  'use strict';
  if (window.__h80) return;
  var KEY = 'onlyus-h80', R = document.documentElement, EDIT = 0, G = null, S = load(), D = null, LP = null, swallow = 0, MO;
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return { o: s.o || [], h: s.h || [], f: s.f || {}, z: s.z || {} }; } catch (e) { return { o: [], h: [], f: {}, z: {} }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var buzz = function (n) { try { navigator.vibrate && navigator.vibrate(n); } catch (e) { } };
  var toast = function (m) { try { window.__us.toast(m); } catch (e) { } };

  function cid(c) {
    if (c.dataset.h80f) return c.dataset.h80f;
    var x = c.querySelector('[data-a]'); if (x) return x.dataset.a;
    x = c.querySelector('[data-st]'); if (x) return 'st' + x.dataset.st;
    x = c.querySelector('[data-ph]'); if (x) return 'ph' + x.dataset.ph;
    return c.querySelector('.h77cal') ? 'cal' : null;
  }
  var isF = function (c) { return !!(c && c.dataset.h80f); };
  var isTile = function (c) { return !!(c && !isF(c) && !c.classList.contains('w2') && !c.classList.contains('w4') && c.querySelector('[data-a]')); };
  var NAMES = { ph1: ['🖼️', 'Photo: Us'], ph2: ['🖼️', 'Photo: Memories'], cal: ['📅', 'Calendar'], st0: ['✨', 'Sticker 1'], st1: ['✨', 'Sticker 2'] };
  function lab(c, id) { var l = c.querySelector('.h77l'); return l ? l.textContent : (NAMES[id] ? NAMES[id][1] : id); }
  function icon(c, id) { var i = c.querySelector('.ic'); return i ? i.innerHTML : '<span>' + (NAMES[id] ? NAMES[id][0] : '•') + '</span>'; }

  /* ---------------- apply saved layout to the board grid */
  function apply() {
    if (!G || !G.isConnected) return; MO.disconnect();
    Array.prototype.forEach.call(G.querySelectorAll('.h80f'), function (n) { n.remove(); });
    var map = {}, cells = Array.prototype.slice.call(G.children), inF = {};
    Object.keys(S.f).forEach(function (fid) { (S.f[fid].i || []).forEach(function (i) { inF[i] = fid; }); });
    cells.forEach(function (c) { var id = cid(c); if (!id) return; c.dataset.h80id = id; map[id] = c; });
    var seq = [], seen = {};
    S.o.forEach(function (id) { if (seen[id]) return; if (S.f[id] || map[id]) { seq.push(id); seen[id] = 1; } });
    cells.forEach(function (c) { var id = c.dataset.h80id; if (id && !seen[id] && !inF[id]) { seq.push(id); seen[id] = 1; } });
    Object.keys(S.f).forEach(function (fid) { if (!seen[fid]) { seq.push(fid); seen[fid] = 1; } });
    seq.forEach(function (id) {
      var c = map[id];
      if (S.f[id]) { c = folderNode(id); if (!c) return; } else if (!c || inF[id]) return;
      G.appendChild(c);
    });
    Array.prototype.slice.call(G.children).forEach(function (c) {
      var id = c.dataset.h80id; if (!id) return;
      c.classList.toggle('h80in', !!inF[id]); c.classList.toggle('h80hid', S.h.indexOf(id) > -1);
      if (/^ph/.test(id)) { c.classList.remove('w2', 'w4'); c.classList.add(S.z[id] || 'w2'); }
      badges(c, id);
    });
    MO.observe(G, { childList: true });
  }
  function badges(c, id) {
    Array.prototype.forEach.call(c.querySelectorAll(':scope>.h80b'), function (b) { b.remove(); });
    var f = isF(c), h = '<button type="button" class="h80b" data-h80="' + (f ? 'unf' : 'hide') + '" aria-label="' + (f ? 'Dissolve box' : 'Hide') + '">' + (f ? '✕' : '–') + '</button>';
    if (/^ph/.test(id)) h += '<button type="button" class="h80b r" data-h80="size" aria-label="Resize">⤢</button>';
    c.insertAdjacentHTML('beforeend', h);
  }
  function folderNode(fid) {
    var F = S.f[fid], items = (F.i || []).map(function (i) { return G.querySelector('[data-h80id="' + CSS.escape(i) + '"]'); }).filter(Boolean);
    if (!items.length) { delete S.f[fid]; save(); return null; }
    var n = document.createElement('div'); n.className = 'h77c h80f'; n.dataset.h80f = fid; n.dataset.h80id = fid;
    n.innerHTML = '<button type="button" class="h77t h80fb" aria-label="' + esc(F.n) + '"><span class="h80mini">' + items.slice(0, 4).map(function (c) { return '<i>' + icon(c, c.dataset.h80id) + '</i>'; }).join('') + '</span></button><div class="h77l">' + esc(F.n || 'Box') + '</div>';
    return n;
  }
  function cellsOrder() { return Array.prototype.map.call(G.children, function (c) { return c.dataset.h80id; }).filter(function (id) { return id && !G.querySelector('.h80in[data-h80id="' + CSS.escape(id) + '"]'); }); }

  /* ---------------- edit mode */
  function bar() {
    var b = $('h77Board'); if (!b || $('h80Bar')) return;
    var d = document.createElement('div'); d.id = 'h80Bar'; d.className = 'h80bar';
    d.innerHTML = '<b>Edit home</b><button type="button" data-h80="add">＋ Add</button><button type="button" data-h80="done">Done</button>'; b.prepend(d);
  }
  function enter() { EDIT = 1; R.classList.add('h80-edit'); bar(); buzz(20); toast('Drag to move · drop one on another to make a box'); }
  function leave() { EDIT = 0; R.classList.remove('h80-edit'); var b = $('h80Bar'); if (b) b.remove(); closeOv(); }
  function closeOv() { var o = $('h80Ov'); if (o) o.remove(); }
  function ov(inner, cls) { closeOv(); var o = document.createElement('div'); o.id = 'h80Ov'; o.innerHTML = '<div class="h80card ' + (cls || '') + '">' + inner + '</div>'; o.addEventListener('pointerdown', function (e) { if (e.target === o) closeOv(); }); document.body.appendChild(o); return o; }
  function openAdd() {
    var hid = S.h.map(function (id) { var c = G.querySelector('[data-h80id="' + CSS.escape(id) + '"]'); return c ? '<button type="button" class="h80it" data-h80="show" data-id="' + esc(id) + '"><span class="h77t"><span class="ic">' + icon(c, id) + '</span></span><small>' + esc(lab(c, id)) + '</small></button>' : ''; }).join('');
    var o = ov('<b class="h80t">Hidden boxes</b><div class="h80gr">' + (hid || '<p class="h80e">Nothing hidden. Tap – on a box to hide it.</p>') + '</div><button type="button" class="h80rs" data-h80="reset">↺ Reset home layout</button>');
  }
  function openBox(fid) {
    var F = S.f[fid]; if (!F) return;
    var items = F.i.map(function (id) { return G.querySelector('[data-h80id="' + CSS.escape(id) + '"]'); }).filter(Boolean);
    var o = ov('<input class="h80nm" maxlength="18" value="' + esc(F.n || 'Box') + '" aria-label="Box name"><div class="h80gr">' + items.map(function (c) { var id = c.dataset.h80id; return '<div class="h80it"><button type="button" data-h80="go" data-id="' + esc(id) + '"><span class="h77t"><span class="ic">' + icon(c, id) + '</span></span><small>' + esc(lab(c, id)) + '</small></button>' + (EDIT ? '<button type="button" class="h80b" data-h80="out" data-id="' + esc(id) + '" data-f="' + fid + '">↗</button>' : '') + '</div>'; }).join('') + '</div>', 'box');
    o.querySelector('.h80nm').addEventListener('change', function (e) { F.n = e.target.value.trim() || 'Box'; save(); apply(); });
  }
  function act(el, e) {
    var a = el.dataset.h80, id = el.dataset.id, c = el.closest('.h77c'), cidv = c && c.dataset.h80id, i;
    if (a === 'done') leave();
    else if (a === 'add') openAdd();
    else if (a === 'hide') { if (S.h.indexOf(cidv) < 0) S.h.push(cidv); else S.h = S.h.filter(function (x) { return x !== cidv; }); save(); apply(); }
    else if (a === 'show') { S.h = S.h.filter(function (x) { return x !== id; }); save(); apply(); openAdd(); }
    else if (a === 'size') { S.z[cidv] = c.classList.contains('w4') ? 'w2' : 'w4'; save(); apply(); }
    else if (a === 'unf') { var F = S.f[cidv]; if (F) { var at = S.o.indexOf(cidv); S.o.splice.apply(S.o, [at < 0 ? S.o.length : at, 1].concat(F.i)); delete S.f[cidv]; save(); apply(); } }
    else if (a === 'out') { var FF = S.f[el.dataset.f]; if (FF) { FF.i = FF.i.filter(function (x) { return x !== id; }); S.o.push(id); save(); closeOv(); apply(); } }
    else if (a === 'go') { var t = G.querySelector('[data-h80id="' + CSS.escape(id) + '"] button,[data-h80id="' + CSS.escape(id) + '"] [data-a]'); closeOv(); setTimeout(function () { if (t) t.click(); }, 140); }
    else if (a === 'reset') { S = { o: [], h: [], f: {}, z: {} }; save(); closeOv(); apply(); toast('Home layout reset'); }
  }
  function merge(d, t) {
    var di = d.dataset.h80id, ti = t.dataset.h80id, fid;
    if (isF(t)) { fid = ti; S.f[fid].i.push(di); } else { fid = 'f' + Date.now().toString(36); S.f[fid] = { n: 'Box', i: [ti, di] }; }
    var ord = cellsOrder(); ord = ord.filter(function (x) { return x !== di; }); S.o = ord.map(function (x) { return x === ti && !isF(t) ? fid : x; });
    save(); apply(); buzz(25);
  }

  /* ---------------- pointer handling */
  function cell(e) { var c = e.target.closest && e.target.closest('.h77c'); return c && G && c.parentNode === G ? c : null; }
  document.addEventListener('pointerdown', function (e) {
    if (!G || !e.target.closest || !e.target.closest('#h77Board') || e.button > 0 || e.target.closest('[data-h80],.h80bar')) return;
    var c = cell(e); if (!c) return;
    if (!EDIT) { LP = { x: e.clientX, y: e.clientY, t: setTimeout(function () { LP = null; swallow = 1; enter(); setTimeout(function () { swallow = 0; }, 700); }, 520) }; return; }
    D = { c: c, x: e.clientX, y: e.clientY, go: 0, tgt: null, ok: null, tm: 0 };
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (LP && Math.hypot(e.clientX - LP.x, e.clientY - LP.y) > 9) { clearTimeout(LP.t); LP = null; }
    if (!D) return;
    if (!D.go) { if (Math.hypot(e.clientX - D.x, e.clientY - D.y) < 8) return; D.go = 1; var r = D.c.getBoundingClientRect(); D.g = D.c.cloneNode(true); D.g.classList.add('h80ghost'); D.g.style.cssText = 'width:' + r.width + 'px;height:' + r.height + 'px;left:' + r.left + 'px;top:' + r.top + 'px'; D.ox = e.clientX - r.left; D.oy = e.clientY - r.top; document.body.appendChild(D.g); D.c.classList.add('h80drag'); buzz(10); scrollLoop(); }
    D.px = e.clientX; D.py = e.clientY; D.g.style.left = (e.clientX - D.ox) + 'px'; D.g.style.top = (e.clientY - D.oy) + 'px';
    var el = document.elementFromPoint(e.clientX, e.clientY), t = el && el.closest && el.closest('.h77c');
    if (!t || t.parentNode !== G || t === D.c || t.classList.contains('h80hid')) { clearTgt(); return; }
    var r2 = t.getBoundingClientRect(), cx = r2.left + r2.width / 2, cy = r2.top + r2.height / 2;
    var mid = Math.abs(e.clientX - cx) < r2.width * .24 && Math.abs(e.clientY - cy) < r2.height * .24;
    if (mid && isTile(D.c) && (isTile(t) || isF(t))) { if (D.tgt !== t) { clearTgt(); D.tgt = t; D.tm = setTimeout(function () { D.ok = t; t.classList.add('h80tgt'); buzz(12); }, 420); } return; }
    clearTgt(); G.insertBefore(D.c, e.clientX < cx ? t : t.nextSibling);
  }, true);
  function clearTgt() { if (!D) return; clearTimeout(D.tm); if (D.tgt) D.tgt.classList.remove('h80tgt'); D.tgt = D.ok = null; }
  function sp(el) { while (el && el !== document.body) { var s = getComputedStyle(el).overflowY; if ((s === 'auto' || s === 'scroll') && el.scrollHeight > el.clientHeight + 2) return el; el = el.parentElement; } return document.scrollingElement; }
  function scrollLoop() { if (!D || !D.go) return; var h = innerHeight, y = D.py || 0, v = y < 90 ? -10 : y > h - 90 ? 10 : 0; if (v) { var s = sp(G); if (s) s.scrollTop += v; } requestAnimationFrame(scrollLoop); }
  function end() {
    if (LP) { clearTimeout(LP.t); LP = null; }
    if (!D) return; var d = D; D = null;
    if (d.g) d.g.remove(); d.c.classList.remove('h80drag'); clearTimeout(d.tm); if (d.tgt) d.tgt.classList.remove('h80tgt');
    if (!d.go) return;
    swallow = 1; setTimeout(function () { swallow = 0; }, 120);
    if (d.ok && d.ok.isConnected) merge(d.c, d.ok); else { S.o = cellsOrder(); save(); apply(); }
  }
  document.addEventListener('pointerup', end, true); document.addEventListener('pointercancel', end, true);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('#h77Board .h77c')) e.preventDefault(); }, true);
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    var b = t.closest('[data-h80]'); if (b) { e.stopPropagation(); e.preventDefault(); act(b, e); return; }
    if (swallow && t.closest('#h77Board')) { e.stopPropagation(); e.preventDefault(); return; }
    var c = G && t.closest('#h77Board .h77c');
    if (c && c.parentNode === G && isF(c)) { e.stopPropagation(); e.preventDefault(); openBox(c.dataset.h80f); return; }
    if (EDIT && t.closest('#h77Board') && !t.closest('[data-cam]') && !t.closest('.h80bar')) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* ---------------- boot */
  var css = '' +
    '.h77c.h80hid,.h77c.h80in{display:none!important}html.h80-edit .h77c.h80hid{display:block!important;opacity:.38}html.h80-edit .h77c.h80hid::after{content:"hidden";position:absolute;inset:0;display:grid;place-items:center;font:700 11px system-ui;color:var(--ink);pointer-events:none}' +
    'html.h80-edit .h77c{touch-action:none;-webkit-user-select:none;user-select:none}html:not(.h80-edit) .h77c{-webkit-touch-callout:none}' +
    '@keyframes h80w{from{rotate:-1.3deg}to{rotate:1.3deg}}@keyframes h80x{from{rotate:-.4deg}to{rotate:.4deg}}' +
    'html.h80-edit .h77c:not(.h80drag){animation:h80w .26s ease-in-out infinite alternate;animation-delay:calc(var(--i,0)*-37ms)}html.h80-edit .h77c.w2:not(.h80drag),html.h80-edit .h77c.w4:not(.h80drag){animation-name:h80x}' +
    '@media (prefers-reduced-motion:reduce){html.h80-edit .h77c{animation:none!important}}' +
    '.h77c.h80drag{opacity:.25}.h80ghost{position:fixed!important;z-index:2147483000;pointer-events:none;scale:1.1;opacity:.95;filter:drop-shadow(0 16px 24px rgba(0,0,0,.35));margin:0!important;animation:none!important}' +
    '.h77c.h80tgt .h77t{outline:3px solid var(--acc);outline-offset:3px;scale:1.12;transition:scale .15s}' +
    '.h80b{display:none;position:absolute;z-index:4;left:-7px;top:-7px;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.7);background:rgba(30,24,44,.82);color:#fff;font:700 14px/1 system-ui;place-items:center;padding:0;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.3)}.h80b.r{left:auto;right:-7px}' +
    'html.h80-edit .h77c>.h80b{display:grid}.h80it .h80b{display:grid;left:auto;right:2px;top:-4px}' +
    '.h80bar{position:sticky;top:calc(6px + env(safe-area-inset-top,0px));z-index:30;display:flex;align-items:center;gap:8px;margin:-6px 0 16px;padding:8px 10px 8px 16px;border-radius:999px;color:var(--ink);border:1px solid var(--sbd,rgba(255,255,255,.5));background:var(--scard,var(--panel));box-shadow:var(--ssh),var(--shl);-webkit-backdrop-filter:var(--sblur);backdrop-filter:var(--sblur)}.h80bar b{flex:1;font-size:15px}' +
    '.h80bar button{border:0;border-radius:999px;padding:8px 14px;font:600 13px system-ui;color:var(--ink);background:color-mix(in srgb,var(--acc) 14%,transparent);cursor:pointer}.h80bar button[data-h80=done]{background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc) 55%,#ff9ecb));color:#fff}' +
    '.h80mini{display:grid;grid-template-columns:1fr 1fr;gap:6%;width:68%;height:68%}.h80mini i{display:grid;place-items:center;border-radius:28%;background:color-mix(in srgb,var(--acc) 14%,transparent);padding:14%}.h80mini svg{width:100%;height:100%}' +
    '#h80Ov{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;background:rgba(12,7,22,.5);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);animation:h80f .2s ease}@keyframes h80f{from{opacity:0}}' +
    '.h80card{width:min(340px,88vw);max-height:80vh;overflow:auto;border-radius:32px;padding:20px;color:#fff;border:1px solid rgba(255,255,255,.45);background:linear-gradient(150deg,rgba(255,255,255,.26),rgba(255,255,255,.08));box-shadow:0 24px 60px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.5);animation:v79pop .35s cubic-bezier(.2,.9,.3,1.3);--g1:rgba(255,255,255,.3);--g2:rgba(255,255,255,.1);--gb:rgba(255,255,255,.5);--gt:#fff;--gs:rgba(0,0,0,.3);--gi:inset 0 1px 0 rgba(255,255,255,.5)}' +
    '.h80t,.h80nm{display:block;width:100%;box-sizing:border-box;text-align:center;font:700 18px system-ui;color:#fff;background:none;border:0;margin:0 0 14px;outline:0}.h80nm{border-bottom:1px dashed rgba(255,255,255,.4);padding:4px}' +
    '.h80gr{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 10px}.h80it{position:relative}.h80it>button,button.h80it{all:unset;cursor:pointer;display:block;text-align:center;width:100%}.h80it .h77t{width:100%;pointer-events:none}.h80it small{display:block;margin-top:6px;font:600 11px system-ui;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.h80e{grid-column:1/-1;text-align:center;opacity:.8;font:13px system-ui;margin:6px 0}' +
    '.h80rs{all:unset;cursor:pointer;display:block;margin:18px auto 0;padding:10px 16px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);font:600 13px system-ui;color:#fff}';
  var st = document.createElement('style'); st.id = 'h80css'; st.textContent = css; document.head.appendChild(st);
  MO = new MutationObserver(function () { apply(); });
  setInterval(function () {
    var g = document.querySelector('#h77Board .h77grid');
    if (g && g !== G) { G = g; MO.observe(G, { childList: true }); apply(); }
    var l = $('vList'); if (EDIT && !(l && l.classList.contains('on'))) leave();
  }, 300);
  window.__h80 = { edit: enter, done: leave };
})();
