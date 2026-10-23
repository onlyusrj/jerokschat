/* OnlyUs mode-v63.js
   Two modes chosen after sign-up:
     "couple"  = the full OnlyUs app (Us+, Our Space, Love Corner, Period, hug banner ...)
     "regular" = same chat, calls, status, games, AI, settings but without the couple-only features
   Saved on this phone and in the user's cloud profile (users/{uid}.mode), changeable in Settings. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var K = 'onlyus-mode', root = document.documentElement;
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var get = function () { try { var m = localStorage.getItem(K); return m === 'regular' || m === 'couple' ? m : ''; } catch (e) { return ''; } };

  var css = el('style');
  css.textContent = [
    /* regular mode: hide everything that is couple-only */
    'html.mode-reg #usb,html.mode-reg #listPeriod,html.mode-reg .welcome-strip,html.mode-reg .couple-profile,html.mode-reg .sound-chip,html.mode-reg #toolLove,html.mode-reg #lvHubBtn,html.mode-reg #lvMoodB,html.mode-reg #lvGn,html.mode-reg #lvOv,html.mode-reg #coupleHub,html.mode-reg [data-couple]{display:none!important}',
    '#modePick{position:fixed;inset:0;z-index:2147482000;display:none;flex-direction:column;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:var(--bg,#120a22);color:var(--ink,#fff);overflow:auto}',
    '#modePick.on{display:flex;animation:mpIn .3s ease both}@keyframes mpIn{from{opacity:0;transform:translateY(14px)}}',
    '#modePick h1{margin:0 0 6px;font-size:26px;letter-spacing:-.02em;text-align:center}',
    '#modePick p.s{margin:0 0 22px;color:var(--dim,#aaa);text-align:center;font-size:15px}',
    '#modePick .mc{all:unset;cursor:pointer;box-sizing:border-box;width:100%;max-width:420px;display:flex;align-items:center;gap:16px;padding:18px;margin-bottom:14px;border-radius:22px;background:var(--panel,#1d1330);border:2px solid var(--line,#3a2a58);-webkit-tap-highlight-color:transparent;transition:transform .15s,border-color .2s}',
    '#modePick .mc:active{transform:scale(.97)}#modePick .mc.sel{border-color:var(--acc,#8657d9)}',
    '#modePick .mc .e{font-size:40px;flex:none}#modePick .mc b{display:block;font-size:18px;color:var(--ink,#fff)}#modePick .mc small{display:block;margin-top:4px;font-size:13.5px;line-height:1.35;color:var(--dim,#aaa)}',
    '#modePick .go{all:unset;cursor:pointer;box-sizing:border-box;width:100%;max-width:420px;text-align:center;padding:15px;border-radius:18px;background:var(--acc,#8657d9);color:#fff;font-weight:700;font-size:16px;margin-top:6px}',
    '#modePick .go:disabled{opacity:.4}#modePick .go:active{transform:scale(.97)}',
    '#modePick .cn{all:unset;cursor:pointer;margin-top:14px;color:var(--dim,#aaa);font-size:14px;padding:8px}'
  ].join('\n');
  document.head.appendChild(css);

  var ov = el('div'); ov.id = 'modePick'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = '<h1>How will you use OnlyUs?</h1><p class="s">You can change this later in Settings.</p>' +
    '<button class="mc" type="button" data-m="couple"><span class="e">💞</span><span><b>For couples</b><small>Chat, calls and games plus couple features: Us+, Love Corner, shared diary, period calendar.</small></span></button>' +
    '<button class="mc" type="button" data-m="regular"><span class="e">💬</span><span><b>Regular use</b><small>Simple chat, calls, status, games and AI with all the couple features hidden.</small></span></button>' +
    '<button class="go" id="mpGo" type="button" disabled>Continue</button><button class="cn" id="mpCancel" type="button" hidden>Cancel</button>';
  document.body.appendChild(ov);

  var pick = '', cb = null;
  ov.querySelectorAll('.mc').forEach(function (b) {
    b.onclick = function () { pick = b.getAttribute('data-m'); ov.querySelectorAll('.mc').forEach(function (x) { x.classList.toggle('sel', x === b); }); $('mpGo').disabled = false; };
  });
  $('mpGo').onclick = function () { if (!pick) return; set(pick, true); ov.classList.remove('on'); };
  $('mpCancel').onclick = function () { ov.classList.remove('on'); };

  function apply() {
    var m = get(), reg = m === 'regular';
    root.classList.toggle('mode-reg', reg);
    var t = document.querySelector('#vList .lb-title'); if (t) t.textContent = 'OnlyUs';
    var sp = document.querySelector('#splash b'); if (sp) sp.textContent = reg ? 'OnlyUs' : 'OnlyUs';
    var q = $('searchChats'); if (q) q.placeholder = reg ? 'Search chats…' : 'Search your chats…';
    var row = $('modeRow'); if (row) { var s = row.querySelector('small'); if (s) s.textContent = reg ? 'Now: Regular use. Tap to change' : 'Now: For couples. Tap to change'; }
  }
  function set(m, save) {
    try { localStorage.setItem(K, m); } catch (e) { }
    apply();
    if (save) { try { window.__us && window.__us.save && window.__us.save(); } catch (e) { } try { window.__us && window.__us.toast && window.__us.toast(m === 'regular' ? 'Regular mode on' : 'Couples mode on 💞'); } catch (e) { } }
  }
  function ask(first) {
    pick = get() || ''; if (first) pick = '';
    ov.querySelectorAll('.mc').forEach(function (x) { x.classList.toggle('sel', x.getAttribute('data-m') === pick); });
    $('mpGo').disabled = !pick; $('mpCancel').hidden = !!first;
    ov.classList.add('on');
  }
  /* existing users without a saved mode keep the full couples app */
  function fromCloud(m) {
    if (m === 'regular' || m === 'couple') { set(m, false); return; }
    if (!get()) set('couple', false);
  }

  /* Settings > Chats page: "App mode" row */
  function addRow() {
    var pg = $('spPg_chat'); if (!pg || $('modeRow')) return;
    var b = el('button', 'row'); b.id = 'modeRow'; b.type = 'button';
    b.innerHTML = '🔀 App mode<small style="display:block;opacity:.7;font-weight:400;margin-top:2px"></small>';
    b.onclick = function () { ask(false); };
    var h = el('h3', '', 'App'); pg.insertBefore(b, pg.firstChild); pg.insertBefore(h, b);
    apply();
  }
  addRow(); setTimeout(addRow, 800); setTimeout(addRow, 2500);
  var sb = $('setb'); if (sb) sb.addEventListener('click', function () { setTimeout(addRow, 60); });

  window.__mode = { get: get, set: set, ask: ask, fromCloud: fromCloud, apply: apply };
  apply();
})();
