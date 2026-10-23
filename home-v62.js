/* OnlyUs home-v62.js
   1) Home header: logo in the top-left corner, "Only Us" title, and a WhatsApp-style 3-dot menu that holds the old icon row
   2) OnlyUs AI button: no text, a sparkle "AI" logo instead
   3) Calls tab: call log (incoming / outgoing / missed) with call-back buttons
   4) Settings tab next to Calls in the bottom bar
   5) Video call: buttons and names hide by themselves so the face is fully visible; tap the screen to show them again */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ================================================================ CSS */
  var css = el('style');
  css.textContent = [
    /* header */
    '#vList>.listbar{position:relative!important;z-index:20!important;flex-direction:column!important;gap:0!important;padding-bottom:12px!important}',
    '#vList .lb-top{position:relative;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px;min-height:44px}',
    '#vList .lb-top .brandmark{order:0;width:40px!important;height:40px!important;border-radius:50%!important;margin:0}',
    '#vList .lb-title{position:absolute;left:50%;transform:translateX(-50%);font-size:26px!important;pointer-events:none;white-space:nowrap}',
    '#lbMore{all:unset;order:2;cursor:pointer;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;-webkit-tap-highlight-color:transparent;transition:background .2s,transform .15s}',
    '#lbMore:active{transform:scale(.9);background:rgba(255,255,255,.18)}#lbMore.open{background:rgba(255,255,255,.18)}',
    '#lbMore svg{width:26px;height:26px;fill:currentColor}',
    '#vList .lb-icons{display:none!important;position:absolute;top:calc(100% - 6px);right:10px;z-index:30;gap:6px!important;padding:8px;border-radius:22px;background:var(--panel);border:1px solid var(--line);box-shadow:0 14px 38px rgba(20,8,40,.35);max-width:calc(100vw - 20px);box-sizing:border-box}',
    '#vList .lb-icons.open{display:flex!important;animation:lbPop .18s cubic-bezier(.2,.9,.3,1) both;transform-origin:top right}',
    '@keyframes lbPop{from{opacity:0;transform:scale(.9) translateY(-6px)}}',
    '#vList .lb-icons .ic{flex:0 0 auto!important;width:48px!important;height:46px!important;max-width:none!important;border-radius:16px!important;font-size:22px!important;background:var(--bg)!important;color:var(--ink)!important;border:1px solid var(--line)!important;box-shadow:none!important}',
    '#vList .lb-icons .ic#soundb,#vList .lb-icons .ic#themeb,#vList .lb-icons .ic.add-toggle{font-size:23px!important}',
    /* AI button */
    '.ai-fab{width:58px!important;height:58px!important;padding:0!important;justify-content:center!important;border-radius:50%!important;background:linear-gradient(135deg,#6a5cff,#b04fe0 55%,#ff5fa8)!important}',
    '.ai-fab svg{width:32px;height:32px;fill:#fff;filter:drop-shadow(0 1px 3px rgba(0,0,0,.3))}',
    /* calls tab */
    '#vCalls .clg-list{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 0 calc(110px + env(safe-area-inset-bottom,0px))}',
    '.clg-h{padding:14px 18px 6px;font-size:13px;font-weight:700;color:var(--dim);letter-spacing:.04em;text-transform:uppercase}',
    '.clg-row{display:flex;align-items:center;gap:14px;padding:10px 16px}',
    '.clg-row .av{width:50px;height:50px;flex:none;font-size:20px;background-size:cover;background-position:center}',
    '.clg-t{flex:1;min-width:0}.clg-t b{display:block;font-size:16.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.clg-row.miss .clg-t b{color:#ea4a4a}',
    '.clg-t small{display:flex;align-items:center;gap:5px;margin-top:3px;font-size:13.5px;color:var(--dim)}',
    '.clg-t small svg{width:15px;height:15px;flex:none}',
    '.clg-t small svg.in{fill:#25d366}.clg-t small svg.out{fill:#25d366}.clg-t small svg.miss{fill:#ea4a4a}',
    '.clg-go{all:unset;cursor:pointer;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:var(--acc);-webkit-tap-highlight-color:transparent}',
    '.clg-go:active{transform:scale(.88);background:color-mix(in srgb,var(--acc) 16%,transparent)}.clg-go svg{width:24px;height:24px;fill:currentColor}',
    '.clg-empty{padding:70px 30px;text-align:center;color:var(--dim)}.clg-empty .big{font-size:46px;margin-bottom:10px}.clg-empty b{display:block;color:var(--ink);font-size:18px;margin-bottom:6px}',
    /* settings tab needs room for the bottom bar */
    '#vSet #setBody{padding-bottom:calc(110px + env(safe-area-inset-bottom,0px))!important}',
    /* video call: clean face */
    '.cscr .cs-top,.cscr .cs-mid,.cscr .cs-ctl,.cscr .cs-shade{transition:opacity .28s ease}',
    '.cscr.vid.conn.ui-hide .cs-top,.cscr.vid.conn.ui-hide .cs-mid,.cscr.vid.conn.ui-hide .cs-ctl,.cscr.vid.conn.ui-hide .cs-shade{opacity:0!important;pointer-events:none!important}',
    '.cscr.vid.conn.ui-hide #clL{top:calc(env(safe-area-inset-top,0px) + 14px)}',
    '#clL{transition:top .28s ease}'
  ].join('\n');
  document.head.appendChild(css);

  /* ================================================================ 1) header */
  var list = $('vList'), lbTop = list && list.querySelector('.lb-top'), icons = list && list.querySelector('.lb-icons');
  if (lbTop && icons) {
    var more = el('button', '', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.1"/><circle cx="12" cy="12" r="2.1"/><circle cx="12" cy="19" r="2.1"/></svg>');
    more.id = 'lbMore'; more.type = 'button'; more.setAttribute('aria-label', 'Menu'); more.setAttribute('aria-haspopup', 'true');
    lbTop.appendChild(more);
    var closeMenu = function () { icons.classList.remove('open'); more.classList.remove('open'); };
    more.addEventListener('click', function (e) { e.stopPropagation(); var o = !icons.classList.contains('open'); icons.classList.toggle('open', o); more.classList.toggle('open', o); });
    icons.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button')) setTimeout(closeMenu, 30); });
    document.addEventListener('click', function (e) { if (icons.classList.contains('open') && !icons.contains(e.target)) closeMenu(); }, true);
    new MutationObserver(function () { if (!list.classList.contains('on')) closeMenu(); }).observe(list, { attributes: true, attributeFilter: ['class'] });
  }

  /* ================================================================ 2) AI logo */
  var fab = $('aiFab');
  if (fab) fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5C7.1 9.5 9.5 7.1 10 2.5z"/><path d="M18.5 13.5c.25 2.2 1.3 3.25 3.5 3.5-2.2.25-3.25 1.3-3.5 3.5-.25-2.2-1.3-3.25-3.5-3.5 2.2-.25 3.25-1.3 3.5-3.5z"/></svg>';

  /* ================================================================ 3) call log */
  var P_IN = '<svg class="in" viewBox="0 0 24 24"><path d="M20 5.41 18.59 4 7 15.59V9H5v10h10v-2H8.41L20 5.41z"/></svg>';
  var P_OUT = '<svg class="out" viewBox="0 0 24 24"><path d="M5 17.59 6.41 19 18 7.41V14h2V4H10v2h6.59L5 17.59z"/></svg>';
  var P_MISS = '<svg class="miss" viewBox="0 0 24 24"><path d="M20 5.41 18.59 4 7 15.59V9H5v10h10v-2H8.41L20 5.41z"/></svg>';
  var PHONE = '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';
  var VIDEO = '<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>';
  var key = function () { return 'onlyus-calllog-' + (U().uid ? (U().uid() || '') : ''); };
  var load = function () { try { var a = JSON.parse(localStorage.getItem(key()) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  function when(t) {
    var d = new Date(t), n = new Date(), tm = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    var day0 = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var diff = Math.round((day0(n) - day0(d)) / 864e5);
    if (diff === 0) return 'Today, ' + tm;
    if (diff === 1) return 'Yesterday, ' + tm;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + tm;
  }
  function dur(s) { var m = Math.floor(s / 60), r = s % 60; return m ? m + ' min ' + r + ' sec' : r + ' sec'; }
  function findContact(uid) { var c = (U().contacts && U().contacts()) || []; for (var i = 0; i < c.length; i++) if (c[i].uid === uid) return c[i]; return null; }
  function callBack(e, video) {
    var api = window.__callApi; if (!api) return U().toast && U().toast('Calls are not ready yet');
    if (api.busy()) return U().toast && U().toast('You are already in a call');
    var c = findContact(e.uid), k = e.k || (c && U().cidOf ? U().cidOf(c) : '');
    if (!k) return U().toast && U().toast('Open the chat once, then try again');
    api.start(video, k, (c && c.name) || e.name, e.uid);
  }
  function renderCalls() {
    var box = $('clgList'); if (!box) return;
    var a = load(); box.innerHTML = '';
    if (!a.length) { box.innerHTML = '<div class="clg-empty"><div class="big">📞</div><b>No calls yet</b>Your voice and video calls will show up here.</div>'; return; }
    box.appendChild(el('div', 'clg-h', 'Recent'));
    a.forEach(function (e) {
      var miss = e.st === 'missed', out = e.dir === 'out';
      var row = el('div', 'clg-row' + (miss ? ' miss' : ''));
      var av = el('div', 'av'); row.appendChild(av);
      var c = findContact(e.uid), nm = (c && c.name) || e.name || 'Unknown';
      try { if (window.__pf) window.__pf.paint(av, e.uid, nm); else av.textContent = nm[0].toUpperCase(); } catch (x) { av.textContent = nm[0].toUpperCase(); }
      var sub = (miss ? P_MISS : out ? P_OUT : P_IN) + '<span>' + esc(when(e.t)) + (e.dur ? ' · ' + dur(e.dur) : e.st === 'noans' ? ' · No answer' : e.st === 'declined' ? ' · Declined' : '') + '</span>';
      row.appendChild(el('div', 'clg-t', '<b>' + esc(nm) + '</b><small>' + sub + '</small>'));
      var go = el('button', 'clg-go', e.video ? VIDEO : PHONE); go.type = 'button'; go.setAttribute('aria-label', (e.video ? 'Video call ' : 'Call ') + nm);
      go.onclick = function () { callBack(e, !!e.video); };
      row.appendChild(go); box.appendChild(row);
    });
  }
  var cv = $('vCalls');
  if (cv) new MutationObserver(function () { if (cv.classList.contains('on')) renderCalls(); }).observe(cv, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('onlyus-calllog', function () { if (cv && cv.classList.contains('on')) renderCalls(); });
  var clr = $('clgClear');
  if (clr) clr.onclick = function () { if (!load().length) return; if (!confirm('Clear your call log on this phone?')) return; try { localStorage.removeItem(key()); } catch (e) { } renderCalls(); };

  /* ================================================================ 5) video call: hide the buttons */
  var V = $('clView'), hideT = null;
  function active() { return V && V.classList.contains('on') && V.classList.contains('vid') && V.classList.contains('conn'); }
  function arm(ms) { clearTimeout(hideT); if (active()) hideT = setTimeout(function () { if (active()) V.classList.add('ui-hide'); }, ms || 3500); }
  function syncCall() {
    if (!V) return;
    if (active()) { if (!V.__armed) { V.__armed = true; V.classList.remove('ui-hide'); arm(3500); } }
    else { V.__armed = false; clearTimeout(hideT); V.classList.remove('ui-hide'); }
  }
  if (V) {
    new MutationObserver(syncCall).observe(V, { attributes: true, attributeFilter: ['class'] });
    V.addEventListener('click', function (e) {
      if (!active()) return;
      var onBtn = e.target.closest && e.target.closest('button');
      if (V.classList.contains('ui-hide')) { V.classList.remove('ui-hide'); arm(4000); }
      else if (onBtn) arm(4000);
      else { clearTimeout(hideT); V.classList.add('ui-hide'); }
    });
    syncCall();
  }
})();
