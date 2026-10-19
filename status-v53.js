/* OnlyUs status-v53.js  --  WhatsApp-style Status
   - Post photos, videos (up to 30 s) or text statuses. Each lasts 24 hours.
   - Your partner sees them in the Status tab (and as a ring around your photo in her chat list).
   - Full-screen viewer: progress bars, tap right/left, hold to pause, swipe down to close.
   - You see who viewed your status.
   Stored in Firestore: chats/{chatId}/statuses/{id}  (needs the updated firestore.rules)         */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var DAY = 864e5, VIDEO_MAX = 30, SEEN_KEY = 'onlyus-st-seen', LOCAL_KEY = 'onlyus-st-local';
  var BG = [['#7b4dff', '#ff5fa2'], ['#00b09b', '#96c93d'], ['#ff8008', '#ffc837'], ['#1d2b64', '#f8cdda'], ['#8e2de2', '#4a00e0'], ['#ee0979', '#ff6a00'], ['#134e5e', '#71b280'], ['#232526', '#5b5f66']];
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var toast = function (m) { try { U().toast(m); } catch (e) { alert(m); } };
  var jget = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var jset = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------------------------------------------------------------- state */
  var seen = {}; (jget(SEEN_KEY, [])).forEach(function (id) { seen[id] = 1; });
  var STORE = {};            // cid -> [docs]  (firestore mode)
  var CIDS = {};             // contact uid -> cid
  var unsubs = [], contactSig = '';
  var viewerQueue = null;

  var isLocal = function () { return !!(U().demo && U().demo()) || !(U().fs && U().fs() && U().fs().collection && U().cidOf); };
  var myUid = function () { return (U().uid && U().uid()) || 'me'; };
  var myName = function () { var m = U().me && U().me(); return (m && m.name) || 'You'; };
  var contacts = function () { return (U().contacts ? U().contacts() : []) || []; };

  function allDocs() {
    var out = [];
    if (isLocal()) out = jget(LOCAL_KEY, []).slice();
    else Object.keys(STORE).forEach(function (k) { out = out.concat(STORE[k]); });
    var now = Date.now();
    return out.filter(function (d) { return d.exp > now; });
  }
  function mineGroups() {   // my statuses, one entry per gid
    var m = {}, now = Date.now();
    allDocs().forEach(function (d) { if (d.fromUid !== myUid()) return; var g = d.gid || d.id; if (!m[g]) m[g] = Object.assign({}, d, { views: {} }); Object.keys(d.views || {}).forEach(function (u) { m[g].views[u] = d.views[u]; }); });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.ts - b.ts; });
  }
  function theirs(uid) {
    return allDocs().filter(function (d) { return d.fromUid === uid; }).sort(function (a, b) { return a.ts - b.ts; });
  }
  var isSeen = function (d) { return !!seen[d.id] || !!(d.views && d.views[myUid()]); };
  function persistSeen() { jset(SEEN_KEY, Object.keys(seen).slice(-500)); }

  /* ----------------------------------------------------- firestore backend */
  function cleanup() { unsubs.forEach(function (u) { try { u(); } catch (e) {} }); unsubs = []; STORE = {}; }
  function watch() {
    if (isLocal()) { contactSig = 'local'; rebuild(); return; }
    var cs = contacts().filter(function (c) { return c.uid && c.code; });
    var sig = cs.map(function (c) { return c.uid + ':' + c.code; }).join('|');
    if (sig === contactSig) return;
    contactSig = sig; cleanup();
    cs.forEach(function (c) {
      Promise.resolve(U().cidOf(c)).then(function (cid) {
        CIDS[c.uid] = cid;
        Promise.resolve(window.__fx && window.__fx.ready ? window.__fx.ready(c) : 0).catch(function () {}).then(function () {
          var q = U().fs().collection('chats').doc(cid).collection('statuses').where('exp', '>', Date.now());
          unsubs.push(q.onSnapshot(function (snap) {
            STORE[cid] = snap.docs.map(function (d) {
              var data = d.data(); try { if (window.__fx && window.__fx.inn && data.et) data = window.__fx.inn(data, c); } catch (e) {}
              return Object.assign({}, data, { id: d.id, cid: cid });
            });
            rebuild();
          }, function () {}));
        });
      }).catch(function () {});
    });
  }
  function colFor(cid) { return U().fs().collection('chats').doc(cid).collection('statuses'); }

  async function postDoc(base) {
    var now = Date.now(), gid = 's' + now.toString(36) + Math.random().toString(36).slice(2, 6);
    var doc = Object.assign({ fromUid: myUid(), gid: gid, ts: now, exp: now + DAY }, base);
    if (isLocal()) {
      var a = jget(LOCAL_KEY, []); a.push(Object.assign({ id: gid, cid: 'local' }, doc)); jset(LOCAL_KEY, a.slice(-60)); rebuild(); return;
    }
    var cs = contacts().filter(function (c) { return c.uid && c.code; });
    if (!cs.length) throw new Error('No chat to post to');
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i], cid = CIDS[c.uid] || await U().cidOf(c), copy = Object.assign({}, doc);
      if (copy.text) { try { if (window.__fx && window.__fx.ready) await window.__fx.ready(c); if (window.__fx && window.__fx.out) await window.__fx.out(copy, c); } catch (e) {} }
      await colFor(cid).add(copy);
    }
  }
  async function removeGroup(g) {
    if (isLocal()) { jset(LOCAL_KEY, jget(LOCAL_KEY, []).filter(function (d) { return (d.gid || d.id) !== (g.gid || g.id); })); rebuild(); return; }
    var jobs = [];
    Object.keys(STORE).forEach(function (cid) { STORE[cid].forEach(function (d) { if (d.fromUid === myUid() && (d.gid || d.id) === (g.gid || g.id)) jobs.push(colFor(cid).doc(d.id).delete()); }); });
    await Promise.all(jobs);
  }
  function markSeen(d) {
    if (seen[d.id]) return; seen[d.id] = 1; persistSeen();
    if (d.fromUid !== myUid() && !isLocal() && d.cid && !(d.views && d.views[myUid()])) {
      try { var u = {}; u['views.' + myUid()] = Date.now(); colFor(d.cid).doc(d.id).update(u).catch(function () {}); } catch (e) {}
    }
    applyRings();
  }
  // expire own old docs quietly
  function sweep() {
    if (isLocal()) { var a = jget(LOCAL_KEY, []), n = Date.now(); var b = a.filter(function (d) { return d.exp > n; }); if (b.length !== a.length) jset(LOCAL_KEY, b); }
  }

  /* ----------------------------------------------------------------- css */
  var css = el('style'); css.textContent = [
    '#vStatus .st-body{padding:6px 14px calc(150px + env(safe-area-inset-bottom,0px));overflow-y:auto}',
    '#vStatus .st-h{font-size:13px;font-weight:700;color:var(--dim);letter-spacing:.04em;text-transform:uppercase;margin:16px 4px 8px}',
    '.st-row{all:unset;cursor:pointer;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:14px;padding:11px 12px;border-radius:20px;background:var(--panel);border:1px solid var(--line);margin-bottom:8px;color:var(--ink)}',
    '.st-row:active{transform:scale(.985)}',
    '.st-row .st-t{flex:1;min-width:0}.st-row .st-t b{display:block;font-size:16px}.st-row .st-t small{display:block;color:var(--dim);font-size:13px;margin-top:2px}',
    '.st-row .st-act{all:unset;cursor:pointer;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:19px;background:var(--line);flex:none}',
    '.st-av{position:relative;width:62px;height:62px;flex:none;display:grid;place-items:center}',
    '.st-av .rg{position:absolute;inset:0;border-radius:50%;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3.5px),#000 calc(100% - 3px));mask:radial-gradient(farthest-side,transparent calc(100% - 3.5px),#000 calc(100% - 3px))}',
    '.st-av .pa{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:20px;color:#fff;background:linear-gradient(145deg,color-mix(in srgb,var(--acc) 55%,#fff),var(--acc));background-size:cover;background-position:center}',
    '.st-av .plus{position:absolute;right:-2px;bottom:-2px;width:22px;height:22px;border-radius:50%;background:var(--acc);color:#fff;font-weight:800;font-size:16px;line-height:20px;text-align:center;border:2px solid var(--bg)}',
    '.st-empty{text-align:center;color:var(--dim);padding:34px 20px;line-height:1.55;font-size:14.5px}',
    '.st-fabs{position:fixed;right:16px;bottom:calc(88px + env(safe-area-inset-bottom,0px));display:none;flex-direction:column;align-items:center;gap:12px;z-index:7}',
    '#vStatus.on~.st-fabs{display:flex}',
    '.st-fabs button{all:unset;cursor:pointer;display:grid;place-items:center;border-radius:50%;box-shadow:0 8px 20px rgba(40,20,80,.32);transition:transform .16s}',
    '.st-fabs button:active{transform:scale(.92)}',
    '#stFabText{width:46px;height:46px;font-size:21px;background:var(--panel);color:var(--ink);border:1px solid var(--line)}',
    '#stFabCam{width:58px;height:58px;font-size:26px;background:linear-gradient(135deg,var(--acc),#ff6fb5);color:#fff}',
    /* home chat-list ring */
    '.ct .av.st-has{position:relative;margin:5px}',
    '.ct .av.st-has::after{content:"";position:absolute;inset:-6px;border-radius:50%;background:var(--ring);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2.5px));mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2.5px));pointer-events:none}',
    '#tabNav button.has-new::after{content:"";position:absolute;top:5px;left:calc(50% + 9px);width:10px;height:10px;border-radius:50%;background:#ff4d7a;border:2px solid var(--bg)}',
    /* overlays */
    '.stov{z-index:70;background:#000;align-items:stretch;justify-content:center;color:#fff}',
    '.stov .in{position:relative;width:100%;max-width:560px;display:flex;flex-direction:column;overflow:hidden;background:#000}',
    '.stv-bars{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;right:10px;display:flex;gap:4px;z-index:5}',
    '.stv-bars i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}',
    '.stv-bars i b{display:block;height:100%;width:100%;background:#fff;transform:scaleX(0);transform-origin:0 50%}',
    '.stv-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);left:8px;right:8px;display:flex;align-items:center;gap:10px;z-index:5;text-shadow:0 1px 6px #000a}',
    '.stv-top .pa{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:var(--acc);background-size:cover;background-position:center;flex:none}',
    '.stv-top .mt{flex:1;min-width:0;color:#fff}.stv-top .mt b{display:block!important;color:#fff!important;font-size:15.5px}.stv-top .mt small{display:block!important;color:#fff!important;opacity:.85;font-size:12.5px}',
    '.stv-x{all:unset;cursor:pointer;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:20px;color:#fff;background:rgba(0,0,0,.28);flex:none}',
    '.stv-stage{position:absolute;inset:0;display:grid;place-items:center;background:#000}',
    '.stv-stage img,.stv-stage video{max-width:100%;max-height:100%;object-fit:contain}',
    '.stv-stage .txt{position:absolute;inset:0;display:grid;place-items:center;padding:38px 26px;text-align:center;font-weight:700;line-height:1.25;word-break:break-word}',
    '.stv-hit{position:absolute;inset:0;z-index:3;touch-action:none}',
    '.stv-cap{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 54px);padding:18px 20px 8px;text-align:center;font-size:16.5px;line-height:1.4;background:linear-gradient(transparent,rgba(0,0,0,.6));z-index:4;pointer-events:none}',
    '.stv-foot{position:absolute;left:0;right:0;bottom:0;padding:12px 18px calc(env(safe-area-inset-bottom,0px) + 12px);z-index:5;text-align:center;font-size:14px;background:rgba(0,0,0,.45)}',
    '.stv-mute{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:6}',
    /* editors */
    '.ste-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;right:10px;display:flex;align-items:center;justify-content:space-between;z-index:5}',
    '.ste-stage{position:absolute;inset:0;display:grid;place-items:center}',
    '.ste-stage img,.ste-stage video{max-width:100%;max-height:100%;object-fit:contain}',
    '.ste-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 12px);background:linear-gradient(transparent,rgba(0,0,0,.65));z-index:5}',
    '.ste-bar input{flex:1;min-width:0;border:0;border-radius:24px;padding:13px 16px;background:rgba(255,255,255,.18);color:#fff;font-size:16px;outline:none}',
    '.ste-bar input::placeholder{color:#ddd}',
    '.ste-send{all:unset;cursor:pointer;width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:linear-gradient(135deg,var(--acc),#ff6fb5);color:#fff;flex:none}',
    '.ste-send[disabled]{opacity:.5}',
    '.ste-strip{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 78px);display:flex;gap:8px;justify-content:center;z-index:5}',
    '.ste-strip i{width:46px;height:46px;border-radius:10px;background:#333 center/cover no-repeat;border:2px solid transparent;opacity:.75}.ste-strip i.on{border-color:#fff;opacity:1}',
    '#stText textarea{position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;border:0;background:transparent;color:#fff;text-align:center;font-weight:700;font-family:inherit;resize:none;outline:none;padding:34vh 28px 20vh;line-height:1.25}',
    '#stText textarea::placeholder{color:rgba(255,255,255,.7)}',
    '#stSheet{z-index:70;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}',
    '#stSheet .sh{width:100%;max-width:560px;background:var(--panel);color:var(--ink);border-radius:24px 24px 0 0;padding:12px 14px calc(env(safe-area-inset-bottom,0px) + 14px)}',
    '#stSheet .sh button{all:unset;cursor:pointer;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:14px;padding:15px 14px;border-radius:16px;font-size:16.5px}',
    '#stSheet .sh button:active{background:var(--line)}',
    '#stSheet .sh .grab{width:40px;height:4px;border-radius:4px;background:var(--line);margin:0 auto 8px}'
  ].join('\n'); document.head.appendChild(css);

  /* ---------------------------------------------------------- rings / avatars */
  function ringGradient(n, unseen, mine) {
    if (!n) return 'none';
    var seg = 360 / n, gap = n > 1 ? Math.min(10, seg / 3) : 0, parts = [], off = n - unseen;
    for (var i = 0; i < n; i++) {
      var a = (i * seg + gap / 2).toFixed(1), b = ((i + 1) * seg - gap / 2).toFixed(1);
      var col = (mine || i >= off) ? 'var(--acc)' : '#b9b4c9';
      parts.push('transparent ' + (i * seg).toFixed(1) + 'deg ' + a + 'deg', col + ' ' + a + 'deg ' + b + 'deg', 'transparent ' + b + 'deg ' + ((i + 1) * seg).toFixed(1) + 'deg');
    }
    return 'conic-gradient(from 0deg,' + parts.join(',') + ')';
  }
  function paintAv(node, uid, name) {
    var isMe = uid === myUid(), img = '';
    try { img = isMe ? (window.__pf && window.__pf.mine && window.__pf.mine()) : (window.__pf && window.__pf.getPeer && window.__pf.getPeer(uid)); } catch (e) {}
    if (img) { node.style.backgroundImage = 'url(' + img + ')'; node.textContent = ''; }
    else { node.style.backgroundImage = ''; node.textContent = ((name || '?')[0] || '?').toUpperCase(); }
  }
  function avatar(uid, name, n, unseen, mine, plus) {
    var w = el('div', 'st-av'), rg = el('div', 'rg'), pa = el('div', 'pa');
    rg.style.background = ringGradient(n, unseen, mine); paintAv(pa, uid, name);
    w.appendChild(rg); w.appendChild(pa); if (plus) w.appendChild(el('span', 'plus', '+'));
    return w;
  }
  function ago(ts) { var m = Math.max(0, Math.floor((Date.now() - ts) / 60000)); return m < 1 ? 'Just now' : m < 60 ? m + ' min ago' : Math.floor(m / 60) < 24 ? Math.floor(m / 60) + ' h ago' : 'Yesterday'; }

  function applyRings() {
    var cl = $('cl'); if (!cl) return;
    var totalUnseen = 0;
    contacts().forEach(function (c) { totalUnseen += theirs(c.uid).filter(function (d) { return !isSeen(d); }).length; });
    var tn = $('tn_status'); if (tn) tn.classList.toggle('has-new', totalUnseen > 0);
    cl.querySelectorAll('.ct').forEach(function (row) {
      var uid = row.dataset.uid, av = row.querySelector('.av'); if (!av) return;
      var list = uid ? theirs(uid) : [], un = list.filter(function (d) { return !isSeen(d); }).length;
      if (list.length) { av.classList.add('st-has'); av.style.setProperty('--ring', ringGradient(list.length, un, false)); av.setAttribute('data-st', '1'); }
      else { av.classList.remove('st-has'); av.style.removeProperty('--ring'); av.removeAttribute('data-st'); }
    });
  }

  /* ---------------------------------------------------------------- tab UI */
  var built = false;
  function build() {
    if (built) return; var v = $('vStatus'); if (!v) return; built = true;
    v.innerHTML = '<div class="bar"><b>Status</b><span class="sp"></span><button class="ic" id="statusRefresh" type="button" aria-label="Refresh">↻</button></div><div class="st-body" id="stBody"></div>';
    var fabs = el('div', 'st-fabs', '<button id="stFabText" type="button" aria-label="Text status">✏️</button><button id="stFabCam" type="button" aria-label="Add photo or video status">📷</button>');
    v.parentNode.insertBefore(fabs, v.nextSibling);
    $('stFabText').onclick = openText; $('stFabCam').onclick = openSheet;
    $('statusRefresh').onclick = function () { contactSig = ''; watch(); render(); };
  }
  function render() {
    var b = $('stBody'); if (!b) return; b.textContent = '';
    var mine = mineGroups(), n = mine.length;
    var me = el('button', 'st-row'); me.type = 'button';
    var last = mine[n - 1];
    me.appendChild(avatar(myUid(), myName(), n, n, true, !n));
    me.appendChild(el('div', 'st-t', '<b>My status</b><small>' + (n ? esc(n + ' update' + (n > 1 ? 's' : '') + ' · ' + ago(last.ts)) : 'Tap to add status update') + '</small>'));
    var cam = el('button', 'st-act', '📷'); cam.type = 'button'; cam.setAttribute('aria-label', 'Add status'); cam.onclick = function (e) { e.stopPropagation(); openSheet(); };
    me.appendChild(cam);
    me.onclick = function () { n ? openViewer({ uid: myUid(), name: 'My status', list: mine, mine: true }) : openSheet(); };
    b.appendChild(me);

    var groups = contacts().filter(function (c) { return c.uid; }).map(function (c) { var l = theirs(c.uid); return { c: c, list: l, un: l.filter(function (d) { return !isSeen(d); }).length }; }).filter(function (g) { return g.list.length; });
    var fresh = groups.filter(function (g) { return g.un; }).sort(function (a, b) { return b.list[b.list.length - 1].ts - a.list[a.list.length - 1].ts; });
    var old = groups.filter(function (g) { return !g.un; }).sort(function (a, b) { return b.list[b.list.length - 1].ts - a.list[a.list.length - 1].ts; });
    var addGroup = function (title, arr) {
      if (!arr.length) return; b.appendChild(el('div', 'st-h', title));
      arr.forEach(function (g) {
        var r = el('button', 'st-row'); r.type = 'button';
        r.appendChild(avatar(g.c.uid, g.c.name, g.list.length, g.un, false, false));
        r.appendChild(el('div', 'st-t', '<b>' + esc(g.c.name) + '</b><small>' + esc(ago(g.list[g.list.length - 1].ts)) + '</small>'));
        r.onclick = function () { openViewer({ uid: g.c.uid, name: g.c.name, list: g.list, mine: false }); };
        b.appendChild(r);
      });
    };
    addGroup('Recent updates', fresh); addGroup('Viewed updates', old);
    if (!groups.length) b.appendChild(el('div', 'st-empty', 'No updates from your partner yet.<br>When she posts a photo, video or text status it shows up here, and a ring appears around her photo on the home screen. 💕'));
    applyRings();
  }
  function rebuild() { applyRings(); var v = $('vStatus'); if (v && v.classList.contains('on')) render(); }

  /* ------------------------------------------------------------ add sheet */
  var sheet;
  function openSheet() {
    if (!sheet) {
      sheet = el('div', 'ov'); sheet.id = 'stSheet';
      sheet.innerHTML = '<div class="sh"><div class="grab"></div><button id="shCam" type="button">📷 &nbsp;Camera</button><button id="shGal" type="button">🖼️ &nbsp;Photo &amp; video</button><button id="shTxt" type="button">✏️ &nbsp;Text</button><button id="shClose" type="button">✕ &nbsp;Cancel</button></div>';
      document.body.appendChild(sheet);
      sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.classList.remove('on'); });
      $('shClose').onclick = function () { sheet.classList.remove('on'); };
      $('shCam').onclick = function () { sheet.classList.remove('on'); pick(true); };
      $('shGal').onclick = function () { sheet.classList.remove('on'); pick(false); };
      $('shTxt').onclick = function () { sheet.classList.remove('on'); openText(); };
    }
    sheet.classList.add('on');
  }
  function pick(camera) {
    var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,video/*'; i.multiple = !camera; if (camera) i.setAttribute('capture', 'environment'); i.style.display = 'none';
    document.body.appendChild(i);
    i.onchange = function () { var f = [].slice.call(i.files || []); i.remove(); if (f.length) openEditor(f); };
    i.click();
  }

  /* --------------------------------------------------------- media editor */
  var ed = { items: [], i: 0 }, edEl;
  function vidDuration(file) {
    return new Promise(function (res) { var v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = function () { var d = v.duration; URL.revokeObjectURL(v.src); res(d); }; v.onerror = function () { res(0); }; v.src = URL.createObjectURL(file); });
  }
  async function openEditor(files) {
    var items = [];
    for (var k = 0; k < files.length && items.length < 8; k++) {
      var f = files[k];
      if (/^video\//.test(f.type)) {
        if (f.size > 50 * 1024 * 1024) { toast('Video is too big (max 50 MB)'); continue; }
        var d = await vidDuration(f); if (d > VIDEO_MAX + 0.5) { toast('Videos can be up to ' + VIDEO_MAX + ' seconds'); continue; }
        items.push({ file: f, kind: 'vid', url: URL.createObjectURL(f), cap: '', dur: d });
      } else if (/^image\//.test(f.type)) items.push({ file: f, kind: 'img', url: URL.createObjectURL(f), cap: '' });
    }
    if (!items.length) return;
    ed = { items: items, i: 0 };
    if (!edEl) {
      edEl = el('div', 'ov stov'); edEl.id = 'stEdit';
      edEl.innerHTML = '<div class="in"><div class="ste-top"><button class="stv-x" id="steClose" type="button" aria-label="Close">✕</button><span id="steCount" style="font-size:14px;opacity:.9"></span><span style="width:40px"></span></div><div class="ste-stage" id="steStage"></div><div class="ste-strip" id="steStrip"></div><div class="ste-bar"><input id="steCap" maxlength="200" placeholder="Add a caption…" autocomplete="off"><button class="ste-send" id="steSend" type="button" aria-label="Post status">➤</button></div></div>';
      document.body.appendChild(edEl);
      $('steClose').onclick = closeEditor;
      $('steCap').oninput = function () { ed.items[ed.i].cap = this.value; };
      $('steSend').onclick = sendMedia;
    }
    showItem(0); edEl.classList.add('on');
  }
  function closeEditor() { if (edEl) edEl.classList.remove('on'); ed.items.forEach(function (it) { try { URL.revokeObjectURL(it.url); } catch (e) {} }); var s = $('steStage'); if (s) s.textContent = ''; }
  function showItem(i) {
    ed.i = i; var it = ed.items[i], st = $('steStage'); st.textContent = '';
    var m = it.kind === 'vid' ? el('video') : el('img'); m.src = it.url; if (it.kind === 'vid') { m.controls = true; m.playsInline = true; m.loop = true; m.muted = true; m.autoplay = true; }
    st.appendChild(m); $('steCap').value = it.cap || '';
    $('steCount').textContent = ed.items.length > 1 ? (i + 1) + ' / ' + ed.items.length : '';
    var strip = $('steStrip'); strip.textContent = '';
    if (ed.items.length > 1) ed.items.forEach(function (x, k) { var t = el('i', k === i ? 'on' : ''); if (x.kind === 'img') t.style.backgroundImage = 'url(' + x.url + ')'; else t.textContent = '🎬'; t.onclick = function () { showItem(k); }; strip.appendChild(t); });
  }
  async function compress(file) {
    var u = URL.createObjectURL(file), img = new Image();
    await new Promise(function (r, j) { img.onload = r; img.onerror = j; img.src = u; });
    var k = Math.min(1, 1080 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
    return new Promise(function (r) { c.toBlob(function (b) { r(b); }, 'image/jpeg', 0.82); });
  }
  function toDataUrl(blob) { return new Promise(function (r) { var f = new FileReader(); f.onload = function () { r(f.result); }; f.readAsDataURL(blob); }); }
  async function uploadBlob(blob) {
    if (!isLocal() && window.__upl) { var r = await window.__upl(blob, blob.type); return r.url; }
    if (blob.size > 3.5 * 1024 * 1024) throw new Error('Too big for demo mode');
    return toDataUrl(blob);
  }
  var posting = false;
  async function sendMedia() {
    if (posting) return; posting = true; var btn = $('steSend'); btn.disabled = true;
    try {
      for (var i = 0; i < ed.items.length; i++) {
        var it = ed.items[i], blob = it.kind === 'img' ? await compress(it.file) : it.file;
        toast('Posting ' + (ed.items.length > 1 ? (i + 1) + '/' + ed.items.length : 'status') + '…');
        var url = await uploadBlob(blob);
        await postDoc({ type: it.kind, url: url, text: (it.cap || '').trim() });
      }
      closeEditor(); toast('Status posted for 24 hours'); render();
    } catch (e) { console.error(e); toast('Could not post status: ' + ((e && e.message) || 'try again')); }
    finally { posting = false; btn.disabled = false; }
  }

  /* ---------------------------------------------------------- text editor */
  var txt, bgi = 0;
  function openText() {
    if (!txt) {
      txt = el('div', 'ov stov'); txt.id = 'stText';
      txt.innerHTML = '<div class="in" id="stTextIn"><div class="ste-top"><button class="stv-x" id="stxClose" type="button" aria-label="Close">✕</button><button class="stv-x" id="stxBg" type="button" aria-label="Change colour">🎨</button></div><textarea id="stxArea" maxlength="240" placeholder="Type a status"></textarea><div class="ste-bar" style="justify-content:flex-end"><button class="ste-send" id="stxSend" type="button" aria-label="Post status">➤</button></div></div>';
      document.body.appendChild(txt);
      $('stxClose').onclick = function () { txt.classList.remove('on'); };
      $('stxBg').onclick = function () { bgi = (bgi + 1) % BG.length; paintText(); };
      $('stxArea').oninput = paintText;
      $('stxSend').onclick = async function () {
        var t = $('stxArea').value.trim(); if (!t) return toast('Write something first');
        var b = this; b.disabled = true;
        try { await postDoc({ type: 'text', text: t, bg: bgi }); txt.classList.remove('on'); $('stxArea').value = ''; toast('Status posted for 24 hours'); render(); }
        catch (e) { toast('Could not post status'); } finally { b.disabled = false; }
      };
    }
    bgi = Math.floor(Math.random() * BG.length); paintText(); txt.classList.add('on'); setTimeout(function () { $('stxArea').focus(); }, 120);
  }
  function textStyle(len) { return len < 40 ? 34 : len < 100 ? 27 : len < 180 ? 22 : 19; }
  function paintText() { var g = BG[bgi]; $('stTextIn').style.background = 'linear-gradient(160deg,' + g[0] + ',' + g[1] + ')'; $('stxArea').style.fontSize = textStyle($('stxArea').value.length) + 'px'; }

  /* ---------------------------------------------------------------- viewer */
  var vw, V = null, raf = 0;
  function ensureViewer() {
    if (vw) return;
    vw = el('div', 'ov stov'); vw.id = 'stView';
    vw.innerHTML = '<div class="in"><div class="stv-stage" id="stvStage"></div><div class="stv-cap" id="stvCap"></div><div class="stv-hit" id="stvHit"></div><div class="stv-bars" id="stvBars"></div><div class="stv-top"><button class="stv-x" id="stvClose" type="button" aria-label="Close">←</button><div class="pa" id="stvAv"></div><div class="mt"><b id="stvName"></b><small id="stvTime"></small></div><button class="stv-x" id="stvDel" type="button" aria-label="Delete status">🗑</button></div><button class="stv-x stv-mute" id="stvMute" type="button" aria-label="Sound" style="display:none">🔊</button><div class="stv-foot" id="stvFoot"></div></div>';
    document.body.appendChild(vw);
    $('stvClose').onclick = closeViewer;
    $('stvDel').onclick = delCurrent;
    $('stvMute').onclick = function () { var m = $('stvStage').querySelector('video'); if (m) { m.muted = !m.muted; this.textContent = m.muted ? '🔇' : '🔊'; } };
    var hit = $('stvHit'), p0 = null;
    hit.addEventListener('pointerdown', function (e) { p0 = { x: e.clientX, y: e.clientY, t: Date.now() }; pause(true); try { hit.setPointerCapture(e.pointerId); } catch (x) {} });
    hit.addEventListener('pointerup', function (e) {
      if (!p0) return; var dx = e.clientX - p0.x, dy = e.clientY - p0.y, dt = Date.now() - p0.t; p0 = null; pause(false);
      if (dy > 90 && Math.abs(dy) > Math.abs(dx)) return closeViewer();
      if (dt < 320 && Math.abs(dx) < 14 && Math.abs(dy) < 14) { var r = hit.getBoundingClientRect(); (e.clientX - r.left) < r.width * 0.33 ? step(-1) : step(1); }
    });
    hit.addEventListener('pointercancel', function () { p0 = null; pause(false); });
    document.addEventListener('keydown', function (e) { if (!vw.classList.contains('on')) return; if (e.key === 'Escape') closeViewer(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  }
  function openViewer(g) {
    ensureViewer();
    var list = g.list.slice(); var start = 0;
    if (!g.mine) { var k = list.findIndex(function (d) { return !isSeen(d); }); start = k < 0 ? 0 : k; }
    V = { g: g, list: list, i: start, t0: 0, dur: 5000, paused: false, elapsed: 0 };
    vw.classList.add('on'); $('stvDel').style.display = g.mine ? '' : 'none';
    var av = $('stvAv'); paintAv(av, g.uid, g.name); $('stvName').textContent = g.name;
    var bars = $('stvBars'); bars.textContent = ''; list.forEach(function () { var i = el('i'); i.appendChild(el('b')); bars.appendChild(i); });
    show();
  }
  function show() {
    cancelAnimationFrame(raf); var d = V.list[V.i]; if (!d) return closeViewer();
    var stage = $('stvStage'); stage.textContent = ''; $('stvMute').style.display = 'none';
    V.elapsed = 0; V.paused = false; V.dur = 5000;
    [].forEach.call($('stvBars').children, function (bar, k) { bar.firstChild.style.transform = 'scaleX(' + (k < V.i ? 1 : 0) + ')'; });
    $('stvTime').textContent = ago(d.ts);
    var cap = $('stvCap'); cap.textContent = d.type === 'text' ? '' : (d.text || ''); cap.style.display = cap.textContent ? '' : 'none';
    if (d.type === 'text') {
      var t = el('div', 'txt'); var g = BG[(d.bg | 0) % BG.length]; t.style.background = 'linear-gradient(160deg,' + g[0] + ',' + g[1] + ')'; t.style.fontSize = textStyle((d.text || '').length) + 'px'; t.textContent = d.text || '';
      stage.appendChild(t); V.dur = Math.min(10000, 4000 + (d.text || '').length * 40);
      V.t0 = performance.now(); loop();
    } else if (d.type === 'vid') {
      var v = el('video'); v.src = d.url; v.playsInline = true; v.autoplay = true; v.preload = 'auto'; stage.appendChild(v); V.video = v;
      V.dur = 0;
      v.onloadedmetadata = function () { V.dur = (v.duration || 10) * 1000; };
      v.onended = function () { step(1); };
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () { v.muted = true; v.play().catch(function () {}); });
      var mb = $('stvMute'); mb.style.display = ''; mb.textContent = '🔊';
      loopVideo();
    } else {
      var im = el('img'); im.onload = function () { V.t0 = performance.now(); V.elapsed = 0; loop(); }; im.onerror = function () { V.t0 = performance.now(); loop(); }; im.src = d.url; stage.appendChild(im); V.video = null;
    }
    var foot = $('stvFoot');
    if (V.g.mine) {
      var names = {}; contacts().forEach(function (c) { names[c.uid] = c.name; });
      var vs = Object.keys(d.views || {}); foot.style.display = '';
      foot.textContent = vs.length ? '👁 Seen by ' + vs.map(function (u) { return names[u] || 'your partner'; }).join(', ') : '👁 No views yet';
    } else { foot.style.display = 'none'; markSeen(d); }
  }
  function loop() {
    var bar = $('stvBars').children[V.i]; if (!bar) return;
    var tick = function (now) {
      if (!V || !vw.classList.contains('on')) return;
      if (!V.paused) { V.elapsed += (now - (V.last || now)); }
      V.last = now;
      var p = Math.min(1, V.elapsed / V.dur); bar.firstChild.style.transform = 'scaleX(' + p + ')';
      if (p >= 1) return step(1);
      raf = requestAnimationFrame(tick);
    };
    V.last = 0; raf = requestAnimationFrame(tick);
  }
  function loopVideo() {
    var bar = $('stvBars').children[V.i], v = V.video;
    var tick = function () {
      if (!V || !vw.classList.contains('on') || V.video !== v) return;
      if (v.duration) bar.firstChild.style.transform = 'scaleX(' + Math.min(1, v.currentTime / v.duration) + ')';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function pause(on) { if (!V) return; V.paused = on; if (V.video) { on ? V.video.pause() : V.video.play().catch(function () {}); } }
  function step(dir) {
    if (!V) return; var n = V.i + dir;
    if (n < 0) { V.i = 0; return show(); }
    if (n >= V.list.length) return closeViewer();
    V.i = n; show();
  }
  function closeViewer() {
    cancelAnimationFrame(raf); if (V && V.video) { try { V.video.pause(); } catch (e) {} } V = null;
    if (vw) { vw.classList.remove('on'); var s = $('stvStage'); if (s) s.textContent = ''; }
    render();
  }
  async function delCurrent() {
    if (!V || !V.g.mine) return; var d = V.list[V.i]; if (!d) return;
    if (!confirm('Delete this status for everyone?')) return;
    pause(true);
    try { await removeGroup(d); V.list.splice(V.i, 1); toast('Status deleted'); if (!V.list.length) return closeViewer(); if (V.i >= V.list.length) V.i = V.list.length - 1; openViewer({ uid: V.g.uid, name: V.g.name, list: V.list, mine: true }); }
    catch (e) { toast('Could not delete'); pause(false); }
  }

  /* ----------------------------------------------------------------- wiring */
  // chat-list photo with a ring opens the status instead of the chat
  document.addEventListener('click', function (e) {
    var av = e.target.closest ? e.target.closest('#cl .ct .av.st-has') : null; if (!av) return;
    var row = av.closest('.ct'), uid = row && row.dataset.uid; if (!uid) return;
    var list = theirs(uid); if (!list.length) return;
    e.stopPropagation(); e.preventDefault();
    var c = contacts().filter(function (x) { return x.uid === uid; })[0] || {};
    openViewer({ uid: uid, name: c.name || 'Status', list: list, mine: false });
  }, true);

  var cl = $('cl');
  if (cl && window.MutationObserver) new MutationObserver(function () { applyRings(); }).observe(cl, { childList: true });
  var sv = $('vStatus');
  if (sv && window.MutationObserver) new MutationObserver(function () { if (sv.classList.contains('on')) { build(); watch(); render(); } }).observe(sv, { attributes: true, attributeFilter: ['class'] });
  build();
  setInterval(function () { sweep(); watch(); if (sv && sv.classList.contains('on') && !(vw && vw.classList.contains('on'))) render(); else applyRings(); }, 20000);
  setTimeout(function () { watch(); applyRings(); }, 1500);
  setTimeout(function () { watch(); applyRings(); }, 6000);
  window.__status = { render: render, watch: watch, post: postDoc, open: openViewer, rings: applyRings, docs: allDocs };
})();
