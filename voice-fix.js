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

  // v55: voice notes that will not play. Some files (e.g. recorded on an iPhone, or served with the wrong type / range
  // headers by the CDN or the service worker) fail when the <audio> loads the web address directly. Fallback: download the
  // file, tell the browser its real format from the first bytes, and play it from a local blob. Real errors are shown.
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
  const tried = new WeakSet();
  async function safePlay(a, src) {
    try { await a.play(); return true; }
    catch (err) {
      if (err && err.name === 'NotAllowedError') { toast('Tap play again'); return false; }
      if (err && err.name === 'AbortError') return false;
    }
    if (tried.has(a)) { toast('Voice note cannot play (' + (errName(a) || 'unknown error') + ')'); return false; }
    tried.add(a);
    try {
      toast('Loading voice note…');
      const r = await fetch(src); if (!r.ok) throw new Error('download ' + r.status);
      const buf = await r.arrayBuffer(); if (!buf.byteLength) throw new Error('empty file');
      const type = sniff(new Uint8Array(buf.slice(0, 16))) || r.headers.get('content-type') || 'audio/webm';
      a.src = URL.createObjectURL(new Blob([buf], { type })); a.load();
      await a.play(); return true;
    } catch (err2) {
      toast('Voice note cannot play: ' + (errName(a) || (err2 && (err2.message || err2.name)) || 'unknown error'));
      return false;
    }
  }

  function aud(d, m) {
    const src = m.url || m.data;
    let a = AU.get(src);
    if (!a) { a = new Audio(); a.preload = 'metadata'; a.src = src; AU.set(src, a); }
    const w = el('div', 'fxA'), pb = el('button', 'fxP', '▶'), cv = el('canvas', 'fxW'), sp = el('button', 'fxS', '1×'), du = el('small', '', '');
    pb.type = sp.type = 'button'; cv.width = 180; cv.height = 34;
    w.append(pb, cv, sp, du); d.appendChild(w);

    let T = +m.dur > 0 ? +m.dur : (DUR.get(src) || 0), pk = PK.get(src) || null;
    const total = () => T || (isFinite(a.duration) ? a.duration : 0);
    const ratio = () => { const t = total(); return t ? Math.max(0, Math.min(1, a.currentTime / t)) : 0; };
    pb.textContent = a.paused ? '▶' : '⏸';
    sp.textContent = a.playbackRate + '×';

    const dr = pr => {
      const x = cv.getContext('2d'), n = 45, bw = cv.width / n;
      x.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < n; i++) {
        const v = pk ? pk[i] : .25 + .2 * Math.abs(Math.sin(i * 1.7 + src.length));
        x.fillStyle = i / n <= pr ? '#ff8ad8' : '#ffffff66';
        const hh = Math.max(3, v * cv.height);
        x.fillRect(i * bw + 1, (cv.height - hh) / 2, bw - 2, hh);
      }
    };
    dr(0); du.textContent = fmt(total());

    // waveform + (for old voice notes) the true length, from the decoded audio.
    // v50: only when the bubble is on screen, and remembered on this phone so it is never decoded twice
    const wk = wkey(src), saved = wfGet(wk);
    if (saved) { if (!T && saved.t) { T = saved.t; DUR.set(src, T); } if (!pk && saved.p) { pk = saved.p.map(x => x / 100); PK.set(src, pk); } dr(0); du.textContent = fmt(total()); }
    if (!pk || !T) {
      const run = () => fetch(src).then(r => r.arrayBuffer()).then(decode).then(bf => {
        if (!T) { T = bf.duration; DUR.set(src, T); }
        const ch = bf.getChannelData(0), n = 45, s = Math.max(1, Math.floor(ch.length / n)), step = Math.max(1, Math.ceil(s / 200));
        const out = []; let mx = 0;
        for (let i = 0; i < n; i++) { let t = 0; for (let j = 0; j < s; j += step) t = Math.max(t, Math.abs(ch[i * s + j] || 0)); out.push(t); mx = Math.max(mx, t); }
        pk = out.map(v => v / (mx || 1)); PK.set(src, pk);
        wfSet(wk, { t: T, p: pk.map(v => Math.round(v * 100)) });
        dr(ratio()); if (a.paused) du.textContent = fmt(total());
      }).catch(() => {});
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); run(); } }, { rootMargin: '120px' });
        io.observe(w);
      } else run();
    }

    a.ontimeupdate = () => { dr(ratio()); du.textContent = fmt(Math.min(a.currentTime, total() || a.currentTime)); };
    a.onended = () => {
      if (!T) { T = a.currentTime; DUR.set(src, T); } // no other source: the real length is where playback ended
      pb.textContent = '▶'; a.currentTime = 0; dr(0); du.textContent = fmt(total());
    };
    a.onpause = () => { pb.textContent = '▶'; };
    a.onplay = () => { pb.textContent = '⏸'; };

    pb.onclick = e => {
      e.stopPropagation();
      if (a.paused) {
        if (playing && playing !== a) playing.pause();
        playing = a;
        pb.textContent = '⏸';
        safePlay(a, src).then(ok => { if (!ok) { pb.textContent = '▶'; if (playing === a) playing = null; } });
      } else { a.pause(); pb.textContent = '▶'; }
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
  }

  mountRow();
  if (!patch()) { let n = 0; const iv = setInterval(() => { if (patch() || ++n > 40) clearInterval(iv); }, 250); }
  window.__voiceFix = { fmt, aud };
})();
