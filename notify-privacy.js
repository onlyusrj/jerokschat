/* OnlyUs notify-privacy.js (v44)
   Settings > "Hide text in notifications": Auto (hide when app lock is on) | On | Off
   The choice is stored on this phone and copied to this phone's push-device record so the server
   sends a generic "New message" notification (no name, no text) to this phone only. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'onlyus-nthide';
  const mode = () => { try { const v = localStorage.getItem(KEY); return v === 'on' || v === 'off' ? v : 'auto'; } catch (e) { return 'auto'; } };
  const lockOn = () => { try { return !!(window.__lk && window.__lk.G && window.__lk.G()); } catch (e) { return false; } };
  const hidden = () => mode() === 'on' || (mode() === 'auto' && lockOn());
  window.__nhHide = hidden;

  const LABEL = { auto: 'Auto', on: 'On', off: 'Off' };
  function paint() {
    const s = $('nhSt'); if (!s) return;
    s.textContent = mode() === 'auto' ? (lockOn() ? 'Auto · hidden' : 'Auto · shown') : LABEL[mode()];
  }

  let last = '', busy = false;
  async function sync(force) {
    const want = mode() + '|' + lockOn();
    if (busy || (!force && want === last)) return;
    try {
      const U = window.__us, uid = U && U.uid && U.uid();
      const vapid = window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.vapidKey;
      if (!uid || !vapid || !('Notification' in window) || Notification.permission !== 'granted' || typeof firebase === 'undefined' || typeof firebase.messaging !== 'function' || !('serviceWorker' in navigator)) return;
      busy = true;
      const reg = window.__usSW || await navigator.serviceWorker.ready;
      const token = await firebase.messaging().getToken({ vapidKey: vapid, serviceWorkerRegistration: reg });
      if (!token) return;
      // separate write: if firestore.rules is not republished yet this fails quietly and push registration is untouched
      await firebase.firestore().collection('users').doc(uid).collection('devices').doc(encodeURIComponent(token).slice(0, 1500))
        .set({ token, updatedAt: Date.now(), hideMode: mode(), lock: lockOn() }, { merge: true });
      last = want;
    } catch (e) { console.warn('notify-privacy sync:', e && (e.code || e.message)); }
    finally { busy = false; }
  }

  function mount() {
    const nt = $('ntRow'); if (!nt || $('nhRow')) return;
    const b = document.createElement('button');
    b.className = 'row'; b.id = 'nhRow'; b.type = 'button';
    b.innerHTML = 'Hide text in notifications<span id="nhSt"></span>';
    nt.parentNode.insertBefore(b, nt.nextSibling);
    b.onclick = () => {
      const next = { auto: 'on', on: 'off', off: 'auto' }[mode()];
      try { if (next === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, next); } catch (e) {}
      paint(); sync(true);
      try {
        window.__us.toast(next === 'auto' ? 'Auto: text is hidden while app lock is on' : next === 'on' ? 'Notifications will say only “New message”' : 'Notifications will show the message text');
      } catch (e) {}
    };
    paint();
    const sb = $('setb'); if (sb) sb.addEventListener('click', () => setTimeout(paint, 60));
  }

  mount();
  document.addEventListener('visibilitychange', () => { paint(); sync(); });
  // app lock can be switched on/off in Settings: notice it and update the server copy
  setInterval(() => { paint(); sync(); }, 4000);
  setTimeout(() => sync(true), 3000);
})();
