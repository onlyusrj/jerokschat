/* OnlyUs pro-v65.js  -  everyday "WhatsApp-style" features
   Chat list: pin (up to 3) + archive, long-press menu          Saved messages (message yourself)
   Message info, labels (tags) + labels list, @mentions         Link preview cards, clickable links
   Location sharing (map card)                                  Auto-translate (per chat)
   Per-chat message sound                                       Media auto-download (Wi-Fi / mobile)
   Storage manager, backup + restore                            Picture-in-picture for video calls
   Hooks used (small edits in index.html):  __sheetX, __bubbleX, __mediaSrc, __proTone, __us.open / __us.addContact */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var PFX = 'onlyus-pro-';
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(PFX + k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) {} }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function toast(m) { try { U().toast(m); } catch (e) {} }
  function F() { return window.__fx || {}; }
  function dlg(title, node, btns) { if (F().dlg) F().dlg(title, node, btns); }
  function selfUid() { try { return U().uid && U().uid(); } catch (e) { return ''; } }
  function fmtSize(n) { n = +n || 0; if (n < 1024) return n + ' B'; if (n < 1048576) return (n / 1024).toFixed(0) + ' KB'; if (n < 1073741824) return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB'; return (n / 1073741824).toFixed(1) + ' GB'; }
  function fmtDT(ts) { try { return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function svg(d, sw) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var IC = {
    pin: svg('<path d="M12 17v5M8.5 3h7l-1 6.5 3 3.5h-12l3-3.5z"/>'),
    archive: svg('<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 12h4"/>'),
    bookmark: svg('<path d="M6 3h12v18l-6-4-6 4z"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    tag: svg('<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    mappin: svg('<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
    bell: svg('<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4"/>'),
    pip: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="6" rx="1" fill="currentColor"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.4),
    back: svg('<path d="M15 5l-7 7 7 7"/>', 2.2),
    db: svg('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>')
  };
  window.__proUI = { jget: jget, jset: jset, el: el, svg: svg, IC: IC, fmtSize: fmtSize };

  /* ====================================================================== CSS */
  var css = el('style');
  css.textContent = [
    '.proA{display:flex!important;align-items:center;gap:14px;font-size:16px}.proA svg{width:22px;height:22px;flex:none;color:var(--dim)}.proA.proDng{color:#e5484d}.proA.proDng svg{color:#e5484d}',
    '.proA .proOn{margin-left:auto;color:var(--acc)}.proA .proOn svg{color:var(--acc);width:20px;height:20px}',
    '.proSheetT{padding:4px 18px 10px;font-size:13px;color:var(--dim);font-weight:600;letter-spacing:.02em}',
    '.ct .proPin{display:inline-flex;margin-left:6px;color:var(--dim)}.ct .proPin svg{width:15px;height:15px;transform:rotate(35deg)}',
    '.ct.proArch .av,.ct.proSaved .av{display:grid;place-items:center;background:color-mix(in srgb,var(--acc) 16%,var(--panel));color:var(--acc)}.ct.proArch .av svg,.ct.proSaved .av svg{width:24px;height:24px}',
    '.ct.proArch b{font-weight:600}.ct.proArchRow{opacity:.86}.proArch .rt .bd{background:var(--acc);color:#fff;border-radius:11px;padding:1px 8px;font-size:12px}',
    '#vChat[data-saved="1"] #cab,#vChat[data-saved="1"] #cvb,#vChat[data-saved="1"] #cs{display:none!important}',
    '.proLab{display:inline-flex;align-items:center;gap:5px;margin:4px 6px 0 0;padding:2px 9px 2px 7px;border-radius:12px;font-size:11.5px;font-weight:600;background:rgba(127,127,127,.16);color:var(--ink)}',
    '.proLab i{width:8px;height:8px;border-radius:50%;display:inline-block}',
    '.proMen{color:var(--acc);font-weight:600}.proMen.me{background:color-mix(in srgb,var(--acc) 20%,transparent);border-radius:5px;padding:0 3px}',
    '.m a.proLnk{color:var(--blue,#2a7de1);text-decoration:underline;word-break:break-all}',
    '.proLk{display:block;margin:6px 0 2px;border-radius:12px;overflow:hidden;background:rgba(127,127,127,.12);border-left:4px solid var(--acc);color:inherit;text-decoration:none;max-width:290px}',
    '.proLk img{display:block;width:100%;max-height:160px;object-fit:cover;background:#0002}',
    '.proLk .t{padding:7px 10px 8px}.proLk b{display:block;font-size:14px;line-height:1.25;margin-bottom:2px;word-break:break-word}',
    '.proLk small{display:block;color:var(--dim);font-size:12px;line-height:1.3;word-break:break-word}.proLk .s{font-size:11.5px;opacity:.85;margin-top:3px}',
    '.proMap{display:block;position:relative;width:260px;max-width:100%;border-radius:12px;overflow:hidden;background:#cfe3d4;color:inherit;text-decoration:none}',
    '.proMap .tl{position:relative;height:150px;overflow:hidden;background:#dfe9dd}.proMap .tl img{position:absolute;width:256px;height:256px;max-width:none}',
    '.proMap .pn{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-34px 0 0 -17px;color:#e5484d;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))}.proMap .pn svg{width:34px;height:34px;fill:currentColor;stroke:#fff;stroke-width:1.2}',
    '.proMap .ft{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:rgba(127,127,127,.14);font-size:13px;font-weight:600;color:var(--ink)}.proMap .ft span{color:var(--acc);font-weight:700}',
    '.proMap .at{position:absolute;right:4px;bottom:36px;font-size:9px;background:rgba(255,255,255,.8);color:#333;padding:0 4px;border-radius:3px}',
    '.proTr{margin-top:6px;padding:6px 9px;border-radius:10px;background:rgba(127,127,127,.14);font-size:.93em;font-style:italic;display:flex;gap:6px;align-items:flex-start}.proTr svg{width:14px;height:14px;flex:none;margin-top:3px;color:var(--dim)}',
    '.proDl{position:relative;display:inline-block;max-width:100%}.proDl>.proBlk{display:block;min-width:210px;min-height:150px;max-width:100%;background:#00000030;border-radius:12px;object-fit:cover;filter:none}',
    '.proDl .proDb{all:unset;cursor:pointer;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:7px;align-items:center;background:rgba(0,0,0,.62);color:#fff;padding:9px 15px;border-radius:22px;font-size:14px;font-weight:600;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.proDl .proDb svg{width:18px;height:18px}',
    '.m.proRound{background:transparent!important;box-shadow:none!important;padding:3px!important}.m.proRound video.pic{width:220px;height:220px;max-width:62vw;max-height:62vw;border-radius:50%;object-fit:cover;background:#000}',
    '.m.proRound .proRp{position:absolute;left:50%;top:104px;transform:translate(-50%,-50%);width:54px;height:54px;border-radius:50%;background:rgba(0,0,0,.45);display:grid;place-items:center;color:#fff;pointer-events:none}.m.proRound .proRp svg{width:26px;height:26px;fill:#fff}',
    '.m.proRound{position:relative}',
    '.proMenPop{position:fixed;z-index:30;left:10px;right:10px;max-width:420px;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);overflow:hidden}',
    '.proMenPop button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:10px;align-items:center;width:100%;padding:11px 16px;color:var(--ink)}.proMenPop button:active{background:var(--line)}',
    '.proOv{position:fixed;inset:0;z-index:40;background:var(--bg);color:var(--ink);display:none;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}.proOv.on{display:flex;animation:proIn .22s ease both}@keyframes proIn{from{opacity:0;transform:translateY(12px)}}',
    '.proTop{display:flex;align-items:center;gap:6px;padding:8px 8px;border-bottom:1px solid var(--line);background:var(--panel)}.proTop b{font-size:18px;flex:1;margin-left:4px}',
    '.proIc{all:unset;cursor:pointer;display:grid;place-items:center;width:42px;height:42px;border-radius:50%;color:var(--ink)}.proIc svg{width:24px;height:24px}.proIc:active{background:var(--line)}',
    '.proBody{flex:1;overflow:auto;padding:12px 14px calc(18px + env(safe-area-inset-bottom,0px));-webkit-overflow-scrolling:touch}',
    '.proChips{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.proChip{all:unset;cursor:pointer;padding:6px 12px;border-radius:16px;background:var(--panel);border:1px solid var(--line);font-size:13px;color:var(--ink)}.proChip.on{background:var(--acc);border-color:var(--acc);color:#fff}',
    '.proItem{display:block;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;padding:11px 12px;margin-bottom:8px;border-radius:12px;background:var(--panel);border:1px solid var(--line);color:var(--ink);font:inherit}.proItem small{display:block;color:var(--dim);margin-top:3px}',
    '.proEmpty{padding:40px 10px;text-align:center;color:var(--dim)}',
    '.proInfo{display:grid;gap:0}.proInfo div{display:flex;justify-content:space-between;gap:14px;padding:9px 2px;border-bottom:1px solid var(--line);font-size:14.5px}.proInfo div:last-child{border:0}.proInfo span{color:var(--dim)}.proInfo b{font-weight:600;text-align:right}',
    '#spPg_data .proStat{padding:6px 2px 12px;color:var(--dim);font-size:14px;line-height:1.5}#spPg_data .proStat b{color:var(--ink)}',
    '#spPg_data .proLbl{display:block;margin:10px 2px 6px;font-size:14px;color:var(--dim)}',
    '#spPg_data .proChatRow{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:6px;border-radius:12px;background:var(--panel);border:1px solid var(--line)}#spPg_data .proChatRow b{flex:1;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#spPg_data .proChatRow span{color:var(--dim);font-size:13.5px}',
    '#spPg_data .proChatRow button{all:unset;cursor:pointer;color:var(--acc);font-weight:600;font-size:13.5px;padding:4px 8px}',
    '#proPip{position:absolute;z-index:6;right:14px;top:calc(env(safe-area-inset-top,0px) + 214px);display:none;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.35);color:#fff;place-items:center;cursor:pointer;padding:0}#proPip svg{width:22px;height:22px}#clView.vid #proPip{display:grid}',
    '.proSw{margin-left:auto}'
  ].join('\n');
  document.head.appendChild(css);

  /* =============================================================== helpers */
  function closeSheet() { var s = $('sheet'); if (s) s.classList.remove('on'); }
  function sheetMenu(title, items) {
    var s = $('sh'); if (!s) return;
    s.textContent = '';
    if (title) s.appendChild(el('div', 'proSheetT', title));
    items.forEach(function (it) {
      var b = el('button', 'a proA' + (it.danger ? ' proDng' : '')); b.type = 'button';
      var i = el('span'); i.innerHTML = it.ic || ''; i.style.display = 'contents'; b.appendChild(i);
      b.appendChild(el('span', '', it.t));
      if (it.on) { var o = el('span', 'proOn'); o.innerHTML = IC.check; b.appendChild(o); }
      b.onclick = function () { if (!it.keep) closeSheet(); try { it.f && it.f(); } catch (e) { console.error(e); } };
      s.appendChild(b);
    });
    $('sheet').classList.add('on');
  }
  function panel(title) {
    var o = el('div', 'proOv'), top = el('div', 'proTop'), bk = el('button', 'proIc'); bk.type = 'button'; bk.innerHTML = IC.back; bk.setAttribute('aria-label', 'Back');
    var body = el('div', 'proBody');
    top.append(bk, el('b', '', title)); o.append(top, body); document.body.appendChild(o);
    var api = { body: body, close: function () { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 240); } };
    bk.onclick = api.close; requestAnimationFrame(function () { o.classList.add('on'); });
    return api;
  }
  /* shared by pro-media-v65.js: add an item to the attach (paper-clip) menu */
  window.__proAttach = function (id, label, color, iconSvg, fn) {
    var m = $('attMenu'); if (!m || m.querySelector('[data-a="' + id + '"]')) return;
    var b = el('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.a = id;
    var i = el('i'); i.style.background = color; i.innerHTML = iconSvg; b.appendChild(i); b.appendChild(el('span', '', label));
    b.addEventListener('click', function (e) { e.stopPropagation(); m.classList.remove('on'); try { fn(); } catch (x) { console.error(x); } });
    var pfd = $('pfd'); if (pfd) m.insertBefore(b, pfd); else m.appendChild(b);
  };
  window.__proPanel = panel; window.__proSheet = sheetMenu;

  /* ========================================================= 1) CHAT LIST */
  var showArch = false, supUntil = 0, obs = null, busy = false;
  function pins() { return jget('pins', []); }
  function arch() { return jget('arch', []); }
  function togglePin(uid) {
    var p = pins(), i = p.indexOf(uid);
    if (i >= 0) p.splice(i, 1); else { if (p.length >= 3) return toast('You can pin up to 3 chats'); p.push(uid); }
    jset('pins', p); applyList();
  }
  function toggleArch(uid) {
    var a = arch(), i = a.indexOf(uid);
    if (i >= 0) a.splice(i, 1); else { a.push(uid); var p = pins(), j = p.indexOf(uid); if (j >= 0) { p.splice(j, 1); jset('pins', p); } }
    jset('arch', a); applyList(); toast(i >= 0 ? 'Chat unarchived' : 'Chat archived');
  }
  function rowMenu(row) {
    var uid = row.dataset.uid; if (!uid) return;
    var name = (row.querySelector('b') || {}).textContent || 'Chat';
    var isP = pins().indexOf(uid) >= 0, isA = arch().indexOf(uid) >= 0;
    sheetMenu(name.replace(/^[^\p{L}\p{N}]+/u, ''), [
      { ic: IC.pin, t: isP ? 'Unpin chat' : 'Pin chat', f: function () { togglePin(uid); } },
      { ic: IC.archive, t: isA ? 'Unarchive' : 'Archive chat', f: function () { toggleArch(uid); } },
      { ic: IC.trash, t: 'Remove chat', danger: 1, f: function () { var x = row.querySelector('.x'); if (x) x.click(); } }
    ]);
  }
  function applyList() {
    var l = $('cl'); if (!l || busy) return;
    busy = true; if (obs) obs.disconnect();
    try {
      var old = l.querySelector(':scope > .proArch'); if (old) old.remove();
      var rows = Array.prototype.filter.call(l.children, function (r) { return r.classList && r.classList.contains('ct'); });
      var P = pins(), A = arch(), me = selfUid(), archRows = [], unread = 0;
      rows.forEach(function (r) {
        var uid = r.dataset.uid, isA = A.indexOf(uid) >= 0;
        r.classList.toggle('proArchRow', isA && showArch);
        r.style.display = (isA && !showArch) ? 'none' : '';
        if (isA) { archRows.push(r); var bd = r.querySelector('.bd'); if (bd) unread += parseInt(bd.textContent, 10) || 0; }
        var pn = r.querySelector('.proPin'), want = P.indexOf(uid) >= 0 && !isA;
        if (want && !pn) { pn = el('span', 'proPin'); pn.innerHTML = IC.pin; var x = r.querySelector('.x'); r.insertBefore(pn, x || null); }
        else if (!want && pn) pn.remove();
        if (me && uid === me) {
          r.classList.add('proSaved'); var av = r.querySelector('.av'); if (av && !av.querySelector('svg')) { av.textContent = ''; av.style.backgroundImage = 'none'; av.innerHTML = IC.bookmark; }
        }
      });
      var normal = rows.filter(function (r) { return A.indexOf(r.dataset.uid) < 0; });
      var pinned = normal.filter(function (r) { return P.indexOf(r.dataset.uid) >= 0; }).sort(function (a, b) { return P.indexOf(a.dataset.uid) - P.indexOf(b.dataset.uid); });
      var rest = normal.filter(function (r) { return P.indexOf(r.dataset.uid) < 0; });
      var order = pinned.concat(rest, archRows);
      var tail = Array.prototype.filter.call(l.children, function (r) { return rows.indexOf(r) < 0; });
      order.forEach(function (r) { l.appendChild(r); });
      tail.forEach(function (r) { l.appendChild(r); });
      if (archRows.length) {
        var ar = el('div', 'ct proArch'); ar.tabIndex = 0;
        var av2 = el('div', 'av'); av2.innerHTML = IC.archive; var d = el('div'); d.appendChild(el('b', '', showArch ? 'Hide archived' : 'Archived'));
        d.appendChild(el('small', '', archRows.length + (archRows.length === 1 ? ' chat' : ' chats')));
        ar.append(av2, d);
        if (unread && !showArch) { var rt = el('div', 'rt'); rt.appendChild(el('span', 'bd', String(unread))); ar.appendChild(rt); }
        ar.onclick = function () { showArch = !showArch; applyList(); };
        l.insertBefore(ar, l.firstChild);
      } else showArch = false;
    } catch (e) { console.error('pro list', e); }
    if (obs) obs.observe(l, { childList: true });
    busy = false;
  }
  function initList() {
    var l = $('cl'); if (!l || l.__pro) return; l.__pro = 1;
    obs = new MutationObserver(function () { clearTimeout(initList.t); initList.t = setTimeout(applyList, 30); });
    obs.observe(l, { childList: true });
    var tm = 0, sx = 0, sy = 0, rowEl = null;
    var stop = function () { clearTimeout(tm); tm = 0; rowEl = null; };
    l.addEventListener('pointerdown', function (e) {
      var r = e.target.closest && e.target.closest('.ct'); if (!r || r.classList.contains('proArch') || e.target.closest('.x')) return;
      sx = e.clientX; sy = e.clientY; rowEl = r; clearTimeout(tm);
      tm = setTimeout(function () { if (!rowEl) return; supUntil = Date.now() + 800; if (navigator.vibrate) navigator.vibrate(15); rowMenu(rowEl); rowEl = null; }, 480);
    }, { passive: true });
    l.addEventListener('pointermove', function (e) { if (tm && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) stop(); }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { l.addEventListener(ev, stop, { passive: true }); });
    l.addEventListener('scroll', stop, { passive: true });
    l.addEventListener('contextmenu', function (e) { var r = e.target.closest && e.target.closest('.ct'); if (!r || r.classList.contains('proArch')) return; e.preventDefault(); supUntil = Date.now() + 800; rowMenu(r); });
    l.addEventListener('click', function (e) { if (Date.now() < supUntil) { e.stopPropagation(); e.preventDefault(); } }, true);
    applyList();
  }

  /* ===================================================== 2) SAVED MESSAGES */
  function openSaved() {
    var uid = selfUid(); if (!uid) return toast('Sign in first');
    if (U().demo && U().demo()) return toast('Saved messages need a connected account');
    var c = (U().contacts() || []).filter(function (x) { return x.uid === uid; })[0];
    if (!c) {
      var code = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      c = { name: 'Saved messages', email: '', phone: 'Message yourself', num: uid, code: code, uid: uid };
      U().addContact(c);
    }
    U().open(c);
  }
  function addSavedButton() {
    var box = document.querySelector('#vList .lb-icons'); if (!box) return false;
    if (box.querySelector('.proSavedBtn')) return true;
    var b = el('button', 'ic proSavedBtn'); b.type = 'button'; b.setAttribute('aria-label', 'Saved messages'); b.title = 'Saved messages'; b.innerHTML = IC.bookmark;
    b.querySelector('svg').style.cssText = 'width:22px;height:22px';
    b.onclick = function (e) { e.stopPropagation(); var m = $('lbMore'); box.classList.remove('open'); if (m) m.classList.remove('open'); openSaved(); };
    var hide = box.querySelector('.o64hide'); box.insertBefore(b, hide || null);
    return true;
  }
  function watchChatView() {
    var v = $('vChat'); if (!v || v.__pro) return; v.__pro = 1;
    var upd = function () { var c = v.classList.contains('on') && U().cur && U().cur(); v.dataset.saved = (c && c.uid && c.uid === selfUid()) ? '1' : ''; };
    new MutationObserver(upd).observe(v, { attributes: true, attributeFilter: ['class'] });
    var nm = $('cn') || document.querySelector('#vChat .bar b'); upd();
  }

  /* ============================================= 3) MESSAGE INFO + LABELS */
  var LABELS = [['imp', 'Important', '#ef4444'], ['todo', 'To-do', '#f59e0b'], ['idea', 'Idea', '#eab308'], ['money', 'Money', '#22c55e'], ['later', 'Read later', '#3b82f6'], ['pers', 'Personal', '#a855f7']];
  function labKey() { var c = U().cur && U().cur(); return c ? 'lab-' + c.uid : ''; }
  function labels() { var k = labKey(); return k ? jget(k, {}) : {}; }
  function labOf(k) { for (var i = 0; i < LABELS.length; i++) if (LABELS[i][0] === k) return LABELS[i]; return null; }
  function labelChip(l) { var c = el('span', 'proLab'), i = el('i'); i.style.background = l[2]; c.append(i, document.createTextNode(l[1])); return c; }
  function refreshLabel(id) {
    var e = U().els && U().els().get(id); if (!e) return;
    var o = e.querySelector('.proLab'); if (o) o.remove();
    var l = labOf(labels()[id]); if (!l) return;
    var chip = labelChip(l), t = e.querySelector('.mt'); e.insertBefore(chip, t || null);
  }
  function setLabel(id, key) {
    var k = labKey(); if (!k) return; var m = jget(k, {});
    if (!key || m[id] === key) delete m[id]; else m[id] = key;
    jset(k, m); refreshLabel(id); toast(m[id] ? 'Labelled: ' + labOf(m[id])[1] : 'Label removed');
  }
  function labelPick(id) {
    var cur = labels()[id];
    var items = LABELS.map(function (l) { var ic = '<span style="width:14px;height:14px;border-radius:50%;background:' + l[2] + ';display:inline-block;margin:0 4px"></span>'; return { ic: ic, t: l[1], on: cur === l[0], f: function () { setLabel(id, l[0]); } }; });
    if (cur) items.push({ ic: IC.trash, t: 'Remove label', danger: 1, f: function () { setLabel(id, ''); } });
    sheetMenu('Label this message', items);
  }
  function typeName(m) { return ({ text: 'Text', img: m.sticker ? 'Sticker' : m.gif ? 'GIF' : 'Photo', vid: m.round ? 'Video message' : 'Video', aud: 'Voice message', doc: 'Document', poll: 'Poll', event: 'Event' })[m.type] || 'Message'; }
  function infoDlg(m, id) {
    var me = U().me && U().me(), mine = me && m.from === me.num, rows = [];
    rows.push(['Type', typeName(m)]);
    rows.push(['Sent', fmtDT(m.ts)]);
    if (mine) {
      rows.push(['Delivered', m.dlv ? (typeof m.dlv === 'number' ? fmtDT(m.dlv) : 'Yes') : 'Not yet']);
      rows.push(['Read', m.read ? (typeof m.read === 'number' ? fmtDT(m.read) : 'Yes') : 'Not yet']);
    } else rows.push(['Received', fmtDT(m.ts)]);
    if (m.edited) rows.push(['Edited', 'Yes']);
    if (m.fileSize || m.bytes) rows.push(['Size', fmtSize(m.fileSize || m.bytes)]);
    if (m.fileName) rows.push(['File', m.fileName]);
    if (m.once) rows.push(['View once', m.vo ? 'Opened' : 'Not opened']);
    if (m.exp) rows.push(['Disappears', fmtDT(m.exp)]);
    var l = labOf(labels()[id]); if (l) rows.push(['Label', l[1]]);
    var w = el('div', 'proInfo');
    rows.forEach(function (r) { var d = el('div'); d.append(el('span', '', r[0]), el('b', '', r[1])); w.appendChild(d); });
    dlg('Message info', w, [{ l: 'Close', g: 1 }]);
  }
  function previewOf(m) {
    if (m.text) return m.text.replace(/\s+/g, ' ').slice(0, 90);
    return ({ img: '📷 Photo', vid: '🎥 Video', aud: '🎤 Voice message', doc: '📄 ' + (m.fileName || 'Document'), poll: '📊 ' + (m.q || 'Poll'), event: '📅 ' + (m.q || 'Event') })[m.type] || 'Message';
  }
  function labelsPanel() {
    var c = U().cur && U().cur(); if (!c) return toast('Open a chat first');
    var p = panel('Labels · ' + c.name), body = p.body, filter = '';
    function draw() {
      body.textContent = '';
      var lab = labels(), msgs = U().msgs(), chips = el('div', 'proChips');
      var all = el('button', 'proChip' + (!filter ? ' on' : ''), 'All'); all.type = 'button'; all.onclick = function () { filter = ''; draw(); }; chips.appendChild(all);
      LABELS.forEach(function (l) { var b = el('button', 'proChip' + (filter === l[0] ? ' on' : ''), l[1]); b.type = 'button'; b.onclick = function () { filter = l[0]; draw(); }; chips.appendChild(b); });
      body.appendChild(chips);
      var list = [];
      Object.keys(lab).forEach(function (id) { var m = msgs.get(id); if (m && !m.dele && (!filter || lab[id] === filter)) list.push({ id: id, m: m, l: labOf(lab[id]) }); });
      list.sort(function (a, b) { return b.m.ts - a.m.ts; });
      if (!list.length) { body.appendChild(el('div', 'proEmpty', 'No labelled messages yet.\nPress and hold a message, then choose Label.')); body.lastChild.style.whiteSpace = 'pre-line'; return; }
      list.forEach(function (x) {
        var b = el('button', 'proItem'); b.type = 'button'; if (x.l) b.appendChild(labelChip(x.l));
        b.appendChild(el('div', '', previewOf(x.m))); b.appendChild(el('small', '', fmtDT(x.m.ts)));
        b.onclick = function () { p.close(); setTimeout(function () { var e = U().els().get(x.id); if (!e) return toast('Message not loaded. Scroll up to load older messages.'); e.scrollIntoView({ behavior: 'smooth', block: 'center' }); e.classList.add('flash'); setTimeout(function () { e.classList.remove('flash'); }, 1600); }, 260); };
        body.appendChild(b);
      });
    }
    draw();
  }
  window.__sheetX = function (m, id, A) {
    A('ℹ️ Info', function () { infoDlg(m, id); });
    A('🏷️ ' + (labels()[id] ? 'Change label' : 'Label'), function () { labelPick(id); });
  };

  /* =============================================== 4) LINKS, MAP, TRANSLATE */
  var URL_RE = /(https?:\/\/[^\s<>"']+)|(@[^\s@.,!?;:()<>"']{1,30})/gu;
  var MAP_RE = /maps\.google\.com\/\?q=(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/;
  function lpOn() { return jget('lp-on', true) !== false; }
  var lpCache = jget('lp', {}), lpPend = {};
  function lpSave() { var k = Object.keys(lpCache); if (k.length > 120) k.slice(0, k.length - 120).forEach(function (x) { delete lpCache[x]; }); jset('lp', lpCache); }
  function ytId(u) { var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/.exec(u); return m ? m[1] : ''; }
  function lpFetch(url) {
    if (lpCache[url]) return Promise.resolve(lpCache[url]);
    if (lpPend[url]) return lpPend[url];
    var host = ''; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) {}
    var base = { url: url, title: '', desc: '', img: '', site: host }, yt = ytId(url);
    if (yt) base.img = 'https://img.youtube.com/vi/' + yt + '/hqdefault.jpg';
    var p;
    try {
      if (!window.firebase || !firebase.functions || (U().demo && U().demo())) throw new Error('nofn');
      p = firebase.functions().httpsCallable('linkPreview', { timeout: 20000 })({ url: url }).then(function (r) { var d = r.data || {}; return { url: d.url || url, title: d.title || '', desc: d.desc || '', img: d.img || base.img, site: d.site || host }; });
    } catch (e) { p = Promise.reject(e); }
    lpPend[url] = p.catch(function () { return base; }).then(function (r) { delete lpPend[url]; lpCache[url] = r; lpSave(); return r; });
    return lpPend[url];
  }
  function lpCard(r) {
    var a = el('a', 'proLk'); a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.onclick = function (e) { e.stopPropagation(); };
    if (r.img) { var i = el('img'); i.loading = 'lazy'; i.referrerPolicy = 'no-referrer'; i.alt = ''; i.src = r.img; i.onerror = function () { i.remove(); }; a.appendChild(i); }
    var t = el('div', 't'); if (r.title) t.appendChild(el('b', '', r.title)); if (r.desc) t.appendChild(el('small', '', r.desc)); t.appendChild(el('small', 's', r.site || '')); a.appendChild(t);
    return a;
  }
  /* ---- map card (OpenStreetMap tiles, no key needed) ---- */
  function tileMath(lat, lng, z, w, h) {
    var n = Math.pow(2, z), x = (lng + 180) / 360 * n * 256, s = Math.sin(lat * Math.PI / 180), y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * 256;
    var left = x - w / 2, top = y - h / 2, out = [];
    for (var tx = Math.floor(left / 256); tx <= Math.floor((left + w) / 256); tx++) for (var ty = Math.floor(top / 256); ty <= Math.floor((top + h) / 256); ty++) {
      if (ty < 0 || ty >= n) continue; out.push({ x: ((tx % n) + n) % n, y: ty, px: tx * 256 - left, py: ty * 256 - top });
    }
    return out;
  }
  function mapCard(lat, lng, clickable) {
    var a = el(clickable === false ? 'div' : 'a', 'proMap');
    if (clickable !== false) { a.href = 'https://maps.google.com/?q=' + lat + ',' + lng; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.onclick = function (e) { e.stopPropagation(); }; }
    var tl = el('div', 'tl'); tileMath(lat, lng, 16, 260, 150).forEach(function (t) { var i = el('img'); i.alt = ''; i.loading = 'lazy'; i.referrerPolicy = 'no-referrer'; i.src = 'https://tile.openstreetmap.org/16/' + t.x + '/' + t.y + '.png'; i.style.left = Math.round(t.px) + 'px'; i.style.top = Math.round(t.py) + 'px'; tl.appendChild(i); });
    var pn = el('div', 'pn'); pn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6" fill="#fff" stroke="none"/></svg>'; tl.appendChild(pn);
    a.appendChild(tl); a.appendChild(el('div', 'at', '© OpenStreetMap'));
    var ft = el('div', 'ft'); ft.append(el('div', '', '📍 Location'), el('span', '', clickable === false ? '' : 'Open')); a.appendChild(ft);
    return a;
  }
  /* ---- auto-translate ---- */
  var LANGS = [['', 'Off'], ['en', 'English'], ['ta', 'தமிழ் (Tamil)'], ['hi', 'हिन्दी (Hindi)'], ['te', 'తెలుగు (Telugu)'], ['ml', 'മലയാളം (Malayalam)'], ['kn', 'ಕನ್ನಡ (Kannada)']];
  function srcLang(t) {
    if (/[\u0B80-\u0BFF]/.test(t)) return 'ta'; if (/[\u0900-\u097F]/.test(t)) return 'hi'; if (/[\u0C00-\u0C7F]/.test(t)) return 'te';
    if (/[\u0D00-\u0D7F]/.test(t)) return 'ml'; if (/[\u0C80-\u0CFF]/.test(t)) return 'kn'; if (/[A-Za-z]{3,}/.test(t)) return 'en'; return '';
  }
  var trCache = jget('trc', {}), trPend = {};
  function trFetch(text, src, tgt) {
    var key = src + '|' + tgt + '|' + text; if (trCache[key]) return Promise.resolve(trCache[key]);
    if (trPend[key]) return trPend[key];
    var u = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 450)) + '&langpair=' + src + '|' + tgt;
    trPend[key] = fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      delete trPend[key]; var t = j && j.responseData && j.responseData.translatedText;
      if (!t || (j.responseStatus && +j.responseStatus !== 200)) throw new Error('tr');
      trCache[key] = t; var ks = Object.keys(trCache); if (ks.length > 250) ks.slice(0, ks.length - 250).forEach(function (x) { delete trCache[x]; }); jset('trc', trCache); return t;
    }).catch(function (e) { delete trPend[key]; throw e; });
    return trPend[key];
  }
  function trLang() { var c = U().cur && U().cur(); return c ? jget('tr-' + c.uid, '') : ''; }
  function autoTranslate(d, m, tgt) {
    var txt = (m.text || '').trim(); if (txt.length < 3 || /^https?:\/\/\S+$/.test(txt) || MAP_RE.test(txt)) return;
    var s = srcLang(txt); if (!s || s === tgt) return;
    var box = el('div', 'proTr'), ic = el('span'); ic.innerHTML = IC.globe; box.appendChild(ic.firstChild); var tx = el('span', '', 'Translating…'); box.appendChild(tx);
    d.insertBefore(box, d.querySelector('.mt') || null);
    trFetch(txt, s, tgt).then(function (t) { tx.textContent = t; }).catch(function () { box.remove(); });
  }
  function trMenu() {
    var c = U().cur && U().cur(); if (!c) return toast('Open a chat first');
    var cur = trLang();
    sheetMenu('Auto-translate incoming messages', LANGS.map(function (l) {
      return { ic: IC.globe, t: l[1], on: cur === l[0], f: function () {
        var go = function () { jset('tr-' + c.uid, l[0]); try { localStorage.setItem('onlyus-trok', '1'); } catch (e) {} toast(l[0] ? 'Auto-translate on · ' + l[1] : 'Auto-translate off'); retranslateAll(l[0]); };
        if (l[0] && !localStorage.getItem('onlyus-trok')) dlg('Auto-translate', el('p', '', 'Messages you receive are sent to a free translation service (MyMemory) to translate them. Your partner’s messages are end-to-end encrypted, but the text you translate is sent to that service. Best for English ↔ Indian languages; Tanglish is not translated.'), [{ l: 'Turn on', f: go }, { l: 'Cancel', g: 1 }]);
        else go();
      } };
    }));
  }
  function retranslateAll(tgt) {
    try {
      var me = U().me(), els = U().els();
      U().msgs().forEach(function (m, id) {
        var e = els.get(id); if (!e || m.dele) return;
        Array.prototype.forEach.call(e.querySelectorAll('.proTr'), function (x) { x.remove(); });
        if (tgt && m.from !== me.num && m.text) autoTranslate(e, m, tgt);
      });
    } catch (e) {}
  }

  /* ---- bubble hook ---- */
  function walkText(d, m, mine) {
    var me = U().me && U().me(), myFirst = ((me && me.name) || '').split(/\s+/)[0].toLowerCase(), nodes = [];
    Array.prototype.forEach.call(d.childNodes, function (n) { if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) nodes.push(n); });
    var first = '';
    nodes.forEach(function (n) {
      var t = n.nodeValue; URL_RE.lastIndex = 0; if (!URL_RE.test(t)) return; URL_RE.lastIndex = 0;
      var frag = document.createDocumentFragment(), last = 0, mt;
      while ((mt = URL_RE.exec(t))) {
        if (mt.index > last) frag.appendChild(document.createTextNode(t.slice(last, mt.index)));
        if (mt[1]) {
          var u = mt[1], tail = ''; while (/[.,!?;:)\]]$/.test(u)) { tail = u.slice(-1) + tail; u = u.slice(0, -1); }
          var a = el('a', 'proLnk', u); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.onclick = function (e) { e.stopPropagation(); }; frag.appendChild(a);
          if (tail) frag.appendChild(document.createTextNode(tail)); if (!first) first = u;
        } else if (mt.index > 0 && /[\w.]/.test(t.charAt(mt.index - 1))) {
          frag.appendChild(document.createTextNode(mt[2]));
        } else {
          var tok = mt[2], s = el('span', 'proMen' + (tok.slice(1).toLowerCase() === myFirst ? ' me' : ''), tok); frag.appendChild(s);
        }
        last = mt.index + mt[0].length;
      }
      if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
    return first;
  }
  window.__bubbleX = function (d, m, id, mine) {
    if (m.dele) return;
    var t = d.querySelector('.mt');
    /* blocked media -> download button */
    Array.prototype.forEach.call(d.querySelectorAll('[data-pro-src]'), wrapBlocked);
    /* round video message */
    if (m.type === 'vid' && m.round) {
      d.classList.add('proRound'); var v = d.querySelector('video.pic');
      if (v) {
        v.controls = false; v.loop = true; v.setAttribute('playsinline', ''); var rp = el('div', 'proRp'); rp.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'; d.insertBefore(rp, t || null);
        v.onclick = function (e) { e.stopPropagation(); if (v.paused) { v.muted = false; v.play().catch(function () {}); rp.style.display = 'none'; } else { v.pause(); rp.style.display = ''; } };
        v.onpause = function () { rp.style.display = ''; };
      }
    }
    if (m.text && m.type !== 'poll') {
      var mm = MAP_RE.exec(m.text);
      if (mm) {
        Array.prototype.slice.call(d.childNodes).forEach(function (n) { if (n.nodeType === 3 || (n.nodeType === 1 && /^(a|span)$/i.test(n.tagName) && !n.classList.contains('mt') && !n.classList.contains('edit-mark'))) n.remove(); });
        d.insertBefore(mapCard(+mm[1], +mm[2]), d.querySelector('.mt') || null);
      } else {
        var link = walkText(d, m, mine);
        if (link && lpOn() && !m.once) {
          var slot = el('div'); d.insertBefore(slot, d.querySelector('.mt') || null);
          lpFetch(link).then(function (r) { if (r && (r.title || r.img || r.desc)) slot.appendChild(lpCard(r)); }).catch(function () {});
        }
        var tgt = !mine && trLang(); if (tgt) autoTranslate(d, m, tgt);
      }
    }
    var l = labOf(labels()[id]); if (l) d.insertBefore(labelChip(l), d.querySelector('.mt') || null);
  };

  /* ============================================= 5) MEDIA AUTO-DOWNLOAD */
  var PLACE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var dlset = jget('dlset', []);
  function onCell() { var c = navigator.connection; return !!(c && (c.type === 'cellular' || (c.saveData === true))); }
  function dlAllowed(kind) { var mode = jget('dl-' + kind, kind === 'vid' ? 'wifi' : 'always'); return mode === 'always' || (mode === 'wifi' && !onCell()); }
  window.__mediaSrc = function (elm, src, m) {
    var kind = elm.tagName === 'VIDEO' ? 'vid' : 'img', me = U().me && U().me();
    if ((me && m.from === me.num) || m.sticker || m.gif || m.once || dlAllowed(kind) || dlset.indexOf(src) >= 0 || /^data:/.test(src)) { elm.src = src; return; }
    elm.dataset.proSrc = src; elm.dataset.proKind = kind; elm.dataset.proSize = m.fileSize || m.bytes || 0; elm.classList.add('proBlk');
    if (kind === 'img') elm.src = PLACE; else { elm.removeAttribute('src'); elm.preload = 'none'; }
  };
  function wrapBlocked(elm) {
    if (elm.parentNode && elm.parentNode.classList && elm.parentNode.classList.contains('proDl')) return;
    var w = el('div', 'proDl'); elm.parentNode.insertBefore(w, elm); w.appendChild(elm);
    var b = el('button', 'proDb'); b.type = 'button'; var kind = elm.dataset.proKind, sz = +elm.dataset.proSize;
    var ic = el('span'); ic.innerHTML = svg('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', 2.2); b.appendChild(ic.firstChild);
    b.appendChild(document.createTextNode((kind === 'vid' ? 'Video' : 'Photo') + (sz ? ' · ' + fmtSize(sz) : '')));
    b.onclick = function (e) {
      e.stopPropagation(); e.preventDefault(); var src = elm.dataset.proSrc; elm.src = src; if (kind === 'vid') { elm.preload = 'metadata'; try { elm.load(); } catch (x) {} }
      elm.classList.remove('proBlk'); delete elm.dataset.proSrc; b.remove();
      if (dlset.indexOf(src) < 0) { dlset.push(src); if (dlset.length > 300) dlset.shift(); jset('dlset', dlset); }
    };
    w.appendChild(b);
  }

  /* ============================================ 6) PER-CHAT MESSAGE SOUND */
  var TONES = { chime: [[880, .0, .14], [1320, .13, .22]], pop: [[620, 0, .09]], bell: [[1047, 0, .6]], drop: [[760, 0, .22]], triple: [[659, 0, .12], [880, .11, .12], [1175, .22, .2]] };
  var TONE_NAMES = [['default', 'Default'], ['chime', 'Chime'], ['pop', 'Pop'], ['bell', 'Bell'], ['drop', 'Water drop'], ['triple', 'Three notes'], ['silent', 'Silent']];
  var actx = null;
  function soundOn() { try { var p = JSON.parse(localStorage.getItem('onlyus-sound-prefs') || '{}'); return p.enabled !== false && p.style !== 'off'; } catch (e) { return true; } }
  function playTone(name) {
    var seq = TONES[name]; if (!seq) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
      var t0 = actx.currentTime;
      seq.forEach(function (n) {
        var o = actx.createOscillator(), g = actx.createGain(); o.type = name === 'bell' ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(n[0], t0 + n[1]); if (name === 'drop') o.frequency.exponentialRampToValueAtTime(380, t0 + n[1] + n[2]); if (name === 'pop') o.frequency.exponentialRampToValueAtTime(320, t0 + n[1] + n[2]);
        g.gain.setValueAtTime(0.0001, t0 + n[1]); g.gain.exponentialRampToValueAtTime(0.2, t0 + n[1] + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + n[2]);
        o.connect(g); g.connect(actx.destination); o.start(t0 + n[1]); o.stop(t0 + n[1] + n[2] + 0.05);
      });
    } catch (e) {}
  }
  window.__proTone = function (uid) {
    var t = jget('tone-' + uid, 'default');
    if (t === 'default') { try { window.premiumSound && window.premiumSound('receive'); } catch (e) {} return; }
    if (t === 'silent' || !soundOn()) return; playTone(t);
  };
  function toneMenu() {
    var c = U().cur && U().cur(); if (!c) return toast('Open a chat first');
    var cur = jget('tone-' + c.uid, 'default');
    sheetMenu('Message sound · ' + c.name, TONE_NAMES.map(function (t) {
      return { ic: IC.bell, t: t[1], on: cur === t[0], keep: 0, f: function () { jset('tone-' + c.uid, t[0]); if (t[0] !== 'default' && t[0] !== 'silent') playTone(t[0]); else if (t[0] === 'default') { try { window.premiumSound('receive'); } catch (e) {} } toast('Sound: ' + t[1] + ' (while the app is open)'); } };
    }));
  }

  /* ========================================== 7) @MENTION AUTOCOMPLETE */
  function initMention() {
    var ta = $('in'), pop = null; if (!ta || ta.__pro) return; ta.__pro = 1;
    var hide = function () { if (pop) { pop.remove(); pop = null; } };
    ta.addEventListener('input', function () {
      var c = U().cur && U().cur(); if (!c || c.uid === selfUid()) return hide();
      var before = ta.value.slice(0, ta.selectionStart || 0), m = /(^|\s)@([^\s@]*)$/.exec(before); if (!m) return hide();
      var first = (c.name || '').split(/\s+/)[0]; if (!first || first.toLowerCase().indexOf(m[2].toLowerCase()) !== 0) return hide();
      hide(); pop = el('div', 'proMenPop'); var b = el('button', '', '@' + first); b.type = 'button';
      b.onmousedown = function (e) { e.preventDefault(); };
      b.onclick = function () { var pos = ta.selectionStart, start = pos - m[2].length - 1; ta.value = ta.value.slice(0, start) + '@' + first + ' ' + ta.value.slice(pos); var np = start + first.length + 2; ta.setSelectionRange(np, np); hide(); ta.dispatchEvent(new Event('input')); ta.focus(); };
      pop.appendChild(b); document.body.appendChild(pop);
      var r = ($('cf') || ta).getBoundingClientRect(); pop.style.bottom = Math.max(8, innerHeight - r.top + 8) + 'px';
    });
    ta.addEventListener('blur', function () { setTimeout(hide, 150); });
  }

  /* ======================================== 8) CHAT TOOLS + ATTACH + PIP */
  function addToolButtons() {
    var g = document.querySelector('#chatTools .tool-grid'); if (!g || g.querySelector('#proToolLab')) return;
    [['proToolLab', '🏷️', 'Labels', labelsPanel], ['proToolTr', '🌐', 'Auto-translate', trMenu], ['proToolTone', '🔔', 'Chat sound', toneMenu]].forEach(function (x) {
      var b = el('button'); b.id = x[0]; b.type = 'button'; b.appendChild(document.createTextNode(x[1])); b.appendChild(el('span', '', x[2]));
      b.onclick = function () { var o = $('chatTools'); if (o) o.classList.remove('on'); setTimeout(x[3], 60); }; g.appendChild(b);
    });
  }
  function shareLoc() {
    if (!U().cid || !U().cid()) return toast('Open a chat first');
    if (!navigator.geolocation) return toast('Location is not available on this phone');
    toast('Getting your location…');
    navigator.geolocation.getCurrentPosition(function (p) {
      var lat = +p.coords.latitude.toFixed(6), lng = +p.coords.longitude.toFixed(6), w = el('div');
      w.appendChild(mapCard(lat, lng, false)); var s = el('small', '', 'Accuracy about ' + Math.round(p.coords.accuracy || 0) + ' m. Your partner will see this exact spot.'); s.style.cssText = 'display:block;margin-top:8px;color:var(--dim)'; w.appendChild(s);
      dlg('Share your location', w, [{ l: 'Send', f: function () { U().send({ text: '📍 Location\nhttps://maps.google.com/?q=' + lat + ',' + lng }); } }, { l: 'Cancel', g: 1 }]);
    }, function (e) { toast(e && e.code === 1 ? 'Location permission is off. Allow it in the phone settings.' : 'Could not get your location. Try again outside.'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }
  function addAttach() { window.__proAttach('proLoc', 'Location', '#10b981', svg('<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>', 1.9).replace('<svg', '<svg style="width:24px;height:24px;color:#fff"'), shareLoc); }
  function addPip() {
    var v = $('clView'); if (!v || $('proPip')) return;
    var b = el('button'); b.id = 'proPip'; b.type = 'button'; b.setAttribute('aria-label', 'Picture in picture'); b.innerHTML = IC.pip;
    b.onclick = function (e) {
      e.stopPropagation();
      try { if (window.Android && Android.enterPip) { Android.enterPip(); return; } } catch (x) {}
      var r = $('clR'); if (r && document.pictureInPictureEnabled && r.requestPictureInPicture) r.requestPictureInPicture().catch(function () { toast('Picture-in-picture is not available right now'); });
      else toast('Picture-in-picture is not supported here (see ANDROID-BRIDGE.txt)');
    };
    v.appendChild(b);
  }

  /* ========================================= 9) STORAGE + DATA SETTINGS */
  async function mediaUsage() {
    if (!window.caches) return null;
    var c = await caches.open('onlyus-media-v1'), ks = await c.keys(), per = {}, total = 0, cnt = 0;
    for (var i = 0; i < ks.length; i++) {
      var r = await c.match(ks[i]); if (!r) continue; var sz = +r.headers.get('x-size') || 0; total += sz; cnt++;
      var m = /\/onlyus\/chat\/([0-9a-f]{16,})\//i.exec(ks[i].url), k = m ? m[1] : 'other'; per[k] = (per[k] || 0) + sz;
    }
    return { total: total, count: cnt, per: per };
  }
  async function clearCache(cidFilter) {
    var c = await caches.open('onlyus-media-v1'), ks = await c.keys();
    for (var i = 0; i < ks.length; i++) { if (!cidFilter || ks[i].url.indexOf('/onlyus/chat/' + cidFilter + '/') >= 0) await c.delete(ks[i]); }
  }
  function segEl(opts, cur, on) {
    var s = el('div', 'seg');
    opts.forEach(function (o) { var b = el('button', cur === o[0] ? 'on' : '', o[1]); b.type = 'button'; b.dataset.v = o[0]; s.appendChild(b); });
    s.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; Array.prototype.forEach.call(s.children, function (x) { x.classList.toggle('on', x === b); }); on(b.dataset.v); };
    return s;
  }
  /* only harmless preference-type keys are backed up (never PIN, lock, E2E keys, AI key, contacts, health data) */
  var OK_KEY = /^(onlyus-(acc|fav|fz|lg|lists|mode|muted|nthide|sound-prefs|starred|stickers|stk|stk-recent|theme|trok|vauto|vlang|wall|wallimg|wallimgdim|wp|wp2|wf|pro)(-|$)|uc-del-)/;
  function backupData() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (OK_KEY.test(k)) out[k] = localStorage.getItem(k); }
    return out;
  }
  function restoreData(obj) {
    var n = 0; Object.keys(obj || {}).forEach(function (k) {
      if (!OK_KEY.test(k) || typeof obj[k] !== 'string') return;
      try { localStorage.setItem(k, obj[k]); n++; } catch (e) {}
    });
    return n;
  }
  function askRestore(data, src) {
    var n = Object.keys(data || {}).length; if (!n) return toast('This backup is empty');
    dlg('Restore backup', el('p', '', 'Restore ' + n + ' saved settings (theme, stickers, labels, pins, starred messages…) from ' + src + '? Your chats and messages are not touched. The app will reload.'), [{ l: 'Restore', f: function () { restoreData(data); toast('Restored. Reloading…'); setTimeout(function () { location.reload(); }, 700); } }, { l: 'Cancel', g: 1 }]);
  }
  function fileBackup() {
    var data = backupData(), blob = new Blob([JSON.stringify({ app: 'OnlyUs', v: 1, at: Date.now(), data: data })], { type: 'application/json' }),
      a = el('a'), u = URL.createObjectURL(blob); a.href = u; a.download = 'onlyus-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(u); }, 4000); toast('Backup saved (' + fmtSize(blob.size) + ')');
  }
  function fileRestore() {
    var inp = el('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { var j = JSON.parse(r.result); if (j.app !== 'OnlyUs' || !j.data) throw 0; askRestore(j.data, 'the file'); } catch (e) { toast('This is not an OnlyUs backup file'); } };
      r.readAsText(f);
    };
    inp.click();
  }
  function cloudRef() { var fs = U().fs && U().fs(), uid = selfUid(); if (!fs || !uid || (U().demo && U().demo())) return null; return fs.collection('backups').doc(uid); }
  function cloudBackup() {
    var ref = cloudRef(); if (!ref) return toast('Sign in to use cloud backup');
    var data = backupData(), big = Object.keys(data).sort(function (a, b) { return data[b].length - data[a].length; }), s = JSON.stringify(data), dropped = 0;
    while (s.length > 850000 && big.length) { delete data[big.shift()]; dropped++; s = JSON.stringify(data); }
    ref.set({ at: Date.now(), json: s }).then(function () { toast('Cloud backup saved' + (dropped ? ' (' + dropped + ' large item skipped, use a file backup for stickers)' : '')); updateCloudStat(); })
      .catch(function () { toast('Cloud backup is blocked. Publish the new firestore.rules (see README).'); });
  }
  function cloudRestore() {
    var ref = cloudRef(); if (!ref) return toast('Sign in to use cloud backup');
    ref.get().then(function (d) { if (!d.exists) return toast('No cloud backup found'); try { askRestore(JSON.parse(d.data().json), 'your cloud backup (' + fmtDT(d.data().at) + ')'); } catch (e) { toast('Cloud backup is damaged'); } })
      .catch(function () { toast('Could not read the cloud backup. Publish the new firestore.rules.'); });
  }
  var cloudStat = null;
  function updateCloudStat() { var ref = cloudRef(); if (!ref || !cloudStat) return; ref.get().then(function (d) { cloudStat.textContent = d.exists ? 'Last cloud backup: ' + fmtDT(d.data().at) : 'No cloud backup yet'; }).catch(function () { cloudStat.textContent = ''; }); }
  function row(t, right, fn) { var b = el('button', 'row'); b.type = 'button'; b.appendChild(document.createTextNode(t)); var s = el('span', '', right || ''); b.appendChild(s); b.onclick = fn; b.__s = s; return b; }

  async function fillStorage(host, stat) {
    host.textContent = ''; stat.textContent = 'Calculating…';
    var u = await mediaUsage(), est = null; try { est = navigator.storage && navigator.storage.estimate && await navigator.storage.estimate(); } catch (e) {}
    stat.innerHTML = ''; var b1 = el('b', '', u ? fmtSize(u.total) : 'n/a'); stat.append('Photos and videos kept on this phone: ', b1, u ? ' (' + u.count + ' files)' : '');
    if (est && est.usage) { stat.appendChild(document.createElement('br')); stat.append('All app data: ', el('b', '', fmtSize(est.usage)), est.quota ? ' of ' + fmtSize(est.quota) + ' available' : ''); }
    if (!u || !u.count) { host.appendChild(el('div', 'proStat', 'No downloaded media yet.')); return; }
    var map = {}, cs = U().contacts() || [];
    for (var i = 0; i < cs.length; i++) { try { map[await U().cidOf(cs[i])] = cs[i]; } catch (e) {} }
    Object.keys(u.per).sort(function (a, b) { return u.per[b] - u.per[a]; }).forEach(function (k) {
      var c = map[k], r = el('div', 'proChatRow'), nm = el('b', '', c ? (c.uid === selfUid() ? 'Saved messages' : c.name) : 'Other media'), sz = el('span', '', fmtSize(u.per[k])), cl = el('button', '', 'Clear'); cl.type = 'button';
      cl.onclick = function () { clearCache(k === 'other' ? '' : k).then(function () { toast('Cleared'); fillStorage(host, stat); }); };
      if (k === 'other') cl.style.display = 'none';
      r.append(nm, sz, cl); host.appendChild(r);
    });
  }
  function buildSettings() {
    var menu = $('spMenu'), body = $('setBody'); if (!menu || !body || $('spPg_data')) return !!$('spPg_data');
    var none = $('spNone'), btn = el('button', 'spm'); btn.type = 'button'; btn.dataset.pg = 'data'; btn.dataset.kw = 'storage data cache backup restore auto download link preview media wifi mobile';
    btn.innerHTML = svg('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>', 1.7) + '<span class="spt"><b>Storage and data</b><small>Media cache, auto-download, backup</small></span>';
    menu.insertBefore(btn, none || null);
    var sec = el('section', 'spp'); sec.id = 'spPg_data'; sec.hidden = true;
    var h1 = el('h3', '', 'Storage'), stat = el('div', 'proStat'), host = el('div');
    var clr = row('Clear all downloaded media', '', function () { dlg('Clear media', el('p', '', 'Downloaded photos and videos are removed from this phone only. They download again when you open them.'), [{ l: 'Clear', f: function () { clearCache('').then(function () { toast('Media cleared'); fillStorage(host, stat); }); } }, { l: 'Cancel', g: 1 }]); });
    sec.append(h1, stat, host, clr);
    sec.appendChild(el('h3', '', 'Media auto-download'));
    sec.appendChild(el('span', 'proLbl', 'Photos'));
    sec.appendChild(segEl([['always', 'Always'], ['wifi', 'Wi-Fi only'], ['never', 'Never']], jget('dl-img', 'always'), function (v) { jset('dl-img', v); }));
    sec.appendChild(el('span', 'proLbl', 'Videos'));
    sec.appendChild(segEl([['always', 'Always'], ['wifi', 'Wi-Fi only'], ['never', 'Never']], jget('dl-vid', 'wifi'), function (v) { jset('dl-vid', v); }));
    var note = el('small', 'proLbl', 'Media you did not download shows a Download button. Photos and videos you send yourself always show.'); sec.appendChild(note);
    sec.appendChild(el('h3', '', 'Links'));
    var lp = row('Link previews', lpOn() ? 'On' : 'Off', function () { var v = !lpOn(); jset('lp-on', v); lp.__s.textContent = v ? 'On' : 'Off'; }); sec.appendChild(lp);
    sec.appendChild(el('small', 'proLbl', 'A shared link is opened by the OnlyUs server to read its title and picture. Turn off to never do this.'));
    sec.appendChild(el('h3', '', 'Backup'));
    sec.appendChild(el('small', 'proLbl', 'Your messages already live in the cloud. A backup keeps your settings, stickers, labels, pins and starred messages for a new phone.'));
    sec.appendChild(row('Back up to a file', '', fileBackup)); sec.appendChild(row('Restore from a file', '', fileRestore));
    sec.appendChild(row('Back up to the cloud now', '', cloudBackup)); sec.appendChild(row('Restore from the cloud', '', cloudRestore));
    cloudStat = el('small', 'proLbl', ''); sec.appendChild(cloudStat);
    body.appendChild(sec);
    btn.addEventListener('click', function () { setTimeout(function () { var t = $('setTitle'); if (t) t.textContent = 'Storage and data'; }, 0); fillStorage(host, stat); updateCloudStat(); });
    return true;
  }

  /* ================================================================== init */
  function init() {
    initList(); addSavedButton(); watchChatView(); addToolButtons(); addAttach(); addPip(); initMention(); buildSettings();
  }
  init();
  [300, 1000, 2500, 5000].forEach(function (t) { setTimeout(init, t); });
  window.__pro = { applyList: applyList, openSaved: openSaved, tileMath: tileMath, srcLang: srcLang, backupData: backupData, restoreData: restoreData, walkText: walkText, mapRe: MAP_RE, urlRe: URL_RE };
})();
