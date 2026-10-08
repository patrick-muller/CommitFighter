// Áudio 8-bit sintetizado no WebAudio. Nenhum arquivo de som.
var CF = window.CF || (window.CF = {});

CF.Audio = (function () {
  var ctx = null, master = null, muted = false;

  function unlock() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ctx || muted) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol || 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, hp, delay) {
    if (!ctx || muted) return;
    var t0 = ctx.currentTime + (delay || 0);
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp || 1000;
    g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t0);
  }

  function seq(notes, step, type, vol) {
    notes.forEach(function (n, i) { if (n) tone(n, step * 0.95, type, vol, null, i * step); });
  }

  var STINGS = {
    deyvin: function () { tone(1800, 0.08, 'triangle', 0.3); tone(2400, 0.12, 'triangle', 0.25, null, 0.06); },
    galego: function () { noise(0.25, 0.25, 3000); tone(300, 0.25, 'sawtooth', 0.12, 900); },
    raul: function () { seq([880, 660, 880, 660], 0.05, 'square', 0.15); },
    sam: function () { seq([500, 520, 540, 560, 580, 600], 0.03, 'sawtooth', 0.1); },
    montano: function () { seq([392, 523, 659], 0.07, 'triangle', 0.25); },
    sibelius: function () { seq([1318, 1760], 0.07, 'square', 0.18); },
    akita: function () { tone(1400, 0.35, 'sawtooth', 0.15, 500); noise(0.2, 0.1, 2000); },
    vini: function () { seq([660, 880, 990], 0.06, 'square', 0.15); },
    deschamps: function () { seq([523, 659, 784, 1046], 0.05, 'triangle', 0.2); },
    claude: function () { for (var i = 0; i < 8; i++) tone(700 + (i % 2) * 120, 0.03, 'square', 0.08, null, i * 0.035); }
  };

  return {
    unlock: unlock,
    toggle: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    punch: function () { noise(0.03, 0.35, 4000); tone(1200, 0.02, 'square', 0.1); },          // click de teclado
    kick: function () { seq([988, 1319], 0.07, 'sine', 0.25); },                                // notification
    hit: function () { noise(0.08, 0.4, 300); tone(160, 0.1, 'square', 0.25, 60); },
    block: function () { tone(220, 0.05, 'square', 0.15); noise(0.04, 0.15, 2500); },
    whiff: function () { noise(0.05, 0.12, 2500); },
    heal: function () { seq([660, 990], 0.06, 'triangle', 0.2); },
    coin: function () { tone(1568, 0.05, 'square', 0.12); tone(2093, 0.08, 'square', 0.12, null, 0.04); },
    special: function (id) { (STINGS[id] || STINGS.claude)(); },
    // jingle de 1s "subiu a rampa"
    jingle: function () { seq([523, 659, 784, 1046, 784, 1046, 1318, 1568], 0.12, 'square', 0.18); seq([131, 0, 196, 0, 262, 0, 392, 0], 0.12, 'triangle', 0.2); },
    ko: function () { tone(400, 0.6, 'sawtooth', 0.25, 60); noise(0.5, 0.2, 200); },
    menu: function () { tone(880, 0.04, 'square', 0.12); },
    confirm: function () { seq([660, 990], 0.05, 'square', 0.18); },
    round: function () { seq([392, 523, 659, 784], 0.08, 'square', 0.18); },
    boss: function () { seq([196, 185, 175, 165, 155], 0.18, 'sawtooth', 0.2); STINGS.claude(); }
  };
})();
