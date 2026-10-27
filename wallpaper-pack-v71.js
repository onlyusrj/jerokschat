/* OnlyUs v71: built-in chat wallpaper pack.
   10 new designs (6-15) drawn only with CSS gradients + tiny inline SVG tiles (no image files, works offline,
   looks right in light AND dark theme because every layer is a soft tint over var(--panel)).
   Design 6 "Sakura" is the DEFAULT for every chat where nobody has picked a wallpaper yet (see wallpaper-gallery.js).
   Picking, sharing with your partner and the photo gallery are still handled by wallpaper-gallery.js. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  if (window.__wpPack) return;

  var svg = function (w, h, body) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
  };
  var tint = function (c, pct) { return 'color-mix(in srgb,' + c + ' ' + pct + '%,var(--panel))'; };
  var clear = function (c, pct) { return 'color-mix(in srgb,' + c + ' ' + pct + '%,transparent)'; };

  /* ---- little shapes ---- */
  var petal = function (x, y, r, s, f, o) {
    return '<path transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')" d="M0 9C-10 3-10-9 0-14 10-9 10 3 0 9zM0-14 0-9" fill="' + f + '" fill-opacity="' + o + '"/>';
  };
  var heart = function (x, y, r, s, f, o) {
    return '<path transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')" d="M0 6C-12-3-10-12-5-12 -2-12 0-10 0-8 0-10 2-12 5-12 10-12 12-3 0 6z" fill="' + f + '" fill-opacity="' + o + '"/>';
  };
  var star = function (x, y, s, f, o) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0-7 1.8-1.8 7 0 1.8 1.8 0 7-1.8 1.8-7 0-1.8-1.8z" fill="' + f + '" fill-opacity="' + o + '"/>';
  };
  var leaf = function (x, y, r, s, f, o) {
    return '<path transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')" d="M0 12C-9 6-10-6 0-14 10-6 9 6 0 12zM0 12 0-8" fill="' + f + '" fill-opacity="' + o + '" stroke="' + f + '" stroke-opacity="' + (o + .1) + '" stroke-width=".8"/>';
  };

  /* ---- tiles ---- */
  var T = {
    sakura: svg(190, 190,
      petal(26, 30, 20, 1, '#ff8fc0', .24) + petal(120, 20, -35, .8, '#ffb3d4', .3) + petal(160, 78, 60, 1.1, '#ff8fc0', .2) +
      petal(70, 88, -15, .9, '#ffb3d4', .28) + petal(24, 140, 80, 1, '#ff8fc0', .2) + petal(112, 150, 10, 1.1, '#ffb3d4', .26) +
      petal(170, 170, -50, .8, '#ff8fc0', .22) + '<circle cx="92" cy="48" r="1.8" fill="#ff8fc0" fill-opacity=".3"/><circle cx="145" cy="122" r="1.6" fill="#ffb3d4" fill-opacity=".4"/><circle cx="48" cy="104" r="1.5" fill="#ff8fc0" fill-opacity=".3"/>'),
    hearts: svg(120, 120,
      heart(18, 20, -12, .9, '#ff6fa5', .17) + heart(78, 14, 10, .6, '#ff9ec4', .22) + heart(104, 64, -8, .8, '#ff6fa5', .15) +
      heart(48, 62, 14, 1, '#ff9ec4', .2) + heart(14, 96, 6, .6, '#ff6fa5', .2) + heart(88, 108, -14, .7, '#ff9ec4', .2)),
    stars: svg(140, 140,
      star(20, 22, 1.2, '#ffd479', .55) + star(96, 14, .8, '#ffffff', .6) + star(118, 70, 1.4, '#ffd479', .5) + star(60, 60, .7, '#cdbcff', .7) +
      star(24, 104, .9, '#ffffff', .55) + star(84, 118, 1.1, '#ffd479', .5) +
      '<circle cx="44" cy="34" r="1.2" fill="#cdbcff" fill-opacity=".7"/><circle cx="130" cy="30" r="1" fill="#fff" fill-opacity=".7"/><circle cx="8" cy="64" r="1.1" fill="#ffd479" fill-opacity=".6"/><circle cx="104" cy="96" r="1.2" fill="#cdbcff" fill-opacity=".7"/><circle cx="52" cy="128" r="1" fill="#fff" fill-opacity=".6"/>'),
    waves: svg(64, 44,
      '<path d="M0 12Q8 4 16 12T32 12 48 12 64 12M0 34Q8 26 16 34T32 34 48 34 64 34" fill="none" stroke="#4aa8ff" stroke-opacity=".2" stroke-width="1.6" stroke-linecap="round"/>'),
    leaves: svg(150, 150,
      leaf(24, 30, -30, 1, '#4fbf7a', .2) + leaf(100, 22, 40, .8, '#7bd49a', .26) + leaf(130, 90, -60, 1.1, '#4fbf7a', .18) +
      leaf(60, 80, 25, .9, '#7bd49a', .24) + leaf(20, 120, 70, 1, '#4fbf7a', .18) + leaf(96, 130, -20, .8, '#7bd49a', .24)),
    doodle: svg(210, 210,
      '<g fill="none" stroke="#9a7bd9" stroke-opacity=".26" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M30 40C14 28 20 16 30 22 40 16 46 28 30 40z"/>' +
      '<path d="M120 24l4 9 10 1-8 7 3 10-9-6-9 6 3-10-8-7 10-1z"/>' +
      '<circle cx="176" cy="46" r="13"/><path d="M171 42v2M181 42v2M170 50q6 6 12 0"/>' +
      '<circle cx="62" cy="104" r="5"/><path d="M62 94v-6M62 114v6M52 104h-6M72 104h6M55 97l-4-4M69 111l4 4M69 97l4-4M55 111l-4 4"/>' +
      '<path d="M120 100q8-14 16 0t16 0 16 0"/>' +
      '<path d="M26 168l26-10-8 16-4-6z M44 168l-2 8"/>' +
      '<path d="M104 160c-10-6-8-16 0-14 8-2 10 8 0 14z"/><circle cx="168" cy="164" r="3"/><path d="M180 130v12M174 136h12"/></g>'),
    dots: svg(24, 24, '<circle cx="12" cy="12" r="1.5" fill="#b08be8" fill-opacity=".34"/>')
  };

  /* ---- the designs ---- */
  var B = [];
  B[6] = T.sakura + ' 0 0/190px 190px,' +
    'radial-gradient(ellipse at 15% 0%,' + clear('#ffb3d4', 26) + ',transparent 60%),radial-gradient(ellipse at 90% 100%,' + clear('#b9a2ff', 22) + ',transparent 58%),' +
    'linear-gradient(170deg,' + tint('#ffd6e8', 24) + ',' + tint('#e6dcff', 14) + ')';
  B[7] = T.hearts + ' 0 0/120px 120px,linear-gradient(160deg,' + tint('#ffb3c9', 20) + ',var(--panel) 70%)';
  B[8] = T.stars + ' 0 0/140px 140px,radial-gradient(circle at 80% 8%,' + clear('#ffd479', 20) + ',transparent 34%),linear-gradient(165deg,' + tint('#7b5cff', 26) + ',' + tint('#2a1d6a', 20) + ')';
  B[9] = 'radial-gradient(ellipse at 0% 0%,' + clear('#2ee6c5', 28) + ',transparent 55%),radial-gradient(ellipse at 100% 30%,' + clear('#ff6fd8', 22) + ',transparent 55%),' +
    'radial-gradient(ellipse at 40% 100%,' + clear('#6a8bff', 26) + ',transparent 60%),var(--panel)';
  B[10] = 'linear-gradient(180deg,' + tint('#ffb88a', 28) + ' 0%,' + tint('#ff7fb0', 22) + ' 50%,' + tint('#8e6bff', 26) + ' 100%)';
  B[11] = T.waves + ' 0 0/64px 44px,linear-gradient(180deg,' + tint('#7fd6ff', 22) + ',' + tint('#3a7bff', 18) + ')';
  B[12] = T.leaves + ' 0 0/150px 150px,linear-gradient(170deg,' + tint('#a8e6bd', 24) + ',' + tint('#4fbf7a', 14) + ')';
  B[13] = 'radial-gradient(circle at 84% 11%,rgba(255,243,200,.9) 0 17px,rgba(255,243,200,.28) 18px 38px,transparent 70px),' +
    'radial-gradient(ellipse 90px 26px at 18% 22%,rgba(255,255,255,.34),transparent 70%),radial-gradient(ellipse 120px 30px at 60% 46%,rgba(255,255,255,.26),transparent 70%),' +
    'radial-gradient(ellipse 100px 28px at 28% 76%,rgba(255,255,255,.3),transparent 70%),linear-gradient(180deg,' + tint('#6f86ff', 30) + ',' + tint('#c9b6ff', 22) + ')';
  B[14] = T.doodle + ' 0 0/210px 210px,linear-gradient(180deg,var(--panel),' + tint('#d9c8ff', 14) + ')';
  B[15] = T.dots + ' 0 0/24px 24px,linear-gradient(160deg,' + tint('#ffd9b8', 22) + ',' + tint('#ffc2dc', 18) + ')';

  var NAMES = { 6: 'Sakura (default)', 7: 'Hearts', 8: 'Starry night', 9: 'Aurora', 10: 'Sunset', 11: 'Ocean waves', 12: 'Forest', 13: 'Moon & clouds', 14: 'Doodles', 15: 'Soft dots' };

  var css = '';
  for (var n = 6; n <= 15; n++) css += '.chat-wallpaper-' + n + '{background:' + B[n] + '!important}\n';
  css += '.wallpaper-picker button{position:relative;overflow:hidden;padding:0;color:var(--ink);font-size:16px}' +
    '.wallpaper-picker button[data-w="6"]:after{content:"\\2B50";position:absolute;top:1px;right:3px;font-size:10px}' +
    '.wallpaper-picker button[data-w="0"]{background:var(--bg);font-size:12px;border-color:var(--line)}.wallpaper-picker button[data-w="0"].on{border-color:var(--acc)}' +
    '.wallpaper-picker{grid-template-columns:repeat(5,1fr)!important}' +
    '.wpName{flex:1 1 100%;font:12.5px system-ui,sans-serif;color:var(--dim);margin-top:6px;min-height:16px}';
  var st = document.createElement('style'); st.id = 'v71wp'; st.textContent = css; document.head.appendChild(st);

  /* ---- picker buttons (previews use the same class as the wallpaper itself) ---- */
  function build() {
    var pk = document.querySelector('#wallpaperBox .wallpaper-picker');
    if (!pk || pk.dataset.v71) return;
    pk.dataset.v71 = '1';
    for (var i = 1; i <= 5; i++) { var o = pk.querySelector('[data-w="' + i + '"]'); if (o) o.classList.add('chat-wallpaper-' + i); }
    for (var k = 6; k <= 15; k++) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.w = String(k); b.title = NAMES[k]; b.setAttribute('aria-label', 'Wallpaper ' + NAMES[k]);
      b.className = 'chat-wallpaper-' + k; pk.appendChild(b);
    }
    var nm = document.createElement('div'); nm.className = 'wpName'; nm.id = 'wpName'; nm.textContent = 'Tap a design. Your partner sees the same one.';
    pk.parentNode.insertBefore(nm, pk.nextSibling);
    pk.addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (b && NAMES[b.dataset.w]) nm.textContent = NAMES[b.dataset.w]; });
    try { if (window.__wpg) window.__wpg.apply(); } catch (e) { } // repaint the highlighted design now that all buttons exist
  }
  build();

  window.__wpPack = { names: NAMES, count: 15, def: 6 };
})();
