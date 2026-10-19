/* OnlyUs voice-fix.js (v45)
   1. Correct voice note length: the sender now stores the real length (m.dur). Old voice notes get it by decoding the audio.
      (Recorded WebM files have no length in their header, so <audio>.duration is wrong or Infinity: that was the "15 s shows 3 min" bug.)
   2. Waveform/decoding uses ONE offline decoder instead of a new AudioContext per message (they piled up and spoiled playback).
   3. Speech-to-text during recording is now optional (Settings > Voice note text). On many phones it shares the mic and makes the recording quiet/muffled. Default Off. */
(function () {
  'use strict';
  const K = 'onlyus-vtt';
  const vttOn = () => { try { return localStorage.getItem(K) === '1'; } catch (e) { return false; } };
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const fmt = s => (isFinite(s) && s >= 0) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '';

  let OC;
  const decode = buf => {
    OC = OC || new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 44100);
    return new Promise((res, rej) => { const p = OC.decodeAudioData(buf, res, rej); if (p && p.catch) p.catch(rej); });
  };

  // remembered waveform + length per voice note (small, newest 150 kept)
  const WK = 'onlyus-wf'; let WF = null;
  const wkey = s => s.length > 90 ? s.length + ':' + s.slice(-70) : s;
  const wfGet = k => { if (!WF) { try { WF = JSON.parse(localStorage.getItem(WK) || '{}'); } catch (e) { WF = {}; } } return WF[k]; };
  const wfSet = (k, val) => { wfGet(k); WF[k] = val; const ks = Object.keys(WF); if (ks.length > 150) ks.slice(0, ks.length - 150).forEach(x => delete WF[x]); try { localStorage.setItem(WK, JSON.stringify(WF)); } catch (e) {} };

  const AU = new Map(), DUR = new Map(), PK = new Map();
  let playing = null;

  // v56: voice notes are small, so each one is downloaded ONCE, its real format is read from the first bytes, and it is
  // played from a local blob. The same download gives the waveform and the length. This avoids CDN / service-worker range and
  // content-type problems that made some voice notes silent. If the download fails we fall back to the plain web address
  // and any real error is shown in a toast (instead of the play button silently going back).
  const sniff = u8 => {
    const t = (o, str) => str.split('').every((c, i) => u8[o + i] === c.charCodeAt(0));
    if (u8.length > 11 && t(4, 'ftyp')) return 'audio/mp4';
    if (u8[0] === 0x1A && u8[1] === 0x45 && u8[2] === 0xDF && u8[3] === 0xA3) return 'audio/webm';
    if (t(0, 'OggS')) return 'audio/ogg';
    if (t(0, 'RIFF')) return 'audio/wav';
    if (t(0, 'ID3') || (u8[0] === 0xFF && (u8[1] & 0xE0) === 0xE0)) return 'audio/mpeg';
    return '';
  };
  const toast = m => { try { window.__us.toast(m); } catch (e) {} };
  const errName = a => { const c = a && a.error && a.error.code; return ({ 1: 'aborted', 2: 'network', 3: 'decode', 4: 'format not supported' })[c] || ''; };
  const FILES = new Map();   // src -> Promise<{url,type}>
  function getFile(src) {
    let p = FILES.get(src);
    if (!p) {
      p = fetch(src).then(r => {
        if (!r.ok) throw new Error('download ' + r.status);
        return r.arrayBuffer().then(buf => ({ buf, ct: r.headers.get('content-type') || '' }));
      }).then(o => {
        if (!o.buf.byteLength) throw new Error('empty file');
        const type = sniff(new Uint8Array(o.buf.slice(0, 16))) || o.ct || 'audio/webm';
        return { url: URL.createObjectURL(new Blob([o.buf], { type })), type };
      });
      FILES.set(src, p); p.catch(() => FILES.delete(src));
    }
    return p;
  }
  function attach(a, src) {   // gives the <audio> its local blob (once)
    if (a.__ready) return a.__ready;
    a.__ready = getFile(src).then(f => { a.__type = f.type; if (!a.__direct) a.src = f.url; return f; }).catch(err => { a.__ready = null; throw err; });
    return a.__ready;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // v57: after play() resolves, check that the sound REALLY moves. If it is stuck (no progress), the element is reset and
  // the voice note is downloaded again from scratch; if that fails too, the plain address is tried, then a toast shows details.
  async function progressed(a) { const t0 = a.currentTime; await wait(1300); return a.paused || a.ended || a.currentTime > t0 + 0.05; }
  const diag = a => 'ready ' + a.readyState + ', net ' + a.networkState + ', ' + (errName(a) || 'no error') + ', ' + (a.__type || 'unknown type') + (a.__direct ? ', direct' : '');
  async function startPlay(a, src) {
    const step = async () => { await a.play(); return progressed(a); };
    try {
      if (!a.src) { try { await attach(a, src); } catch (e) { a.src = src; a.__direct = 1; } }
      if (await step()) return true;
    } catch (err) {
      if (err && err.name === 'NotAllowedError') { toast('Tap play again'); return false; }
      if (err && err.name === 'AbortError') return false;
    }
    try {                                   // stuck or failed: reset the element and download again
      a.pause(); FILES.delete(src); a.__ready = null; a.__direct = 0;
      a.removeAttribute('src'); a.load();
      await attach(a, src);
      if (await step()) return true;
    } catch (e2) {}
    try {                                   // last try: the plain web address
      a.pause(); a.__direct = 1; a.src = src; a.load();
      if (await step()) return true;
    } catch (e3) {}
    toast('Voice note cannot play: ' + diag(a));
    return false;
  }

  // same size for every voice note (they were stretched to the width of long reply quotes)
  const css = document.createElement('style');
  css.textContent = '.fxA{width:250px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box}.fxA .fxW{flex:1 1 auto!important;min-width:0!important;width:auto!important}.fxA .fxP,.fxA .fxS{flex:none}.fxA small{flex:none;min-width:34px;text-align:right}';
  document.head.appendChild(css);

  // v58: "read" voice notes + auto-play of the next one
  const PK_KEY = 'onlyus-played', AUTO_KEY = 'onlyus-vauto';
  let PLAYED = null;
  const playedSet = () => { if (!PLAYED) { try { PLAYED = JSON.parse(localStorage.getItem(PK_KEY) || '[]'); } catch (e) { PLAYED = []; } if (!Array.isArray(PLAYED)) PLAYED = []; } return PLAYED; };
  const isPlayed = k => playedSet().indexOf(k) >= 0;
  const markPlayed = k => { const a = playedSet(); if (a.indexOf(k) >= 0) return false; a.push(k); if (a.length > 400) a.splice(0, a.length - 400); try { localStorage.setItem(PK_KEY, JSON.stringify(a)); } catch (e) {} return true; };
  const autoOn = () => { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch (e) { return true; } };
  // the next voice note right below this one (stops at any other kind of message), skipping ones already heard
  function nextNote(w) {
    const cur = w.closest && w.closest('.m'); if (!cur) return null;
    let n = cur.nextElementSibling;
    while (n) {
      if (n.classList.contains('day')) { n = n.nextElementSibling; continue; }
      const f = n.querySelector && n.querySelector('.fxA');
      if (!f || f.__mine !== w.__mine) return null;
      if (!f.__played()) return f;
      n = n.nextElementSibling;
    }
    return null;
  }

  function aud(d, m) {
    const src = m.url || m.data;
    let a = AU.get(src);
    if (!a) { a = new Audio(); a.preload = 'auto'; AU.set(src, a); }
    const w = el('div', 'fxA'), pb = el('button', 'fxP', '▶'), cv = el('canvas', 'fxW'), sp = el('button', 'fxS', '1×'), du = el('small', '', '');
    pb.type = sp.type = 'button'; cv.width = 180; cv.height = 34;
    w.append(pb, cv, sp, du); d.appendChild(w);

    let T = +m.dur > 0 ? +m.dur : (DUR.get(src) || 0), pk = PK.get(src) || null;
    const total = () => T || (isFinite(a.duration) ? a.duration : 0);
    const ratio = () => { const t = total(); return t ? Math.max(0, Math.min(1, a.currentTime / t)) : 0; };
    pb.textContent = a.paused ? '▶' : '⏸';
    sp.textContent = a.playbackRate + '×';

    const wk0 = wkey(src);
    const accent = () => { try { w.style.color = 'var(--acc,#25d366)'; return getComputedStyle(w).color || '#25d366'; } catch (e) { return '#25d366'; } };
    const dr = pr => {
      const x = cv.getContext('2d'), n = 45, bw = cv.width / n, acc = accent(), heard = isPlayed(wk0), moving = pr > 0;
      x.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < n; i++) {
        const v = pk ? pk[i] : .25 + .2 * Math.abs(Math.sin(i * 1.7 + src.length));
        const done = i / n <= pr;
        // never heard: grey. Heard: the chat's accent colour (from Settings). While playing: the played part is bright accent.
        if (heard) { x.globalAlpha = moving && !done ? .4 : 1; x.fillStyle = acc; }
        else { x.globalAlpha = 1; x.fillStyle = done && moving ? acc : '#ffffff66'; }
        const hh = Math.max(3, v * cv.height);
        x.fillRect(i * bw + 1, (cv.height - hh) / 2, bw - 2, hh);
      }
      x.globalAlpha = 1;
      w.classList.toggle('heard', heard);
    };
    dr(0); du.textContent = fmt(total());

    // waveform + (for old voice notes) the true length, from the decoded audio.
    // v50: only when the bubble is on screen, and remembered on this phone so it is never decoded twice
    const wk = wkey(src), saved = wfGet(wk);
    if (saved) { if (!T && saved.t) { T = saved.t; DUR.set(src, T); } if (!pk && saved.p) { pk = saved.p.map(x => x / 100); PK.set(src, pk); } dr(0); du.textContent = fmt(total()); }
    const decodeWave = () => getFile(src).then(f => fetch(f.url)).then(r => r.arrayBuffer()).then(decode).then(bf => {
      if (!T) { T = bf.duration; DUR.set(src, T); }
      const ch = bf.getChannelData(0), n = 45, s = Math.max(1, Math.floor(ch.length / n)), step = Math.max(1, Math.ceil(s / 200));
      const out = []; let mx = 0;
      for (let i = 0; i < n; i++) { let t = 0; for (let j = 0; j < s; j += step) t = Math.max(t, Math.abs(ch[i * s + j] || 0)); out.push(t); mx = Math.max(mx, t); }
      pk = out.map(v => v / (mx || 1)); PK.set(src, pk);
      wfSet(wk, { t: T, p: pk.map(v => Math.round(v * 100)) });
      dr(ratio()); if (a.paused) du.textContent = fmt(total());
    }).catch(() => {});
    // when the bubble is on screen: download the voice note once (play-ready), then draw the waveform / length if needed
    const onScreen = () => { dr(ratio()); attach(a, src).then(() => { if (!pk || !T) decodeWave(); }).catch(() => {}); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); onScreen(); } }, { rootMargin: '120px' });
      io.observe(w);
    } else onScreen();

    const meNum = (() => { try { return window.__us.me().num; } catch (e) { return null; } })();
    w.__mine = !!meNum && m.from === meNum;
    w.__played = () => isPlayed(wk0);
    const heardNow = () => { if (markPlayed(wk0)) dr(ratio()); };
    a.ontimeupdate = () => {
      if (a.currentTime > 0.6) heardNow();            // started listening = "read"
      dr(ratio()); du.textContent = fmt(Math.min(a.currentTime, total() || a.currentTime));
    };
    a.onended = () => {
      if (!T) { T = a.currentTime; DUR.set(src, T); } // no other source: the real length is where playback ended
      heardNow();
      pb.textContent = '▶'; a.currentTime = 0; dr(0); du.textContent = fmt(total());
      if (playing === a) playing = null;
      if (autoOn()) { const nx = nextNote(w); if (nx && nx.__start) setTimeout(() => nx.__start(), 250); }   // next voice note plays by itself
    };
    a.onpause = () => { pb.textContent = '▶'; };
    a.onplay = () => { pb.textContent = '⏸'; };

    const startNote = async () => {
      if (!a.paused) return;
      if (playing && playing !== a) playing.pause();
      playing = a; pb.textContent = '⏸';
      const ok = await startPlay(a, src);
      if (!ok) { pb.textContent = '▶'; if (playing === a) playing = null; }
    };
    w.__start = startNote;
    pb.onclick = async e => {
      e.stopPropagation();
      if (!a.paused) { a.pause(); pb.textContent = '▶'; return; }
      startNote();
    };
    sp.onclick = e => { e.stopPropagation(); const r = a.playbackRate === 1 ? 1.5 : a.playbackRate === 1.5 ? 2 : 1; a.playbackRate = r; sp.textContent = r + '×'; };
    cv.onclick = e => {
      e.stopPropagation();
      const t = total(); if (!t) return;
      const r = cv.getBoundingClientRect();
      a.currentTime = Math.max(0, Math.min(t, t * (e.clientX - r.left) / r.width));
      dr(ratio());
    };

    if (m.tr) {
      const t = el('div', 'fxTr', m.tr), b = el('button', 'fxS', 'Aa');
      t.style.display = 'none'; b.type = 'button'; b.title = 'Voice to text';
      b.onclick = e => { e.stopPropagation(); t.style.display = t.style.display === 'none' ? 'block' : 'none'; };
      w.appendChild(b); d.appendChild(t);
    }
  }

  function patch() {
    const fx = window.__fx;
    if (!fx || fx.__vf) return !!(fx && fx.__vf);
    fx.aud = aud;
    const o = fx.srStart;
    fx.srStart = function () { if (vttOn()) return o && o.apply(this, arguments); };
    fx.__vf = 1;
    return true;
  }

  function mountRow() {
    const after = document.getElementById('fxVl');
    if (!after || document.getElementById('vtRow')) return;
    const b = el('button', 'row'); b.id = 'vtRow'; b.type = 'button';
    b.innerHTML = 'Voice note text (transcript)<span id="vtSt"></span>';
    after.parentNode.insertBefore(b, after);
    const paint = () => { document.getElementById('vtSt').textContent = vttOn() ? 'On' : 'Off'; };
    b.onclick = () => {
      try { if (vttOn()) localStorage.removeItem(K); else localStorage.setItem(K, '1'); } catch (e) {}
      paint();
      try { window.__us.toast(vttOn() ? 'Transcript on. If voice notes sound quiet, turn it off.' : 'Transcript off: clearer recording'); } catch (e) {}
    };
    paint();
    const v = el('button', 'row'); v.id = 'vaRow'; v.type = 'button';
    v.innerHTML = 'Auto-play next voice note<span id="vaSt"></span>';
    after.parentNode.insertBefore(v, after);
    const paint2 = () => { document.getElementById('vaSt').textContent = autoOn() ? 'On' : 'Off'; };
    v.onclick = () => {
      try { if (autoOn()) localStorage.setItem(AUTO_KEY, '0'); else localStorage.removeItem(AUTO_KEY); } catch (e) {}
      paint2();
      try { window.__us.toast(autoOn() ? 'Next voice note plays automatically' : 'Auto-play off'); } catch (e) {}
    };
    paint2();
  }

  mountRow();
  if (!patch()) { let n = 0; const iv = setInterval(() => { if (patch() || ++n > 40) clearInterval(iv); }, 250); }
  window.__voiceFix = { fmt, aud };
})();
