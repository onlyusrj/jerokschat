/* OnlyUs activity-v83.js - one "Activity" page: Moments (status) + Calls + Our Space shortcuts, in glass bento cards.
   Status and call data come from status-v53.js (window.__status) and home-v62.js (window.__calllog). Nothing is duplicated. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var v = $('vAct'); if (!v) return;
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ls = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var S = function () { return window.__status || {}; }, C = function () { return window.__calllog || {}; };
  var built = 0, sec = {};
  var SP = [['notes', '💌', 'Love notes', 'Little letters for you', '#ff8fb8,#ff5d8f'], ['mood', '🫶', 'Mood', 'How are we feeling', '#ffcf70,#ff9b54'], ['dates', '⏳', 'Dates', '', '#8fb4ff,#6a7bff'], ['surprises', '🎁', 'Surprise', 'A little something', '#b89bff,#8a5cff'], ['places', '🗺️', 'Places', 'Our map', '#6fe0c4,#2fb59a'], ['music', '🎵', 'Music', 'Songs we love', '#ff9ecb,#d96bff'], ['questions', '💭', 'Questions', 'Know each other more', '#7fd0ff,#4a9bff'], ['lists', '✅', 'Lists', 'Plans and bucket lists', '#ffc27a,#ff8a5c']];

  var css = el('style'); css.id = 'v83css'; css.textContent = [
    '#vAct{background:radial-gradient(circle at 8% 4%,color-mix(in srgb,var(--acc) 26%,transparent),transparent 42%),radial-gradient(circle at 96% 24%,color-mix(in srgb,#8fb4ff 34%,transparent),transparent 46%),radial-gradient(circle at 30% 96%,color-mix(in srgb,#ff9ecb 30%,transparent),transparent 48%),var(--bg)}',
    '#vAct .bar{margin:8px 12px 0;border-radius:24px;background:var(--scard,var(--panel));border:1px solid var(--sbd,var(--line));box-shadow:var(--ssh);-webkit-backdrop-filter:var(--sblur);backdrop-filter:var(--sblur)}',
    '#vAct .act-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px calc(120px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:20px}',
    '.ag{position:relative;border-radius:28px;border:1px solid var(--sbd,var(--line));background:var(--scard,var(--panel));box-shadow:var(--ssh),var(--shl);-webkit-backdrop-filter:var(--sblur);backdrop-filter:var(--sblur)}',
    '.ahero{padding:20px 18px;overflow:hidden;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 34%,transparent),color-mix(in srgb,#8fb4ff 26%,transparent)),var(--scard,var(--panel))}',
    '.ahero h2{margin:0;font-size:28px;letter-spacing:-.02em}.ahero p{margin:4px 0 14px;color:var(--dim);font-size:14px;max-width:62%}.ahero img{position:absolute;right:6px;top:50%;translate:0 -50%;width:42%;max-width:170px;opacity:.95;filter:drop-shadow(0 10px 16px rgba(0,0,0,.18))}',
    '.achips{display:flex;flex-wrap:wrap;gap:8px;position:relative;z-index:1}.achip{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;font:600 12.5px system-ui;color:var(--ink);background:color-mix(in srgb,var(--panel) 60%,transparent);border:1px solid var(--sbd,var(--line))}.achip b{color:var(--acc)}',
    '.ah{display:flex;align-items:center;gap:10px;margin:0 4px 10px}.ah h3{margin:0;font-size:19px}.ah small{color:var(--dim);flex:1}.ah button{all:unset;cursor:pointer;padding:7px 12px;border-radius:999px;font:600 12.5px system-ui;color:#fff;background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc) 55%,#ff9ecb))}',
    '.astr{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 4px 12px;margin:0 -4px;scrollbar-width:none}.astr::-webkit-scrollbar{display:none}',
    '.asc{all:unset;cursor:pointer;position:relative;flex:none;width:118px;height:176px;border-radius:26px;overflow:hidden;scroll-snap-align:start;color:#fff;background:linear-gradient(160deg,color-mix(in srgb,var(--acc) 70%,#fff),#8a6bff);box-shadow:var(--ssh);-webkit-tap-highlight-color:transparent;transition:transform .18s}.asc:active{transform:scale(.96)}',
    '.asc.un{outline:3px solid var(--acc);outline-offset:2px}.asc .m{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background-size:cover;background-position:center}',
    '.asc::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.62),transparent 55%)}.asc .t{position:absolute;z-index:2;left:10px;right:10px;bottom:10px}.asc .t b{display:block;font-size:14px;text-shadow:0 1px 6px rgba(0,0,0,.5)}.asc .t small{opacity:.85;font-size:11.5px}',
    '.asc .tx{position:absolute;z-index:1;inset:14px 12px 46px;display:grid;place-items:center;text-align:center;font:700 15px/1.25 system-ui;overflow:hidden}.asc .n{position:absolute;z-index:2;top:8px;right:8px;min-width:22px;height:22px;border-radius:11px;background:rgba(0,0,0,.45);font:700 12px/22px system-ui;text-align:center;padding:0 6px}',
    '.asc.add{background:var(--scard,var(--panel));color:var(--ink);border:2px dashed color-mix(in srgb,var(--acc) 55%,transparent);display:grid;place-items:center;text-align:center}.asc.add::after{display:none}.asc.add i{font-style:normal;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;margin:0 auto 8px;font-size:24px;color:#fff;background:linear-gradient(135deg,var(--acc),#ff9ecb)}.asc.add b{font-size:13px}',
    '.acallq{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px}.acallq button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:20px;font:700 14px system-ui;color:#fff;background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc) 55%,#ff9ecb));box-shadow:0 8px 20px color-mix(in srgb,var(--acc) 38%,transparent)}.acallq button+button{background:linear-gradient(135deg,#6a9bff,#8a6bff);box-shadow:0 8px 20px rgba(106,123,255,.38)}',
    '.astat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 14px 6px}.astat div{text-align:center;padding:10px 4px;border-radius:18px;background:color-mix(in srgb,var(--acc) 9%,transparent)}.astat b{display:block;font-size:20px}.astat small{color:var(--dim);font-size:11.5px}',
    '#vAct .clg-list{padding:4px 8px 10px;max-height:none;overflow:visible}#vAct .clg-h{padding:10px 10px 6px}#vAct .clg-row{margin:6px 0;padding:9px 10px;border-radius:20px;background:color-mix(in srgb,var(--panel) 55%,transparent);border:1px solid var(--sbd,var(--line))}#vAct .clg-empty{padding:26px 20px}',
    '.asp{display:grid;grid-template-columns:1fr 1fr;gap:12px}.apt{all:unset;cursor:pointer;position:relative;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-height:118px;padding:14px;border-radius:26px;border:1px solid var(--sbd,var(--line));background:var(--scard,var(--panel));box-shadow:var(--ssh),var(--shl);-webkit-backdrop-filter:var(--sblur);backdrop-filter:var(--sblur);overflow:hidden;-webkit-tap-highlight-color:transparent;transition:transform .18s}.apt:active{transform:scale(.97)}',
    '.apt .ic{position:absolute;left:12px;top:12px;width:44px;height:44px;border-radius:16px;display:grid;place-items:center;font-size:22px;background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 8px 16px color-mix(in srgb,var(--c2) 40%,transparent)}.apt b{font-size:15px;color:var(--ink)}.apt small{color:var(--dim);font-size:12px}',
    '.apt.big{grid-column:1/-1;min-height:168px;color:#fff;background-size:cover;background-position:center}.apt.big::before{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(20,10,40,.66),transparent 62%)}.apt.big b,.apt.big small{position:relative;color:#fff}.apt.big small{opacity:.9}.apt.big b{font-size:19px}',
    '@media(prefers-reduced-motion:no-preference){#vAct.on .ag,#vAct.on .apt,#vAct.on .asc{animation:v83in .5s cubic-bezier(.2,.8,.3,1) backwards}}@keyframes v83in{from{opacity:0;translate:0 16px}}'
  ].join('\n'); document.head.appendChild(css);

  function days() { var s = ls('onlyus-since'); if (!s) return -1; var d = new Date(s + 'T00:00:00'); return isNaN(d) ? -1 : Math.floor((Date.now() - d.getTime()) / 864e5); }
  function openSpace(tab) { var b = $('tn_space'); if (b) b.click(); setTimeout(function () { var t = document.querySelector('#hubTabs [data-tab="' + tab + '"]'); if (t) t.click(); }, 480); }
  function partner() { var c = (S().contacts && S().contacts()) || []; for (var i = 0; i < c.length; i++) if (c[i].uid) return c[i]; return null; }

  function build() {
    if (built) return; built = 1;
    v.innerHTML = '<div class="bar"><b>Activity</b><span class="sp"></span><button class="ic" id="actRef" type="button" aria-label="Refresh">↻</button></div><div class="act-scroll" id="actScroll"></div>';
    var sc = $('actScroll');
    sec.hero = el('div', 'ag ahero'); sc.appendChild(sec.hero);
    var st = el('div'); st.id = 'actStatus'; st.innerHTML = '<div class="ah"><h3>Moments</h3><small>Disappear after 24 hours</small><button type="button" id="actPost">＋ Post</button></div><div class="astr" id="actStrip"></div>'; sc.appendChild(st);
    var cl = el('div'); cl.id = 'actCalls'; cl.innerHTML = '<div class="ah"><h3>Calls</h3><small>Voice and video</small></div><div class="ag"><div class="acallq" id="actQuick"></div><div class="astat" id="actStat"></div><div id="actCl"></div></div>'; sc.appendChild(cl);
    var cll = $('clgList'); if (cll) $('actCl').appendChild(cll);
    var sp = el('div'); sp.id = 'actSpace'; sp.innerHTML = '<div class="ah"><h3>Our Space</h3><small>Everything for the two of you</small></div><div class="asp" id="actGrid"></div>'; sc.appendChild(sp);
    var g = $('actGrid'), mem = ls('onlyus-h77-p2'), d = days();
    var big = el('button', 'apt big', '<span class="ic" style="--c1:#ffa1c9;--c2:#8a6bff">📸</span><b>Memories</b><small>' + (mem ? 'Our photos and moments' : 'Add your first memory together') + '</small>'); big.type = 'button';
    if (mem) big.style.backgroundImage = 'url(' + JSON.stringify(mem) + ')'; else big.style.backgroundImage = 'linear-gradient(135deg,#ffa1c9,#8a6bff)';
    big.onclick = function () { openSpace('memories'); }; g.appendChild(big);
    SP.forEach(function (x) { var b = el('button', 'apt', '<span class="ic" style="--c1:' + x[4].split(',')[0] + ';--c2:' + x[4].split(',')[1] + '">' + x[1] + '</span><b>' + x[2] + '</b><small>' + esc(x[0] === 'dates' && d >= 0 ? 'Day ' + d + ' together' : x[0] === 'dates' ? 'Anniversaries and countdowns' : x[3]) + '</small>'); b.type = 'button'; b.onclick = function () { openSpace(x[0]); }; g.appendChild(b); });
    $('actPost').onclick = function () { if (S().sheet) S().sheet(); };
    $('actRef').onclick = function () { try { S().watch(); } catch (e) { } render(); };
  }

  function groups() {
    var s = S(), out = []; if (!s.mine) return out;
    var me = s.mine(); out.push({ mine: 1, uid: s.uid(), name: 'My moment', list: me, n: me.length, un: 0 });
    s.contacts().filter(function (c) { return c.uid; }).forEach(function (c) { var l = s.theirs(c.uid); if (l.length) out.push({ uid: c.uid, name: c.name, list: l, n: l.length, un: l.filter(function (d) { return !s.seen(d); }).length }); });
    return out;
  }
  function media(card, d) {
    if (!d) return;
    if (d.type === 'img') { var m = el('div', 'm'); m.style.backgroundImage = 'url(' + JSON.stringify(d.url) + ')'; card.appendChild(m); }
    else if (d.type === 'vid') { var vd = el('video', 'm'); vd.muted = true; vd.playsInline = true; vd.preload = 'metadata'; vd.src = d.url + '#t=0.2'; card.appendChild(vd); }
    else card.appendChild(el('div', 'tx', esc((d.text || '').slice(0, 70))));
  }
  function render() {
    if (!built) return; var s = S();
    var gs = groups(), strip = $('actStrip'); strip.textContent = '';
    var add = el('button', 'asc add', '<div><i>＋</i><b>Add moment</b></div>'); add.type = 'button'; add.onclick = function () { if (s.sheet) s.sheet(); }; strip.appendChild(add);
    var tx = el('button', 'asc add', '<div><i>✏️</i><b>Write one</b></div>'); tx.type = 'button'; tx.onclick = function () { if (s.text) s.text(); }; strip.appendChild(tx);
    gs.forEach(function (g) {
      if (!g.n) return; var last = g.list[g.n - 1], c = el('button', 'asc' + (g.un ? ' un' : '')); c.type = 'button';
      media(c, last); c.insertAdjacentHTML('beforeend', (g.n > 1 ? '<span class="n">' + g.n + '</span>' : '') + '<div class="t"><b>' + esc(g.name) + '</b><small>' + esc(s.ago(last.ts)) + '</small></div>');
      c.onclick = function () { s.open({ uid: g.uid, name: g.name, list: g.list, mine: !!g.mine }); }; strip.appendChild(c);
    });
    var un = 0; gs.forEach(function (g) { un += g.un; });
    var calls = (C().load && C().load()) || [], miss = calls.filter(function (e) { return e.st === 'missed'; }).length, tot = calls.reduce(function (a, e) { return a + (e.dur || 0); }, 0), dd = days();
    sec.hero.innerHTML = '<img alt="" src="sticker-cat-love.svg"><h2>Activity</h2><p>Moments, calls and little things from your space.</p><div class="achips"><span class="achip">✨ <b>' + un + '</b> new</span><span class="achip">📞 <b>' + miss + '</b> missed</span>' + (dd >= 0 ? '<span class="achip">💞 Day <b>' + dd + '</b></span>' : '') + '</div>';
    var p = partner(), q = $('actQuick'); q.textContent = '';
    if (p && C().back) [['📞 Voice call', 0], ['🎥 Video call', 1]].forEach(function (x) { var b = el('button', '', x[0]); b.type = 'button'; b.onclick = function () { C().back({ uid: p.uid, name: p.name }, !!x[1]); }; q.appendChild(b); });
    else q.style.display = 'none';
    $('actStat').innerHTML = '<div><b>' + calls.length + '</b><small>Calls</small></div><div><b>' + miss + '</b><small>Missed</small></div><div><b>' + Math.round(tot / 60) + '</b><small>Minutes</small></div>';
    if (C().render) C().render();
  }
  function show() { build(); try { S().watch(); } catch (e) { } render(); }
  new MutationObserver(function () { if (v.classList.contains('on')) show(); }).observe(v, { attributes: true, attributeFilter: ['class'] });
  setInterval(function () { if (v.classList.contains('on') && !document.hidden) render(); }, 20000);
  window.addEventListener('onlyus-calllog', function () { if (v.classList.contains('on')) render(); });
  window.__act = { to: function (w) { build(); var t = $(w === 'calls' ? 'actCalls' : 'actStatus'); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  build();
})();
