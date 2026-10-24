/* OnlyUs pro-media-v65.js
   1) Video message   - record a short round video (up to 60 s) and send it
   2) Document scanner - photograph paper, straighten + clean it, many pages -> one PDF
   3) Photo editor    - crop, rotate, draw, text, emoji before sending a photo
   Needs pro-v65.js (loaded first).  Uses the existing upload (window.__upl / window.__sendMedia) so nothing else changes. */
(function () {
  'use strict';
  var P = window.__proUI;
  var $ = function (id) { return document.getElementById(id); };
  var U = function () { return window.__us || {}; };
  var toast = function (m) { try { U().toast(m); } catch (e) {} };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var svg = P ? P.svg : function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };

  /* ============================================================ pure helpers (also unit-tested) */
  /* unit square (0,0)(1,0)(1,1)(0,1) -> quad p[0..3] (TL,TR,BR,BL): returns [a,b,c,d,e,f,g,h] */
  function sq2quad(p) {
    var x0 = p[0][0], y0 = p[0][1], x1 = p[1][0], y1 = p[1][1], x2 = p[2][0], y2 = p[2][1], x3 = p[3][0], y3 = p[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3, a, b, c, d, e, f, g, h;
    if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) { a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; h = 0; }
    else {
      var den = dx1 * dy2 - dx2 * dy1; g = (dx3 * dy2 - dx2 * dy3) / den; h = (dx1 * dy3 - dx3 * dy1) / den;
      a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0; d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
    }
    return [a, b, c, d, e, f, g, h];
  }
  function mapUV(H, u, v) { var w = H[6] * u + H[7] * v + 1; return [(H[0] * u + H[1] * v + H[2]) / w, (H[3] * u + H[4] * v + H[5]) / w]; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function outSize(c, maxSide) {
    var w = (dist(c[0], c[1]) + dist(c[3], c[2])) / 2, h = (dist(c[0], c[3]) + dist(c[1], c[2])) / 2, k = Math.min(1, maxSide / Math.max(w, h, 1));
    return [Math.max(40, Math.round(w * k)), Math.max(40, Math.round(h * k))];
  }
  /* perspective warp with bilinear sampling. src: {data,width,height} RGBA. returns Uint8ClampedArray (outW*outH*4) */
  function warp(src, corners, outW, outH) {
    var H = sq2quad(corners), out = new Uint8ClampedArray(outW * outH * 4), sw = src.width, sh = src.height, sd = src.data, i = 0;
    for (var y = 0; y < outH; y++) {
      var v = (y + 0.5) / outH;
      for (var x = 0; x < outW; x++) {
        var u = (x + 0.5) / outW, w = H[6] * u + H[7] * v + 1, sx = (H[0] * u + H[1] * v + H[2]) / w - 0.5, sy = (H[3] * u + H[4] * v + H[5]) / w - 0.5;
        if (sx < 0) sx = 0; else if (sx > sw - 1.001) sx = sw - 1.001; if (sy < 0) sy = 0; else if (sy > sh - 1.001) sy = sh - 1.001;
        var x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, p00 = (y0 * sw + x0) * 4, p10 = p00 + 4, p01 = p00 + sw * 4, p11 = p01 + 4;
        for (var k = 0; k < 3; k++) {
          var t = sd[p00 + k] * (1 - fx) + sd[p10 + k] * fx, b = sd[p01 + k] * (1 - fx) + sd[p11 + k] * fx; out[i + k] = t * (1 - fy) + b * fy;
        }
        out[i + 3] = 255; i += 4;
      }
    }
    return out;
  }
  function lumHist(d) { var h = new Uint32Array(256); for (var i = 0; i < d.length; i += 4) h[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8]++; return h; }
  function pct(h, total, p) { var s = 0, t = total * p; for (var i = 0; i < 256; i++) { s += h[i]; if (s >= t) return i; } return 255; }
  function filterEnhance(d) {
    var h = lumHist(d), n = d.length / 4, black = pct(h, n, 0.02), white = Math.max(black + 40, pct(h, n, 0.9)), sc = 255 / (white - black);
    var lut = new Uint8ClampedArray(256); for (var i = 0; i < 256; i++) lut[i] = 255 * Math.pow(Math.min(1, Math.max(0, (i - black) * sc / 255)), 0.92);
    for (var j = 0; j < d.length; j += 4) { d[j] = lut[d[j]]; d[j + 1] = lut[d[j + 1]]; d[j + 2] = lut[d[j + 2]]; }
  }
  function filterBW(d, w, h) {
    var n = w * h, g = new Uint8Array(n), i, x, y;
    for (i = 0; i < n; i++) g[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
    var W1 = w + 1, I = new Uint32Array(W1 * (h + 1));
    for (y = 0; y < h; y++) { var row = 0; for (x = 0; x < w; x++) { row += g[y * w + x]; I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + row; } }
    var r = Math.max(7, Math.round(Math.max(w, h) / 40));
    for (y = 0; y < h; y++) {
      var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      for (x = 0; x < w; x++) {
        var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), area = (x1 - x0) * (y1 - y0);
        var s = I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0], v = g[y * w + x] * area < s * 0.9 ? 0 : 255, p = (y * w + x) * 4;
        d[p] = d[p + 1] = d[p + 2] = v;
      }
    }
  }
  function otsu(g) {
    var h = new Uint32Array(256), n = g.length, i, sum = 0; for (i = 0; i < n; i++) { h[g[i]]++; sum += g[i]; }
    var sB = 0, wB = 0, best = 0, th = 127; for (i = 0; i < 256; i++) { wB += h[i]; if (!wB) continue; var wF = n - wB; if (!wF) break; sB += i * h[i]; var mB = sB / wB, mF = (sum - sB) / wF, bt = wB * wF * (mB - mF) * (mB - mF); if (bt > best) { best = bt; th = i; } }
    return th;
  }
  /* find the bright sheet of paper in a small grey image. returns 4 corners in 0..1 coords or null */
  function autoCorners(gray, w, h) {
    var th = otsu(gray), cols = new Uint32Array(w), rows = new Uint32Array(h), x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (gray[y * w + x] > th) { cols[x]++; rows[y]++; }
    var cMin = h * 0.12, rMin = w * 0.12, x0 = -1, x1 = -1, y0 = -1, y1 = -1;
    for (x = 0; x < w; x++) if (cols[x] > cMin) { if (x0 < 0) x0 = x; x1 = x; }
    for (y = 0; y < h; y++) if (rows[y] > rMin) { if (y0 < 0) y0 = y; y1 = y; }
    if (x0 < 0 || y0 < 0) return null;
    var area = (x1 + 1 - x0) * (y1 + 1 - y0) / (w * h); if (area < 0.25 || area > 0.985) return null;
    return [[x0 / w, y0 / h], [(x1 + 1) / w, y0 / h], [(x1 + 1) / w, (y1 + 1) / h], [x0 / w, (y1 + 1) / h]];
  }
  /* minimal PDF writer: pages = [{w,h,jpg:Uint8Array}] -> Uint8Array */
  function buildPdf(pages) {
    var enc = new TextEncoder(), chunks = [], off = 0, xref = [];
    function put(x) { var b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); off += b.length; }
    function obj(n, body) { xref[n] = off; put(n + ' 0 obj\n' + body + '\nendobj\n'); }
    put('%PDF-1.4\n'); put(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
    var kids = []; pages.forEach(function (p, i) { kids.push((3 + 3 * i) + ' 0 R'); });
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pages.length + ' >>');
    pages.forEach(function (p, i) {
      var pn = 3 + 3 * i, cn = pn + 1, im = pn + 2, W = 595, H = Math.max(100, Math.round(595 * p.h / p.w));
      obj(pn, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ' + cn + ' 0 R >>');
      var cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q'; obj(cn, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
      xref[im] = off; put(im + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpg.length + ' >>\nstream\n'); put(p.jpg); put('\nendstream\nendobj\n');
    });
    var n = 3 + 3 * pages.length, xo = off; put('xref\n0 ' + n + '\n0000000000 65535 f \n');
    for (var k = 1; k < n; k++) put(('0000000000' + xref[k]).slice(-10) + ' 00000 n \n');
    put('trailer\n<< /Size ' + n + ' /Root 1 0 R >>\nstartxref\n' + xo + '\n%%EOF\n');
    var out = new Uint8Array(off), p2 = 0; chunks.forEach(function (c) { out.set(c, p2); p2 += c.length; }); return out;
  }
  window.__proMedia = { sq2quad: sq2quad, mapUV: mapUV, warp: warp, outSize: outSize, filterEnhance: filterEnhance, filterBW: filterBW, otsu: otsu, autoCorners: autoCorners, buildPdf: buildPdf };
  if (!P || !window.__proAttach) return;

  /* ============================================================ shared UI bits */
  var css = el('style');
  css.textContent = [
    '.pmOv{position:fixed;inset:0;z-index:45;background:#000;color:#fff;display:none;flex-direction:column;padding-top:env(safe-area-inset-top,0px);-webkit-user-select:none;user-select:none;touch-action:none}.pmOv.on{display:flex;animation:proIn .2s ease both}',
    '.pmTop{display:flex;align-items:center;gap:8px;padding:8px 10px}.pmTop b{flex:1;font-size:17px}',
    '.pmB{all:unset;cursor:pointer;display:grid;place-items:center;min-width:42px;height:42px;border-radius:21px;color:#fff;padding:0 6px;box-sizing:border-box}.pmB svg{width:24px;height:24px}.pmB:active{background:rgba(255,255,255,.18)}.pmB[disabled]{opacity:.35}',
    '.pmGo{all:unset;cursor:pointer;background:var(--acc,#00a884);color:#fff;font-weight:700;padding:0 18px;height:40px;border-radius:20px;display:inline-grid;place-items:center;font-size:15px}.pmGo[disabled]{opacity:.5}',
    '.pmBar{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap;padding:8px 8px calc(10px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.07)}',
    '.pmT{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;border-radius:12px;font-size:12px;color:#ddd;min-width:54px}.pmT svg{width:22px;height:22px}.pmT.on{background:rgba(255,255,255,.18);color:#fff}',
    /* video message */
    '#pmVm .stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:10px}',
    '#pmVm .ring{position:relative;width:min(78vw,320px);height:min(78vw,320px)}#pmVm .ring video{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);border-radius:50%;object-fit:cover;background:#111}',
    '#pmVm .ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}#pmVm .ring circle{fill:none;stroke-width:6}',
    '#pmVm .tm{font-size:18px;font-variant-numeric:tabular-nums;min-height:24px}',
    '#pmVm .ctl{display:flex;align-items:center;justify-content:center;gap:34px;padding-bottom:calc(26px + env(safe-area-inset-bottom,0px))}',
    '#pmVm .rec{all:unset;cursor:pointer;width:74px;height:74px;border-radius:50%;border:5px solid #fff;box-sizing:border-box;display:grid;place-items:center}#pmVm .rec i{width:50px;height:50px;border-radius:50%;background:#ef4444;transition:all .15s}#pmVm .rec.on i{width:28px;height:28px;border-radius:7px}',
    /* scanner */
    '#pmSc .stage{flex:1;min-height:0;position:relative;display:grid;place-items:center;overflow:hidden}#pmSc canvas{max-width:100%;max-height:100%;touch-action:none}',
    '#pmSc .strip{display:flex;gap:8px;overflow-x:auto;padding:8px 10px;background:rgba(255,255,255,.05)}#pmSc .strip .th{flex:none;position:relative;width:46px;height:62px;border-radius:6px;overflow:hidden;border:2px solid transparent;background:#222}#pmSc .strip .th.on{border-color:var(--acc,#00a884)}#pmSc .strip .th canvas{width:100%;height:100%;object-fit:cover}',
    '#pmSc .strip .add{all:unset;cursor:pointer;flex:none;width:46px;height:62px;border-radius:6px;border:2px dashed #777;display:grid;place-items:center;color:#ccc;font-size:24px}',
    '#pmSc .hint{position:absolute;left:0;right:0;top:6px;text-align:center;font-size:12.5px;color:#ddd;pointer-events:none;text-shadow:0 1px 3px #000}',
    /* editor */
    '#pmEd .stage{flex:1;min-height:0;position:relative;display:grid;place-items:center;overflow:hidden}#pmEd .wrap{position:relative;line-height:0}#pmEd canvas{display:block;max-width:100vw;max-height:calc(100vh - 230px);touch-action:none}#pmEd .ov{position:absolute;left:0;top:0;pointer-events:auto}',
    '#pmEd .opt{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px 10px;min-height:46px}#pmEd .sw{all:unset;cursor:pointer;width:28px;height:28px;border-radius:50%;border:3px solid transparent;box-sizing:border-box;outline:1px solid rgba(255,255,255,.4)}#pmEd .sw.on{border-color:#fff}',
    '#pmEd .em{all:unset;cursor:pointer;font-size:26px;padding:2px 5px;border-radius:8px}#pmEd .em.on{background:rgba(255,255,255,.22)}#pmEd .sz{width:120px}',
    '#mpv .mpvB.proEdit{display:none}'
  ].join('\n');
  document.head.appendChild(css);
  function overlay(id) { var o = el('div', 'pmOv'); o.id = id; document.body.appendChild(o); return o; }
  function btn(cls, html, fn, label) { var b = el('button', cls); b.type = 'button'; b.innerHTML = html; if (label) b.setAttribute('aria-label', label); if (fn) b.onclick = fn; return b; }
  var X_ICON = svg('<path d="M6 6l12 12M18 6L6 18"/>', 2.2);

  /* ============================================================ 1) VIDEO MESSAGE */
  var vm = null;
  function vmMime() {
    var c = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (var i = 0; i < c.length; i++) { try { if (MediaRecorder.isTypeSupported(c[i])) return c[i]; } catch (e) {} }
    return '';
  }
  function openVM() {
    if (!U().cid || !U().cid()) return toast('Open a chat first');
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast('Video messages are not supported on this phone');
    if (vm) return;
    var o = overlay('pmVm'), st = { facing: 'user', stream: null, rec: null, chunks: [], t0: 0, tm: 0, blob: null, url: '' };
    var top = el('div', 'pmTop'), close = btn('pmB', X_ICON, function () { shut(); }, 'Close'); top.append(close, el('b', '', 'Video message'));
    var stage = el('div', 'stage'), ring = el('div', 'ring'), v = el('video'); v.playsInline = true; v.setAttribute('playsinline', ''); v.muted = true; v.autoplay = true;
    var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('viewBox', '0 0 100 100');
    var c0 = document.createElementNS(sv.namespaceURI, 'circle'), c1 = document.createElementNS(sv.namespaceURI, 'circle');
    [c0, c1].forEach(function (c) { c.setAttribute('cx', 50); c.setAttribute('cy', 50); c.setAttribute('r', 47); c.setAttribute('vector-effect', 'non-scaling-stroke'); }); c0.setAttribute('stroke', 'rgba(255,255,255,.22)'); c1.setAttribute('stroke', '#ef4444'); c1.setAttribute('stroke-linecap', 'round');
    var CIRC = 2 * Math.PI * 47; c1.setAttribute('stroke-dasharray', CIRC); c1.setAttribute('stroke-dashoffset', CIRC); sv.append(c0, c1); ring.append(v, sv);
    var tmEl = el('div', 'tm', 'Tap the red button to record'), ctl = el('div', 'ctl');
    var flip = btn('pmB', svg('<path d="M20 7H8a4 4 0 00-4 4v1M4 17h12a4 4 0 004-4v-1M17 4l3 3-3 3M7 20l-3-3 3-3"/>'), function () { st.facing = st.facing === 'user' ? 'environment' : 'user'; cam(); }, 'Switch camera');
    var rec = btn('rec', '<i></i>', function () { if (st.rec && st.rec.state === 'recording') stop(); else if (st.blob) { /* in review */ } else start(); }, 'Record');
    var retake = btn('pmB', svg('<path d="M4 12a8 8 0 108-8M4 4v5h5"/>'), function () { review(false); cam(); }, 'Retake'); retake.style.display = 'none';
    var send = el('button', 'pmGo', 'Send'); send.type = 'button'; send.style.display = 'none';
    ctl.append(flip, rec, retake, send); stage.append(ring, tmEl, ctl); o.append(top, stage); o.classList.add('on'); vm = o;
    function shut() { clearInterval(st.tm); try { if (st.rec && st.rec.state === 'recording') { st.rec.onstop = null; st.rec.stop(); } } catch (e) {} if (st.stream) st.stream.getTracks().forEach(function (t) { t.stop(); }); if (st.url) URL.revokeObjectURL(st.url); o.remove(); vm = null; }
    function cam() {
      if (st.stream) st.stream.getTracks().forEach(function (t) { t.stop(); });
      navigator.mediaDevices.getUserMedia({ video: { facingMode: st.facing, width: { ideal: 640 }, height: { ideal: 640 } }, audio: { echoCancellation: true, noiseSuppression: true } }).then(function (s) {
        st.stream = s; v.srcObject = s; v.muted = true; v.loop = false; v.style.transform = st.facing === 'user' ? 'scaleX(-1)' : ''; v.play().catch(function () {});
      }).catch(function (e) { toast(e && e.name === 'NotAllowedError' ? 'Allow camera and microphone to record' : 'Could not open the camera'); shut(); });
    }
    function setProg(f) { c1.setAttribute('stroke-dashoffset', CIRC * (1 - Math.min(1, f))); }
    function start() {
      if (!st.stream) return; st.chunks = []; var mime = vmMime(), r;
      try { r = new MediaRecorder(st.stream, mime ? { mimeType: mime, videoBitsPerSecond: 900000, audioBitsPerSecond: 64000 } : undefined); } catch (e) { return toast('Recording is not supported on this phone'); }
      st.rec = r; r.ondataavailable = function (e) { if (e.data && e.data.size) st.chunks.push(e.data); };
      r.onstop = function () {
        clearInterval(st.tm); var dur = Date.now() - st.t0; rec.classList.remove('on'); flip.style.display = '';
        if (dur < 1000) { toast('Too short. Hold on a little longer'); setProg(0); tmEl.textContent = 'Tap the red button to record'; return; }
        st.blob = new Blob(st.chunks, { type: (r.mimeType || mime || 'video/webm').split(';')[0] }); review(true);
      };
      r.start(250); st.t0 = Date.now(); rec.classList.add('on'); flip.style.display = 'none';
      st.tm = setInterval(function () { var s = (Date.now() - st.t0) / 1000; setProg(s / 60); tmEl.textContent = Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2) + ' / 1:00'; if (s >= 60) stop(); }, 100);
    }
    function stop() { try { if (st.rec && st.rec.state === 'recording') st.rec.stop(); } catch (e) {} }
    function review(on) {
      if (on) {
        if (st.stream) st.stream.getTracks().forEach(function (t) { t.stop(); }); st.stream = null; st.url = URL.createObjectURL(st.blob);
        v.srcObject = null; v.src = st.url; v.muted = false; v.loop = true; v.play().catch(function () {}); rec.style.display = 'none'; retake.style.display = ''; send.style.display = ''; tmEl.textContent = 'Preview'; setProg(1);
      } else {
        if (st.url) URL.revokeObjectURL(st.url); st.url = ''; st.blob = null; v.removeAttribute('src'); rec.style.display = ''; retake.style.display = 'none'; send.style.display = 'none'; tmEl.textContent = 'Tap the red button to record'; setProg(0);
      }
    }
    send.onclick = function () {
      if (!st.blob || send.disabled) return; send.disabled = true; send.textContent = 'Sending…';
      var ext = /mp4/.test(st.blob.type) ? 'mp4' : 'webm', f = new File([st.blob], 'video-message-' + Date.now() + '.' + ext, { type: st.blob.type });
      Promise.resolve(window.__upl(f, f.type)).then(function (res) { return U().send(Object.assign({ type: 'vid', round: 1, fileName: f.name, fileSize: f.size }, res)); })
        .then(function () { shut(); }).catch(function () { send.disabled = false; send.textContent = 'Send'; toast('Could not send the video. Check your internet.'); });
    };
    cam();
  }

  /* ============================================================ 2) DOCUMENT SCANNER */
  var sc = null;
  function loadImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { URL.revokeObjectURL(u); res(i); }; i.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); }; i.src = u;
    });
  }
  function toCanvas(img, maxSide) {
    var k = Math.min(1, maxSide / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
  }
  function detect(c) {
    try {
      var k = Math.min(1, 320 / Math.max(c.width, c.height)), w = Math.max(8, Math.round(c.width * k)), h = Math.max(8, Math.round(c.height * k)), t = document.createElement('canvas'); t.width = w; t.height = h;
      var x = t.getContext('2d'); x.drawImage(c, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data, g = new Uint8Array(w * h);
      for (var i = 0; i < g.length; i++) g[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
      var r = autoCorners(g, w, h); if (r) return r.map(function (p) { return [p[0] * c.width, p[1] * c.height]; });
    } catch (e) {}
    var m = 0.05; return [[c.width * m, c.height * m], [c.width * (1 - m), c.height * m], [c.width * (1 - m), c.height * (1 - m)], [c.width * m, c.height * (1 - m)]];
  }
  function rotateCanvas(c) { var n = document.createElement('canvas'); n.width = c.height; n.height = c.width; var x = n.getContext('2d'); x.translate(n.width, 0); x.rotate(Math.PI / 2); x.drawImage(c, 0, 0); return n; }
  function renderPage(pg, maxSide) {
    var s = outSize(pg.corners, maxSide), sx = pg.src.getContext('2d').getImageData(0, 0, pg.src.width, pg.src.height), out = warp(sx, pg.corners, s[0], s[1]);
    if (pg.filter === 'enh') filterEnhance(out); else if (pg.filter === 'bw') filterBW(out, s[0], s[1]);
    var c = document.createElement('canvas'); c.width = s[0]; c.height = s[1]; c.getContext('2d').putImageData(new ImageData(out, s[0], s[1]), 0, 0); return c;
  }
  function openScan() {
    if (!U().cid || !U().cid()) return toast('Open a chat first');
    if (sc) return;
    var o = overlay('pmSc'), pages = [], cur = -1, drag = -1, disp = { k: 1 };
    var top = el('div', 'pmTop'), close = btn('pmB', X_ICON, function () { shut(); }, 'Close'), done = el('button', 'pmGo', 'Done'); done.type = 'button'; done.disabled = true;
    top.append(close, el('b', '', 'Scan document'), done);
    var stage = el('div', 'stage'), cv = el('canvas'), hint = el('div', 'hint', 'Drag the corners to fit the page'); stage.append(cv, hint);
    var strip = el('div', 'strip'), bar = el('div', 'pmBar');
    var fAuto = btn('pmT', svg('<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/>') + '<span>Auto fit</span>', function () { var p = pages[cur]; if (p) { p.corners = detect(p.src); draw(); } });
    var fRot = btn('pmT', svg('<path d="M20 12a8 8 0 11-3-6.2M20 4v5h-5"/>') + '<span>Rotate</span>', function () { var p = pages[cur]; if (!p) return; p.src = rotateCanvas(p.src); p.corners = detect(p.src); draw(); thumbs(); });
    var fl = [['orig', 'Original'], ['enh', 'Enhanced'], ['bw', 'Black & white']].map(function (f) { var b = btn('pmT', svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>') + '<span>' + f[1] + '</span>', function () { var p = pages[cur]; if (!p) return; p.filter = f[0]; mark(); thumbs(); }); b.dataset.f = f[0]; return b; });
    var fDel = btn('pmT', svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>') + '<span>Delete</span>', function () { if (cur < 0) return; pages.splice(cur, 1); cur = Math.min(cur, pages.length - 1); draw(); thumbs(); });
    bar.append(fAuto, fRot); fl.forEach(function (b) { bar.appendChild(b); }); bar.appendChild(fDel);
    o.append(top, stage, strip, bar); o.classList.add('on'); sc = o;
    var cam = el('input'), gal = el('input'); cam.type = gal.type = 'file'; cam.accept = gal.accept = 'image/*'; cam.setAttribute('capture', 'environment'); cam.hidden = gal.hidden = true; gal.multiple = true; o.append(cam, gal);
    cam.onchange = function () { addFiles(cam.files); cam.value = ''; }; gal.onchange = function () { addFiles(gal.files); gal.value = ''; };
    function shut() { o.remove(); sc = null; }
    function mark() { Array.prototype.forEach.call(bar.querySelectorAll('[data-f]'), function (b) { b.classList.toggle('on', pages[cur] && pages[cur].filter === b.dataset.f); }); }
    function thumbs() {
      strip.textContent = '';
      pages.forEach(function (p, i) { var th = el('div', 'th' + (i === cur ? ' on' : '')), c = document.createElement('canvas'); c.width = 46; c.height = 62; try { var r = renderPage(p, 120); var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 46, 62); var k = Math.min(46 / r.width, 62 / r.height); x.drawImage(r, (46 - r.width * k) / 2, (62 - r.height * k) / 2, r.width * k, r.height * k); } catch (e) {} th.appendChild(c); th.onclick = function () { cur = i; draw(); thumbs(); }; strip.appendChild(th); });
      var a = el('button', 'add', '+'); a.type = 'button'; a.onclick = function () { cam.click(); }; strip.appendChild(a);
      var g = el('button', 'add'); g.type = 'button'; g.innerHTML = svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'); g.firstChild.style.cssText = 'width:22px;height:22px'; g.onclick = function () { gal.click(); }; strip.appendChild(g);
      done.disabled = !pages.length; done.textContent = pages.length ? 'Done · ' + pages.length : 'Done';
    }
    function draw() {
      var p = pages[cur]; if (!p) { cv.width = 10; cv.height = 10; hint.textContent = 'Tap + to take a photo of a page'; mark(); return; }
      hint.textContent = 'Drag the corners to fit the page';
      var maxW = stage.clientWidth - 8, maxH = stage.clientHeight - 8, k = Math.min(maxW / p.src.width, maxH / p.src.height, 1); disp.k = k;
      cv.width = Math.round(p.src.width * k); cv.height = Math.round(p.src.height * k); cv.style.width = cv.width + 'px'; cv.style.height = cv.height + 'px';
      var x = cv.getContext('2d'); x.drawImage(p.src, 0, 0, cv.width, cv.height);
      var c = p.corners.map(function (q) { return [q[0] * k, q[1] * k]; });
      x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.rect(0, 0, cv.width, cv.height); x.moveTo(c[0][0], c[0][1]); for (var i = 3; i >= 0; i--) x.lineTo(c[i][0], c[i][1]); x.closePath(); x.fill('evenodd');
      x.strokeStyle = '#2ee6a6'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(c[0][0], c[0][1]); for (var j = 1; j < 4; j++) x.lineTo(c[j][0], c[j][1]); x.closePath(); x.stroke();
      c.forEach(function (q, n) { x.fillStyle = n === drag ? '#fff' : '#2ee6a6'; x.beginPath(); x.arc(q[0], q[1], 13, 0, 7); x.fill(); x.strokeStyle = '#003'; x.lineWidth = 2; x.stroke(); });
      mark();
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width / disp.k, (e.clientY - r.top) * cv.height / r.height / disp.k]; }
    cv.addEventListener('pointerdown', function (e) {
      var p = pages[cur]; if (!p) return; var q = pos(e), best = -1, bd = 1e9;
      p.corners.forEach(function (c, i) { var d = Math.hypot(c[0] - q[0], c[1] - q[1]) * disp.k; if (d < bd) { bd = d; best = i; } });
      if (bd < 46) { drag = best; try { cv.setPointerCapture(e.pointerId); } catch (x) {} draw(); }
    });
    cv.addEventListener('pointermove', function (e) { if (drag < 0) return; var p = pages[cur], q = pos(e); p.corners[drag] = [Math.max(0, Math.min(p.src.width, q[0])), Math.max(0, Math.min(p.src.height, q[1]))]; draw(); });
    var up = function () { if (drag >= 0) { drag = -1; draw(); thumbs(); } }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    function addFiles(list) {
      var arr = Array.prototype.slice.call(list || []); if (!arr.length) return; toast('Preparing…');
      arr.reduce(function (pr, f) { return pr.then(function () { return loadImg(f).then(function (img) { var s = toCanvas(img, 2000); pages.push({ src: s, corners: detect(s), filter: 'enh' }); cur = pages.length - 1; }); }); }, Promise.resolve())
        .then(function () { draw(); thumbs(); }).catch(function () { toast('Could not read that photo'); });
    }
    done.onclick = function () {
      if (!pages.length || done.disabled) return; done.disabled = true; done.textContent = 'Creating PDF…';
      setTimeout(function () {
        try {
          var out = [], n = 0;
          pages.forEach(function (p) { var c = renderPage(p, 1700); out.push(new Promise(function (res) { c.toBlob(function (b) { b.arrayBuffer().then(function (ab) { res({ w: c.width, h: c.height, jpg: new Uint8Array(ab) }); }); }, 'image/jpeg', 0.85); })); });
          Promise.all(out).then(function (pp) {
            var pdf = buildPdf(pp), d = new Date(), pad = function (x) { return ('0' + x).slice(-2); }, name = 'Scan ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + '.' + pad(d.getMinutes()) + '.pdf';
            var f = new File([pdf], name, { type: 'application/pdf' }); shut(); window.__sendMedia(f, false);
          });
        } catch (e) { done.disabled = false; done.textContent = 'Done'; toast('Could not create the PDF'); }
      }, 30);
    };
    thumbs(); draw(); setTimeout(function () { cam.click(); }, 250);
  }

  /* ============================================================ 3) PHOTO EDITOR */
  var ed = null;
  function openEditor(src) {
    if (ed) return; var img = new Image(); img.onload = function () { build(img); }; img.onerror = function () { toast('Could not open the photo'); }; img.src = src;
    function build(img) {
      var o = overlay('pmEd'), k0 = Math.min(1, 1600 / Math.max(img.width, img.height)), W = document.createElement('canvas'); W.width = Math.round(img.width * k0); W.height = Math.round(img.height * k0); W.getContext('2d').drawImage(img, 0, 0, W.width, W.height);
      var stack = [], tool = 'draw', color = '#ff3b30', size = 8, emoji = '😀', crop = null, drag = null;
      var top = el('div', 'pmTop'), close = btn('pmB', X_ICON, function () { shut(); }, 'Cancel'), undo = btn('pmB', svg('<path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-3"/>'), function () { if (stack.length) { var s = stack.pop(); W.width = s.w; W.height = s.h; W.getContext('2d').putImageData(s.d, 0, 0); fit(); } }, 'Undo'), done = el('button', 'pmGo', 'Done'); done.type = 'button';
      top.append(close, el('b', '', 'Edit photo'), undo, done);
      var stage = el('div', 'stage'), wrap = el('div', 'wrap'), ov = el('canvas', 'ov'); wrap.append(W, ov); stage.appendChild(wrap);
      var opt = el('div', 'opt'), bar = el('div', 'pmBar'), tools = {};
      function T(id, icon, label, fn) { var b = btn('pmT', svg(icon) + '<span>' + label + '</span>', function () { fn ? fn() : setTool(id); }); tools[id] = b; bar.appendChild(b); return b; }
      T('crop', '<path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14"/>', 'Crop'); T('rot', '<path d="M20 12a8 8 0 11-3-6.2M20 4v5h-5"/>', 'Rotate', rotate);
      T('draw', '<path d="M4 20l4-1L19 8l-3-3L5 16z"/>', 'Draw'); T('text', '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', 'Text'); T('emoji', '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 007 0M9 9.5h.01M15 9.5h.01"/>', 'Emoji');
      o.append(top, stage, opt, bar); o.classList.add('on'); ed = o;
      function shut() { o.remove(); ed = null; }
      function push() { stack.push({ w: W.width, h: W.height, d: W.getContext('2d').getImageData(0, 0, W.width, W.height) }); if (stack.length > 6) stack.shift(); }
      function fit() { var mw = innerWidth, mh = innerHeight - 250, k = Math.min(mw / W.width, mh / W.height, 1); W.style.width = Math.round(W.width * k) + 'px'; W.style.height = Math.round(W.height * k) + 'px'; ov.width = W.width; ov.height = W.height; ov.style.width = W.style.width; ov.style.height = W.style.height; drawCrop(); }
      function rotate() { push(); var n = rotateCanvas(W); W.width = n.width; W.height = n.height; W.getContext('2d').drawImage(n, 0, 0); crop = null; fit(); if (tool === 'crop') initCrop(); }
      function setTool(t) {
        tool = t; Object.keys(tools).forEach(function (k) { tools[k].classList.toggle('on', k === t); }); opt.textContent = ''; crop = null; drawCrop();
        if (t === 'draw' || t === 'text') { ['#ff3b30', '#ffcc00', '#34c759', '#0a84ff', '#ffffff', '#000000'].forEach(function (c) { var s = el('button', 'sw' + (c === color ? ' on' : '')); s.type = 'button'; s.style.background = c; s.onclick = function () { color = c; setTool(t); }; opt.appendChild(s); }); var r = el('input', 'sz'); r.type = 'range'; r.min = 3; r.max = 36; r.value = size; r.oninput = function () { size = +r.value; }; opt.appendChild(r); }
        if (t === 'emoji') { ['😀', '😂', '😍', '🥰', '😎', '🔥', '❤️', '👍', '🎉', '✨', '💯', '🌹'].forEach(function (e) { var b = el('button', 'em' + (e === emoji ? ' on' : ''), e); b.type = 'button'; b.onclick = function () { emoji = e; setTool('emoji'); }; opt.appendChild(b); }); }
        if (t === 'crop') { initCrop(); var ap = el('button', 'pmGo', 'Apply crop'); ap.type = 'button'; ap.onclick = applyCrop; opt.appendChild(ap); }
      }
      function pt(e) { var r = W.getBoundingClientRect(); return [(e.clientX - r.left) * W.width / r.width, (e.clientY - r.top) * W.height / r.height]; }
      function sc2() { return W.width / (parseFloat(W.style.width) || W.width); }
      function initCrop() { var m = Math.round(Math.min(W.width, W.height) * 0.08); crop = { x: m, y: m, w: W.width - 2 * m, h: W.height - 2 * m }; drawCrop(); }
      function drawCrop() {
        var x = ov.getContext('2d'); x.clearRect(0, 0, ov.width, ov.height); if (!crop) return;
        x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, ov.width, ov.height); x.clearRect(crop.x, crop.y, crop.w, crop.h);
        x.strokeStyle = '#fff'; x.lineWidth = 2 * sc2(); x.strokeRect(crop.x, crop.y, crop.w, crop.h);
        x.lineWidth = sc2(); x.globalAlpha = .5; for (var i = 1; i < 3; i++) { x.beginPath(); x.moveTo(crop.x + crop.w * i / 3, crop.y); x.lineTo(crop.x + crop.w * i / 3, crop.y + crop.h); x.moveTo(crop.x, crop.y + crop.h * i / 3); x.lineTo(crop.x + crop.w, crop.y + crop.h * i / 3); x.stroke(); } x.globalAlpha = 1;
        x.fillStyle = '#fff'; var s = 9 * sc2(); [[crop.x, crop.y], [crop.x + crop.w, crop.y], [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]].forEach(function (c) { x.fillRect(c[0] - s, c[1] - s, 2 * s, 2 * s); });
      }
      function applyCrop() { if (!crop || crop.w < 20 || crop.h < 20) return; push(); var n = document.createElement('canvas'); n.width = Math.round(crop.w); n.height = Math.round(crop.h); n.getContext('2d').drawImage(W, crop.x, crop.y, crop.w, crop.h, 0, 0, n.width, n.height); W.width = n.width; W.height = n.height; W.getContext('2d').drawImage(n, 0, 0); crop = null; fit(); setTool('draw'); }
      var last = null;
      ov.addEventListener('pointerdown', function (e) {
        var p = pt(e), x = W.getContext('2d'); try { ov.setPointerCapture(e.pointerId); } catch (z) {}
        if (tool === 'crop' && crop) {
          var th = 30 * sc2(), cs = { tl: [crop.x, crop.y], tr: [crop.x + crop.w, crop.y], bl: [crop.x, crop.y + crop.h], br: [crop.x + crop.w, crop.y + crop.h] }, hit = null;
          Object.keys(cs).forEach(function (k) { if (Math.hypot(cs[k][0] - p[0], cs[k][1] - p[1]) < th) hit = k; });
          drag = hit ? { k: hit } : (p[0] > crop.x && p[0] < crop.x + crop.w && p[1] > crop.y && p[1] < crop.y + crop.h ? { k: 'mv', dx: p[0] - crop.x, dy: p[1] - crop.y } : null); return;
        }
        if (tool === 'draw') { push(); last = p; x.strokeStyle = color; x.fillStyle = color; x.lineWidth = size * sc2(); x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.arc(p[0], p[1], x.lineWidth / 2, 0, 7); x.fill(); }
        else if (tool === 'text') {
          var t = prompt('Type your text', ''); if (!t) return; push(); var fs = Math.round((16 + size * 2.4) * sc2()); x.font = '800 ' + fs + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = fs / 7; x.strokeStyle = color === '#000000' ? '#fff' : '#000'; x.lineJoin = 'round'; x.strokeText(t, p[0], p[1]); x.fillStyle = color; x.fillText(t, p[0], p[1]);
        } else if (tool === 'emoji') { push(); var es = Math.round(Math.min(W.width, W.height) * 0.18); x.font = es + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, p[0], p[1]); }
      });
      ov.addEventListener('pointermove', function (e) {
        var p = pt(e), x = W.getContext('2d');
        if (tool === 'draw' && last && e.buttons !== 0) { x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke(); last = p; }
        else if (tool === 'crop' && drag && crop) {
          var c = crop, X = Math.max(0, Math.min(W.width, p[0])), Y = Math.max(0, Math.min(W.height, p[1])), r = c.x + c.w, b = c.y + c.h;
          if (drag.k === 'mv') { c.x = Math.max(0, Math.min(W.width - c.w, p[0] - drag.dx)); c.y = Math.max(0, Math.min(W.height - c.h, p[1] - drag.dy)); }
          else { if (/l/.test(drag.k)) { c.x = Math.min(X, r - 30); c.w = r - c.x; } if (/r/.test(drag.k)) c.w = Math.max(30, X - c.x); if (/^t/.test(drag.k)) { c.y = Math.min(Y, b - 30); c.h = b - c.y; } if (/^b/.test(drag.k)) c.h = Math.max(30, Y - c.y); }
          drawCrop();
        }
      });
      var end = function () { last = null; drag = null; }; ov.addEventListener('pointerup', end); ov.addEventListener('pointercancel', end);
      done.onclick = function () {
        done.disabled = true; W.toBlob(function (b) { if (!b) { done.disabled = false; return toast('Could not save the edit'); } var f = new File([b], 'edited-' + Date.now() + '.jpg', { type: 'image/jpeg' }); shut(); if (window.__preview) window.__preview(f); }, 'image/jpeg', 0.9);
      };
      fit(); setTool('draw'); addEventListener('resize', fit);
    }
  }
  function hookPreview() {
    var top = document.querySelector('#mpv .mpvTop'), body = $('mpvBody'); if (!top || !body || top.querySelector('.proEdit')) return !!(top && top.querySelector('.proEdit'));
    var b = el('button', 'mpvB proEdit'); b.type = 'button'; b.setAttribute('aria-label', 'Edit photo'); b.innerHTML = svg('<path d="M4 20l4-1L19 8l-3-3L5 16z"/>');
    var once = $('mpvO'); top.insertBefore(b, once || null);
    var sync = function () { b.style.display = body.querySelector('img') ? 'grid' : 'none'; }; new MutationObserver(sync).observe(body, { childList: true }); sync();
    b.onclick = function () { var i = body.querySelector('img'); if (i && i.src) openEditor(i.src); };
    return true;
  }

  /* ============================================================ init */
  function init() {
    var vIc = svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>', 1.9).replace('<svg', '<svg style="width:24px;height:24px;color:#fff"');
    var sIc = svg('<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M7 12h10"/>', 1.9).replace('<svg', '<svg style="width:24px;height:24px;color:#fff"');
    window.__proAttach('proScan', 'Scan', '#0ea5e9', sIc, openScan); window.__proAttach('proVm', 'Video message', '#ef4444', vIc, openVM); hookPreview();
  }
  init(); [300, 1000, 2500].forEach(function (t) { setTimeout(init, t); });
  window.__proMedia.openScan = openScan; window.__proMedia.openVM = openVM; window.__proMedia.openEditor = openEditor;
})();
