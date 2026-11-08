/* OnlyUs motion-v76.js  -  the "plain" bits now move smoothly
   Screen slides, press feedback, the tab pill, the message pop-in, dialog OPEN and the list entrance already existed (home-v52.js / fx-anim.js / couple-v64.js),
   so this file only fills the gaps:
   1) Dialogs: CLOSING now fades out too (it used to vanish instantly). Dialogs that other modules create (o67 / o68 / h75) also get an open animation.
   2) Toast: slides up and fades, and fades away instead of blinking off.
   3) The plain browser checkboxes that act as settings (the ones with an id: Settings toggles, "share my period tips" ...) become animated switches (spring knob). Checklist boxes stay as they are.
   4) Chat list and messages never bounce the page behind them (overscroll contained).
   Uses the individual `translate` / `scale` CSS properties, so it never fights the transforms that views and cards already use.
   Everything is switched off for people who turned on "reduce motion". */
(function () {
  'use strict';
  if (window.__mv76) return;
  var $ = function (id) { return document.getElementById(id); };
  var EASE = 'cubic-bezier(.2,.9,.3,1)', SPRING = 'cubic-bezier(.2,1.15,.3,1)';
  var CARD = '.card,.cd,.dlg,.box,.h75box,.o67box,.o68box';

  var css = [
    '@media (prefers-reduced-motion:no-preference){',
    /* ---- dialogs: open ---- */
    '@keyframes mvFade{from{opacity:0}}@keyframes mvFadeOut{to{opacity:0}}',
    '@keyframes mvPop{from{opacity:0;translate:0 22px;scale:.94}}@keyframes mvPopOut{to{opacity:0;translate:0 14px;scale:.97}}',
    '.o67ov,.h75ov,.o68ov{animation:mvFade .22s ease backwards}',
    '.o67ov>:is(' + CARD + '),.h75ov>:is(' + CARD + '),.o68ov>:is(' + CARD + '){animation:mvPop .38s ' + SPRING + ' backwards}',
    /* ---- dialogs: close (class is put back for a moment so the fade-out can play) ---- */
    '.ov.mv-out{display:flex;pointer-events:none;animation:mvFadeOut .2s ease forwards}',
    '.ov.mv-out>:is(' + CARD + '){animation:mvPopOut .2s ease forwards}',
    /* ---- toast ---- */
    '@keyframes mvToast{from{opacity:0;translate:0 16px;scale:.93}}@keyframes mvToastOut{to{opacity:0;translate:0 10px;scale:.96}}',
    '#toast{animation:mvToast .32s ' + SPRING + ' backwards}',
    '#toast.mv-out{display:block!important;pointer-events:none;animation:mvToastOut .22s ease forwards}',
    /* ---- switches ---- */
    'input[type=checkbox][id]:not([data-bucket]):not([data-i]){appearance:none;-webkit-appearance:none;flex:none;position:relative;width:48px;height:29px;margin:0;border-radius:99px;cursor:pointer;vertical-align:middle;background:color-mix(in srgb,var(--ink,#333) 22%,transparent);transition:background-color .28s ease,box-shadow .28s ease;-webkit-tap-highlight-color:transparent}',
    'input[type=checkbox][id]:not([data-bucket]):not([data-i])::after{content:"";position:absolute;left:3px;top:3px;width:23px;height:23px;border-radius:50%;background:#fff;box-shadow:0 2px 6px #0004;transition:translate .34s ' + SPRING + ',width .2s ease}',
    'input[type=checkbox][id]:not([data-bucket]):not([data-i]):active::after{width:28px}',
    'input[type=checkbox][id]:not([data-bucket]):not([data-i]):checked{background:var(--acc,#8657d9);box-shadow:0 0 14px color-mix(in srgb,var(--acc,#8657d9) 55%,transparent)}',
    'input[type=checkbox][id]:not([data-bucket]):not([data-i]):checked::after{translate:19px 0}',
    'input[type=checkbox][id]:not([data-bucket]):not([data-i]):checked:active::after{translate:14px 0}',
    '}',
    '#cl,#ms{overscroll-behavior:contain}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'v76motion'; st.textContent = css; document.head.appendChild(st);

  var reduce = function () { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* ---- dialog close fade (works for every .ov that is opened / closed with the "on" class) ---- */
  function watchOv(o) {
    if (o.__mv) return; o.__mv = 1; o.__on = o.classList.contains('on');
    new MutationObserver(function () {
      var on = o.classList.contains('on');
      if (on) { o.__on = 1; clearTimeout(o.__t); if (o.classList.contains('mv-out')) o.classList.remove('mv-out'); }   /* remove() on a missing class still fires this observer again = endless loop */
      else if (o.__on) { o.__on = 0; if (reduce()) return; o.classList.add('mv-out'); clearTimeout(o.__t); o.__t = setTimeout(function () { o.classList.remove('mv-out'); }, 210); }
    }).observe(o, { attributes: true, attributeFilter: ['class'] });
  }
  function scanOv() { document.querySelectorAll('.ov').forEach(watchOv); }
  scanOv();
  new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) { var n = ms[i].addedNodes[j]; if (n.nodeType === 1 && n.classList && n.classList.contains('ov')) watchOv(n); } }).observe(document.body, { childList: true });

  /* ---- toast fade-out ---- */
  (function () {
    var t = $('toast'); if (!t) return; t.__shown = t.style.display && t.style.display !== 'none';
    new MutationObserver(function () {
      var hidden = t.style.display === 'none';
      if (!hidden) { t.__shown = 1; clearTimeout(t.__t); if (t.classList.contains('mv-out')) t.classList.remove('mv-out'); }
      else if (t.__shown) { t.__shown = 0; if (reduce()) return; t.classList.add('mv-out'); clearTimeout(t.__t); t.__t = setTimeout(function () { t.classList.remove('mv-out'); }, 230); }
    }).observe(t, { attributes: true, attributeFilter: ['style'] });
  })();

  window.__mv76 = { v: 76 };
})();
