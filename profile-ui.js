/* OnlyUs profile-ui.js (v46)
   - WhatsApp-style Settings (menu + sub pages)
   - Profile photo: add / change / delete. Saved on this phone AND in Firestore (chats/{cid}/coupleHub/pf_{uid}),
     so it stays until you delete it, comes back after reinstall, and your partner sees it.
   No firestore.rules change needed (coupleHub is already members-only). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const AV = 'onlyus-avatar', TS = 'onlyus-avatar-ts', PEER = 'onlyus-pf-';
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
  const U = () => window.__us || {};
  const toast = m => { try { U().toast(m); } catch (e) {} };
  const bases = new Map();           // partner uid -> chat doc ref
  const peer = new Map();            // partner uid -> dataURL

  /* ---------- peer photos ---------- */
  const getPeer = uid => peer.has(uid) ? peer.get(uid) : (ls(PEER + uid) || '');
  function paint(el, uid, name) {
    if (!el) return;
    const img = getPeer(uid);
    if (img) { el.style.backgroundImage = 'url(' + img + ')'; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; el.textContent = ''; el.classList.add('hasimg'); }
    else { el.style.backgroundImage = ''; el.textContent = ((name || '?')[0] || '?').toUpperCase(); el.classList.remove('hasimg'); }
  }
  function setPeer(uid, img) {
    if ((getPeer(uid) || '') === (img || '')) return;
    peer.set(uid, img || ''); ls(PEER + uid, img || null);
    try { if (U().cuid && U().cuid() === uid) paint($('cav'), uid, U().cname && U().cname()); } catch (e) {}
    try { U().list && U().list(); } catch (e) {}
  }

  /* ---------- my photo ---------- */
  const mine = () => ls(AV) || '';
  const myTs = () => +(ls(TS) || 0);
  function refresh() { try { window.__avatar && window.__avatar(); } catch (e) {} }
  function pushAll(img, ts) {
    const uid = U().uid && U().uid(); if (!uid) return;
    const doc = img ? { uid, img, ts } : { uid, img: '', ts, del: true };
    bases.forEach(base => base.collection('coupleHub').doc('pf_' + uid).set(doc).catch(() => {}));
  }
  function pick(file) {
    const i = new Image(), u = URL.createObjectURL(file);
    i.onload = () => {
      const s = Math.min(i.width, i.height), c = document.createElement('canvas');
      c.width = c.height = 320;
      c.getContext('2d').drawImage(i, (i.width - s) / 2, (i.height - s) / 2, s, s, 0, 0, 320, 320);
      URL.revokeObjectURL(u);
      let q = .85, d = c.toDataURL('image/jpeg', q);
      while (d.length > 120000 && q > .4) { q -= .1; d = c.toDataURL('image/jpeg', q); }
      const ts = Date.now(); ls(AV, d); ls(TS, String(ts)); refresh(); pushAll(d, ts);
      toast('Profile photo saved 💕 Your partner can see it');
    };
    i.onerror = () => { URL.revokeObjectURL(u); toast('Could not read that photo'); };
    i.src = u;
  }
  function remove() {
    if (!mine()) return;
    if (!confirm('Delete your profile photo? Your partner will not see it anymore.')) return;
    const ts = Date.now(); ls(AV, null); ls(TS, String(ts)); refresh(); pushAll('', ts);
    toast('Profile photo deleted');
  }
  // old local photo (before v46) has no timestamp: give it one so it gets shared once
  if (mine() && !myTs()) ls(TS, String(Date.now()));

  function syncOwn(snap, hub) {
    const uid = U().uid && U().uid(); if (!uid) return;
    const d = snap.exists ? snap.data() : null, rts = d ? (+d.ts || 0) : 0, lts = myTs();
    if (rts > lts) { ls(AV, d.img || null); ls(TS, String(rts)); refresh(); }          // new phone / other phone changed it
    else if (rts < lts) {                                                                // this chat does not have my latest yet
      const img = mine();
      hub.doc('pf_' + uid).set(img ? { uid, img, ts: lts } : { uid, img: '', ts: lts, del: true }).catch(() => {});
    }
  }
  function watch(c, k, base, lun) {
    try {
      bases.set(c.uid, base);
      const hub = base.collection('coupleHub'), me = U().uid && U().uid();
      lun.push(hub.doc('pf_' + c.uid).onSnapshot(s => { const d = s.exists ? s.data() : null; setPeer(c.uid, d && d.img ? d.img : ''); }, () => {}));
      if (me) lun.push(hub.doc('pf_' + me).onSnapshot(s => syncOwn(s, hub), () => {}));
    } catch (e) {}
  }

  /* ---------- full photo viewer ---------- */
  function view(src) {
    const o = document.createElement('div'); o.className = 'pfview';
    const im = new Image(); im.src = src; o.appendChild(im);
    o.onclick = () => o.remove(); document.body.appendChild(o);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('#cav');
    if (a) { const uid = U().cuid && U().cuid(), img = uid && getPeer(uid); if (img) view(img); }
  });

  /* ---------- settings navigation ---------- */
  const TITLES = { prof: 'Profile', acct: 'Account', priv: 'Privacy', chat: 'Chats', noti: 'Notifications', call: 'Calls & whiteboard' };
  let cur = '';
  function menu() {
    cur = ''; const m = $('spMenu'); if (!m) return;
    m.hidden = false; document.querySelectorAll('#setBody .spp').forEach(p => p.hidden = true);
    $('setTitle').textContent = 'Settings'; const s = $('spSearch'); if (s) { s.value = ''; filter(''); }
    $('setBody').scrollTop = 0;
  }
  function open(k) {
    const p = $('spPg_' + k); if (!p) return;
    cur = k; $('spMenu').hidden = true;
    document.querySelectorAll('#setBody .spp').forEach(x => x.hidden = x !== p);
    $('setTitle').textContent = TITLES[k] || 'Settings'; $('setBody').scrollTop = 0;
  }
  function filter(q) {
    q = q.trim().toLowerCase(); let n = 0;
    document.querySelectorAll('#spMenu .spm').forEach(b => {
      const hit = !q || (b.textContent + ' ' + (b.dataset.kw || '')).toLowerCase().includes(q);
      b.hidden = !hit; if (hit) n++;
    });
    const hero = $('spHero'); if (hero) hero.hidden = !!q;
    const none = $('spNone'); if (none) none.hidden = n > 0;
  }
  function init() {
    if (!$('spMenu')) return;
    $('spMenu').addEventListener('click', e => {
      const b = e.target.closest('[data-pg]'); if (b) open(b.dataset.pg);
    });
    $('spSearch').addEventListener('input', e => filter(e.target.value));
    $('pfDel').addEventListener('click', remove);
    const sb = $('setb'); if (sb) sb.addEventListener('click', menu);
    const vs = $('vSet'); if (vs) vs.addEventListener('keydown', e => { if (e.key === 'Escape' && cur) menu(); });
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#spOpenAv')) { const i = mine(); if (i) view(i); } });
  }
  window.__setNav = { back() { if (cur) { menu(); return true; } return false; }, menu, open };
  window.__pf = { paint, watch, pick, remove, mine, getPeer };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
