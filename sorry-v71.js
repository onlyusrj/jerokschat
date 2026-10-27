/* OnlyUs v71: "Sorry" corner (chat tools > 💌 Sorry).
   For when you two had a fight and one of you wants to make it right, without finding the words at the worst moment.
   1) Words    ready sorry messages (Tanglish / English). Tap one, edit it, send.
   2) Build    "My sorry" builder: what I did + how you felt + what I will do next time -> one proper apology.
   3) Space    "I need a little time" message with a time, so silence is not read as ignoring.
   4) Make-up  sorry coupons (ice cream, hug, movie night...) and a pinky promise.
   5) Sticker  3 animated sorry stickers drawn in code.
   Everything is sent as a normal chat message / sticker, so it needs no rules change and your partner sees it in the chat. */
(function () {
  'use strict';
  if (window.__sorry) return;
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var toast = function (m) { try { U().toast(m); } catch (e) { } };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var put = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } };
  var dataUrl = function (s) { return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s))); };
  var myName = function () { try { return (U().me() || {}).name || ''; } catch (e) { return ''; } };
  var herName = function () { try { return U().cname() || ''; } catch (e) { return ''; } };

  /* ---------------- words ---------------- */
  var W = {
    ta: {
      'Manasara': [
        'Sorry da 🥺 Naan pannadhu thappu thaan. Unna hurt pannanum nu nenaikala, aana pannitten. Please maniccidu 💗',
        'Nee kovama irukkum pothu enakku romba kashtama irukku. Naan thappu pannitten, sorry. Nee illama sanda poda mudiyala 🥺',
        'Konjam yosichu paatha, en thappu enakku puriyudhu. Sorry. Un feelings enakku mukkiyam 💗'
      ],
      'Cute': [
        'Sorry sorry sorry 🙏 Oru chance kudu, nalla kutty paiyan/ponnu ah irupen 🥹',
        'Kovama iruntha kooda ok, aana ennai vittuttu pogadha 🥺 Sorry kutty 💕',
        'Un kaalla vizhundhu sorry kekkuren 🧎 Please sirichidu 😘'
      ],
      'Thappa othukkuren': [
        'Naan appadi pesi irukka koodathu. Adhu thappu. Sorry. Next time kovam vandha first konjam wait pannitu pesuren.',
        'Un side la irundhu yosichu paatha, nee hurt aana adhu nyaayam thaan. Sorry da 💗',
        'Naan avasarama react pannitten. Un mela anbu irukku, aana en pesu thappa irundhuchu. Sorry.'
      ],
      'Pesalama?': [
        'Sanda mudiyattum. Namma rendu perum calm aana apram pesalama? Naan ready 💗',
        'Nee yen hurt aanennu enakku purinjukkanum. Sollu, naan kekkuren, interrupt pannala 🤍',
        'Sanda vendam da. Namma pesi sari pannalam 🥺 Call pannattuma?'
      ]
    },
    en: {
      'Sincere': [
        'I am sorry. I hurt you and that was never what I wanted. Please forgive me 💗',
        'I hate that we are fighting. I was wrong and I am sorry. You matter more to me than being right 🥺',
        'I thought about it and I see my mistake. I am really sorry. Your feelings matter to me 💗'
      ],
      'Cute': [
        'Sorry sorry sorry 🙏 One more chance? I will be extra good 🥹',
        'You can be angry, just do not leave me 🥺 Sorry baby 💕',
        'Coming to you on my knees with a very big sorry 🧎 Please smile 😘'
      ],
      'Own it': [
        'I should not have said that. It was wrong. I am sorry, and next time I will pause before I react.',
        'Looking from your side, your hurt makes complete sense. I am sorry 💗',
        'I reacted too fast. I love you, but the way I spoke was not okay. Sorry.'
      ],
      'Talk?': [
        'Let us end this fight. Can we talk once we are both calm? I am ready whenever you are 💗',
        'I want to understand why you are hurt. Tell me, I will listen without interrupting 🤍',
        'No more fighting please. Let us fix this together 🥺 Can I call you?'
      ]
    }
  };
  var SPACE = {
    ta: function (t) { return 'Konjam time venum da, ' + t + ' la naan thirumba pesuren. Un mela kovam illa, naan calm aaganum, avlo thaan 🌿 Nee ignore panna maatten, promise 💗'; },
    en: function (t) { return 'I need a little time to calm down. I will come back to talk in ' + t + '. I am not angry at you and I am not ignoring you, I just want to talk properly 🌿💗'; }
  };
  var TIMES = { ta: ['15 nimisham', '30 nimisham', '1 manineram', 'indru ravu'], en: ['15 minutes', '30 minutes', '1 hour', 'tonight'] };
  var COUPONS = [
    ['🍦', 'Ice cream treat', 'Un favourite ice cream, en selavula'],
    ['🤗', 'Long hug', 'Epo venumnalum, 1 minute kuda vidama'],
    ['🎬', 'Movie night', 'Nee pick pannura padam, naan complaint pannama'],
    ['📞', 'Late night call', 'Thoonga varaikum pesalam'],
    ['🍫', 'Chocolate surprise', 'Unexpected ah un kaila'],
    ['🚶', 'Evening walk', 'Phone illama, nee mattum naan mattum'],
    ['🍽️', 'Dinner of your choice', 'Nee sollura edam, nee sollura food'],
    ['💆', 'Pamper time', 'Head massage + unakku rest']
  ];

  /* ---------------- stickers (animated SVG) ---------------- */
  var FACE = '<defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#ffc857"/></radialGradient></defs>';
  function sticker(kind) {
    var cap = { sad: 'Sorry da', hug: 'Hug?', flower: 'For you' }[kind];
    var body = '';
    if (kind === 'sad') {
      body = FACE + '<circle cx="128" cy="116" r="74" fill="url(#g)"/><circle cx="104" cy="108" r="9" fill="#3a2a4a"/><circle cx="152" cy="108" r="9" fill="#3a2a4a"/><circle cx="107" cy="105" r="3" fill="#fff"/><circle cx="155" cy="105" r="3" fill="#fff"/>' +
        '<path d="M110 150q18-14 36 0" stroke="#3a2a4a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M84 92q14-10 28-4M144 88q14-6 28 4" stroke="#3a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="82" cy="132" r="10" fill="#ff8aa8" opacity=".5"/><circle cx="174" cy="132" r="10" fill="#ff8aa8" opacity=".5"/>' +
        '<path d="M100 120q-6 18 0 28" stroke="#6fb7ff" stroke-width="6" fill="none" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></path>' +
        '<path d="M156 120q6 18 0 28" stroke="#6fb7ff" stroke-width="6" fill="none" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin=".5s" repeatCount="indefinite"/></path>';
    } else if (kind === 'hug') {
      body = '<g><animateTransform attributeName="transform" type="translate" values="-6 0;6 0;-6 0" dur="1.6s" repeatCount="indefinite"/><circle cx="96" cy="116" r="42" fill="#ffc857"/><circle cx="82" cy="108" r="5" fill="#3a2a4a"/><circle cx="110" cy="108" r="5" fill="#3a2a4a"/><path d="M84 128q12 10 24 0" stroke="#3a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
        '<g><animateTransform attributeName="transform" type="translate" values="6 0;-6 0;6 0" dur="1.6s" repeatCount="indefinite"/><circle cx="160" cy="116" r="42" fill="#ffadc7"/><circle cx="146" cy="108" r="5" fill="#3a2a4a"/><circle cx="174" cy="108" r="5" fill="#3a2a4a"/><path d="M148 128q12 10 24 0" stroke="#3a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
        '<g transform="translate(128 52)"><path d="M0 14C-26-6-18-30 0-16 18-30 26-6 0 14z" fill="#ff3d6e"><animateTransform attributeName="transform" type="scale" values="1;1.25;1" dur="1.1s" repeatCount="indefinite"/></path></g>';
    } else {
      body = '<path d="M128 220V120" stroke="#4fbf7a" stroke-width="7" stroke-linecap="round"/><path d="M128 190c-26-4-36-20-36-32 22 0 36 12 36 32zM128 170c26-4 36-20 36-32-22 0-36 12-36 32z" fill="#4fbf7a"/>' +
        '<g><animateTransform attributeName="transform" type="rotate" values="-4 128 120;4 128 120;-4 128 120" dur="2.4s" repeatCount="indefinite"/>' +
        '<g fill="#ff8fb8"><circle cx="128" cy="78" r="24"/><circle cx="160" cy="100" r="24"/><circle cx="148" cy="136" r="24"/><circle cx="108" cy="136" r="24"/><circle cx="96" cy="100" r="24"/></g><circle cx="128" cy="112" r="20" fill="#ffd166"/></g>';
    }
    var c = '<rect x="46" y="212" width="164" height="36" rx="18" fill="#fff" opacity=".95"/><text x="128" y="237" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="800" fill="#4a2a7a">' + esc(cap) + '</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">' + body + c + '</svg>';
  }

  /* ---------------- UI ---------------- */
  var css = '#sorryOv{align-items:center;justify-content:center;padding:12px;z-index:60}' +
    '#sorryOv .card{max-width:440px;max-height:90vh;overflow:auto;position:relative;padding:20px!important}' +
    '#sorryOv h2{margin:0 0 2px;font-size:20px;color:var(--acc)}#sorryOv .sub{color:var(--dim);font-size:13px;margin-bottom:12px}' +
    '#sorryOv .x{position:absolute;top:10px;right:12px;border:0;background:transparent;color:var(--dim);font-size:24px;cursor:pointer}' +
    '#sorryOv .tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px}#sorryOv .tabs button{flex:0 0 auto;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:99px;padding:7px 12px;font:600 13px system-ui,sans-serif;cursor:pointer}' +
    '#sorryOv .tabs button.on{background:var(--acc);border-color:var(--acc);color:#fff}' +
    '#sorryOv .pane{display:none}#sorryOv .pane.on{display:block}' +
    '#sorryOv .chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 8px}#sorryOv .chips button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:99px;padding:6px 11px;font:13px system-ui,sans-serif;cursor:pointer}#sorryOv .chips button.on{border-color:var(--acc);color:var(--acc);font-weight:700}' +
    '#sorryOv .opt{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:10px 12px;margin:0 0 7px;font:13.5px/1.35 system-ui,sans-serif;cursor:pointer}#sorryOv .opt:active{transform:scale(.98)}' +
    '#sorryOv textarea,#sorryOv input[type=text]{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px;font:14px/1.4 system-ui,sans-serif;resize:vertical}' +
    '#sorryOv label{display:block;font:600 12.5px system-ui,sans-serif;color:var(--dim);margin:8px 0 3px}' +
    '#sorryOv .go{width:100%;margin-top:10px;border:0;border-radius:14px;background:var(--acc);color:#fff;padding:12px;font:700 15px system-ui,sans-serif;cursor:pointer}' +
    '#sorryOv .go.alt{background:var(--bg);color:var(--ink);border:1px solid var(--line);margin-top:6px}' +
    '#sorryOv .cg{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}#sorryOv .cg button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:10px 6px;font:600 13px system-ui,sans-serif;cursor:pointer}#sorryOv .cg button b{display:block;font-size:24px}' +
    '#sorryOv .sg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#sorryOv .sg button{border:1px solid var(--line);background:var(--bg);border-radius:14px;padding:6px;cursor:pointer}#sorryOv .sg img{width:100%;display:block}' +
    '#sorryOv .tip{font-size:12px;color:var(--dim);margin-top:10px;line-height:1.4}';
  var st = document.createElement('style'); st.id = 'v71sorry'; st.textContent = css; document.head.appendChild(st);

  var lang = get('onlyus-sorry-lang') || 'ta', cat = 0, ov, ta;

  function build() {
    if ($('sorryOv')) return;
    ov = document.createElement('div'); ov.className = 'ov'; ov.id = 'sorryOv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Say sorry');
    ov.innerHTML = '<div class="card"><button class="x" type="button" aria-label="Close">×</button>' +
      '<h2>💌 Say sorry</h2><div class="sub" id="sorrySub"></div>' +
      '<div class="tabs" id="sorryTabs"><button data-t="w" class="on">Words</button><button data-t="b">My sorry</button><button data-t="s">Need time</button><button data-t="c">Make-up</button><button data-t="k">Stickers</button></div>' +
      '<div class="pane on" data-p="w"><div class="chips" id="sLang"><button data-l="ta">Tanglish</button><button data-l="en">English</button></div><div class="chips" id="sCats"></div><div id="sList"></div>' +
      '<label for="sText">Edit it your way, then send</label><textarea id="sText" rows="4" placeholder="Pick one above or write your own…"></textarea><button class="go" id="sSend" type="button">Send sorry 💗</button></div>' +
      '<div class="pane" data-p="b"><label for="bDid">1. What did I do / say?</label><input type="text" id="bDid" placeholder="e.g. un phone call ah ignore pannen"><label for="bFeel">2. How did it make you feel?</label><input type="text" id="bFeel" placeholder="e.g. neglected, hurt, alone"><label for="bFix">3. What will I do next time?</label><input type="text" id="bFix" placeholder="e.g. busy na munnadiye solluven"><button class="go alt" id="bMake" type="button">Write my sorry</button><div class="tip">A good sorry has 3 parts: own it, understand their feeling, say what you will change. This puts them together, you can still edit it in the first tab.</div></div>' +
      '<div class="pane" data-p="s"><div class="sub" style="margin-top:0">Kovam la pesina sanda perusa aagum. Konjam time eduthukko, aana avanga/avalga ignore nu ninaikkama irukka idhu help pannum.</div><div class="chips" id="tChips"></div><button class="go" id="tSend" type="button">Send “I need a little time” 🌿</button></div>' +
      '<div class="pane" data-p="c"><div class="sub" style="margin-top:0">Sorry with a little gift. Tap one to send a coupon.</div><div class="cg" id="cGrid"></div><button class="go alt" id="pinky" type="button">🤙 Send a pinky promise</button></div>' +
      '<div class="pane" data-p="k"><div class="sg" id="sGrid"></div><div class="tip">Animated stickers, sent like any sticker in the chat.</div></div></div>';
    document.body.appendChild(ov);
    ta = $('sText');
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.x')) close(); });
    $('sorryTabs').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; tab(b.dataset.t); };
    $('sLang').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; lang = b.dataset.l; put('onlyus-sorry-lang', lang); cat = 0; paint(); };
    $('sCats').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; cat = +b.dataset.i; paint(); };
    $('sList').onclick = function (e) { var b = e.target.closest('.opt'); if (!b) return; ta.value = b.textContent; ta.focus(); };
    $('sSend').onclick = function () { var t = ta.value.trim(); if (!t) return toast('Pick a message or write your own'); deliver({ type: 'text', text: t }, 'Sorry sent 💗'); ta.value = ''; };
    $('bMake').onclick = function () {
      var d = $('bDid').value.trim(), f = $('bFeel').value.trim(), x = $('bFix').value.trim();
      if (!d) return toast('Write what you did first');
      var t = lang === 'en'
        ? 'I am sorry for ' + d + '.' + (f ? ' I understand it made you feel ' + f + ' and that is completely fair.' : '') + (x ? ' Next time, ' + x + '.' : '') + ' I love you 💗'
        : 'Sorry da. ' + d[0].toUpperCase() + d.slice(1) + ', adhu en thappu thaan.' + (f ? ' Adhunala nee ' + f + ' ah feel pannirupa nu enakku puriyudhu, adhu nyaayam thaan.' : '') + (x ? ' Next time ' + x + '.' : '') + ' I love you 💗';
      ta.value = t; tab('w'); toast('Check it, edit if you want, then send');
    };
    $('tSend').onclick = function () { var c = ov.querySelector('#tChips .on'); if (!c) return toast('Choose how long first'); deliver({ type: 'text', text: SPACE[lang](c.textContent) }, 'Sent 🌿'); };
    $('tChips').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; ov.querySelectorAll('#tChips button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
    $('cGrid').innerHTML = COUPONS.map(function (c, i) { return '<button type="button" data-i="' + i + '"><b>' + c[0] + '</b>' + esc(c[1]) + '</button>'; }).join('');
    $('cGrid').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return; var c = COUPONS[+b.dataset.i];
      var from = myName() ? '\n— ' + myName() : '';
      deliver({ type: 'text', text: '🎟️ SORRY COUPON 🎟️\n' + c[0] + ' ' + c[1] + '\n' + c[2] + '\nValid: anytime, no expiry 💗' + from }, 'Coupon sent 🎟️');
    };
    $('pinky').onclick = function () {
      var x = $('bFix').value.trim();
      deliver({ type: 'text', text: '🤙 Pinky promise\nIdhu pola thappu thirumba pannama paathukkuren' + (x ? ': ' + x : '') + '. Nee en life la romba mukkiyam 💗' }, 'Promise sent 🤙');
    };
    $('sGrid').innerHTML = ['sad', 'hug', 'flower'].map(function (k) { return '<button type="button" data-k="' + k + '"><img alt="" src="' + dataUrl(sticker(k)) + '"></button>'; }).join('');
    $('sGrid').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; deliver({ type: 'img', sticker: true, data: dataUrl(sticker(b.dataset.k)) }, 'Sticker sent 💗'); };
    paint();
  }

  function paint() {
    ov.querySelectorAll('#sLang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === lang); });
    var names = Object.keys(W[lang]);
    $('sCats').innerHTML = names.map(function (n, i) { return '<button type="button" data-i="' + i + '"' + (i === cat ? ' class="on"' : '') + '>' + esc(n) + '</button>'; }).join('');
    $('sList').innerHTML = W[lang][names[cat]].map(function (m) { return '<button class="opt" type="button">' + esc(m) + '</button>'; }).join('');
    $('tChips').innerHTML = TIMES[lang].map(function (t) { return '<button type="button">' + esc(t) + '</button>'; }).join('');
    var him = herName();
    $('sorrySub').textContent = him ? 'Sanda aana apram, first step edukkuradhu perusu. ' + him + ' ku anuppalam 💗' : 'Sanda aana apram, first step edukkuradhu perusu 💗';
  }
  function tab(t) {
    ov.querySelectorAll('#sorryTabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
    ov.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('on', p.dataset.p === t); });
  }
  function deliver(o, ok) {
    Promise.resolve().then(function () { return U().send(o); }).then(function (r) { if (r === false) return; toast(ok); close(); }).catch(function () { toast('Not sent. Check internet.'); });
  }
  function open(t) { build(); paint(); tab(t || 'w'); ov.classList.add('on'); }
  function close() { if (ov) ov.classList.remove('on'); }

  function addEntry() {
    var grid = document.querySelector('#chatTools .tool-grid');
    if (!grid || $('toolSorry')) return;
    var b = document.createElement('button'); b.id = 'toolSorry'; b.type = 'button'; b.innerHTML = '💌<span>Sorry</span>';
    b.onclick = function () { var ct = $('chatTools'); if (ct) ct.classList.remove('on'); open(); };
    var first = grid.firstElementChild; grid.insertBefore(b, first && first.nextSibling);
  }
  addEntry(); setTimeout(addEntry, 1500); setTimeout(addEntry, 4000);
  window.__sorry = { open: open, close: close };
})();
