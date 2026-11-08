/* OnlyUs account-sync-v73.js
   Settings belong to the ACCOUNT, not to the phone.
   - Every setting in WL below (theme, language, palette, font size, home layout, muted/starred/pinned chats ...) is copied to
     users/{uid}/prefs/app in Firestore a couple of seconds after it changes.
   - When you sign in on any phone, your saved settings are restored (the app reloads once so every screen picks them up).
   - "Welcome / onboarding done" and "intro seen" are saved the same way, so a finished welcome never comes back for that account.
   - Signing in with a DIFFERENT account on the same phone clears the previous account's synced settings first.
   Never synced (stay on the phone): app lock, biometric, encryption keys, vault, AI key, call logs, avatar and wallpaper images, plan cache.
   Needs the new rule  match /users/{uid}/prefs/{doc}  (see firestore.rules). Without it the app just keeps working locally. */
(function () {
  'use strict';
  if (window.__acctSync) return;
  var WL = ['onlyus-lang', 'onlyus-vlang', 'onlyus-vtt', 'onlyus-vauto', 'onlyus-trok', 'onlyus-theme', 'onlyus-pal', 'onlyus-acc', 'onlyus-fz', 'onlyus-wf', 'onlyus-lg',
    'onlyus-sound-prefs', 'onlyus-nthide', 'onlyus-sk-home', 'onlyus-sk-chat', 'onlyus-h70', 'onlyus-since', 'onlyus-sorry-lang', 'onlyus-wall-global',
    'onlyus-muted', 'onlyus-starred', 'onlyus-fav', 'onlyus-hidden', 'onlyus-hpin', 'onlyus-lists', 'onlyus-intro', 'onlyus-asked-notif'];
  var MAXV = 6000, TSK = 'onlyus-sync-ts', UIDK = 'onlyus-sync-uid', RLK = 'onlyus-sync-rl';
  var SP = Storage.prototype, oSet = SP.setItem, oRem = SP.removeItem, oGet = SP.getItem;
  var uid = '', active = false, applying = false, isReady = true, ts = {}, dirty = {}, timer = 0, retry = 0;
  var api = { _reload: function () { location.reload(); } };

  var rd = function (k) { try { return oGet.call(localStorage, k); } catch (e) { return null; } };
  var wr = function (k, v) { try { oSet.call(localStorage, k, v); } catch (e) { } };
  var rm = function (k) { try { oRem.call(localStorage, k); } catch (e) { } };
  var fs = function () { try { return window.firebase && window.firebase.firestore(); } catch (e) { return null; } };
  var ok = function (k) { return WL.indexOf(k) >= 0 || (uid && (k === 'onlyus-ob-' + uid || k === 'onlyus-ob-done-' + uid)); };
  var loadTs = function () { try { ts = JSON.parse(rd(TSK) || '{}') || {}; } catch (e) { ts = {}; } };
  var saveTs = function () { wr(TSK, JSON.stringify(ts)); };
  var userKeys = function () { var o = WL.slice(); for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (/^onlyus-ob-(done-)?[A-Za-z0-9]+$/.test(k)) o.push(k); } return o; };

  /* ---- watch writes to settings ---- */
  function touch(k) {
    if (!active || applying || !ok(k)) return;
    var v = rd(k); if (v != null && v.length > MAXV) return;
    ts[k] = Date.now(); dirty[k] = v == null ? '' : v; saveTs(); schedule(2500);
  }
  SP.setItem = function (k, v) { oSet.call(this, k, v); if (this === localStorage) touch(String(k)); };
  SP.removeItem = function (k) { oRem.call(this, k); if (this === localStorage) touch(String(k)); };

  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms); }
  function flush() {
    var f = fs(), keys = Object.keys(dirty); if (!f || !uid || !keys.length) return Promise.resolve();
    var kv = {}, t = {}; keys.forEach(function (k) { kv[k] = dirty[k]; t[k] = ts[k] || Date.now(); });
    var sent = dirty; dirty = {};
    return f.doc('users/' + uid + '/prefs/app').set({ kv: kv, ts: t, updatedAt: Date.now() }, { merge: true }).then(function () { retry = 0; }).catch(function () {
      keys.forEach(function (k) { if (!(k in dirty)) dirty[k] = sent[k]; });         /* keep for later (offline / rules not published yet) */
      if (retry < 4) { retry++; schedule(15000 * retry); }
    });
  }
  window.addEventListener('pagehide', function () { try { flush(); } catch (e) { } });
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  /* ---- sign-in: restore ---- */
  var withTimeout = function (p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); };

  function begin(u) {
    uid = u; active = false; isReady = false; dirty = {}; loadTs();
    var last = rd(UIDK);
    if (last && last !== u) { userKeys().forEach(rm); ts = {}; saveTs(); }          /* other account used this phone: do not leak its settings */
    wr(UIDK, u);
    var f = fs(); if (!f) { active = true; isReady = true; return; }
    var pPrefs = withTimeout(f.doc('users/' + u + '/prefs/app').get().then(function (s) { return s.exists ? s.data() : null; }), 7000).catch(function () { return undefined; });
    var pUser = withTimeout(f.doc('users/' + u).get().then(function (s) { return s.exists ? s.data() : null; }), 7000).catch(function () { return undefined; });
    Promise.all([pPrefs, pUser]).then(function (r) { try { apply(r[0], r[1]); } catch (e) { } finish(); });
  }

  function apply(remote, user) {
    var changed = false, upKeys = [];
    applying = true;
    var rkv = (remote && remote.kv) || {}, rts = (remote && remote.ts) || {};
    if (remote !== undefined) {
      Object.keys(rkv).forEach(function (k) {
        if (!ok(k)) return; var rt = +rts[k] || 0, lt = +ts[k] || 0;
        if (rt > lt) {
          var cur = rd(k), nv = rkv[k];
          if (nv === '' ? cur != null : cur !== nv) { if (nv === '') rm(k); else wr(k, nv); if (k !== 'onlyus-intro' && k.indexOf('onlyus-ob-') !== 0 && k !== 'onlyus-asked-notif') changed = true; }
          ts[k] = rt;
        }
      });
      userKeys().forEach(function (k) { if (!ok(k)) return; var lt = +ts[k] || 0, rt = +rts[k] || 0, v = rd(k); if (v != null && v.length <= MAXV && (lt > rt || !(k in rkv))) { if (!lt) ts[k] = Date.now(); upKeys.push(k); } });
    }
    /* account already onboarded in the cloud (age is only saved at the end of the welcome steps) -> never show the welcome again */
    var ob = user && user.ob;
    if (ob && typeof ob.age === 'number') {
      var cur = {}; try { cur = JSON.parse(rd('onlyus-ob-' + uid) || '{}') || {}; } catch (e) { }
      ['age', 'gender', 'since', 'title', 'lang'].forEach(function (k) { if (cur[k] == null && ob[k] != null) cur[k] = ob[k]; }); cur.done = 1;
      wr('onlyus-ob-' + uid, JSON.stringify(cur)); wr('onlyus-ob-done-' + uid, '1'); wr('onlyus-intro', '1');
      if (ob.since && !rd('onlyus-since')) wr('onlyus-since', ob.since);
      ['onlyus-ob-' + uid, 'onlyus-ob-done-' + uid, 'onlyus-intro'].forEach(function (k) { if (upKeys.indexOf(k) < 0) { ts[k] = ts[k] || Date.now(); upKeys.push(k); } });
    }
    applying = false; saveTs();
    upKeys.forEach(function (k) { dirty[k] = rd(k) == null ? '' : rd(k); });
    if (upKeys.length) schedule(800);
    if (changed) {
      var done = false; try { done = !!sessionStorage.getItem(RLK); sessionStorage.setItem(RLK, '1'); } catch (e) { }
      if (!done) { restoring(); setTimeout(function () { api._reload(); }, 450); }
    }
  }
  function finish() { active = true; isReady = true; window.dispatchEvent(new Event('onlyus-sync-ready')); }
  function restoring() {
    if (document.getElementById('acctRestore')) return;
    var d = document.createElement('div'); d.id = 'acctRestore';
    d.style.cssText = 'position:fixed;inset:0;z-index:2000;background:#0b0615;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;font:600 16px system-ui,sans-serif';
    d.innerHTML = '<div style="font-size:42px">💞</div>Restoring your settings…'; document.body.appendChild(d);
  }

  /* ---- watch sign-in / sign-out ---- */
  setInterval(function () {
    var u = ''; try { u = (window.__us && window.__us.uid && window.__us.uid()) || ''; } catch (e) { }
    if (u && u !== uid) begin(u);
    else if (!u && uid) { flush(); uid = ''; active = false; isReady = true; }
  }, 400);

  api.ready = function () { var u = ''; try { u = (window.__us && window.__us.uid && window.__us.uid()) || ''; } catch (e) { } return isReady && (!u || u === uid); };
  api.flush = flush;
  api.keys = WL;
  window.__acctSync = api;
})();
