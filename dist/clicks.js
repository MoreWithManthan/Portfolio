/* Mechanical mouse + keyboard sounds, synthesized live with the Web Audio API (no audio files).
   - Mouse: left-click anywhere on the page.
   - Keyboard: ONLY while typing in an editable field (terminal, CTF answer, hash box, companion chat)
     and only for keys that edit text: characters, Space, Enter, Backspace, Delete. */
(function () {
  'use strict';
  var STORE = 'mwm-click-sounds';
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  var ctx = null, out = null, noiseBuf = null;
  var enabled = true;
  try { enabled = localStorage.getItem(STORE) !== 'off'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.001; comp.release.value = 0.06;
      out = ctx.createGain(); out.gain.value = 0.9;
      out.connect(comp); comp.connect(ctx.destination);
      var len = Math.floor(ctx.sampleRate * 0.25);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { ctx = null; return false; }
  }

  var rnd = function (spread) { return 1 + (Math.random() * 2 - 1) * spread; };

  // Each sound gets its own slight stereo position so repeated hits don't feel like one loop.
  function bus(pan) {
    var g = ctx.createGain();
    if (ctx.createStereoPanner) {
      var p = ctx.createStereoPanner(); p.pan.value = pan;
      g.connect(p); p.connect(out);
    } else g.connect(out);
    return g;
  }

  // Filtered noise burst with an instant attack and exponential decay.
  function noise(dest, t, type, freq, q, gain, dur) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.0007);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.1); s.stop(t + dur + 0.02);
  }

  // Damped resonance (a struck plate / case): fixed pitch, tiny downward settle, fast decay.
  function ring(dest, t, freq, gain, dur, settle) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * (settle || 0.9), t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /* ---------- Keyboard (clicky switch + slightly deep case) ---------- */
  var KEY = {
    // [click freq, body freq, body gain, body dur, extra thump freq (0 = none), thump gain]
    letter:    [3600, 260, 0.55, 0.055, 0,   0],
    space:     [2500, 170, 0.75, 0.085, 95,  0.7],
    enter:     [2900, 190, 0.8,  0.08,  105, 0.6],
    backspace: [3100, 210, 0.75, 0.07,  120, 0.5]
  };

  function keyDown(kind) {
    var k = KEY[kind], t = ctx.currentTime + 0.001, v = rnd(0.35), b = bus((Math.random() - 0.5) * 0.3);
    var pitch = rnd(0.07);
    noise(b, t, 'bandpass', k[0] * pitch, 1.1, 0.75 * v, 0.014);              // switch click
    noise(b, t + 0.001, 'highpass', 6500, 0.7, 0.28 * v, 0.008);              // top-end snap
    ring(b, t + 0.004, 2900 * pitch, 0.10 * v, 0.02, 0.97);                   // leaf "ping"
    noise(b, t + 0.006, 'lowpass', 1100 * pitch, 0.8, 0.9 * v, k[3]);         // bottom-out thock
    ring(b, t + 0.006, k[1] * pitch, k[2] * v, k[3] * 1.2, 0.85);             // case body
    if (k[4]) {
      ring(b, t + 0.006, k[4] * pitch, k[5] * v, 0.12, 0.82);                 // stabilizer / low thump
      noise(b, t + 0.03, 'bandpass', 1900, 2.5, 0.16 * v, 0.02);              // stabilizer rattle
    }
    if (kind === 'backspace') noise(b, t + 0.002, 'bandpass', 1500 * pitch, 1.5, 0.35 * v, 0.03);
  }
  function keyUp(kind) {
    var t = ctx.currentTime + 0.001, v = rnd(0.3), b = bus((Math.random() - 0.5) * 0.3);
    noise(b, t, 'bandpass', 4600 * rnd(0.08), 1.6, 0.32 * v, 0.011);
    noise(b, t + 0.002, 'lowpass', 900, 0.7, 0.22 * v, 0.022);
    if (kind !== 'letter') ring(b, t, 150 * rnd(0.05), 0.14 * v, 0.05, 0.9);
  }

  /* ---------- Mouse (microswitch) ---------- */
  function mouseDown() {
    var t = ctx.currentTime + 0.001, b = bus((Math.random() - 0.5) * 0.2), p = rnd(0.05);
    noise(b, t, 'bandpass', 2700 * p, 2.6, 1.0, 0.012);                       // snap
    noise(b, t + 0.001, 'highpass', 7000, 0.7, 0.3, 0.006);
    ring(b, t + 0.001, 1900 * p, 0.12, 0.014, 0.95);
    noise(b, t + 0.003, 'lowpass', 750, 0.9, 0.7, 0.03);                      // shell thump
    ring(b, t + 0.003, 140 * p, 0.5, 0.045, 0.85);
  }
  function mouseUp() {
    var t = ctx.currentTime + 0.001, b = bus((Math.random() - 0.5) * 0.2), p = rnd(0.05);
    noise(b, t, 'bandpass', 3600 * p, 2.8, 0.5, 0.008);
    noise(b, t + 0.002, 'lowpass', 700, 0.9, 0.22, 0.015);
  }

  /* ---------- Where and when sounds are allowed ---------- */
  var TEXT_TYPES = ['text', 'search', 'url', 'email', 'tel', 'password', 'number'];
  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
    if (el.tagName === 'INPUT') {
      var t = (el.getAttribute('type') || 'text').toLowerCase();
      return TEXT_TYPES.indexOf(t) > -1 && !el.readOnly && !el.disabled;
    }
    return false;
  }
  function kindOf(e) {
    if (e.key === 'Backspace' || e.key === 'Delete') return 'backspace';
    if (e.key === 'Enter') return 'enter';
    if (e.key === ' ' || e.code === 'Space') return 'space';
    if (e.key && e.key.length === 1) return 'letter';
    return null;                                   // arrows, Tab, Shift, Esc, F-keys ... stay silent
  }
  function ready() { return enabled && document.visibilityState !== 'hidden' && init(); }

  var down = {}, lastKeyTime = 0;

  document.addEventListener('keydown', function (e) {
    if (!e.isTrusted || e.repeat || e.isComposing || e.ctrlKey || e.metaKey) return;
    if (!isEditable(e.target)) return;
    var kind = kindOf(e);
    if (!kind) return;
    lastKeyTime = performance.now();
    if (!ready()) return;
    down[e.code || e.key] = kind;
    keyDown(kind);
  }, true);

  document.addEventListener('keyup', function (e) {
    var id = e.code || e.key, kind = down[id];
    if (!kind) return;                             // only release sounds for keys that clicked down
    delete down[id];
    if (ready()) keyUp(kind);
  }, true);

  // On-screen/mobile keyboards don't send real key events; use the text-input event instead.
  document.addEventListener('input', function (e) {
    if (!e.isTrusted || !isEditable(e.target)) return;
    if (performance.now() - lastKeyTime < 80) return;   // a physical key already made the sound
    var it = e.inputType || '';
    var kind = /^delete/.test(it) ? 'backspace' : it === 'insertLineBreak' || it === 'insertParagraph' ? 'enter'
             : /^insert/.test(it) ? 'letter' : null;
    if (kind && ready()) keyDown(kind);
  }, true);

  window.addEventListener('blur', function () { down = {}; });

  document.addEventListener('pointerdown', function (e) {
    if (e.isTrusted && e.pointerType === 'mouse' && e.button === 0 && ready()) mouseDown();
  }, true);
  document.addEventListener('pointerup', function (e) {
    if (e.isTrusted && e.pointerType === 'mouse' && e.button === 0 && ready()) mouseUp();
  }, true);

  function wireToggle() {
    var b = document.getElementById('sound-toggle');
    if (!b) return;
    var render = function () {
      b.textContent = 'Click sounds: ' + (enabled ? 'on' : 'off');
      b.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    };
    render();
    b.addEventListener('click', function () {
      enabled = !enabled;
      try { localStorage.setItem(STORE, enabled ? 'on' : 'off'); } catch (e) {}
      render();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireToggle);
  else wireToggle();
})();
