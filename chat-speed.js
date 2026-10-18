/* OnlyUs chat-speed.js (v50)
   Settings > Chats > "Show old chats": Ask (card with Yes / No) or Auto (older messages load when you scroll up).
   Shows how much temporary media this phone keeps (photos, GIFs, voice notes: 7 days, max 200 MB) and can clear it. */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var K = 'onlyus-old', CACHE = 'onlyus-media-v1';
  function mode() { try { return localStorage.getItem(K) === 'auto' ? 'auto' : 'ask'; } catch (e) { return 'ask'; } }

  var st = document.createElement('style');
  st.textContent = '#olBox{margin:14px 0 6px}#olBox h3{margin:0 0 6px;font-size:14px;color:var(--dim);font-weight:700;letter-spacing:.02em}.olnote{font-size:12.5px;color:var(--dim);line-height:1.45;padding:6px 4px 2px}';
  document.head.appendChild(st);

  function sizeText(cb) {
    if (!window.caches) return cb('');
    caches.open(CACHE).then(function (c) {
      return c.keys().then(function (ks) {
        return Promise.all(ks.map(function (k) { return c.match(k).then(function (r) { return r ? (+r.headers.get('x-size') || 0) : 0; }); }));
      });
    }).then(function (a) {
      var t = a.reduce(function (x, y) { return x + y; }, 0);
      cb(t < 1048576 ? Math.max(0, Math.round(t / 1024)) + ' KB' : (t / 1048576).toFixed(1) + ' MB');
    }).catch(function () { cb(''); });
  }

  function mount() {
    var pg = $('spPg_chat'); if (!pg || $('olRow')) return;
    var box = document.createElement('div'); box.id = 'olBox';
    box.innerHTML = '<h3>Old messages &amp; saved files</h3>' +
      '<button class="row" id="olRow" type="button">Show old chats<span id="olSt"></span></button>' +
      '<button class="row" id="olClr" type="button">Saved photos, GIFs &amp; voice notes<span id="olSz"></span></button>' +
      '<div class="olnote">A chat opens with only the newest 50 messages so it appears at once. Ask: tap Yes on the card at the top to load 50 older ones. Auto: older messages load as you scroll up. Saved files stay on this phone for 7 days (max 200 MB), then clear themselves. Nothing is deleted from the cloud. Tap the saved-files row to clear them now.</div>';
    pg.appendChild(box);
    var paint = function () { $('olSt').textContent = mode() === 'auto' ? 'Auto-load' : 'Ask me'; sizeText(function (t) { $('olSz').textContent = t || 'Clear'; }); };
    $('olRow').onclick = function () {
      try { if (mode() === 'auto') localStorage.removeItem(K); else localStorage.setItem(K, 'auto'); } catch (e) {}
      paint();
      try { window.__us.toast(mode() === 'auto' ? 'Older messages load as you scroll up' : 'You will be asked before old messages load'); } catch (e) {}
    };
    $('olClr').onclick = function () {
      if (!window.caches) return;
      if (!confirm('Remove saved photos, GIFs and voice notes from this phone? They download again when you open them.')) return;
      caches.delete(CACHE).then(function () { paint(); try { window.__us.toast('Saved files cleared'); } catch (e) {} });
    };
    paint();
    var sb = $('setb'); if (sb) sb.addEventListener('click', function () { setTimeout(paint, 80); });
  }
  mount();
  if (!$('olRow')) { var n = 0, iv = setInterval(function () { mount(); if ($('olRow') || ++n > 40) clearInterval(iv); }, 250); }
})();
