/* OnlyUs extras-v69.js
   1) Two extra sticker packs inside the sticker panel: "Kitty" (Couple Pro and Plus) and "Cosmic" (Couple Pro Plus only).
      They are small animated SVG stickers drawn in code, sent exactly like the built-in ones.
   2) Our Space: every tab opens with its own little animation.                                                  */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var plan = function () { return window.__plan ? window.__plan.get() : 'free'; };
  var U = function () { return window.__us || {}; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var dataUrl = function (s) { return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s))); };
  var HP = 'M0 10C-18-4-10-20 0-9 10-20 18-4 0 10z';

  /* ---------- sticker art ---------- */
  function wrap(body, cap, anim) {
    var c = cap ? '<g><rect x="28" y="206" width="200" height="38" rx="19" fill="#fff" opacity=".95"/><text x="128" y="232" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="21" font-weight="800" fill="#4a2a7a">' + esc(cap) + '</text></g>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><g>' + (anim ? '<animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="1.6s" repeatCount="indefinite"/>' : '') + body + '</g>' + c + '</svg>';
  }
  var heart = function (x, y, s, c, dur) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="' + HP + '" fill="' + c + '"><animateTransform attributeName="transform" type="scale" values="1;1.25;1" dur="' + (dur || 1.2) + 's" repeatCount="indefinite"/></path></g>'; };
  var star = function (x, y, r, c, d) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"><animate attributeName="opacity" values="1;.2;1" dur="' + (d || 1.6) + 's" repeatCount="indefinite"/></circle>'; };
  function kitty(fur, belly, mood, cap, extra) {
    var eyes = mood === 'happy' ? '<path d="M82 112q10-14 20 0M154 112q10-14 20 0" stroke="#3a2a4a" stroke-width="6" fill="none" stroke-linecap="round"/>' :
      mood === 'sleep' ? '<path d="M80 114h24M152 114h24" stroke="#3a2a4a" stroke-width="6" stroke-linecap="round"/>' :
      mood === 'sad' ? '<circle cx="92" cy="112" r="9" fill="#3a2a4a"/><circle cx="164" cy="112" r="9" fill="#3a2a4a"/><circle cx="95" cy="109" r="3" fill="#fff"/><circle cx="167" cy="109" r="3" fill="#fff"/><path d="M88 128q4 16 0 24" stroke="#6fb7ff" stroke-width="5" fill="none" stroke-linecap="round"/>' :
      mood === 'love' ? heart(92, 112, .9, '#ff3d6e', 1) + heart(164, 112, .9, '#ff3d6e', 1) :
      '<circle cx="92" cy="112" r="10" fill="#3a2a4a"/><circle cx="164" cy="112" r="10" fill="#3a2a4a"/><circle cx="96" cy="108" r="3.5" fill="#fff"/><circle cx="168" cy="108" r="3.5" fill="#fff"/>';
    var mouth = mood === 'sad' ? '<path d="M116 146q12-10 24 0" stroke="#3a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/>' : mood === 'surprise' ? '<ellipse cx="128" cy="150" rx="8" ry="10" fill="#3a2a4a"/>' : '<path d="M114 142q7 12 14 0q7 12 14 0" stroke="#3a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/>';
    var body = '<path d="M62 92 52 40 96 66zM194 92l10-52-44 26z" fill="' + fur + '"/><path d="M68 80 62 56l22 12zM188 80l6-24-22 12z" fill="#ffb6c8"/><ellipse cx="128" cy="124" rx="76" ry="66" fill="' + fur + '"/><ellipse cx="128" cy="150" rx="30" ry="22" fill="' + belly + '"/>' + eyes + '<path d="M122 132h12l-6 7z" fill="#ff7a9c"/>' + mouth + '<circle cx="64" cy="138" r="11" fill="#ff9db6" opacity=".55"/><circle cx="192" cy="138" r="11" fill="#ff9db6" opacity=".55"/><path d="M56 128h-30M56 140l-28 8M200 128h30M200 140l28 8" stroke="#6a5a7a" stroke-width="3" stroke-linecap="round"/>' + (extra || '');
    return wrap(body, cap, true);
  }
  var KIT = [
    ['#ffd6a5', '#fff3e0', 'love', 'Love you', heart(206, 60, 1.3, '#ff4d6d', 1) + heart(50, 70, .9, '#ff8fb3', 1.4)],
    ['#cdb4f6', '#f4ecff', 'sad', 'Miss you', ''],
    ['#b8e0d2', '#eefaf5', 'happy', 'Yay!', star(40, 50, 5, '#ffd23f') + star(216, 44, 6, '#ffd23f', 1.2)],
    ['#ffc2d4', '#fff0f5', 'sleep', 'Good night', '<text x="196" y="64" font-size="30" font-weight="800" fill="#7a5cff" font-family="Arial">z</text><text x="214" y="42" font-size="22" font-weight="800" fill="#7a5cff" font-family="Arial">z</text>'],
    ['#ffe08a', '#fff8dc', 'surprise', 'Really?', ''],
    ['#d9d9e8', '#f7f7ff', 'happy', 'Hug?', '<path d="M30 170q30-30 50 0M226 170q-30-30-50 0" stroke="' + '#d9d9e8' + '" stroke-width="16" fill="none" stroke-linecap="round"/>'],
    ['#ffb199', '#ffe9e2', 'love', 'Mine', heart(128, 44, 1.4, '#ff4d6d', 1)],
    ['#a8d8ff', '#eaf5ff', 'sad', 'Sorry', ''],
    ['#ffd6a5', '#fff3e0', 'happy', 'Good morning', '<circle cx="214" cy="48" r="20" fill="#ffd23f"/>'],
    ['#cdb4f6', '#f4ecff', 'surprise', 'Call me', ''],
    ['#b8e0d2', '#eefaf5', 'love', 'Kiss', heart(196, 150, .8, '#ff4d6d', 1) + heart(214, 130, .6, '#ff8fb3', 1.3)],
    ['#ffc2d4', '#fff0f5', 'happy', 'Hungry', '']
  ];
  function planet(c1, c2, cap, extra) {
    var b = '<rect width="256" height="256" rx="40" fill="#1d1040"/>' + [[30, 40], [220, 36], [60, 150], [200, 120], [120, 28], [236, 184], [24, 100]].map(function (p, i) { return star(p[0], p[1], 2.5 + i % 3, '#fff', 1.2 + i * .2); }).join('') +
      '<g><animateTransform attributeName="transform" type="rotate" values="-8 128 112;8 128 112;-8 128 112" dur="5s" repeatCount="indefinite"/><ellipse cx="128" cy="112" rx="104" ry="24" fill="none" stroke="' + c2 + '" stroke-width="10" opacity=".85"/><circle cx="128" cy="112" r="56" fill="' + c1 + '"/><path d="M80 98q48 14 96 0M76 126q52 16 104 0" stroke="#fff" stroke-width="6" fill="none" opacity=".35"/><path d="M24 112a104 24 0 0 0 208 0" fill="none" stroke="' + c2 + '" stroke-width="10" opacity=".85"/></g>' + (extra || '');
    return wrap(b, cap, false);
  }
  var COS = [
    ['#ff7eb3', '#ffd1e6', 'You are my universe', heart(214, 70, 1, '#ff5c8d', 1)],
    ['#7a5cff', '#c9bcff', 'Over the moon', '<circle cx="214" cy="52" r="20" fill="#ffe9a8"/><circle cx="224" cy="46" r="18" fill="#1d1040"/>'],
    ['#4facfe', '#bfe3ff', 'Stars align', ''],
    ['#ffb347', '#ffe0b0', 'Hot for you', ''],
    ['#43e97b', '#c8f7d9', 'Out of this world', ''],
    ['#ff6b6b', '#ffc9c9', 'Forever yours', heart(40, 70, 1, '#ff8fb3', 1.4)],
    ['#f093fb', '#f8d1fd', 'Dream of you', ''],
    ['#00c6ff', '#b3f0ff', 'Orbiting you', ''],
    ['#ffd23f', '#fff0a8', 'My sunshine', ''],
    ['#a18cd1', '#e0d4f7', 'Miss you', ''],
    ['#fc5c7d', '#ffc1cf', 'Kiss kiss', heart(200, 168, .9, '#ff4d6d', 1)],
    ['#6a11cb', '#c6a9f5', 'Good night', '']
  ];
  var PACKS = {
    kitty: { label: 'Kitty', tier: 'pro', items: KIT.map(function (k) { return kitty(k[0], k[1], k[2], k[3], k[4]); }), why: 'The Kitty sticker pack is part of Couple Pro.' },
    cosmic: { label: 'Cosmic', tier: 'plus', items: COS.map(function (c) { return planet(c[0], c[1], c[2], c[3]); }), why: 'The Cosmic sticker pack is part of Couple Pro Plus.' }
  };
  var ok = function (t) { var p = plan(); return t === 'pro' ? p !== 'free' : p === 'plus'; };

  function addTabs() {
    var panel = $('stkP'), tabs = $('stkT'); if (!panel || !tabs || tabs.__o69) return; tabs.__o69 = 1;
    Object.keys(PACKS).forEach(function (k) {
      var P = PACKS[k], b = el('button', '', P.label + (ok(P.tier) ? '' : ' \u00b7 ' + (P.tier === 'plus' ? 'PLUS' : 'PRO'))); b.type = 'button'; b.dataset.t = k;
      b.addEventListener('click', function () {
        setTimeout(function () {
          var g = $('stkG'); if (!g) return; [].forEach.call(tabs.children, function (x) { x.classList.toggle('on', x === b); });
          if (!ok(P.tier)) { g.textContent = ''; g.appendChild(el('div', 'note full', P.why)); if (window.__plan) window.__plan.paywall(P.why); return; }
          g.textContent = ''; g.scrollTop = 0;
          P.items.forEach(function (svg) {
            var t = el('button', 'tile'); t.type = 'button'; t.style.cssText = 'background:none;border:0;padding:4px'; var im = new Image(); im.src = dataUrl(svg); im.alt = ''; im.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block'; t.appendChild(im);
            t.onclick = function () { try { U().send({ type: 'img', sticker: true, data: dataUrl(svg) }); if (panel.classList.contains('on') && $('stkb')) $('stkb').click(); } catch (e) { try { U().toast('Could not send'); } catch (x) { } } };
            g.appendChild(t);
          });
        }, 0);
      });
      tabs.appendChild(b);
    });
  }

  /* ---------- Our Space: each tab has its own little entrance ---------- */
  var css = el('style');
  css.textContent = [
    '@keyframes o69paper{from{opacity:0;transform:translateY(24px) rotate(-3deg)}}@keyframes o69bounce{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}@keyframes o69zoom{from{opacity:0;transform:scale(.8) rotate(4deg)}}',
    '@keyframes o69flip{from{opacity:0;transform:perspective(500px) rotateX(-70deg)}}@keyframes o69pop{0%{opacity:0;transform:scale(.3)}70%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}@keyframes o69right{from{opacity:0;transform:translateX(40px)}}',
    '@keyframes o69wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes o69left{from{opacity:0;transform:translateX(-36px)}}@keyframes o69fade{from{opacity:0}}@keyframes o69pulse{0%{opacity:0;transform:scale(.9)}50%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}',
    '#hubContent[data-t=notes]>*{animation:o69paper .55s ease both}#hubContent[data-t=mood]>*{animation:o69bounce .6s ease both}#hubContent[data-t=memories]>*{animation:o69zoom .55s ease both}',
    '#hubContent[data-t=dates]>*{animation:o69flip .6s ease both}#hubContent[data-t=surprises]>*{animation:o69pop .6s ease both}#hubContent[data-t=places]>*{animation:o69right .5s ease both}',
    '#hubContent[data-t=music]>*{animation:o69fade .5s ease both,o69wave 2.4s ease-in-out .5s infinite}#hubContent[data-t=lists]>*{animation:o69left .5s ease both}#hubContent[data-t=questions]>*{animation:o69fade .6s ease both}#hubContent[data-t=period]>*{animation:o69pulse .6s ease both}#hubContent[data-t=home]>*{animation:o69bounce .55s ease both}#hubContent[data-t=extras]>*{animation:o69pop .5s ease both}',
    '#hubContent>*:nth-child(2){animation-delay:.07s!important}#hubContent>*:nth-child(3){animation-delay:.14s!important}#hubContent>*:nth-child(4){animation-delay:.21s!important}#hubContent>*:nth-child(5){animation-delay:.28s!important}#hubContent>*:nth-child(n+6){animation-delay:.35s!important}',
    '#hubTabs button.on{animation:o69pulse .5s ease}',
    '@media (prefers-reduced-motion:reduce){#hubContent>*{animation:none!important}}'
  ].join('\n');
  document.head.appendChild(css);
  function tag() { var c = $('hubContent'), b = $('hubTabs') && $('hubTabs').querySelector('button.on'); if (c && b && c.getAttribute('data-t') !== b.dataset.tab) c.setAttribute('data-t', b.dataset.tab); }
  var hc = $('hubContent'); if (hc) new MutationObserver(tag).observe(hc, { childList: true });
  var ht = $('hubTabs'); if (ht) new MutationObserver(tag).observe(ht, { attributes: true, subtree: true, attributeFilter: ['class'] });
  var q = 0; new MutationObserver(function () { if (q) return; q = setTimeout(function () { q = 0; addTabs(); }, 200); }).observe(document.body, { childList: true, subtree: true });
  addTabs(); tag();
  window.__stk69 = { packs: PACKS };
})();
