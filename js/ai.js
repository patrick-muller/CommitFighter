// IA da CPU. 'easy' = candidatos (feita para o iniciante ganhar), 'boss' = Claude, 'dummy' = treino.
var CF = window.CF || (window.CF = {});

CF.AI = function (level) {
  this.level = level;
  this.mode = 'stand';          // treino: 'stand' ou 'block'
  this.virt = { held: {}, pressed: {} };
  this.blockT = 0;
  this.backT = 0;
  this.nextAtk = 50;
  this.lastSpecial = 0;
  this.lastStart = null;
  var boss = level === 'boss';
  this.p = {
    blockPunch: boss ? 0.6 : 0.3,
    blockKick: boss ? 0.6 : 0,
    readSpecial: boss ? 0.5 : 0,        // a CPU comum cai em todo especial telegrafado
    specialEvery: boss ? 150 : 240,
    atkMin: boss ? 16 : 30, atkRand: boss ? 18 : 35,
    jump: boss ? 0.006 : 0.004
  };
};

CF.AI.prototype.bind = function (f, match) { this.f = f; this.match = match; };

CF.AI.prototype.press = function (a) { this.virt.pressed[a] = true; };

CF.AI.prototype.think = function () {
  var f = this.f, m = this.match, v = this.virt;
  v.held = {};
  if (!f || !m) return;
  var o = m.opp(f);
  var back = f.facing > 0 ? 'left' : 'right', fwd = f.facing > 0 ? 'right' : 'left';

  if (this.level === 'dummy') {
    if (this.mode === 'block') v.held[back] = true;
    return;
  }
  if (m.phase !== 'fight' || m.freeze) return;

  // reage ao início de cada golpe do oponente
  if (o.state === 'attack' && o.move) {
    var start = o.time - o.mt;
    if (start !== this.lastStart) {
      this.lastStart = start;
      var k = o.move.kind, r = Math.random();
      if (k === 'normal' && o.move.button === 'punch' && r < this.p.blockPunch) this.blockT = 22;
      else if (k === 'normal' && o.move.button !== 'punch' && r < this.p.blockKick) this.blockT = 26;
      else if ((k === 'special' || k === 'super') && r < this.p.readSpecial) this.blockT = 60;
    }
  }
  if (this.blockT > 0) { this.blockT--; v.held[back] = true; return; }

  var dist = Math.abs(o.x - f.x);

  if (f.meter >= 100 && o.grounded() && dist < 320 && Math.random() < 0.05) { this.press('super'); return; }
  if (m.matchTime - this.lastSpecial > this.p.specialEvery && f.state !== 'attack') {
    this.lastSpecial = m.matchTime;
    this.press('special');
    return;
  }

  if (this.backT > 0) { this.backT--; v.held[back] = true; }
  else if (dist > 115) v.held[fwd] = true;
  else if (dist < 70 && Math.random() < 0.02) this.backT = 18;

  if (dist < 135 && --this.nextAtk <= 0) {
    this.press(dist < 95 && Math.random() < 0.5 ? 'punch' : 'kick');
    this.nextAtk = this.p.atkMin + Math.floor(Math.random() * this.p.atkRand);
  }
  if (Math.random() < this.p.jump) { v.held.up = true; v.held[fwd] = true; }
};
