/* OnlyUs games-v60.js  —  4 new live games for the "Play together" hub
   🔲 Dots & Boxes   🚢 Battleship   ❓ Trivia Duel   🃏 Color Cards (Uno-style)
   They use the SAME share/game document + request / accept / score / play-again flow as the other games
   (no firestore.rules change). Needs the hook window.__gmApi that index.html now provides. */
(function () {
  'use strict';
  var G = window.__gmApi;
  if (!G) return;
  var h = G.h, my = G.my, opp = G.opp, idx = G.idx, upd = G.upd, fin = G.fin, put = G.put, FAST = G.FAST, shuf = G.shuf;
  var D = function () { return G.D(); };
  var NS = 'http://www.w3.org/2000/svg';
  var mkb = function (cls, txt, fn) { var b = h('button', cls, txt); b.type = 'button'; if (fn) b.onclick = fn; return b; };

  /* ------------------------------------------------------------------ styles */
  var css = document.createElement('style');
  css.textContent = [
    '.gDots{width:min(92vw,360px);height:auto;touch-action:manipulation}',
    '.gBs{display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:min(88vw,330px);background:#ffffff14;padding:4px;border-radius:12px}',
    '.gBs.sm{width:min(58vw,210px);padding:3px;gap:1px}',
    '.gBs button,.gBs div{all:unset;box-sizing:border-box;aspect-ratio:1;border-radius:4px;background:#5aa9ff33;display:grid;place-items:center;font-size:13px;line-height:1;font-weight:800}',
    '.gBs button{cursor:pointer}.gBs button:active{background:#5aa9ff99}',
    '.gBs .shp{background:#94a3b8}.gBs .shp.a{background:#8b5cf6}.gBs .shp.b{background:#06b6d4}.gBs .shp.c{background:#22c55e}.gBs .shp.d{background:#f59e0b}.gBs .shp.e{background:#ec4899}',
    '.gBs .hit{background:#ef4444!important;color:#fff}.gBs .miss{background:#ffffff22;color:#ffffffaa}',
    '.gBsRow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}',
    '.gBsT{font-size:12px;opacity:.8;margin:12px 0 4px}',
    '.gTq{font-size:18px;font-weight:700;text-align:center;margin:4px 0 14px;min-height:48px;width:100%}',
    '.gTo{display:grid;gap:8px;width:100%}',
    '.gTo button{all:unset;box-sizing:border-box;cursor:pointer;padding:13px 14px;border-radius:14px;background:#ffffff1c;border:1px solid #ffffff22;font-size:15px}',
    '.gTo button.sel{background:#7d70f5bb}.gTo button.ok{background:#22c55eaa}.gTo button.bad{background:#ef4444aa}',
    '.gTo button:disabled{cursor:default}',
    '.gTt{font-size:13px;opacity:.85;margin-top:10px;text-align:center}',
    '.gCcRow{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}',
    '.gCc{all:unset;box-sizing:border-box;cursor:pointer;width:46px;height:68px;border-radius:9px;border:2px solid #fff;display:grid;place-items:center;font-size:20px;font-weight:800;color:#fff;text-shadow:0 1px 2px #0007;box-shadow:0 4px 10px #0005}',
    '.gCc.dim{opacity:.38;cursor:default}.gCc.lg{width:66px;height:96px;font-size:30px}.gCc.sm{width:22px;height:32px;border-width:1px;border-radius:5px}',
    '.gCc.back{background:repeating-linear-gradient(45deg,#2b2140,#2b2140 6px,#3a2d57 6px,#3a2d57 12px)}',
    '.gCcMid{display:flex;gap:22px;align-items:center;justify-content:center;margin:12px 0}',
    '.gCcDot{display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:middle;margin-right:6px;border:2px solid #fff}',
    '.gCcPick{display:flex;gap:10px;justify-content:center;margin:10px 0}',
    '.gCcPick button{all:unset;cursor:pointer;width:44px;height:44px;border-radius:50%;border:3px solid #fff}'
  ].join('\n');
  document.head.appendChild(css);

  /* =================================================================== 🔲 DOTS & BOXES */
  var DB_COL = ['#ff6b9d', '#6bb5ff'];
  function dbInit() { return { l: Array(40).fill(0), bx: Array(16).fill(0), t: 0, ln: -1 }; }
  function dbBox(r, c) { return [r * 4 + c, (r + 1) * 4 + c, 20 + r * 5 + c, 20 + r * 5 + c + 1]; }
  function dbMove(k) {
    var d = D(), s = d.s, i = idx();
    if (d.st !== 'play' || s.t !== i || s.l[k]) return;
    var l = s.l.slice(), bx = s.bx.slice(), got = 0, chk = function (x) { return l[x]; };
    l[k] = i + 1;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var b = r * 4 + c;
      if (!bx[b] && dbBox(r, c).every(chk)) { bx[b] = i + 1; got++; }
    }
    var ns = { l: l, bx: bx, t: got ? i : 1 - i, ln: k };
    if (bx.every(Boolean)) {
      var a = bx.filter(function (x) { return x === 1; }).length, z = 16 - a;
      return fin(a > z ? d.p[0] : z > a ? d.p[1] : 'd', ns);
    }
    upd({ s: ns });
  }
  function rDots(B) {
    var d = D(), s = d.s, i = idx(), mine = d.st === 'play' && s.t === i, cell = 60, pad = 22, W = pad * 2 + cell * 4;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W); svg.setAttribute('class', 'gDots');
    var E = function (t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
    var seg = function (k) {
      if (k < 20) { var r = Math.floor(k / 4), c = k % 4, x = pad + c * cell, y = pad + r * cell; return [x, y, x + cell, y]; }
      var k2 = k - 20, r2 = Math.floor(k2 / 5), c2 = k2 % 5, x2 = pad + c2 * cell, y2 = pad + r2 * cell; return [x2, y2, x2, y2 + cell];
    };
    s.bx.forEach(function (o, b) {
      if (!o) return;
      var r = Math.floor(b / 4), c = b % 4;
      E('rect', { x: pad + c * cell + 5, y: pad + r * cell + 5, width: cell - 10, height: cell - 10, rx: 9, fill: DB_COL[o - 1], opacity: .4 });
      var t = E('text', { x: pad + c * cell + cell / 2, y: pad + r * cell + cell / 2 + 7, 'text-anchor': 'middle', 'font-size': 20 });
      t.textContent = o - 1 === i ? '♥' : '★';
    });
    for (var k = 0; k < 40; k++) {
      var q = seg(k), v = s.l[k];
      if (v) E('line', { x1: q[0], y1: q[1], x2: q[2], y2: q[3], stroke: DB_COL[v - 1], 'stroke-width': k === s.ln ? 9 : 6, 'stroke-linecap': 'round' });
      else E('line', { x1: q[0], y1: q[1], x2: q[2], y2: q[3], stroke: '#ffffff30', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '2 7' });
    }
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) E('circle', { cx: pad + c * cell, cy: pad + r * cell, r: 5.5, fill: '#fff' });
    if (mine) for (var m = 0; m < 40; m++) {
      if (s.l[m]) continue;
      var z = seg(m), hit = E('line', { x1: z[0], y1: z[1], x2: z[2], y2: z[3], stroke: 'transparent', 'stroke-width': 30, 'stroke-linecap': 'round', style: 'cursor:pointer' });
      (function (kk) { hit.onclick = function () { dbMove(kk); }; })(m);
    }
    var a = s.bx.filter(function (x) { return x === i + 1; }).length, b2 = s.bx.filter(function (x) { return x === 2 - i; }).length;
    put(B, svg, d.st === 'play' ? (mine ? 'Your turn · tap a dotted line' + (s.ln >= 0 && s.t === i ? ' (box = go again)' : '') : opp().name + '’s turn') : 'Game over');
    B.appendChild(h('div', 'gmNote', '♥ You ' + a + '  –  ' + b2 + ' ' + opp().name + ' ★'));
  }

  /* =================================================================== 🚢 BATTLESHIP */
  var FLEET = [['Carrier', 5], ['Battleship', 4], ['Cruiser', 3], ['Submarine', 3], ['Destroyer', 2]], DASH = Array(101).join('-');
  function bsInit() { return { t: 0, ships: {}, sh: {}, ln: null }; }
  function bsRandom() {
    var g = Array(100).fill('.');
    FLEET.forEach(function (f, n) {
      var ch = 'abcde'[n], len = f[1];
      for (var tries = 0; tries < 800; tries++) {
        var hz = Math.random() < .5, r = Math.floor(Math.random() * (hz ? 10 : 11 - len)), c = Math.floor(Math.random() * (hz ? 11 - len : 10)), ok = true, cells = [];
        for (var k = 0; k < len; k++) { var p = hz ? r * 10 + c + k : (r + k) * 10 + c; if (g[p] !== '.') { ok = false; break; } cells.push(p); }
        if (ok) { cells.forEach(function (p) { g[p] = ch; }); break; }
      }
    });
    return g.join('');
  }
  function bsBoard(ships, shots, cls, onTap, showShips) {
    var g = h('div', 'gBs ' + (cls || ''));
    for (let k = 0; k < 100; k++) {
      var sc = shots ? shots[k] : '-', sh = ships ? ships[k] : '.', c = '', tx = '';
      if (sc === 'h') { c = 'hit'; tx = '✖'; }
      else if (sc === 'm') { c = 'miss'; tx = '•'; }
      else if (showShips && sh !== '.') c = 'shp ' + sh;
      var tap = onTap && sc === '-', el = h(tap ? 'button' : 'div', c, tx);
      if (tap) { el.type = 'button'; el.onclick = function () { onTap(k); }; }
      if (c.indexOf('hit') === 0 && showShips && sh !== '.') el.className = 'hit shp ' + sh;
      g.appendChild(el);
    }
    return g;
  }
  function bsCell(k) { return String.fromCharCode(65 + k % 10) + (Math.floor(k / 10) + 1); }
  function bsFire(k) {
    var d = D(), s = d.s, me = my(), o = opp().uid, i = idx();
    if (d.st !== 'play' || s.t !== i || !s.ships || !s.ships[me] || !s.ships[o]) return;
    var oS = s.ships[o], arr = ((s.sh && s.sh[me]) || DASH).split('');
    if (arr[k] !== '-') return;
    var ch = oS[k], hit = ch !== '.', sunk = '', p;
    arr[k] = hit ? 'h' : 'm';
    if (hit) {
      var all = true;
      for (p = 0; p < 100; p++) if (oS[p] === ch && arr[p] !== 'h') { all = false; break; }
      if (all) sunk = FLEET['abcde'.indexOf(ch)][0];
    }
    var won = true;
    for (p = 0; p < 100; p++) if (oS[p] !== '.' && arr[p] !== 'h') { won = false; break; }
    var str = arr.join(''), ln = { u: me, k: k, r: hit ? (sunk ? 's' : 'h') : 'm', n: sunk };
    if (won) {
      var shn = Object.assign({}, s.sh || {}); shn[me] = str;
      return fin(me, Object.assign({}, s, { sh: shn, ln: ln }));
    }
    var u = {}; u['s.sh.' + me] = str; u['s.t'] = hit ? i : 1 - i; u['s.ln'] = ln;
    upd(u);
  }
  function rBship(B) {
    var d = D(), s = d.s, me = my(), o = opp().uid, i = idx(), L = G.loc(), mS = s.ships && s.ships[me], tS = s.ships && s.ships[o];
    if (d.st === 'play' && !(mS && tS)) {
      if (!mS) {
        if (!L.bs || L.bsFor !== d.n) { L.bs = bsRandom(); L.bsFor = d.n; }
        put(B, bsBoard(L.bs, null, '', null, true), 'Place your fleet · tap Shuffle until you like it');
        var row = h('div', 'gBsRow');
        row.appendChild(mkb('btn l', '🔀 Shuffle', function () { L.bs = bsRandom(); G.render(); }));
        row.appendChild(mkb('btn', 'Ready ✓', function () { var u = {}; u['s.ships.' + me] = L.bs; upd(u); }));
        B.appendChild(row);
      } else {
        put(B, bsBoard(mS, null, '', null, true), 'Waiting for ' + opp().name + ' to place their fleet…');
      }
      B.appendChild(h('div', 'gmNote', 'Ships stay hidden from your partner until they are hit. A hit gives you another shot.'));
      return;
    }
    var my_ = (s.sh && s.sh[me]) || DASH, th = (s.sh && s.sh[o]) || DASH, myTurn = d.st === 'play' && s.t === i;
    put(B, bsBoard(tS, my_, '', myTurn ? bsFire : null, d.st !== 'play'), d.st === 'play' ? (myTurn ? 'Your turn · tap the water to fire 🎯' : opp().name + ' is aiming…') : 'Game over');
    B.appendChild(h('div', 'gBsT', 'Your fleet'));
    B.appendChild(bsBoard(mS, th, 'sm', null, true));
    var mh = my_.split('h').length - 1, oh = th.split('h').length - 1;
    B.appendChild(h('div', 'gmNote', 'Hits: you ' + mh + '/17 · ' + opp().name + ' ' + oh + '/17'));
    var l = s.ln;
    if (l) {
      var w = l.u === me ? 'You' : opp().name;
      B.appendChild(h('div', 'gmNote', w + ' fired at ' + bsCell(l.k) + ' → ' + (l.r === 's' ? 'sunk the ' + l.n + ' 🔥' : l.r === 'h' ? 'HIT 💥 (shoots again)' : 'miss 🌊')));
    }
  }

  /* =================================================================== ❓ TRIVIA DUEL */
  var QN = 10, TSEC = 20;
  var QB = [
    ['What is the capital of Australia?', 'Sydney', 'Canberra', 'Melbourne', 'Perth', 1],
    ['Which planet is known as the Red Planet?', 'Venus', 'Jupiter', 'Mars', 'Mercury', 2],
    ['How many continents are there?', '5', '6', '8', '7', 3],
    ['Which is the largest ocean?', 'Pacific', 'Atlantic', 'Indian', 'Arctic', 0],
    ['What is the chemical symbol for gold?', 'Ag', 'Au', 'Gd', 'Go', 1],
    ['Who painted the Mona Lisa?', 'Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo', 2],
    ['What is the national animal of India?', 'Lion', 'Elephant', 'Peacock', 'Tiger', 3],
    ['What is the national bird of India?', 'Peacock', 'Parrot', 'Sparrow', 'Eagle', 0],
    ['What is the capital of Tamil Nadu?', 'Madurai', 'Chennai', 'Coimbatore', 'Trichy', 1],
    ['The Taj Mahal is in which city?', 'Delhi', 'Jaipur', 'Agra', 'Lucknow', 2],
    ['The Gateway of India is in which city?', 'Chennai', 'Kolkata', 'Goa', 'Mumbai', 3],
    ['Who wrote the Indian national anthem?', 'Rabindranath Tagore', 'Bankim Chandra', 'Gandhi', 'Nehru', 0],
    ['Which is the largest mammal?', 'Elephant', 'Blue whale', 'Giraffe', 'Hippo', 1],
    ['Which is the fastest land animal?', 'Lion', 'Horse', 'Cheetah', 'Leopard', 2],
    ['How many days are there in a leap year?', '364', '365', '367', '366', 3],
    ['Which is the largest planet in our solar system?', 'Jupiter', 'Saturn', 'Neptune', 'Earth', 0],
    ['Which gas do plants absorb from the air?', 'Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen', 1],
    ['What is the hardest natural substance?', 'Gold', 'Iron', 'Diamond', 'Quartz', 2],
    ['What is the currency of Japan?', 'Won', 'Yuan', 'Baht', 'Yen', 3],
    ['How many players are on the field for one football (soccer) team?', '11', '9', '10', '12', 0],
    ['Which sport is Sachin Tendulkar famous for?', 'Hockey', 'Cricket', 'Tennis', 'Football', 1],
    ['Mount Everest is part of which mountain range?', 'Alps', 'Andes', 'Himalayas', 'Rockies', 2],
    ['What is the smallest prime number?', '0', '1', '3', '2', 3],
    ['What is the square root of 144?', '12', '14', '11', '13', 0],
    ['How many sides does a hexagon have?', '5', '6', '7', '8', 1],
    ['Which festival is called the festival of lights?', 'Pongal', 'Holi', 'Diwali', 'Onam', 2],
    ['Pongal is mainly the harvest festival of which state?', 'Punjab', 'Gujarat', 'Assam', 'Tamil Nadu', 3],
    ['Which animal is called the ship of the desert?', 'Camel', 'Horse', 'Donkey', 'Ox', 0],
    ['Who invented the telephone?', 'Edison', 'Alexander Graham Bell', 'Tesla', 'Marconi', 1],
    ['What is the capital of France?', 'Lyon', 'Nice', 'Paris', 'Marseille', 2],
    ['Which is the largest hot desert in the world?', 'Gobi', 'Thar', 'Kalahari', 'Sahara', 3],
    ['Which organ pumps blood in the body?', 'Heart', 'Liver', 'Lungs', 'Kidney', 0],
    ['How many colours are there in a rainbow?', '6', '7', '8', '9', 1],
    ['Which planet is famous for its rings?', 'Mars', 'Venus', 'Saturn', 'Mercury', 2],
    ['Thiruvalluvar wrote which famous work?', 'Silappatikaram', 'Manimekalai', 'Kamba Ramayanam', 'Thirukkural', 3],
    ['Which vitamin do we get from sunlight?', 'Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin B12', 0],
    ['Who is known as the Father of the Nation in India?', 'Subhas Chandra Bose', 'Mahatma Gandhi', 'Sardar Patel', 'Ambedkar', 1],
    ['What is the national flower of India?', 'Rose', 'Jasmine', 'Lotus', 'Marigold', 2],
    ['Which month has the fewest days?', 'April', 'June', 'September', 'February', 3],
    ['Which is the tallest animal?', 'Giraffe', 'Elephant', 'Camel', 'Ostrich', 0],
    ['How many squares are on a chessboard?', '60', '64', '72', '81', 1],
    ['Which Indian city is known as the Pink City?', 'Udaipur', 'Jodhpur', 'Jaipur', 'Agra', 2],
    ['Which is the biggest country in the world by area?', 'Canada', 'China', 'USA', 'Russia', 3],
    ['Which planet is closest to the Sun?', 'Mercury', 'Venus', 'Earth', 'Mars', 0],
    ['What is the capital of Japan?', 'Osaka', 'Tokyo', 'Kyoto', 'Seoul', 1],
    ['How many strings does a standard guitar have?', '4', '5', '6', '7', 2],
    ['What is the capital of Kerala?', 'Kochi', 'Kozhikode', 'Thrissur', 'Thiruvananthapuram', 3],
    ['What do bees make?', 'Honey', 'Milk', 'Silk', 'Wax only', 0]
  ];
  function trInit() { return { q: shuf(QB.map(function (_, n) { return n; })).slice(0, QN), i: 0, ph: 'ask', ans: {}, pt: {} }; }
  function trReveal() {
    var d = D(); if (!d || d.game !== 'trivia' || d.st !== 'play') return;
    var s = d.s, ar = G.arb(), key = d.n + ':' + s.i;
    if (s.ph !== 'ask' || ar.trRv === key) return;
    ar.trRv = key;
    var q = QB[s.q[s.i]], u = { 's.ph': 'rev' };
    d.p.forEach(function (x) { var a = s.ans && s.ans[x]; u['s.pt.' + x] = ((s.pt && s.pt[x]) || 0) + (a === q[5] ? 1 : 0); });
    upd(u);
  }
  function trNext() {
    var d = D(); if (!d || d.game !== 'trivia' || d.st !== 'play') return;
    var s = d.s; if (s.ph !== 'rev') return;
    if (s.i >= QN - 1) {
      var a = (s.pt && s.pt[d.p[0]]) || 0, b = (s.pt && s.pt[d.p[1]]) || 0;
      fin(a > b ? d.p[0] : b > a ? d.p[1] : 'd', s);
    } else upd({ 's.i': s.i + 1, 's.ph': 'ask', 's.ans': {} });
  }
  function trArb() {
    var d = D(), s = d.s, ar = G.arb();
    if (d.p[0] !== my()) return;
    var key = d.n + ':' + s.i + ':' + s.ph;
    if (s.ph === 'ask') {
      var both = d.p.every(function (x) { return s.ans && s.ans[x] != null; });
      if (both) { if (ar.trB !== key) { ar.trB = key; setTimeout(trReveal, FAST() ? 100 : 600); } }
      else if (ar.trT !== key) { ar.trT = key; setTimeout(function () { var c = D(); if (c && c.game === 'trivia' && c.st === 'play' && c.s.i === s.i && c.s.ph === 'ask') trReveal(); }, FAST() ? 4000 : (TSEC + 2) * 1000); }
    } else if (s.ph === 'rev' && ar.trN !== key) {
      ar.trN = key; setTimeout(trNext, FAST() ? 600 : 3200);
    }
  }
  function rTrivia(B) {
    var d = D(), s = d.s, me = my(), o = opp().uid, L = G.loc(), q = QB[s.q[s.i]];
    clearInterval(L.trTm);
    if (!q) return;
    var pts = function (u) { return (s.pt && s.pt[u]) || 0; }, ans = s.ans || {}, rev = s.ph === 'rev' || d.st === 'end', done = ans[me] != null;
    B.appendChild(h('div', 'gmSt', d.st === 'play' ? 'Question ' + (s.i + 1) + '/' + QN + ' · you ' + pts(me) + ' – ' + pts(o) + ' ' + opp().name : 'Game over · you ' + pts(me) + ' – ' + pts(o) + ' ' + opp().name));
    B.appendChild(h('div', 'gTq', q[0]));
    var box = h('div', 'gTo');
    for (let k = 0; k < 4; k++) {
      var cls = '', tx = q[k + 1];
      if (rev) {
        if (k === q[5]) cls = 'ok'; else if (ans[me] === k) cls = 'bad';
        var who = []; if (ans[me] === k) who.push('you'); if (ans[o] === k) who.push(opp().name);
        if (who.length) tx += '   · ' + who.join(' & ');
      } else if (ans[me] === k) cls = 'sel';
      var b = mkb(cls, tx, function () {
        var c = D(); if (c.st !== 'play' || c.s.ph !== 'ask' || (c.s.ans && c.s.ans[me] != null)) return;
        var u = {}; u['s.ans.' + me] = k; upd(u);
      });
      b.disabled = rev || done || d.st !== 'play';
      box.appendChild(b);
    }
    B.appendChild(box);
    if (d.st === 'play' && !rev) {
      var key = d.n + ':' + s.i;
      if (L.trK !== key) { L.trK = key; L.tr0 = Date.now(); }
      var tm = h('div', 'gTt'), tick = function () {
        if (!document.body.contains(tm)) { clearInterval(L.trTm); return; }
        tm.textContent = (done ? 'Waiting for ' + opp().name + '… · ' : '') + '⏱ ' + Math.max(0, TSEC - Math.floor((Date.now() - L.tr0) / 1000)) + 's';
      };
      tick(); L.trTm = setInterval(tick, 500); B.appendChild(tm);
    } else if (rev) {
      var mc = ans[me] === q[5], oc = ans[o] === q[5];
      B.appendChild(h('div', 'gTt', (mc ? '✅ You got it' : ans[me] == null ? '⏱ You did not answer' : '❌ Not this time') + ' · ' + opp().name + (oc ? ' got it ✅' : ans[o] == null ? ' did not answer' : ' missed ❌')));
    }
  }

  /* =================================================================== 🃏 COLOR CARDS (Uno-style) */
  var CC = ['R', 'Y', 'G', 'B'], CCOL = { R: '#ef4444', Y: '#eab308', G: '#22c55e', B: '#3b82f6' }, CNAME = { R: 'red', Y: 'yellow', G: 'green', B: 'blue' };
  var isWild = function (c) { return c === 'W' || c === 'F'; };
  function ccDeck() {
    var dk = [];
    CC.forEach(function (c) { dk.push(c + '0'); for (var n = 1; n <= 9; n++) dk.push(c + n, c + n); dk.push(c + 'S', c + 'S', c + 'D', c + 'D'); });
    for (var k = 0; k < 4; k++) dk.push('W', 'F');
    return shuf(dk);
  }
  function ccInit() {
    var dk = ccDeck(), h0 = dk.splice(0, 7), h1 = dk.splice(0, 7), top = 'R0';
    for (var k = 0; k < dk.length; k++) if (/^[RYGB][0-9]$/.test(dk[k])) { top = dk.splice(k, 1)[0]; break; }
    return { dk: dk, pl: [], h0: h0, h1: h1, top: top, col: top[0], t: 0, dd: 0, ln: null };
  }
  function ccOk(c, s) { return isWild(c) || c[0] === s.col || (!isWild(s.top) && c.slice(1) === s.top.slice(1)); }
  function ccTake(st, n, who) {
    for (var k = 0; k < n; k++) {
      if (!st.dk.length) { if (!st.pl.length) break; st.dk = shuf(st.pl); st.pl = []; }
      st[who].push(st.dk.pop());
    }
  }
  function ccCopy(s) { return { dk: s.dk.slice(), pl: s.pl.slice(), h0: s.h0.slice(), h1: s.h1.slice() }; }
  function ccPlay(j, wc) {
    var d = D(), s = d.s, i = idx(), hk = 'h' + i, ok = 'h' + (1 - i);
    if (d.st !== 'play' || s.t !== i) return;
    var c = s[hk][j];
    if (!c || !ccOk(c, s)) return;
    if (isWild(c) && !wc) return;
    var st = ccCopy(s);
    st[hk].splice(j, 1); st.pl.push(s.top);
    var col = isWild(c) ? wc : c[0], t = 1 - i;
    if (c[1] === 'S') t = i;
    else if (c[1] === 'D') { ccTake(st, 2, ok); t = i; }
    else if (c === 'F') { ccTake(st, 4, ok); t = i; }
    var ns = { dk: st.dk, pl: st.pl, h0: st.h0, h1: st.h1, top: c, col: col, t: t, dd: 0, ln: { u: my(), c: c, w: col } };
    if (!st[hk].length) return fin(my(), ns);
    upd({ s: ns });
  }
  function ccDrawOne() {
    var d = D(), s = d.s, i = idx();
    if (d.st !== 'play' || s.t !== i || s.dd) return;
    var st = ccCopy(s), hk = 'h' + i; ccTake(st, 1, hk);
    var card = st[hk][st[hk].length - 1], can = !!card && st[hk].length > s[hk].length && ccOk(card, s);
    upd({ s: Object.assign({}, s, { dk: st.dk, pl: st.pl, h0: st.h0, h1: st.h1, t: can ? i : 1 - i, dd: can ? 1 : 0, ln: { u: my(), k: 'd' } }) });
  }
  function ccPass() {
    var d = D(), s = d.s, i = idx();
    if (d.st !== 'play' || s.t !== i || !s.dd) return;
    upd({ 's.t': 1 - i, 's.dd': 0, 's.ln': { u: my(), k: 'p' } });
  }
  function ccFace(c) { return c === 'W' ? '🌈' : c === 'F' ? '+4' : c[1] === 'S' ? '⛔' : c[1] === 'D' ? '+2' : c[1]; }
  function ccEl(c, cls, tag) {
    var e = h(tag || 'div', 'gCc ' + (cls || ''), ccFace(c));
    if (tag) e.type = 'button';
    e.style.background = isWild(c) ? 'conic-gradient(#ef4444 0 25%,#eab308 0 50%,#22c55e 0 75%,#3b82f6 0)' : CCOL[c[0]];
    return e;
  }
  function ccText(l, me) {
    if (!l) return '';
    var w = l.u === me ? 'You' : opp().name;
    if (l.k === 'd') return w + ' drew a card';
    if (l.k === 'p') return w + ' passed';
    var n = l.c[1] === 'D' ? ' +2 → skip' : l.c === 'F' ? ' +4 → skip' : l.c[1] === 'S' ? ' skip' : '';
    return w + ' played ' + (isWild(l.c) ? 'a wild card → ' + CNAME[l.w] : CNAME[l.c[0]] + ' ' + ccFace(l.c)) + n;
  }
  function rCards(B) {
    var d = D(), s = d.s, i = idx(), me = my(), L = G.loc(), mine = d.st === 'play' && s.t === i;
    var hand = (s['h' + i] || []).map(function (c, j) { return { c: c, j: j }; }), oc = (s['h' + (1 - i)] || []).length;
    var ord = function (c) { return isWild(c) ? 9 : CC.indexOf(c[0]); };
    hand.sort(function (a, b) { return ord(a.c) - ord(b.c) || (a.c.slice(1) > b.c.slice(1) ? 1 : -1); });
    B.appendChild(h('div', 'gmSt', d.st !== 'play' ? 'Game over' : mine ? (s.dd ? 'You drew a playable card · play it or pass' : 'Your turn · play a card or draw') : opp().name + '’s turn'));
    var top = h('div', 'gCcRow'); top.appendChild(h('div', 'gmNote', opp().name + ': ' + oc + ' card' + (oc === 1 ? '' : 's')));
    B.appendChild(top);
    var back = h('div', 'gCcRow'); back.style.margin = '8px 0 0';
    for (var k = 0; k < Math.min(oc, 12); k++) back.appendChild(h('div', 'gCc sm back'));
    B.appendChild(back);
    var mid = h('div', 'gCcMid'), pile = mkb('gCc lg back', '🂠', ccDrawOne); pile.disabled = !mine || !!s.dd; if (!mine || s.dd) pile.className += ' dim';
    mid.appendChild(pile);
    var tc = ccEl(s.top, 'lg'); tc.style.borderColor = CCOL[s.col]; tc.style.boxShadow = '0 0 0 3px ' + CCOL[s.col] + ',0 4px 12px #0007'; mid.appendChild(tc);
    B.appendChild(mid);
    B.appendChild(h('div', 'gmNote', '')).innerHTML = '<span class="gCcDot" style="background:' + CCOL[s.col] + '"></span>Colour: ' + CNAME[s.col] + ' · draw pile ' + s.dk.length;
    var lt = ccText(s.ln, me); if (lt) B.appendChild(h('div', 'gmNote', lt));
    if (L.ccW != null && mine && hand.some(function (x) { return x.j === L.ccW; })) {
      B.appendChild(h('div', 'gmNote', 'Choose a colour'));
      var pk = h('div', 'gCcPick');
      CC.forEach(function (c) { var b = mkb('', '', function () { var j = L.ccW; L.ccW = null; ccPlay(j, c); }); b.style.background = CCOL[c]; pk.appendChild(b); });
      B.appendChild(pk);
      B.appendChild(mkb('btn l', 'Cancel', function () { L.ccW = null; G.render(); }));
    }
    var row = h('div', 'gCcRow'); row.style.marginTop = '14px';
    hand.forEach(function (x) {
      var can = mine && ccOk(x.c, s), e = ccEl(x.c, can ? '' : 'dim', 'button');
      e.disabled = !can;
      e.onclick = function () { if (isWild(x.c)) { L.ccW = x.j; G.render(); } else ccPlay(x.j); };
      row.appendChild(e);
    });
    B.appendChild(row);
    if (mine && s.dd) B.appendChild(mkb('btn l', 'Pass ➜', ccPass));
    B.appendChild(h('div', 'gmNote', 'Your cards: ' + hand.length));
  }

  /* ------------------------------------------------------------------ register */
  G.reg('dots', { name: 'Dots & Boxes', icon: '🔲', init: dbInit, render: rDots });
  G.reg('bship', { name: 'Battleship', icon: '🚢', init: bsInit, render: rBship });
  G.reg('trivia', { name: 'Trivia Duel', icon: '❓', init: trInit, render: rTrivia, arb: trArb });
  G.reg('cards', { name: 'Color Cards', icon: '🃏', init: ccInit, render: rCards });

  window.__games60 = { dbMove: dbMove, bsRandom: bsRandom, bsFire: bsFire, trReveal: trReveal, trNext: trNext, trArb: trArb, ccInit: ccInit, ccPlay: ccPlay, ccDrawOne: ccDrawOne, ccPass: ccPass, ccOk: ccOk, QB: QB, FLEET: FLEET };
})();
