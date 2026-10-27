/* OnlyUs couple-v64.js
   1) Home header: no logo, just "OnlyUs" in the top-left corner
   2) Games: cover pictures instead of emojis (covers are embedded in this file, no extra folder needed)
   3) Couple extras (couples mode only): floating hearts, "Together for N days" card, daily question card,
      heart burst on tap, soft pop-in for new chat bubbles
   4) Bottom tab labels fit six tabs on a phone                                                       */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; };

  var css = el('style');
  css.textContent = [
    /* header */
    'html #vList .lb-top .brandmark{display:none!important}',
    'html #vList .lb-top{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;width:100%!important;padding-left:2px}',
    'html #vList .lb-top .lb-title{position:static!important;left:auto!important;transform:none!important;pointer-events:auto;order:-1!important;flex:1 1 auto;text-align:left!important;margin:0!important;font-size:29px!important;font-weight:800!important;letter-spacing:-.6px;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 2px 14px rgba(40,10,90,.45)}',
    'html #vList .lb-top #lbMore{margin-left:auto!important;flex:none}',
    '.search-wrap kbd{display:none!important}',
    'html #usb{display:none!important}',
    /* 3-dots menu: opens as a row inside the header (no floating popup behind the page) */
    'html #vList .listbar{flex-direction:column!important;align-items:stretch!important;flex-wrap:nowrap!important;gap:0!important}',
    'html #vList .lb-top{flex:none!important}',
    'html #vList .lb-icons.open{position:static!important;flex:none!important;order:5;width:100%!important;max-width:none!important;justify-content:space-between!important;gap:8px!important;padding:6px 0 4px!important;margin:4px 0 0!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;animation:o64drop .22s cubic-bezier(.2,.9,.3,1) both!important}',
    '@keyframes o64drop{from{opacity:0;transform:translateY(-8px)}}',
    'html #vList .lb-icons.open .ic{flex:1 1 0!important;width:auto!important;max-width:none!important;height:46px!important;background:rgba(255,255,255,.2)!important;color:#fff!important;border:1px solid rgba(255,255,255,.28)!important}',
    'html #vList .lb-icons.open .ic.add-toggle{background:#fff!important;color:#65409a!important}',
    'html #vList .lb-icons .o64hide{font-size:14px!important;font-weight:700}',
    /* home screen scrolls as one page */
    'html #vList.on{overflow-y:auto!important;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain}',
    'html #vList>*{flex-shrink:0!important}',
    'html #vList #cl{flex:none!important;overflow:visible!important;height:auto!important;max-height:none!important}',
    'html #vList .listbar{position:sticky!important;top:0;z-index:6}',
    'html #vList .ai-fab,html #vList .qr-fab{position:fixed!important}',
    'html #vList{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}',
    /* scroll scenes */
    '.o64h3{margin:18px 18px 4px;font-size:19px;font-weight:800;color:var(--ink)}.o64h3 small{display:block;margin-top:2px;font-size:12.5px;font-weight:500;color:var(--dim);text-transform:none;letter-spacing:0}',
    '.o64row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:8px 18px 16px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.o64row::-webkit-scrollbar{display:none}',
    '.o64sc{flex:0 0 80%;max-width:340px;scroll-snap-align:center;border-radius:24px;overflow:hidden;background:var(--panel);border:1px solid var(--line);box-shadow:0 10px 26px rgba(80,40,150,.16);transition:transform .35s ease}.o64sc:active{transform:scale(.97)}',
    '.o64sc svg{display:block;width:100%;height:auto}.o64sc div{padding:10px 14px 14px}.o64sc b{display:block;font-size:15px;color:var(--ink)}.o64sc span{display:block;margin-top:2px;font-size:12.5px;color:var(--dim);line-height:1.35}',
    '.o64rv{opacity:0;transform:translateY(30px) scale(.97);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}.o64rv.in{opacity:1;transform:none}',
    '.o64idea{display:flex;gap:14px;align-items:center}.o64idea svg{flex:none;width:64px;height:64px}.o64idea .o64q{margin:0;font-size:16px}',
    '.o64tw{animation:o64tw 2.4s ease-in-out infinite}@keyframes o64tw{50%{opacity:.2}}',
    '.o64rise{animation:o64rs 7s ease-in infinite}@keyframes o64rs{from{transform:translateY(40px);opacity:0}15%{opacity:1}to{transform:translateY(-230px);opacity:.9}}',
    '.o64sway{transform-box:fill-box;transform-origin:50% 100%;animation:o64sw 3s ease-in-out infinite alternate}@keyframes o64sw{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}',
    '.o64steam{stroke-dasharray:14 10;animation:o64st 2.4s linear infinite}@keyframes o64st{to{stroke-dashoffset:-48}}',
    '.o64wave{animation:o64wv 4s ease-in-out infinite alternate}@keyframes o64wv{to{transform:translateX(-46px)}}',
    '.o64sun{animation:o64sn 7s ease-in-out infinite alternate}@keyframes o64sn{to{transform:translateY(26px)}}',
    '.o64ping{transform-box:fill-box;transform-origin:center;animation:o64pg 2.8s ease-out infinite}@keyframes o64pg{from{transform:scale(.1);opacity:1}to{transform:scale(1.7);opacity:0}}',
    '.o64pulse{transform-box:fill-box;transform-origin:center;animation:o64pl 1.5s ease-in-out infinite}@keyframes o64pl{50%{transform:scale(1.25)}}',
    '#o64Pdf{position:fixed;inset:0;z-index:2147481000;display:none;flex-direction:column;background:#2b2b33}#o64Pdf.on{display:flex}',
    '#o64Pdf .ph{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:#1c1c22;color:#fff}#o64Pdf .ph b{flex:1;min-width:0;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#o64Pdf .ph a,#o64Pdf .ph button{all:unset;cursor:pointer;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.14);color:#fff;font-size:14px;font-weight:600}',
    '#o64Pdf .pb{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:10px 8px calc(24px + env(safe-area-inset-bottom,0px));text-align:center;color:#ddd;font:14px system-ui,sans-serif}',
    '#o64Pdf canvas{display:block;width:100%;height:auto;margin:0 auto 10px;background:#fff;border-radius:4px;box-shadow:0 2px 12px rgba(0,0,0,.4)}#o64Pdf iframe{width:100%;height:100%;border:0;background:#fff}',
    /* bottom tabs: six on a phone */
    '#tabNav button{font-size:10.5px!important;letter-spacing:-.1px}#tabNav button svg{width:23px!important;height:23px!important}',
    'html.hub-open #tabNav{z-index:90}html.hub-open #coupleHub{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}',
    '#tn_space.on svg{animation:o64beat 1.6s ease-in-out infinite}',
    '@keyframes o64beat{0%,100%{transform:scale(1.1)}14%{transform:scale(1.28)}28%{transform:scale(1.1)}42%{transform:scale(1.22)}}',
    /* games pictures */
    '#vGames .gv-card .gi,.gmCard .gi{display:block;width:100%;font-size:0!important;line-height:0}',
    '.gv-card .gi img,.gmCard .gi img{width:100%;aspect-ratio:16/11;object-fit:cover;border-radius:14px;display:block;box-shadow:0 6px 16px rgba(60,30,110,.22)}',
    '#vGames .gv-card,.gmCard{padding:8px 8px 12px!important;gap:8px!important;overflow:visible!important}',
    '#vGames .gv-grid{grid-auto-rows:max-content!important;grid-template-rows:none!important}.gmGrid{align-items:start}',
    '.gv-card:active .gi img,.gmCard:active .gi img{transform:scale(.97)}.gi img{transition:transform .2s ease}',
    /* floating hearts */
    '#o64Hearts{display:none;position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}#vList.on #o64Hearts{display:block}',
    '#o64Hearts i{position:absolute;bottom:-40px;font-style:normal;color:var(--acc);opacity:0;animation:o64float linear infinite}',
    '@keyframes o64float{0%{transform:translateY(0) translateX(0) scale(.7);opacity:0}12%{opacity:.28}50%{transform:translateY(-55vh) translateX(18px) scale(1)}100%{transform:translateY(-112vh) translateX(-14px) scale(1.15);opacity:0}}',
    /* cards */
    '.o64card{position:relative;margin:10px 14px;padding:16px 18px;border-radius:22px;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 16%,var(--panel)),var(--panel));border:1px solid var(--line);box-shadow:0 8px 24px rgba(110,70,190,.12);overflow:hidden}',
    '@keyframes o64up{from{opacity:0;transform:translateY(14px)}}',
    '.o64card small{display:block;color:var(--dim);font-size:12px;letter-spacing:.4px;text-transform:uppercase;font-weight:700}',
    '.o64days{display:flex;align-items:baseline;gap:8px;margin-top:6px}.o64days b{font-size:42px;line-height:1;color:var(--acc);font-weight:800}.o64days span{font-size:15px;color:var(--ink);font-weight:600}',
    '.o64sub{margin-top:6px;font-size:13px;color:var(--dim)}',
    '.o64bar{margin-top:10px;height:7px;border-radius:9px;background:color-mix(in srgb,var(--acc) 14%,transparent);overflow:hidden}.o64bar i{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,var(--acc),#ff6fa8);transition:width 1.2s cubic-bezier(.2,.8,.2,1)}',
    '.o64h{position:absolute;right:16px;top:14px;width:34px;height:34px;fill:#ff5c8d;animation:o64beat 1.6s ease-in-out infinite}',
    '.o64q{margin:8px 0 12px;font-size:17px;line-height:1.4;font-weight:600;color:var(--ink)}',
    '.o64btns{display:flex;gap:8px;margin-right:78px}.o64btns button{all:unset;cursor:pointer;flex:1;text-align:center;padding:10px;border-radius:14px;font-size:14px;font-weight:700;background:var(--acc);color:#fff}.o64btns button.alt{background:color-mix(in srgb,var(--acc) 14%,transparent);color:var(--acc)}',
    /* burst + bubbles */
    '.o64b{position:fixed;z-index:2147480000;pointer-events:none;font-size:20px;color:#ff5c8d;animation:o64burst .9s ease-out forwards}',
    '@keyframes o64burst{from{transform:translate(-50%,-50%) scale(.4);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.3) rotate(var(--r));opacity:0}}',
    '#ms .m:nth-last-child(-n+2){animation:o64pop .32s cubic-bezier(.2,1.2,.4,1) both}',
    '@keyframes o64pop{from{opacity:0;transform:translateY(10px) scale(.94)}}',
    '.heart-orb{animation:o64beat 2s ease-in-out infinite;cursor:pointer}',
    '@media (prefers-reduced-motion:reduce){#o64Hearts{display:none!important}.o64h,.heart-orb,#tn_space.on svg,html #vList .lb-title{animation:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- 2) games pictures instead of emojis ---------- */
  var KEY = { 'Tic-Tac-Toe': 'ttt', 'Connect 4': 'c4', 'Rock Paper Scissors': 'rps', 'Memory Match': 'memory', 'Quick Duel': 'duel', 'Draw & Guess': 'draw', 'Would You Rather': 'wyr', 'Truth or Dare': 'tod', 'Ludo': 'ludo', 'Dots & Boxes': 'dots', 'Battleship': 'bship', 'Trivia Duel': 'trivia', 'Color Cards': 'cards' };
  var PIC = {"bship": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%232c3e8f%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%230f1b4d%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Cpath%20d=%22M0%20190q50-24%20100%200t100%200%20100%200%20100%200V300H0z%22%20fill=%22%233b82f6%22%20opacity=%22.55%22/%3E%3Cpath%20d=%22M60%20180h280l-40%2052H110z%22%20fill=%22%23e8ecff%22/%3E%3Crect%20x=%22170%22%20y=%22130%22%20width=%2290%22%20height=%2250%22%20rx=%226%22%20fill=%22%23c7d2ff%22/%3E%3Crect%20x=%22205%22%20y=%2295%22%20width=%2222%22%20height=%2235%22%20fill=%22%23a5b4fc%22/%3E%3Cpath%20d=%22M0%20235q50-24%20100%200t100%200%20100%200%20100%200V300H0z%22%20fill=%22%231d4ed8%22%20opacity=%22.8%22/%3E%3Ccircle%20cx=%22320%22%20cy=%2270%22%20r=%2226%22%20fill=%22%23ffd23f%22%20opacity=%22.9%22/%3E%3C/svg%3E", "c4": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%234facfe%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%231d3fbf%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%2248%22%20y=%2238%22%20width=%22305%22%20height=%22228%22%20rx=%2222%22%20fill=%22%232f5fe0%22/%3E%3Ccircle%20cx=%2270%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22113%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22156%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22199%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22242%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22285%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22328%22%20cy=%2262%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%2270%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22113%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22156%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22199%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22242%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22285%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22328%22%20cy=%22105%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%2270%22%20cy=%22148%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22113%22%20cy=%22148%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22156%22%20cy=%22148%22%20r=%2217%22%20fill=%22%23ff4d6d%22/%3E%3Ccircle%20cx=%22199%22%20cy=%22148%22%20r=%2217%22%20fill=%22%23ffd23f%22/%3E%3Ccircle%20cx=%22242%22%20cy=%22148%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22285%22%20cy=%22148%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22328%22%20cy=%22148%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%2270%22%20cy=%22191%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22113%22%20cy=%22191%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22156%22%20cy=%22191%22%20r=%2217%22%20fill=%22%23ffd23f%22/%3E%3Ccircle%20cx=%22199%22%20cy=%22191%22%20r=%2217%22%20fill=%22%23ff4d6d%22/%3E%3Ccircle%20cx=%22242%22%20cy=%22191%22%20r=%2217%22%20fill=%22%23ffd23f%22/%3E%3Ccircle%20cx=%22285%22%20cy=%22191%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22328%22%20cy=%22191%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%2270%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22113%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22156%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22199%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22242%22%20cy=%22234%22%20r=%2217%22%20fill=%22%23ff4d6d%22/%3E%3Ccircle%20cx=%22285%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3Ccircle%20cx=%22328%22%20cy=%22234%22%20r=%2217%22%20fill=%22%231b2a6b%22/%3E%3C/svg%3E", "cards": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23667eea%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23764ba2%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Cg%20transform=%22rotate(-30%20200%20250)%22%3E%3Crect%20x=%22150%22%20y=%2270%22%20width=%22100%22%20height=%22150%22%20rx=%2214%22%20fill=%22%23ff4d6d%22%20stroke=%22%23fff%22%20stroke-width=%225%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22145%22%20r=%2222%22%20fill=%22%23fff%22%20opacity=%22.9%22/%3E%3C/g%3E%3Cg%20transform=%22rotate(-10%20200%20250)%22%3E%3Crect%20x=%22150%22%20y=%2270%22%20width=%22100%22%20height=%22150%22%20rx=%2214%22%20fill=%22%23ffd23f%22%20stroke=%22%23fff%22%20stroke-width=%225%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22145%22%20r=%2222%22%20fill=%22%23fff%22%20opacity=%22.9%22/%3E%3C/g%3E%3Cg%20transform=%22rotate(10%20200%20250)%22%3E%3Crect%20x=%22150%22%20y=%2270%22%20width=%22100%22%20height=%22150%22%20rx=%2214%22%20fill=%22%2343e97b%22%20stroke=%22%23fff%22%20stroke-width=%225%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22145%22%20r=%2222%22%20fill=%22%23fff%22%20opacity=%22.9%22/%3E%3C/g%3E%3Cg%20transform=%22rotate(30%20200%20250)%22%3E%3Crect%20x=%22150%22%20y=%2270%22%20width=%22100%22%20height=%22150%22%20rx=%2214%22%20fill=%22%234facfe%22%20stroke=%22%23fff%22%20stroke-width=%225%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22145%22%20r=%2222%22%20fill=%22%23fff%22%20opacity=%22.9%22/%3E%3C/g%3E%3C/svg%3E", "dots": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%2300c6ff%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%237b5cff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%22145%22%20y=%22115%22%20width=%2255%22%20height=%2255%22%20fill=%22%23ffd23f%22%20opacity=%22.9%22/%3E%3Cpath%20d=%22M90%2060H255M90%20115H200M145%20115V170M200%20115V170M145%20170H200M255%2060V115%22%20stroke=%22%23fff%22%20stroke-width=%227%22%20stroke-linecap=%22round%22/%3E%3Ccircle%20cx=%2290%22%20cy=%2260%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22145%22%20cy=%2260%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22200%22%20cy=%2260%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22255%22%20cy=%2260%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22310%22%20cy=%2260%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%2290%22%20cy=%22115%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22145%22%20cy=%22115%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22115%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22255%22%20cy=%22115%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22310%22%20cy=%22115%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%2290%22%20cy=%22170%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22145%22%20cy=%22170%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22170%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22255%22%20cy=%22170%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22310%22%20cy=%22170%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%2290%22%20cy=%22225%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22145%22%20cy=%22225%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22225%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22255%22%20cy=%22225%22%20r=%229%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22310%22%20cy=%22225%22%20r=%229%22%20fill=%22%23fff%22/%3E%3C/svg%3E", "draw": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23a18cd1%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23fbc2eb%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%2270%22%20y=%2250%22%20width=%22260%22%20height=%22200%22%20rx=%2218%22%20fill=%22%23fff%22/%3E%3Cpath%20d=%22M100%20190c30-90%2060%2010%2090-50s50%2040%2090-20%22%20stroke=%22%23ff5e9c%22%20stroke-width=%2210%22%20fill=%22none%22%20stroke-linecap=%22round%22/%3E%3Cpath%20d=%22M285%20230l55-120%2022%2010-55%20120-30%206z%22%20fill=%22%23ffd23f%22%20stroke=%22%23e8436a%22%20stroke-width=%224%22/%3E%3C/svg%3E", "duel": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23ffb347%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23ff416c%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Cpath%20d=%22M225%2035L130%20165h62l-22%20100%20105-140h-64z%22%20fill=%22%23fff%22/%3E%3Cpath%20d=%22M225%2035L130%20165h62l-22%20100%22%20fill=%22none%22/%3E%3Ccircle%20cx=%2290%22%20cy=%2270%22%20r=%226%22%20fill=%22%23fff%22%20opacity=%22.7%22/%3E%3Ccircle%20cx=%22320%22%20cy=%22230%22%20r=%228%22%20fill=%22%23fff%22%20opacity=%22.7%22/%3E%3C/svg%3E", "ludo": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%2356ccf2%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%232f80ed%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%2260%22%20y=%2260%22%20width=%2290%22%20height=%2290%22%20rx=%2214%22%20fill=%22%23ff4d6d%22/%3E%3Crect%20x=%22250%22%20y=%2260%22%20width=%2290%22%20height=%2290%22%20rx=%2214%22%20fill=%22%2343e97b%22/%3E%3Crect%20x=%2260%22%20y=%22150%22%20width=%2290%22%20height=%2290%22%20rx=%2214%22%20fill=%22%23ffd23f%22/%3E%3Crect%20x=%22250%22%20y=%22150%22%20width=%2290%22%20height=%2290%22%20rx=%2214%22%20fill=%22%237a5cff%22/%3E%3Crect%20x=%22140%22%20y=%2285%22%20width=%22120%22%20height=%22130%22%20rx=%2220%22%20fill=%22%23fff%22%20transform=%22rotate(-8%20200%20150)%22/%3E%3Cg%20transform=%22rotate(-8%20200%20150)%22%3E%3Ccircle%20cx=%22165%22%20cy=%22115%22%20r=%229%22%20fill=%22%232b1a5e%22/%3E%3Ccircle%20cx=%22235%22%20cy=%22115%22%20r=%229%22%20fill=%22%232b1a5e%22/%3E%3Ccircle%20cx=%22165%22%20cy=%22185%22%20r=%229%22%20fill=%22%232b1a5e%22/%3E%3Ccircle%20cx=%22235%22%20cy=%22185%22%20r=%229%22%20fill=%22%232b1a5e%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22150%22%20r=%229%22%20fill=%22%232b1a5e%22/%3E%3C/g%3E%3C/svg%3E", "memory": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%2343e97b%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%231f8f8a%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%2260%22%20y=%2260%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%2291%22%20cy=%22101%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3Crect%20x=%22135%22%20y=%2260%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%23fff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Cpath%20d=%22M166%20118%20c-14-12-22-20-22-28%200-8%2012-12%2022-2%2010-10%2022-6%2022%202%200%208-8%2016-22%2028z%22%20fill=%22%23ff4d6d%22/%3E%3Crect%20x=%22210%22%20y=%2260%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%22241%22%20cy=%22101%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3Crect%20x=%22285%22%20y=%2260%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%22316%22%20cy=%22101%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3Crect%20x=%2260%22%20y=%22155%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%2291%22%20cy=%22196%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3Crect%20x=%22135%22%20y=%22155%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%22166%22%20cy=%22196%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3Crect%20x=%22210%22%20y=%22155%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%23fff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Cpath%20d=%22M241%20213%20c-14-12-22-20-22-28%200-8%2012-12%2022-2%2010-10%2022-6%2022%202%200%208-8%2016-22%2028z%22%20fill=%22%23ff4d6d%22/%3E%3Crect%20x=%22285%22%20y=%22155%22%20width=%2262%22%20height=%2282%22%20rx=%2210%22%20fill=%22%237a5cff%22%20stroke=%22%23fff%22%20stroke-width=%223%22/%3E%3Ccircle%20cx=%22316%22%20cy=%22196%22%20r=%2210%22%20fill=%22%23fff%22%20opacity=%22.35%22/%3E%3C/svg%3E", "rps": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23f7971e%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23e8436a%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Ccircle%20cx=%22110%22%20cy=%22150%22%20r=%2252%22%20fill=%22%23fff%22%20opacity=%22.95%22/%3E%3Ccircle%20cx=%22110%22%20cy=%22150%22%20r=%2230%22%20fill=%22%23f5b49a%22/%3E%3Crect%20x=%22170%22%20y=%22100%22%20width=%2270%22%20height=%22100%22%20rx=%2214%22%20fill=%22%23fff%22%20opacity=%22.95%22%20transform=%22rotate(8%20205%20150)%22/%3E%3Cpath%20d=%22M285%20110l45%2080M330%20110l-45%2080%22%20stroke=%22%23fff%22%20stroke-width=%2214%22%20stroke-linecap=%22round%22/%3E%3Ccircle%20cx=%22283%22%20cy=%22205%22%20r=%2212%22%20fill=%22none%22%20stroke=%22%23fff%22%20stroke-width=%227%22/%3E%3Ccircle%20cx=%22332%22%20cy=%22205%22%20r=%2212%22%20fill=%22none%22%20stroke=%22%23fff%22%20stroke-width=%227%22/%3E%3C/svg%3E", "tod": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23f5576c%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%234b1d8f%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Cpath%20d=%22M60%2070h170a18%2018%200%200%201%2018%2018v70a18%2018%200%200%201-18%2018H130l-40%2034v-34H60a18%2018%200%200%201-18-18V88a18%2018%200%200%201%2018-18z%22%20fill=%22%23fff%22/%3E%3Cpath%20d=%22M340%20120h-120a18%2018%200%200%200-18%2018v70a18%2018%200%200%200%2018%2018h50l40%2034v-34h30a18%2018%200%200%200%2018-18v-70a18%2018%200%200%200-18-18z%22%20fill=%22%23ffb347%22/%3E%3Ctext%20x=%22145%22%20y=%22135%22%20font-size=%2230%22%20font-family=%22Arial%22%20font-weight=%22700%22%20fill=%22%234b1d8f%22%20text-anchor=%22middle%22%3ETruth%3C/text%3E%3Ctext%20x=%22290%22%20y=%22190%22%20font-size=%2230%22%20font-family=%22Arial%22%20font-weight=%22700%22%20fill=%22%237a1d1d%22%20text-anchor=%22middle%22%3EDare%3C/text%3E%3C/svg%3E", "trivia": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23fbd786%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23f7797d%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22140%22%20r=%2282%22%20fill=%22%23fff%22/%3E%3Ctext%20x=%22200%22%20y=%22185%22%20font-size=%22130%22%20font-family=%22Arial%22%20font-weight=%22800%22%20fill=%22%237a5cff%22%20text-anchor=%22middle%22%3E%3F%3C/text%3E%3Crect%20x=%22165%22%20y=%22228%22%20width=%2270%22%20height=%2216%22%20rx=%228%22%20fill=%22%23fff%22%20opacity=%22.9%22/%3E%3Crect%20x=%22178%22%20y=%22250%22%20width=%2244%22%20height=%2212%22%20rx=%226%22%20fill=%22%23fff%22%20opacity=%22.8%22/%3E%3C/svg%3E", "ttt": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23ff7eb3%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%237a5cff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Cpath%20d=%22M155%2060V240%22%20stroke=%22%23fff%22%20stroke-width=%228%22%20stroke-linecap=%22round%22%20opacity=%22.9%22/%3E%3Cpath%20d=%22M245%2060V240%22%20stroke=%22%23fff%22%20stroke-width=%228%22%20stroke-linecap=%22round%22%20opacity=%22.9%22/%3E%3Cpath%20d=%22M95%20120H305%22%20stroke=%22%23fff%22%20stroke-width=%228%22%20stroke-linecap=%22round%22%20opacity=%22.9%22/%3E%3Cpath%20d=%22M95%20180H305%22%20stroke=%22%23fff%22%20stroke-width=%228%22%20stroke-linecap=%22round%22%20opacity=%22.9%22/%3E%3Cpath%20d=%22M110%2075l30%2030M140%2075l-30%2030%22%20stroke=%22%23fff%22%20stroke-width=%229%22%20stroke-linecap=%22round%22/%3E%3Ccircle%20cx=%22200%22%20cy=%22150%22%20r=%2217%22%20fill=%22none%22%20stroke=%22%23ffe27a%22%20stroke-width=%229%22/%3E%3Ccircle%20cx=%22290%22%20cy=%22210%22%20r=%2217%22%20fill=%22none%22%20stroke=%22%23ffe27a%22%20stroke-width=%229%22/%3E%3Cpath%20d=%22M110%20195l30%2030M140%20195l-30%2030%22%20stroke=%22%23fff%22%20stroke-width=%229%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E", "wyr": "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23ff9a9e%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%236a5cff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%22400%22%20height=%22300%22%20fill=%22url(%23g)%22/%3E%3Ccircle%20cx=%22350%22%20cy=%2240%22%20r=%2290%22%20fill=%22%23fff%22%20opacity=%22.08%22/%3E%3Ccircle%20cx=%2240%22%20cy=%22280%22%20r=%22110%22%20fill=%22%23fff%22%20opacity=%22.07%22/%3E%3Crect%20x=%2240%22%20y=%2270%22%20width=%22150%22%20height=%22160%22%20rx=%2220%22%20fill=%22%23fff%22%20opacity=%22.95%22/%3E%3Crect%20x=%22210%22%20y=%2270%22%20width=%22150%22%20height=%22160%22%20rx=%2220%22%20fill=%22%232b1a5e%22%20opacity=%22.9%22/%3E%3Ctext%20x=%22115%22%20y=%22170%22%20font-size=%2276%22%20font-family=%22Arial%22%20font-weight=%22700%22%20fill=%22%23ff4d6d%22%20text-anchor=%22middle%22%3EA%3C/text%3E%3Ctext%20x=%22285%22%20y=%22170%22%20font-size=%2276%22%20font-family=%22Arial%22%20font-weight=%22700%22%20fill=%22%23fff%22%20text-anchor=%22middle%22%3EB%3C/text%3E%3Ccircle%20cx=%22200%22%20cy=%22150%22%20r=%2224%22%20fill=%22%23ffd23f%22/%3E%3Ctext%20x=%22200%22%20y=%22160%22%20font-size=%2226%22%20font-family=%22Arial%22%20font-weight=%22700%22%20fill=%22%232b1a5e%22%20text-anchor=%22middle%22%3Eor%3C/text%3E%3C/svg%3E"};
  function photoize() {
    document.querySelectorAll('.gv-card .gi,.gmCard .gi').forEach(function (g) {
      if (g.querySelector('img')) return;
      var b = g.parentNode && g.parentNode.querySelector('b'), k = b && KEY[b.textContent.trim()];
      if (!k || !PIC[k]) return;
      var im = new Image(); im.alt = b.textContent.trim(); im.decoding = 'async'; im.src = PIC[k];
      g.textContent = ''; g.appendChild(im);
    });
  }
  var raf = 0;
  new MutationObserver(function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; photoize(); }); }).observe(document.body, { childList: true, subtree: true });
  photoize();


  /* ---------- 3-dots menu: Hide button + working toggle ---------- */
  function fixMenu() {
    var list = $('vList'), more = $('lbMore'), icons = list && list.querySelector('.lb-icons');
    if (!more || !icons || icons.__o64) return; icons.__o64 = 1;
    var hide = el('button', 'ic o64hide', 'Hide'); hide.type = 'button'; hide.setAttribute('aria-label', 'Hide menu');
    var shut = function () { icons.classList.remove('open'); more.classList.remove('open'); };
    hide.onclick = function (e) { e.stopPropagation(); shut(); };
    icons.appendChild(hide);
    var was = false;
    more.addEventListener('pointerdown', function () { was = icons.classList.contains('open'); }, true);
    more.addEventListener('click', function (e) { if (was) { was = false; e.stopImmediatePropagation(); e.stopPropagation(); shut(); } }, true);
  }
  fixMenu(); setTimeout(fixMenu, 300); setTimeout(fixMenu, 1200);


  /* ---------- scenes (animated pictures you scroll through) ---------- */
  var HP = 'M0 8c-10-9-14-14-14-20 0-6 5-9 9-9 3 0 5 2 5 4 0-2 2-4 5-4 4 0 9 3 9 9 0 6-4 11-14 20z';
  var hrt = function (x, y, sc, fill, cls, dl) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path class="' + (cls || '') + '" style="' + (dl != null ? 'animation-delay:' + dl + 's' : '') + '" d="' + HP + '" fill="' + fill + '"/></g>'; };
  var grad = function (id, a, b) { return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="300" height="190" fill="url(#' + id + ')"/>'; };
  var SV = function (inner) { return '<svg viewBox="0 0 300 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>'; };
  var stars = ''; [[30, 28], [70, 55], [110, 20], [150, 48], [200, 25], [245, 60], [270, 22], [50, 90], [225, 95], [180, 70], [128, 80], [95, 38]].forEach(function (p, i) { stars += '<circle class="o64tw" style="animation-delay:' + (i * .27) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (1.4 + (i % 3) * .6) + '" fill="#fff"/>'; });
  var SCENES = [
    { t: 'Under the stars', d: 'Just us, the moon and a quiet night.', s: SV(grad('s1', '#1b1445', '#5b3c9e') + stars + '<circle cx="235" cy="48" r="20" fill="#ffe9a8"/><circle cx="244" cy="42" r="18" fill="#2c1f63" opacity=".9"/><path d="M0 150q80-40 160-12t140-8V190H0z" fill="#150f34"/><circle cx="130" cy="118" r="9" fill="#f6c9d8"/><circle cx="152" cy="120" r="9" fill="#f6c9d8"/><path d="M118 128h26l-4 30h-18zM141 130h24l-3 28h-18z" fill="#ff6fa8"/>' + hrt(141, 100, 1.1, '#ff5c8d', 'o64rise', 0)) },
    { t: 'Float away together', d: 'Let the little worries drift off.', s: SV(grad('s2', '#8fd3ff', '#ffd1e6') + '<ellipse cx="60" cy="150" rx="46" ry="14" fill="#fff" opacity=".8"/><ellipse cx="240" cy="165" rx="56" ry="16" fill="#fff" opacity=".8"/>' + [[80, 170, '#ff5c8d', 0], [150, 175, '#ffb347', 2.2], [220, 172, '#7a5cff', 4.1]].map(function (b) { return '<g class="o64sway"><g class="o64rise" style="animation-delay:' + b[3] + 's;animation-duration:' + (6 + b[3] / 2) + 's">' + hrt(b[0], b[1] - 60, 2.1, b[2]) + '<path d="M' + b[0] + ' ' + (b[1] - 40) + 'v50" stroke="#fff" stroke-width="1.5" opacity=".8"/></g></g>'; }).join('')) },
    { t: 'Coffee for two', d: 'Slow mornings are our favourite.', s: SV(grad('s3', '#ffd6a5', '#ff9a8b') + '<rect y="140" width="300" height="50" fill="#8a5a44"/><path d="M70 100h70l-8 42H78z" fill="#fff"/><path d="M140 108q22 0 20 16t-24 14" fill="none" stroke="#fff" stroke-width="7"/><path d="M165 100h70l-8 42h-54z" fill="#ffe9d6"/><path d="M235 108q22 0 20 16t-24 14" fill="none" stroke="#ffe9d6" stroke-width="7"/>' + [[90, 0], [115, .6], [185, .3], [210, .9]].map(function (x) { return '<path class="o64steam" style="animation-delay:' + x[1] + 's" d="M' + x[0] + ' 88q-8-10 0-20t0-20" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>'; }).join('') + hrt(105, 107, .5, '#ff5c8d', 'o64pulse') + hrt(200, 107, .5, '#ff5c8d', 'o64pulse', .4)) },
    { t: 'A love letter', d: 'Write the words you never say out loud.', s: SV(grad('s4', '#a18cd1', '#fbc2eb') + '<rect x="85" y="75" width="130" height="85" rx="8" fill="#fff"/><path d="M85 82l65 45 65-45" fill="none" stroke="#d9c6f2" stroke-width="5"/>' + hrt(150, 74, 2.4, '#ff4d6d', 'o64pulse') + hrt(60, 170, .9, '#fff', 'o64rise', 0) + hrt(240, 170, 1.1, '#fff', 'o64rise', 2) + hrt(180, 170, .7, '#ff5c8d', 'o64rise', 3.5) + hrt(110, 170, .8, '#ff5c8d', 'o64rise', 5)) },
    { t: 'Sunset walk', d: 'Hand in hand till the sky goes quiet.', s: SV(grad('s5', '#ffb36b', '#ff5e8a') + '<circle class="o64sun" cx="150" cy="105" r="34" fill="#fff3b0"/><rect y="128" width="300" height="62" fill="#5b3c9e"/><g class="o64wave"><path d="M-60 140q23-9 46 0t46 0 46 0 46 0 46 0 46 0 46 0 46 0" fill="none" stroke="#c9b3ff" stroke-width="4" opacity=".8"/><path d="M-60 158q23-9 46 0t46 0 46 0 46 0 46 0 46 0 46 0 46 0" fill="none" stroke="#c9b3ff" stroke-width="4" opacity=".55"/></g><circle cx="140" cy="120" r="6" fill="#2a1747"/><circle cx="160" cy="121" r="6" fill="#2a1747"/><path d="M133 127h14l-2 22h-10zM153 128h14l-2 21h-10z" fill="#2a1747"/>') },
    { t: 'Celebrate us', d: 'Every little win deserves fireworks.', s: SV(grad('s6', '#0b1035', '#2a1b6b') + [[90, 80, '#ff5c8d', 0], [210, 65, '#ffd23f', .9], [150, 120, '#4facfe', 1.7]].map(function (f) { var o = ''; for (var i = 0; i < 10; i++) { var a = i * 36 * Math.PI / 180; o += '<circle cx="' + (f[0] + Math.cos(a) * 34).toFixed(1) + '" cy="' + (f[1] + Math.sin(a) * 34).toFixed(1) + '" r="3.2" fill="' + f[2] + '"/>'; } return '<g class="o64ping" style="animation-delay:' + f[3] + 's">' + o + '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="5" fill="' + f[2] + '"/></g>'; }).join('') + '<path d="M0 170q80-26 150-6t150-14V190H0z" fill="#120b3a"/>') }
  ];
  var IDEAS = ['Cook a new recipe together tonight', 'Take a sunset walk and share one dream each', 'Watch your first favourite movie again', 'Write three things you love about each other', 'Make a playlist of songs that remind you of us', 'Plan a tiny surprise for tomorrow', 'Video call and play a game together', 'Look at old photos and tell the story behind one', 'Try a new sweet or snack and rate it together', 'Send each other a voice note before sleep', 'Plan your dream trip, even if it is just for fun', 'Do a mini photo shoot of the two of you', 'Learn a few words of a new language together', 'Stargaze (or watch the sky) at the same time'];

  function buildScenes() {
    var w = $('o64Scenes'); if (!w) { w = el('div'); w.id = 'o64Scenes'; w.setAttribute('data-couple', ''); }
    w.innerHTML = '<h3 class="o64h3">Our little moments<small>Swipe through, tap for hearts</small></h3>';
    var row = el('div', 'o64row');
    SCENES.forEach(function (x) { var c = el('div', 'o64sc o64rv', x.s + '<div><b>' + x.t + '</b><span>' + x.d + '</span></div>'); row.appendChild(c); });
    w.appendChild(row);
    var i = Math.floor(Date.now() / 864e5) % IDEAS.length;
    var idea = el('div', 'o64card o64rv', '<div class="o64idea"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#ffe9a8"/><path d="M32 12a14 14 0 0 0-8 25v6h16v-6a14 14 0 0 0-8-25z" fill="#ffc93c"/><rect x="25" y="46" width="14" height="5" rx="2.5" fill="#ff9f1c"/>' + hrt(32, 30, .8, '#ff5c8d', 'o64pulse') + '</svg><div><small>Date idea of the day</small><div class="o64q">' + IDEAS[i] + '</div></div></div>');
    w.appendChild(idea);
    return w;
  }

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 }) : null;
  function reveal(root) { (root || document).querySelectorAll('.o64rv:not(.in)').forEach(function (n) { if (io) io.observe(n); else n.classList.add('in'); }); }

  /* ---------- PDF: open inside the app ---------- */
  var PJ = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function loadPdfjs() {
    if (window.pdfjsLib && window.pdfjsLib.__w) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      if (window.pdfjsLib) return res();
      var sc = document.createElement('script'); sc.src = PJ + 'pdf.min.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc);
    }).then(function () { return fetch(PJ + 'pdf.worker.min.js'); }).then(function (r) { return r.text(); }).then(function (t) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([t], { type: 'text/javascript' }));
      window.pdfjsLib.__w = 1; return window.pdfjsLib;
    });
  }
  function pdfView(url, name) {
    var ov = $('o64Pdf');
    if (!ov) {
      ov = el('div'); ov.id = 'o64Pdf'; ov.setAttribute('role', 'dialog');
      ov.innerHTML = '<div class="ph"><button type="button" id="o64PdfX" aria-label="Close">Close</button><b id="o64PdfN"></b><a id="o64PdfD" target="_blank" rel="noopener" download>Save</a></div><div class="pb" id="o64PdfB"></div>';
      document.body.appendChild(ov);
      $('o64PdfX').onclick = function () { ov.classList.remove('on'); $('o64PdfB').textContent = ''; ov.__t = (ov.__t || 0) + 1; };
    }
    var body = $('o64PdfB'), tok = ov.__t = (ov.__t || 0) + 1;
    $('o64PdfN').textContent = name || 'PDF'; $('o64PdfD').href = url; $('o64PdfD').setAttribute('download', name || 'document.pdf');
    body.textContent = 'Opening PDF…'; ov.classList.add('on');
    var fallback = function () {
      if (ov.__t !== tok) return;
      body.textContent = '';
      var f = document.createElement('iframe'); f.src = 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(url); body.appendChild(f);
    };
    Promise.all([loadPdfjs(), fetch(url, { mode: 'cors', credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })]).then(function (a) {
      return a[0].getDocument({ data: a[1] }).promise;
    }).then(function (pdf) {
      if (ov.__t !== tok) return; body.textContent = '';
      var dpr = Math.min(window.devicePixelRatio || 1, 2.5), width = Math.max(300, body.clientWidth - 16), n = 1;
      (function next() {
        if (n > pdf.numPages || ov.__t !== tok) return;
        pdf.getPage(n).then(function (pg) {
          var v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: width * dpr / v0.width });
          var cv = document.createElement('canvas'); cv.width = v.width; cv.height = v.height; body.appendChild(cv);
          return pg.render({ canvasContext: cv.getContext('2d'), viewport: v }).promise;
        }).then(function () { n++; next(); }).catch(function () { n++; next(); });
      })();
    }).catch(fallback);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.docC'); if (!a) return;
    var nm = ((a.querySelector('.docN') || {}).textContent || '').trim();
    if (!/\.pdf$/i.test(nm) && !/\.pdf(\?|#|$)/i.test(a.getAttribute('href') || '')) return;
    e.preventDefault(); e.stopImmediatePropagation(); pdfView(a.href, nm);
  }, true);

  /* ---------- burst hearts ---------- */
  function burst(x, y) {
    for (var i = 0; i < 9; i++) {
      var h = el('span', 'o64b', '♥'), a = Math.PI * 2 * i / 9 + Math.random() * .5, d = 50 + Math.random() * 50;
      h.style.left = x + 'px'; h.style.top = y + 'px';
      h.style.setProperty('--dx', Math.cos(a) * d + 'px'); h.style.setProperty('--dy', Math.sin(a) * d - 20 + 'px'); h.style.setProperty('--r', (Math.random() * 60 - 30) + 'deg');
      h.style.fontSize = 14 + Math.random() * 14 + 'px';
      document.body.appendChild(h); setTimeout(function (n) { n.remove(); }.bind(null, h), 950);
    }
    try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) { }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.heart-orb,.o64card,.o64sc,#tn_space');
    if (t && !(e.target.closest && e.target.closest('.h70mb,.o64nx'))) burst(e.clientX, e.clientY);
  }, true);

  /* ---------- 3) couple extras on the home screen ---------- */
  var QS = ['What is your favourite memory of us so far?', 'What small thing do I do that makes you smile?', 'Where would you take me for a surprise trip?', 'What song reminds you of us?', 'What is one thing you want us to try together this month?', 'When did you first realise you liked me?', 'What is your idea of a perfect lazy Sunday with me?', 'What is something I do that you secretly love?', 'If we could live anywhere for a year, where would it be?', 'What is one dream you have that I should know about?', 'What made you laugh the most with me?', 'What is your comfort food and who should cook it?', 'Which of our photos is your favourite and why?', 'What is one thing you are grateful for about us today?', 'What is the sweetest thing anyone has done for you?', 'Which movie should we watch together next?', 'What is your love language, in your own words?', 'What is one thing you want to improve about us?', 'Describe our first date in three words.', 'What do you miss most when we are apart?', 'What tiny ritual should we start as a couple?', 'What is a fear you would like me to help you with?', 'What would our dream home look like?', 'What is a skill you would like us to learn together?', 'What is your favourite nickname for me?', 'What is one thing you are proud of me for?', 'What was the best day we have had together?', 'What do you want us to be doing in five years?', 'How do you like to be comforted on a bad day?', 'What is one thing you have never told me but want to?'];

  var days = function (iso) { var d = new Date(iso + 'T00:00:00'); return isNaN(d) ? -1 : Math.floor((Date.now() - d.getTime()) / 864e5); };
  var MILE = [30, 50, 100, 150, 200, 250, 300, 365, 500, 600, 730, 1000, 1095, 1461, 1826, 2000, 2555, 3000, 3650];

  function buildTogether() {
    var c = $('o64Together'); if (!c) { c = el('div', 'o64card'); c.id = 'o64Together'; c.setAttribute('data-couple', ''); }
    var since = ls('onlyus-since'), n = since ? days(since) : -1;
    var h7 = (window.__h70 && window.__h70.together && window.__h70.together()) || {};
    var heart = h7.emoji ? '<span class="o64h o64emo" aria-hidden="true">' + String(h7.emoji).replace(/[<>&"]/g, '') + '</span>' : '<svg class="o64h" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    if (n < 0) {
      c.innerHTML = heart + '<small>Our days</small><div class="o64q">Set the day you became a couple and watch the days add up.</div><div class="o64btns"><button type="button" id="o64Set">Set our date</button></div>';
    } else {
      var next = MILE.filter(function (m) { return m > n; })[0] || (Math.ceil((n + 1) / 365) * 365), prev = MILE.filter(function (m) { return m <= n; }).pop() || 0;
      var y = Math.floor(n / 365), mo = Math.floor((n % 365) / 30), d = (n % 365) % 30;
      var big = n, unit = 'days';
      if (h7.unit === 'weeks') { big = Math.floor(n / 7); unit = big === 1 ? 'week' : 'weeks'; }
      else if (h7.unit === 'months') { big = Math.floor(n / 30.4375); unit = big === 1 ? 'month' : 'months'; }
      else if (h7.unit === 'ymd') { big = (y ? y + 'y ' : '') + mo + 'm'; unit = d + 'd'; }
      else unit = n === 1 ? 'day' : 'days';
      c.innerHTML = heart + '<small>' + (h7.label ? h7.label.replace(/[<>&"]/g, '') : 'Together for') + '</small><div class="o64days"><b>' + big + '</b><span>' + unit + '</span></div><div class="o64sub">' + (y ? y + ' yr ' : '') + mo + ' mo ' + d + ' d' + (h7.mile === false ? '' : ' · next milestone: day ' + next + ' (' + (next - n) + ' to go)') + '</div>' + (h7.mile === false ? '' : '<div class="o64bar"><i style="width:0"></i></div>') + '<div class="o64btns" style="margin-top:12px"><button type="button" class="alt" id="o64Set">Change date</button></div>';
      var f = c.querySelector('.o64bar i'); if (f) setTimeout(function () { f.style.width = Math.max(4, Math.min(100, (n - prev) / (next - prev) * 100)) + '%'; }, 120);
    }
    var st = c.querySelector('#o64Set');
    if (st) st.onclick = function (e) {
      e.stopPropagation();
      var inp = el('input'); inp.type = 'date'; inp.max = new Date().toISOString().slice(0, 10); inp.value = ls('onlyus-since') || '';
      inp.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:50%;top:50%';
      inp.onchange = function () { if (inp.value) { ls('onlyus-since', inp.value); buildTogether(); } inp.remove(); };
      document.body.appendChild(inp);
      try { inp.showPicker ? inp.showPicker() : inp.click(); } catch (x) { inp.click(); }
    };
    return c;
  }

  function buildQuestion() {
    var c = $('o64Question'); if (!c) { c = el('div', 'o64card'); c.id = 'o64Question'; c.setAttribute('data-couple', ''); }
    var i = Math.floor(Date.now() / 864e5) % QS.length, qs = QS;
    var pk = window.__h70 && window.__h70.pool && window.__h70.pool(QS); if (pk && pk.list && pk.list.length) { qs = pk.list; i = pk.i % qs.length; }
    c.innerHTML = '<small>' + (pk && pk.label ? pk.label.replace(/[<>&"]/g, '') : 'Question of the day') + '</small><div class="o64q"></div><div class="o64btns"><button type="button" id="o64Ask">Send to chat</button><button type="button" class="alt" id="o64Copy">Copy</button><button type="button" class="alt o64nx" id="o64Next" aria-label="Another question">&#x21bb;</button></div>';
    c.querySelector('.o64q').textContent = qs[i];
    c.querySelector('#o64Next').onclick = function (e) { e.stopPropagation(); if (window.__h70 && window.__h70.shuffle) window.__h70.shuffle(); buildQuestion(); };
    c.querySelector('#o64Ask').onclick = function () {
      var inp = document.querySelector('#cf textarea,#cf input[type="text"],#cf [contenteditable="true"]'), q = qs[i];
      var ok = false;
      if (inp) { if (inp.isContentEditable) inp.textContent = q; else inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true })); ok = true; }
      try { navigator.clipboard && navigator.clipboard.writeText(q); } catch (e) { }
      try { window.__us && window.__us.toast && window.__us.toast(ok ? 'Open a chat and tap send 💌' : 'Copied. Paste it in your chat 💌'); } catch (e) { }
    };
    c.querySelector('#o64Copy').onclick = function () { try { navigator.clipboard && navigator.clipboard.writeText(qs[i]); window.__us && window.__us.toast && window.__us.toast('Copied'); } catch (e) { } };
    return c;
  }

  function mount() {
    var list = $('vList'); if (!list || $('o64Hearts')) return;
    var layer = el('div'); layer.id = 'o64Hearts'; layer.setAttribute('data-couple', ''); layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 10; i++) {
      var h = el('i', '', '♥'); h.style.left = (Math.random() * 94 + 2) + '%'; h.style.fontSize = (12 + Math.random() * 16) + 'px';
      h.style.animationDuration = (11 + Math.random() * 10) + 's'; h.style.animationDelay = (-Math.random() * 16) + 's'; layer.appendChild(h);
    }
    list.appendChild(layer);
    var anchor = list.querySelector('.couple-profile') || list.querySelector('.welcome-strip');
    if (anchor) { var q = buildQuestion(); anchor.after(q); anchor.after(buildTogether()); q.after(buildScenes()); }
    list.querySelectorAll('.o64card').forEach(function (c) { c.classList.add('o64rv'); });
    reveal(list);
  }
  mount();
  window.__o64 = { together: buildTogether, question: buildQuestion };
  /* the day counter refreshes at midnight / when the app comes back */
  document.addEventListener('visibilitychange', function () { if (!document.hidden && $('o64Together')) { buildTogether(); buildQuestion(); reveal(document); } });
})();
