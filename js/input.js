// Teclado por posição física (event.code), controles por jogador e buffer de golpes.
var CF = window.CF || (window.CF = {});

CF.Input = (function () {
  var down = {}, pressed = {}, typed = '';
  var BLOCK_DEFAULT = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Quote', 'Semicolon'];

  window.addEventListener('keydown', function (e) {
    if (BLOCK_DEFAULT.indexOf(e.code) >= 0) e.preventDefault();
    if (!down[e.code]) pressed[e.code] = true;
    down[e.code] = true;
    if (e.key && e.key.length === 1) typed = (typed + e.key.toLowerCase()).slice(-12);
    if (CF.Audio) CF.Audio.unlock();
  });
  window.addEventListener('keyup', function (e) { down[e.code] = false; });
  window.addEventListener('blur', function () { down = {}; });

  return {
    held: function (code) { return !!down[code]; },
    hit: function (code) { return !!pressed[code]; },
    any: function (codes) { for (var i = 0; i < codes.length; i++) if (pressed[codes[i]]) return true; return false; },
    typed: function (word) {
      if (typed.slice(-word.length) === word) { typed = ''; return true; }
      return false;
    },
    endFrame: function () { pressed = {}; }
  };
})();

// Controle de um lutador. Humanos leem o teclado; a IA escreve em `virt`.
CF.Controller = function (keys) {
  this.keys = keys;
  this.virt = null;
  this.held = {};
  this.pressed = {};
  this.buffer = {};
  this.locked = false;
};

CF.Controller.ACTIONS = ['left', 'right', 'up', 'punch', 'kick', 'special', 'super'];

CF.Controller.prototype.update = function () {
  var A = CF.Controller.ACTIONS;
  if (this.ai) { this.ai.think(); this.virt = this.ai.virt; }
  for (var i = 0; i < A.length; i++) {
    var a = A[i], h, p;
    if (this.virt) { h = !!this.virt.held[a]; p = !!this.virt.pressed[a]; }
    else { h = CF.Input.held(this.keys[a]); p = CF.Input.hit(this.keys[a]); }
    if (this.locked) { h = false; p = false; }
    this.held[a] = h;
    this.pressed[a] = p;
    if (p) this.buffer[a] = 6;
    else if (this.buffer[a] > 0) this.buffer[a]--;
  }
  if (this.virt) this.virt.pressed = {};
};

// Consome um botão do buffer (aperto recente ainda não usado).
CF.Controller.prototype.take = function (a) {
  if (this.buffer[a] > 0) { this.buffer[a] = 0; return true; }
  return false;
};
