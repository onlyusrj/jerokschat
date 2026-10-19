/* OnlyUs sounds-v54.js
   1) sound_send.mp3   -> plays when YOUR message gets its first tick (cleaned WhatsApp send sound)
   2) sound_media.mp3  -> plays when your partner sends a voice note / photo / video while YOU are inside that chat
   3) ringtone.mp3     -> "Shape of You" rings (looping) on an INCOMING voice or video call
   Respects the existing Sound on/off switch (Sound settings). */
(function () {
  'use strict';
  var KEY = 'onlyus-sound-prefs';
  function soundOn() { try { var p = JSON.parse(localStorage.getItem(KEY) || '{}'); return p.enabled !== false; } catch (e) { return true; } }

  function mk(src, vol, loop) {
    var a = new Audio(src); a.preload = 'auto'; a.volume = vol; a.loop = !!loop;
    try { a.load(); } catch (e) {} return a;
  }
  var A = { send: mk('sound_send.mp3', 1), media: mk('sound_media.mp3', 1), ring: mk('ringtone.mp3', 1, true) };

  /* unlock: browsers/WebView allow later play() only after one user tap */
  var unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    ['send', 'media', 'ring'].forEach(function (k) {
      var a = A[k], v = a.volume; a.volume = 0;
      var p = a.play(); var done = function () { try { a.pause(); a.currentTime = 0; } catch (e) {} a.volume = v; };
      if (p && p.then) p.then(done).catch(function () { a.volume = v; unlocked = false; }); else done();
    });
  }
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true, capture: true }); });

  function play(k) {
    if (!soundOn()) return true;                       /* muted: pretend handled, stay silent */
    var a = A[k]; if (!a) return false;
    try {
      if (!a.paused) { var c = a.cloneNode(); c.volume = a.volume; c.play().catch(function () {}); return true; }
      a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () {});
      return true;
    } catch (e) { return false; }
  }

  /* ---- 1) + 2) message sounds: wrap the old synth engine, keep it as fallback ---- */
  var old = window.premiumSound;
  window.premiumSound = function (kind, again) {
    if (kind === 'send') { if (play('send')) return; }
    else if (kind === 'media') { if (play('media')) return; kind = 'receive'; }
    if (typeof old === 'function') return old(kind, again);
  };

  /* ---- 3) incoming call ringtone ---- */
  function wrapRing() {
    var R = window.__ring; if (!R || R.__v54) return false; R.__v54 = 1;
    var oStart = R.start, oStop = R.stop, oStopAll = R.stopAll, oBack = R.back, ringing = false;
    function halt() { ringing = false; try { A.ring.pause(); A.ring.currentTime = 0; } catch (e) {} try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {} }
    R.start = function () {
      /* oStopAll first so nothing else is ringing, then Shape of You on loop */
      try { oStopAll.call(R); } catch (e) {}
      halt(); ringing = true;
      try { A.ring.loop = true; A.ring.currentTime = 0; A.ring.volume = 1; } catch (e) {}
      var p = A.ring.play();
      if (p && p.catch) p.catch(function () { if (ringing) { ringing = false; try { oStart.call(R); } catch (e) {} } });   /* autoplay blocked -> old ringtone */
      try { if (navigator.vibrate) navigator.vibrate([800, 700, 800, 700, 800, 700, 800, 700, 800, 700, 800]); } catch (e) {}
    };
    R.stop = function () { halt(); try { oStop.call(R); } catch (e) {} };
    R.stopAll = function () { halt(); try { oStopAll.call(R); } catch (e) {} };
    R.back = function () { halt(); return oBack.apply(R, arguments); };
    return true;
  }
  if (!wrapRing()) { var n = 0, t = setInterval(function () { if (wrapRing() || ++n > 40) clearInterval(t); }, 250); }
})();
