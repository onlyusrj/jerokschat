/* OnlyUs stickers-pack.js (v44)
   - New sticker/GIF button next to the attach (clip) button
   - Panel: Recent | Panda & Bear couple pack (original art, ~60 stickers) | My stickers | GIF
   - Import WhatsApp stickers: pick .webp/.png/.gif files (many at once) or a .wastickers / .zip pack
   - Built-in stickers are tiny animated SVGs (sent as image messages, move on both phones)
*/
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const U = () => window.__us;
  const toast = m => { try { U().toast(m); } catch (e) { alert(m); } };
  const LS = { g: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, s: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------------- art */
  const PINK = '#ff7a9c', RED = '#ff4d6d', INK = '#2b2233';
  const heart = (x, y, s, c, cls) => `<path class="${cls || ''}" transform="translate(${x} ${y}) scale(${s})" fill="${c || RED}" d="M0 10C-18-4-10-20 0-9 10-20 18-4 0 10z"/>`;
  const star = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" fill="${c || '#ffd23f'}" d="M0-10 3-3 10-3 4 2 6 10 0 5-6 10-4 2-10-3-3-3z"/>`;

  // face parts. e = expression
  function eyes(e, ink) {
    const L = -17, R = 17, y = -4;
    const dot = x => `<circle cx="${x}" cy="${y}" r="5.2" fill="${ink}"/><circle cx="${x + 1.8}" cy="${y - 2}" r="1.7" fill="#fff"/>`;
    const arc = (x, up) => `<path d="M${x - 6} ${y + (up ? 3 : -1)} Q${x} ${y + (up ? -6 : 7)} ${x + 6} ${y + (up ? 3 : -1)}" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    switch (e) {
      case 'love': return [L, R].map(x => heart(x, y + 1, .55, RED)).join('');
      case 'happy': case 'laugh': return arc(L, true) + arc(R, true);
      case 'sleep': return arc(L, false) + arc(R, false);
      case 'wink': return dot(L) + arc(R, true);
      case 'sad': case 'cry': return dot(L) + dot(R) + `<path d="M${L - 8} ${y - 9} L${L + 5} ${y - 12} M${R + 8} ${y - 9} L${R - 5} ${y - 12}" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
      case 'angry': return dot(L) + dot(R) + `<path d="M${L - 9} ${y - 13} L${L + 7} ${y - 8} M${R + 9} ${y - 13} L${R - 7} ${y - 8}" stroke="${ink}" stroke-width="3.4" stroke-linecap="round"/>`;
      case 'wow': return `<circle cx="${L}" cy="${y}" r="6.5" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="${R}" cy="${y}" r="6.5" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="${L}" cy="${y}" r="2.6" fill="${ink}"/><circle cx="${R}" cy="${y}" r="2.6" fill="${ink}"/>`;
      case 'shy': return arc(L, true) + arc(R, true);
      case 'smug': return `<path d="M${L - 6} ${y} H${L + 6} M${R - 6} ${y} H${R + 6}" stroke="${ink}" stroke-width="3.4" stroke-linecap="round"/>`;
      case 'dizzy': return [L, R].map(x => `<path d="M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`).join('');
      default: return dot(L) + dot(R);
    }
  }
  function mouth(e, ink) {
    const y = 12;
    switch (e) {
      case 'happy': case 'wink': case 'love': return `<path d="M-8 ${y} Q0 ${y + 9} 8 ${y}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'laugh': return `<path d="M-10 ${y - 1} Q0 ${y + 16} 10 ${y - 1}Z" fill="#7a2336"/><path d="M-5 ${y + 6} Q0 ${y + 11} 5 ${y + 6}" fill="${PINK}"/>`;
      case 'kiss': return `<path d="M0 ${y - 1} c-6-7-14 2 0 9 c14-7 6-16 0-9z" fill="${RED}"/>`;
      case 'sad': case 'cry': return `<path d="M-7 ${y + 5} Q0 ${y - 3} 7 ${y + 5}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'angry': return `<path d="M-7 ${y + 5} Q0 ${y - 2} 7 ${y + 5}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'wow': return `<ellipse cx="0" cy="${y + 3}" rx="4.5" ry="6" fill="#7a2336"/>`;
      case 'sleep': return `<path d="M-4 ${y + 2} Q0 ${y + 6} 4 ${y + 2}" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case 'shy': return `<path d="M-5 ${y + 2} Q-2 ${y + 6} 0 ${y + 2} Q2 ${y + 6} 5 ${y + 2}" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case 'smug': return `<path d="M-7 ${y + 2} Q2 ${y + 8} 9 ${y - 2}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'hungry': return `<path d="M-8 ${y} Q0 ${y + 10} 8 ${y}Z" fill="#7a2336"/><path d="M5 ${y + 3} q3 8 0 11" stroke="#7fd4ff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'dizzy': return `<path d="M-8 ${y + 3} q4-5 8 0 t8 0" stroke="${ink}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
      default: return `<path d="M-6 ${y + 1} Q0 ${y + 6} 6 ${y + 1}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
  }
  // character at (0,0) = centre of body. who 'p' panda, 'b' bear. e expression, arms: 'down'|'up'|'hug'|'cheeks'|'hold'
  function who(w, e, arms) {
    const P = w === 'p', skin = P ? '#ffffff' : '#b9794a', dark = P ? '#2b2733' : '#8e5530', belly = P ? '#f4f0ff' : '#e9c49a', ink = P ? '#2b2233' : '#3a2316';
    let s = '';
    // legs
    s += `<ellipse cx="-26" cy="66" rx="19" ry="14" fill="${dark}"/><ellipse cx="26" cy="66" rx="19" ry="14" fill="${dark}"/>`;
    // body
    s += `<ellipse cx="0" cy="38" rx="42" ry="40" fill="${skin}" stroke="${P ? '#d9d2e6' : '#9a6038'}" stroke-width="2"/><ellipse cx="0" cy="46" rx="24" ry="24" fill="${belly}" opacity="${P ? .7 : 1}"/>`;
    // arms
    const arm = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="19" transform="rotate(${r} ${x} ${y})" fill="${dark}"/>`;
    if (arms === 'up') s += arm(-46, 28, 150) + arm(46, 28, -150);
    else if (arms === 'hug') s += arm(-34, 52, -60) + arm(34, 52, 60);
    else if (arms === 'cheeks') s += arm(-36, 4, -20) + arm(36, 4, 20);
    else if (arms === 'hold') s += arm(-30, 44, -30) + arm(30, 44, 30);
    else s += arm(-46, 40, 14) + arm(46, 40, -14);
    // head
    s += `<g transform="translate(0 -34)">`;
    s += `<circle cx="-34" cy="-24" r="15" fill="${dark}"/><circle cx="34" cy="-24" r="15" fill="${dark}"/>`;
    if (!P) s += `<circle cx="-34" cy="-24" r="7" fill="#e9c49a"/><circle cx="34" cy="-24" r="7" fill="#e9c49a"/>`;
    s += `<ellipse cx="0" cy="0" rx="48" ry="42" fill="${skin}" stroke="${P ? '#d9d2e6' : '#9a6038'}" stroke-width="2"/>`;
    if (P) s += `<ellipse cx="-17" cy="-4" rx="12" ry="15" transform="rotate(24 -17 -4)" fill="${dark}"/><ellipse cx="17" cy="-4" rx="12" ry="15" transform="rotate(-24 17 -4)" fill="${dark}"/>`;
    if (!P) s += `<ellipse cx="0" cy="12" rx="19" ry="14" fill="#e9c49a"/>`;
    const blush = (e === 'shy' || e === 'love' || e === 'kiss') ? .85 : .55;
    s += `<ellipse cx="-30" cy="10" rx="8" ry="5" fill="${PINK}" opacity="${blush}"/><ellipse cx="30" cy="10" rx="8" ry="5" fill="${PINK}" opacity="${blush}"/>`;
    s += `<g>${P ? eyes(e, '#ffffff').replace(/stroke="#ffffff"/g, 'stroke="#fff"') : eyes(e, ink)}</g>`;
    s += `<ellipse cx="0" cy="6" rx="5" ry="3.6" fill="${P ? '#2b2733' : '#3a2316'}"/>`;
    s += mouth(e, P ? '#2b2733' : ink);
    if (e === 'cry') s += `<path class="tear" d="M-20 4 q-4 12 0 22 M20 4 q4 12 0 22" stroke="#6fc3ff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (e === 'sad') s += `<path d="M-20 4 q-3 8 0 12" stroke="#6fc3ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    if (e === 'angry') s += `<path d="M30-30 l6-6 M36-24 l8-2 M24-34 l1-8" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>`;
    s += `</g>`;
    return s;
  }
  const at = (x, y, sc, inner, cls) => `<g transform="translate(${x} ${y}) scale(${sc})"><g class="${cls || ''}">${inner}</g></g>`;

  // props
  const bigHeart = (x, y, s) => heart(x, y, s, RED, 'beat');
  const cup = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-12 -8h24v10a12 12 0 0 1-24 0z" fill="#fff" stroke="#c9a" stroke-width="2"/><path d="M12-4h6a6 6 0 0 1 0 12h-6" fill="none" stroke="#c9a" stroke-width="3"/><path d="M-12 -4h24" stroke="#a5683a" stroke-width="4"/><path class="steam" d="M-4-12q-4-6 0-10M4-12q-4-6 0-10" stroke="#bbb" stroke-width="2" fill="none"/></g>`;
  const rose = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 0V34" stroke="#3aa655" stroke-width="3"/><path d="M0 16q10-4 12 4" fill="#3aa655"/><circle r="9" fill="#ff3d63"/><path d="M-5 -2q5 6 10 0M-3 3q3 3 6 0" stroke="#b01e3f" stroke-width="2" fill="none"/></g>`;
  const phone = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-10" y="-17" width="20" height="34" rx="5" fill="#2b2733"/><rect x="-7" y="-13" width="14" height="24" rx="2" fill="#cfe8ff"/>${heart(0, -1, .5)}</g>`;
  const gift = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-15" y="-8" width="30" height="24" rx="3" fill="#7a5cff"/><rect x="-3" y="-8" width="6" height="24" fill="#ffd23f"/><rect x="-17" y="-14" width="34" height="9" rx="3" fill="#9b84ff"/><path d="M0-14q-12-12-12-2t12 2q12 10 12 0t-12-2" fill="none" stroke="#ffd23f" stroke-width="3"/></g>`;
  const balloon = (x, y, c) => `<g class="float" transform="translate(${x} ${y})"><ellipse rx="14" ry="17" fill="${c || RED}"/><path d="M0 17l-3 6h6z" fill="${c || RED}"/><path d="M0 23q-6 14 0 28" stroke="#999" fill="none" stroke-width="1.6"/><ellipse cx="-5" cy="-6" rx="3" ry="5" fill="#fff" opacity=".55"/></g>`;
  const food = (x, y, k) => ({
    pizza: `<g transform="translate(${x} ${y}) rotate(-20)"><path d="M0 22L-18-14Q0-24 18-14z" fill="#ffc857"/><path d="M-18-14Q0-24 18-14" stroke="#e0903a" stroke-width="5" fill="none"/><circle cx="-4" cy="-6" r="3.4" fill="#e5484d"/><circle cx="6" cy="2" r="3.4" fill="#e5484d"/></g>`,
    icecream: `<g transform="translate(${x} ${y})"><path d="M-10-2L0 28 10-2z" fill="#e3a857"/><circle cx="0" cy="-8" r="13" fill="#ff9ec4"/><circle cx="-4" cy="-10" r="2" fill="#fff" opacity=".8"/></g>`,
    cake: `<g transform="translate(${x} ${y})"><rect x="-18" y="0" width="36" height="20" rx="4" fill="#ffd9b0"/><path d="M-18 4q6 8 12 0t12 0 12 0v-4h-36z" fill="#fff"/><rect x="-2" y="-14" width="4" height="12" fill="#7ad7ff"/><path class="flame" d="M0-26q-5 6 0 10 5-4 0-10z" fill="#ffb02e"/></g>`,
    noodles: `<g transform="translate(${x} ${y})"><path d="M-20 0h40a20 18 0 0 1-40 0z" fill="#ff7a9c"/><path d="M-12-2q4-12 8 0t8 0 8 0" stroke="#ffd23f" stroke-width="3" fill="none"/><path d="M12-18l12 -14M16-16l12-12" stroke="#a5683a" stroke-width="2.5"/></g>`
  }[k]);
  const pillow = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-26" y="-14" width="52" height="30" rx="12" fill="#cdbbff"/>${heart(0, 0, .6, '#fff')}</g>`;
  const moon = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-20a20 20 0 1 0 18 28A16 16 0 0 1 0-20z" fill="#ffe27a"/></g>`;
  const zzz = (x, y) => `<g class="zzz" font-family="system-ui,sans-serif" font-weight="800" fill="#7a63ff"><text x="${x}" y="${y}" font-size="26">Z</text><text x="${x + 18}" y="${y - 22}" font-size="20">z</text><text x="${x + 32}" y="${y - 40}" font-size="15">z</text></g>`;
  const sparkles = (a) => a.map(([x, y, s]) => `<g class="tw">${star(x, y, s)}</g>`).join('');
  const cloud = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-26 8a12 12 0 0 1 4-23 16 16 0 0 1 30-2 12 12 0 0 1 2 25z" fill="#b9c7e6"/><path class="drop" d="M-14 14l-3 9M-2 14l-3 9M10 14l-3 9" stroke="#5aa7ff" stroke-width="3" stroke-linecap="round"/></g>`;
  const umbrella = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-34 0a34 30 0 0 1 68 0z" fill="#ff7a9c"/><path d="M0 0V30a6 6 0 0 1-12 0" stroke="#554" stroke-width="3" fill="none"/></g>`;
  const sun = (x, y) => `<g class="spin" transform="translate(${x} ${y})"><circle r="15" fill="#ffd23f"/>${[...Array(8)].map((_, i) => `<path d="M0-21V-29" stroke="#ffb02e" stroke-width="4" stroke-linecap="round" transform="rotate(${i * 45})"/>`).join('')}</g>`;
  const note = (x, y) => `<g class="float" fill="#7a63ff" transform="translate(${x} ${y})"><path d="M0 0v-24l14-4v24" stroke="#7a63ff" stroke-width="3" fill="none"/><circle cx="-4" cy="2" r="5"/><circle cx="10" cy="-2" r="5"/></g>`;
  const bubble = (txt, x, y) => `<g transform="translate(${x} ${y})"><rect x="-40" y="-18" width="80" height="34" rx="17" fill="#fff" stroke="#e4d6ff" stroke-width="2"/><path d="M-6 16l6 12 6-12z" fill="#fff"/><text x="0" y="5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="19" fill="${INK}">${esc(txt)}</text></g>`;
  const bye = () => `<g class="wave" transform="translate(52 6)"><path d="M0 0q8-14 14 0" stroke="${INK}" stroke-width="3" fill="none"/></g>`;

  /* ---------- caption (bottom ribbon) */
  const caption = (t, color) => {
    if (!t) return '';
    const w = Math.min(236, 22 + t.length * 15.5);
    return `<g transform="translate(128 232)"><rect x="${-w / 2}" y="-19" width="${w}" height="38" rx="19" fill="${color || '#fff'}" stroke="#fff" stroke-width="4"/><rect x="${-w / 2}" y="-19" width="${w}" height="38" rx="19" fill="${color || '#fff'}"/><text x="0" y="8" text-anchor="middle" font-family="'Baloo 2','Comic Sans MS','Trebuchet MS',system-ui,sans-serif" font-weight="800" font-size="23" fill="${color ? '#fff' : INK}">${esc(t)}</text></g>`;
  };

  /* ---------- sticker table: [id, caption, builder] — canvas is 256 x 256 */
  const solo = (w, e, arms, extra, over) => () => `${extra && extra.back || ''}${at(128, 112, 1.08, who(w, e, arms), 'bob')}${extra && extra.front || ''}`;
  const duo = (e1, e2, a1, a2, extra) => () => `${extra && extra.back || ''}${at(78, 124, .84, who('p', e1, a1), 'bob')}${at(178, 124, .84, who('b', e2, a2), 'bob2')}${extra && extra.front || ''}`;
  const H = (x, y, s) => bigHeart(x, y, s || 1);
  const S = [
    // --- love & affection
    ['Love you', 'Love u da', duo('love', 'love', 'up', 'up', { front: H(128, 58, 1.7) + H(110, 44, .7) + H(150, 40, .6) })],
    ['Love you 2', 'Love u di', duo('love', 'love', 'hug', 'hug', { front: H(128, 70, 1.4) })],
    ['Hug', 'Hug me', duo('happy', 'happy', 'hug', 'hug', { front: sparkles([[128, 62, 1.2], [50, 50, .9], [206, 56, .9]]) })],
    ['Kiss', 'Muah', duo('kiss', 'shy', 'down', 'cheeks', { front: H(120, 56, 1) + H(144, 40, .7) })],
    ['Kiss 2', 'Kissu', solo('b', 'kiss', 'down', { front: H(180, 70, 1.2) + H(200, 48, .7) })],
    ['Kiss 3', 'Kissu', solo('p', 'kiss', 'down', { front: H(180, 70, 1.2) + H(200, 48, .7) })],
    ['Heart', 'My heart', solo('p', 'love', 'hold', { front: H(128, 168, 2.1) })],
    ['Heart 2', 'My heart', solo('b', 'love', 'hold', { front: H(128, 168, 2.1) })],
    ['Rose', 'For you', solo('b', 'shy', 'hold', { front: rose(128, 156) })],
    ['Rose 2', 'For you', solo('p', 'shy', 'hold', { front: rose(128, 156) })],
    ['Cuddle', 'Cuddle?', duo('shy', 'love', 'cheeks', 'hug', { back: H(128, 40, 1.1) })],
    ['Soulmates', 'Only us', duo('happy', 'happy', 'hold', 'hold', { front: H(128, 44, 1.3) + sparkles([[40, 50, 1], [214, 60, 1]]) })],
    ['Forever', 'Forever', duo('love', 'love', 'hold', 'hold', { back: H(128, 56, 1.8) })],
    ['Cutie', 'Cutie', solo('p', 'shy', 'cheeks', { front: sparkles([[60, 56, 1.1], [200, 62, 1], [196, 150, .8]]) })],
    ['Cutie 2', 'Cutieee', solo('b', 'shy', 'cheeks', { front: sparkles([[60, 56, 1.1], [200, 62, 1], [60, 150, .8]]) })],
    ['Blush', 'Aww', duo('shy', 'shy', 'cheeks', 'cheeks', { front: H(128, 56, .9) })],
    ['Wink', 'Wink wink', solo('b', 'wink', 'hold', { front: H(184, 66, .9) })],
    ['Wink 2', 'Hey you', solo('p', 'wink', 'up', { front: H(184, 66, .9) })],
    // --- greetings & daily
    ['Good morning', 'Good morning', duo('happy', 'sleep', 'up', 'down', { back: sun(206, 44) })],
    ['Good morning 2', 'Morning', solo('p', 'happy', 'hold', { front: cup(128, 158), back: sun(206, 44) })],
    ['Good morning 3', 'Morning', solo('b', 'sleep', 'hold', { front: cup(128, 158), back: sun(206, 44) })],
    ['Good night', 'Good night', duo('sleep', 'sleep', 'down', 'down', { back: moon(206, 44, 1.2) + zzz(112, 56) })],
    ['Sleepy', 'Sleepy', solo('p', 'sleep', 'hold', { front: pillow(128, 168) + zzz(168, 76) })],
    ['Sleepy 2', 'Sleepy', solo('b', 'sleep', 'hold', { front: pillow(128, 168) + zzz(168, 76) })],
    ['Dream', 'Sweet dreams', solo('b', 'sleep', 'down', { back: moon(64, 50, 1.1) + sparkles([[196, 50, 1], [214, 90, .8]]) })],
    ['Hi', 'Hiii', solo('p', 'happy', 'up', { front: sparkles([[56, 56, 1], [204, 60, 1]]) })],
    ['Hi 2', 'Hello!', solo('b', 'happy', 'up', { front: sparkles([[56, 56, 1], [204, 60, 1]]) })],
    ['Bye', 'Bye bye', duo('happy', 'happy', 'up', 'up', {})],
    ['Call me', 'Call me', solo('p', 'happy', 'hold', { front: phone(176, 140) })],
    ['Call me 2', 'Call me', solo('b', 'wow', 'hold', { front: phone(176, 140) })],
    ['Where', 'Enga da?', solo('b', 'wow', 'down', { front: bubble('?', 192, 52) })],
    ['Waiting', 'Waiting..', solo('p', 'sad', 'down', { front: bubble('...', 192, 52) })],
    ['Miss you', 'Miss u', duo('sad', 'sad', 'hold', 'hold', { back: H(128, 50, 1) })],
    ['Miss you 2', 'Miss u', solo('p', 'cry', 'cheeks', { front: H(196, 62, .8) })],
    ['Miss you 3', 'Miss u', solo('b', 'cry', 'cheeks', { front: H(196, 62, .8) })],
    // --- food & fun
    ['Hungry', 'Hungry', solo('b', 'hungry', 'hold', { front: food(128, 156, 'noodles') })],
    ['Hungry 2', 'Saapta?', solo('p', 'hungry', 'hold', { front: food(128, 156, 'pizza') })],
    ['Pizza', 'Pizza date', duo('happy', 'happy', 'hold', 'hold', { front: food(128, 150, 'pizza') })],
    ['Icecream', 'Ice cream', duo('happy', 'wow', 'hold', 'hold', { front: food(128, 150, 'icecream') })],
    ['Birthday', 'Happy B-day', duo('happy', 'happy', 'up', 'up', { front: food(128, 150, 'cake'), back: balloon(40, 60, '#ff7a9c') + balloon(216, 60, '#7ad7ff') })],
    ['Birthday 2', 'Birthday!!', solo('p', 'happy', 'up', { front: food(128, 168, 'cake') + sparkles([[50, 56, 1], [210, 60, 1]]) })],
    ['Gift', 'For you', solo('b', 'shy', 'hold', { front: gift(128, 156) })],
    ['Surprise', 'Surprise!', duo('wow', 'happy', 'up', 'up', { back: balloon(34, 64) + balloon(222, 64, '#ffd23f'), front: sparkles([[128, 44, 1.3]]) })],
    ['Music', 'Our song', duo('happy', 'happy', 'hold', 'hold', { back: note(120, 56) + note(160, 44) })],
    ['Dance', 'Dance?', duo('laugh', 'laugh', 'up', 'up', { back: note(116, 52) + note(156, 46) })],
    // --- feelings
    ['Sorry', 'Sorry da', solo('b', 'sad', 'hold', { front: H(128, 168, 1.5) })],
    ['Sorry 2', 'Sorry di', solo('p', 'cry', 'cheeks', {})],
    ['Please', 'Please..', solo('p', 'sad', 'hold', { front: sparkles([[60, 60, 1], [196, 60, 1]]) })],
    ['Thanks', 'Thank you', duo('happy', 'happy', 'hold', 'hold', { back: H(128, 50, 1) })],
    ['Angry', 'Kovam', solo('b', 'angry', 'down', {})],
    ['Angry 2', 'Hmph', solo('p', 'angry', 'cheeks', {})],
    ['Fight', 'Dei!', duo('angry', 'angry', 'down', 'down', {})],
    ['Sad', 'Sad', solo('b', 'sad', 'down', { front: cloud(196, 56) })],
    ['Cry', 'Crying', solo('p', 'cry', 'cheeks', {})],
    ['Cry 2', 'Crying', solo('b', 'cry', 'cheeks', {})],
    ['Laugh', 'LOL', duo('laugh', 'laugh', 'cheeks', 'cheeks', {})],
    ['Laugh 2', 'Haha', solo('b', 'laugh', 'cheeks', {})],
    ['Shock', 'OMG', solo('p', 'wow', 'up', { front: bubble('!!', 192, 52) })],
    ['Smug', 'Hmm okay', solo('b', 'smug', 'down', {})],
    ['Smug 2', 'Seri seri', solo('p', 'smug', 'hold', {})],
    ['Dizzy', 'Mind blown', solo('b', 'dizzy', 'cheeks', { front: sparkles([[58, 56, 1.1], [200, 56, 1.1]]) })],
    ['Tired', 'Tired', solo('p', 'sleep', 'down', { front: cup(184, 160) })],
    ['Busy', 'Busy..', solo('b', 'smug', 'hold', { front: phone(176, 144) })],
    ['Rain', 'Rainy day', duo('happy', 'happy', 'hold', 'hold', { back: umbrella(128, 46) + cloud(210, 32) })],
    ['OK', 'Okay!', duo('happy', 'wink', 'up', 'hold', {})],
    ['Yes', 'Yes!', solo('p', 'laugh', 'up', {})],
    ['No', 'Nooo', solo('b', 'wow', 'cheeks', {})],
    ['Kissy bye', 'Tata', duo('kiss', 'kiss', 'up', 'up', { front: H(128, 50, 1.1) })],
    ['Together', 'Us 4ever', duo('love', 'love', 'hold', 'hold', { front: sparkles([[128, 46, 1.2]]) })]
  ];

  const CSS = `
  .bob{animation:bob 1.6s ease-in-out infinite;transform-origin:center bottom}
  .bob2{animation:bob 1.6s ease-in-out .25s infinite}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .beat{animation:beat 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
  .tw{animation:tw 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  @keyframes tw{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.5);opacity:.5}}
  .float{animation:fl 2.4s ease-in-out infinite}
  @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .zzz{animation:zz 2s ease-in-out infinite}
  @keyframes zz{0%{opacity:.2;transform:translateY(8px)}60%{opacity:1}100%{opacity:.2;transform:translateY(-8px)}}
  .spin{animation:sp 8s linear infinite;transform-box:fill-box;transform-origin:center}
  @keyframes sp{to{transform:rotate(360deg)}}
  .steam,.drop,.tear{animation:zz 1.6s ease-in-out infinite}
  .flame{animation:beat .5s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom}
  .wave{animation:wv 1s ease-in-out infinite;transform-origin:52px 6px}
  @keyframes wv{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(14deg)}}`;

  function svg(i, animate) {
    const [, cap, build] = S[i];
    const body = build();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><defs><filter id="o" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feDropShadow in="w" dx="0" dy="1.5" stdDeviation="1.6" flood-color="#4b3a78" flood-opacity=".35" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>${animate ? `<style>${CSS}</style>` : ''}</defs><g filter="url(#o)">${body}</g>${caption(cap, '#8657d9')}</svg>`;
  }
  const dataUrl = (s) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));

  /* ---------------------------------------------------------------- storage (IndexedDB) */
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('onlyus-stickers', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('s', { keyPath: 'id' });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('s', mode), st = t.objectStore('s'); const rq = fn(st); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); }); };
  const allMine = () => Promise.race([tx('readonly', s => s.getAll()), new Promise((_, r) => setTimeout(r, 2500))]).then(a => (a || []).sort((x, y) => y.t - x.t)).catch(() => []);
  const putMine = o => tx('readwrite', s => s.put(o));
  const delMine = id => tx('readwrite', s => s.delete(id));

  /* ---------------------------------------------------------------- import */
  const MAXB = 520 * 1024; // keep each message well under Firestore's 1 MiB document limit
  const blobToUrl = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
  async function shrink(blob) {
    const bmp = await createImageBitmap(blob);
    let side = 512;
    for (let q = .9; ; q -= .15) {
      const sc = Math.min(1, side / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * sc)); c.height = Math.max(1, Math.round(bmp.height * sc));
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/webp', q);
      if (url.length * .75 < MAXB || q < .3) { if (bmp.close) bmp.close(); return url; }
      side = Math.round(side * .8);
    }
  }
  async function addBlob(blob, name) {
    const isAnim = /gif/i.test(blob.type) || /\.gif$/i.test(name || '');
    let url;
    if (blob.size <= MAXB && (/^image\/(webp|png|gif)$/.test(blob.type) || /\.(webp|png|gif)$/i.test(name || ''))) {
      // keep the original file: preserves transparency and WhatsApp animated stickers
      url = await blobToUrl(blob.type ? blob : new Blob([blob], { type: /\.png$/i.test(name) ? 'image/png' : /\.gif$/i.test(name) ? 'image/gif' : 'image/webp' }));
    } else if (isAnim) { return 'big'; } else { url = await shrink(blob); }
    await Promise.race([putMine({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), data: url, gif: isAnim }), new Promise((_, r) => setTimeout(() => r(new Error('storage timeout')), 4000))]);
    return 'ok';
  }
  async function importFiles(files) {
    let ok = 0, big = 0, bad = 0;
    for (const f of files) {
      try {
        if (/\.(wastickers|zip)$/i.test(f.name)) {
          if (!window.JSZip) { bad++; continue; }
          const z = await JSZip.loadAsync(f);
          for (const n of Object.keys(z.files)) {
            const e = z.files[n]; if (e.dir || !/\.(webp|png)$/i.test(n) || /tray|try|icon/i.test(n.split('/').pop())) continue;
            const b = await e.async('blob'); const r = await addBlob(new Blob([b], { type: /\.png$/i.test(n) ? 'image/png' : 'image/webp' }), n); r === 'ok' ? ok++ : big++;
          }
        } else { const r = await addBlob(f, f.name); r === 'ok' ? ok++ : big++; }
      } catch (e) { console.error(e); bad++; }
    }
    toast((ok ? ok + ' sticker' + (ok > 1 ? 's' : '') + ' added ✓' : 'Nothing added') + (big ? ' · ' + big + ' too big' : '') + (bad ? ' · ' + bad + ' failed' : ''));
    return ok;
  }
  function pickFiles(accept, multiple) {
    return new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple; i.style.display = 'none'; document.body.appendChild(i); i.onchange = () => { const a = [...i.files]; i.remove(); res(a); }; i.click(); });
  }

  /* ---------------------------------------------------------------- send */
  const recent = () => LS.g('onlyus-stk-recent', []);
  const pushRecent = k => { const r = recent().filter(x => x !== k); r.unshift(k); LS.s('onlyus-stk-recent', r.slice(0, 24)); };
  const sendSticker = (o, key) => { if (key) pushRecent(key); close(); try { U().send(o); } catch (e) { toast('Could not send'); } };

  /* ---------------------------------------------------------------- UI */
  let panel, tabs, grid, cur = 'pack', mine = [];
  const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const style = mk('style', '', `
  #stkb{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;flex:none}
  #stkb svg{width:24px;height:24px;fill:currentColor;opacity:.75}
  #stkb.on svg{opacity:1;fill:var(--acc,#8657d9)}
  #stkP{display:none;flex-direction:column;margin:0 10px 6px;border:1px solid var(--glass-border,var(--line));border-radius:22px;background:var(--glass-strong,var(--panel,#fff));overflow:hidden;height:min(330px,46vh)}
  #stkP.on{display:flex}
  #stkT{display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid var(--line);overflow-x:auto;flex:none}
  #stkT button{all:unset;cursor:pointer;flex:none;padding:7px 12px;border-radius:14px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap}
  #stkT button.on{background:var(--acc,#8657d9);color:#fff}
  #stkG{flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;align-content:start}
  #stkG .s{all:unset;cursor:pointer;border-radius:12px;padding:3px;display:flex;align-items:center;justify-content:center;aspect-ratio:1;position:relative}
  #stkG .s:active{background:var(--line);transform:scale(.94)}
  #stkG .s img{width:100%;height:100%;object-fit:contain;pointer-events:none}
  #stkG .full{grid-column:1/-1}
  #stkG .note{font-size:13px;color:var(--dim);padding:6px 4px;line-height:1.45}
  #stkG .act{all:unset;cursor:pointer;grid-column:1/-1;text-align:center;padding:11px;border-radius:14px;background:var(--acc,#8657d9);color:#fff;font-weight:700;font-size:14px}
  #stkG .act.g{background:var(--line);color:var(--ink)}
  #stkG input.q{grid-column:1/-1;padding:9px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-size:14px}
  #stkG .gifs{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,1fr);gap:5px}
  #stkG .gifs img{width:100%;border-radius:10px;cursor:pointer;background:var(--line)}
  @media (min-width:700px){#stkG{grid-template-columns:repeat(6,1fr)}}`);
  document.head.appendChild(style);

  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 2h-13A3.5 3.5 0 0 0 2 5.5v13A3.5 3.5 0 0 0 5.5 22H14a8 8 0 0 0 8-8V5.5A3.5 3.5 0 0 0 18.5 2zM5.5 4h13c.83 0 1.5.67 1.5 1.5V12h-3.5A4.5 4.5 0 0 0 12 16.5V20H5.5A1.5 1.5 0 0 1 4 18.5v-13C4 4.67 4.67 4 5.5 4zm8.5 14.9V16.5c0-1.38 1.12-2.5 2.5-2.5h2.4A6 6 0 0 1 14 18.9zM8 9.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zm6.5 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM8.2 12.2c1.1 1.3 3.2 1.3 4.3.2l1.2 1c-1.7 2-4.9 2-6.7 0z"/></svg>';

  function tile(src, onclick, extra) { const b = mk('button', 's'); b.type = 'button'; const i = new Image(); i.src = src; i.loading = 'lazy'; i.alt = 'sticker'; b.appendChild(i); b.onclick = onclick; if (extra) extra(b); return b; }

  async function render() {
    [...tabs.children].forEach(b => b.classList.toggle('on', b.dataset.t === cur));
    grid.textContent = ''; grid.scrollTop = 0;
    if (cur === 'recent') {
      const r = recent(); mine = await allMine(); const mm = new Map(mine.map(m => [m.id, m]));
      if (!r.length) grid.appendChild(mk('div', 'note full', 'Stickers you send show up here.'));
      r.forEach(k => {
        if (k[0] === 'b') { const i = +k.slice(1); if (S[i]) grid.appendChild(tile(dataUrl(svg(i, false)), () => sendSticker({ type: 'img', sticker: true, data: dataUrl(svg(i, true)) }, k))); }
        else { const m = mm.get(k.slice(2)); if (m) grid.appendChild(tile(m.data, () => sendSticker({ type: 'img', sticker: true, data: m.data }, k))); }
      });
    } else if (cur === 'pack') {
      S.forEach((s, i) => grid.appendChild(tile(dataUrl(svg(i, false)), () => sendSticker({ type: 'img', sticker: true, data: dataUrl(svg(i, true)) }, 'b' + i), b => b.title = s[0])));
    } else if (cur === 'mine') {
      const a = mk('button', 'act', '＋ Add stickers (WhatsApp .webp / photos / .wastickers pack)'); a.type = 'button';
      a.onclick = async () => { const f = await pickFiles('image/*,.webp,.wastickers,.zip', true); if (f.length && await importFiles(f)) render(); };
      grid.appendChild(a);
      grid.appendChild(mk('div', 'note full', 'How to bring WhatsApp stickers: in WhatsApp long-press a sticker → Share/Save, or use a sticker-pack exporter app, then pick the saved .webp files (many at once) or the .wastickers file here. Long-press a sticker below to delete it.'));
      mine = await allMine();
      const legacy = LS.g('onlyus-stk', []);
      mine.forEach(m => grid.appendChild(tile(m.data, () => sendSticker({ type: 'img', sticker: true, data: m.data }, 'u:' + m.id), b => hold(b, async () => { if (confirm('Delete this sticker?')) { await delMine(m.id); render(); } }))));
      legacy.forEach((d, idx) => grid.appendChild(tile(d, () => sendSticker({ type: 'img', sticker: true, data: d }), b => hold(b, () => { if (confirm('Delete this sticker?')) { const z = LS.g('onlyus-stk', []); z.splice(idx, 1); LS.s('onlyus-stk', z); render(); } }))));
      if (!mine.length && !legacy.length) grid.appendChild(mk('div', 'note full', 'Nothing here yet. Tap the button above.'));
    } else if (cur === 'gif') {
      const K = window.GIPHY_KEY;
      const a = mk('button', 'act g', '＋ Add my GIFs from phone'); a.type = 'button';
      a.onclick = async () => { const f = await pickFiles('image/gif,image/webp', true); if (f.length && await importFiles(f)) render(); };
      grid.appendChild(a);
      mine = await allMine();
      const mg = mine.filter(m => m.gif);
      if (mg.length) { const w = mk('div', 'gifs'); mg.forEach(m => { const i = new Image(); i.src = m.data; i.onclick = () => sendSticker({ type: 'img', gif: true, data: m.data }); hold(i, async () => { if (confirm('Delete this GIF?')) { await delMine(m.id); render(); } }); w.appendChild(i); }); grid.appendChild(w); }
      if (!K) { grid.appendChild(mk('div', 'note full', 'Online GIF search needs a free GIPHY key: put it in firebase-config.js as window.GIPHY_KEY (developers.giphy.com). Until then you can save your own GIFs above (each under 500 KB).')); return; }
      const q = mk('input', 'q'); q.placeholder = 'Search GIFs…'; const box = mk('div', 'gifs'); grid.append(q, box);
      const go = async t => { try { const j = await (await fetch('https://api.giphy.com/v1/gifs/' + (t ? 'search' : 'trending') + '?api_key=' + K + '&limit=20&rating=pg-13&q=' + encodeURIComponent(t || ''))).json(); box.textContent = ''; j.data.forEach(g => { const i = new Image(); i.src = g.images.fixed_height_small.url; i.onclick = () => sendSticker({ type: 'img', gif: true, url: g.images.downsized.url }); box.appendChild(i); }); } catch (e) { box.textContent = 'GIF search failed. Check internet.'; } };
      let tm; q.oninput = () => { clearTimeout(tm); tm = setTimeout(() => go(q.value.trim()), 400); }; go('');
    }
  }
  function hold(el, fn) { let t; el.oncontextmenu = e => { e.preventDefault(); fn(); }; el.ontouchstart = () => { t = setTimeout(fn, 700); }; el.ontouchend = el.ontouchmove = () => clearTimeout(t); }

  function open() {
    const emo = $('emo'); if (emo) emo.style.display = 'none';
    try { window.__closeAtt && window.__closeAtt(); } catch (e) {}
    panel.classList.add('on'); $('stkb').classList.add('on');
    if (!recent().length && cur === 'recent') cur = 'pack';
    render();
  }
  function close() { if (!panel) return; panel.classList.remove('on'); const b = $('stkb'); if (b) b.classList.remove('on'); }

  function mount() {
    const att = $('attb'), vc = $('vChat'), emo = $('emo');
    if (!att || !vc || !emo || $('stkb')) return;
    const b = mk('button', 'ic d', ICON); b.id = 'stkb'; b.type = 'button'; b.setAttribute('aria-label', 'Stickers and GIFs'); b.title = 'Stickers & GIFs';
    att.parentNode.insertBefore(b, att);
    panel = mk('div'); panel.id = 'stkP'; tabs = mk('div'); tabs.id = 'stkT'; grid = mk('div'); grid.id = 'stkG'; panel.append(tabs, grid);
    emo.parentNode.insertBefore(panel, emo.nextSibling);
    [['recent', '🕘 Recent'], ['pack', '🐼🐻 Us'], ['mine', '⭐ Mine'], ['gif', 'GIF']].forEach(([k, t]) => { const x = mk('button', '', t); x.type = 'button'; x.dataset.t = k; x.onclick = () => { cur = k; render(); }; tabs.appendChild(x); });
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (panel.classList.contains('on')) close(); else open(); });
    const eb = $('eb'); if (eb) eb.addEventListener('click', close, true);
    att.addEventListener('click', close, true);
    const ta = $('in'); if (ta) ta.addEventListener('focus', close);
    document.addEventListener('pointerdown', e => { if (panel.classList.contains('on') && !panel.contains(e.target) && !b.contains(e.target)) close(); }, true);
    window.__stickerPanel = { open, close };
  }
  window.__stickerPack = { count: S.length, svg, dataUrl };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  // chat view is built once, but retry briefly in case scripts load in a different order
  let n = 0; const iv = setInterval(() => { mount(); if ($('stkb') || ++n > 40) clearInterval(iv); }, 250);
})();
