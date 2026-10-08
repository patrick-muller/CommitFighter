// Lutador: estados, física, entradas, golpes e hitboxes (retângulos relativos aos pés).
var CF = window.CF || (window.CF = {});

CF.HURT = [-30, -165, 30, 0];
CF.WALK_FWD = 3.4;
CF.WALK_BACK = 2.8;
CF.JUMP_VY = -11.5;
CF.GRAVITY = 0.6;

// Normais genéricos (frame data das regras).
CF.Moves = {
  punch: { name: 'soco', kind: 'normal', button: 'punch', startup: 5, active: 3, recovery: 8, dmg: 40,
    hitstun: 10, blockstun: 6, push: 4, box: [20, -140, 95, -105], wind: CF.FR.PUNCH_WIND, act: CF.FR.PUNCH, sfx: 'punch' },
  kick: { name: 'chute', kind: 'normal', button: 'kick', startup: 8, active: 4, recovery: 12, dmg: 55,
    hitstun: 12, blockstun: 8, push: 6, hitpause: 4, box: [20, -110, 120, -60], wind: CF.FR.KICK_WIND, act: CF.FR.KICK, sfx: 'kick' },
  airPunch: { name: 'soco aéreo', kind: 'normal', button: 'punch', startup: 5, active: 6, recovery: 6, dmg: 40,
    hitstun: 10, blockstun: 6, push: 4, box: [0, -120, 80, -60], wind: CF.FR.PUNCH_WIND, act: CF.FR.PUNCH, sfx: 'punch', air: true },
  airKick: { name: 'chute aéreo', kind: 'normal', button: 'kick', startup: 7, active: 8, recovery: 6, dmg: 55,
    hitstun: 12, blockstun: 8, push: 6, hitpause: 4, box: [0, -90, 95, -20], wind: CF.FR.KICK_WIND, act: CF.FR.KICK, sfx: 'kick', air: true }
};

CF.Fighter = function (roster, side, ctrl, opts) {
  opts = opts || {};
  this.r = roster;
  this.id = roster.id;
  this.side = side;
  this.ctrl = ctrl;
  this.kit = CF.Kits[roster.id];
  this.boss = !!opts.boss;
  this.maxHp = this.boss ? 900 : CF.MAX_HP;
  this.baseDmg = this.boss ? 1.25 : 1;
  this.scale = this.boss ? 1.15 : 1;
  this.meter = opts.fullMeter ? 100 : 0;
  this.usage = { punch: 0, kick: 0, special: 0, normal: 0 };
  this.wins = 0;
  this.totalHp = 0;
  this.data = {};          // estado próprio do kit (chopp, contexto...)
  if (this.kit.init) this.kit.init(this);
};

CF.Fighter.prototype.reset = function (x, facing) {
  this.hp = this.maxHp;
  this.x = x; this.y = CF.GROUND;
  this.vx = 0; this.vy = 0; this.push = 0;
  this.facing = facing;
  this.state = 'idle'; this.t = 0; this.time = 0;
  this.move = null; this.mt = 0; this.hitDone = false;
  this.status = {};
  this.invuln = 0; this.hidden = false; this.flash = 0;
  this.label = null;
  this.lastButton = null;
  if (this.kit.onRound) this.kit.onRound(this);
};

CF.Fighter.prototype.grounded = function () { return this.y >= CF.GROUND && this.vy >= 0; };
CF.Fighter.prototype.has = function (s) { return !!this.status[s]; };
CF.Fighter.prototype.addStatus = function (name, frames, onEnd) { this.status[name] = { t: frames, onEnd: onEnd }; };
CF.Fighter.prototype.backHeld = function () { return this.facing > 0 ? this.ctrl.held.left : this.ctrl.held.right; };
CF.Fighter.prototype.fwdHeld = function () { return this.facing > 0 ? this.ctrl.held.right : this.ctrl.held.left; };

CF.Fighter.prototype.canBlock = function () {
  return this.grounded() && this.backHeld() && !this.has('ally') &&
    (this.state === 'idle' || this.state === 'walk' || this.state === 'blockstun');
};

CF.Fighter.prototype.dmgMult = function () {
  var m = this.baseDmg;
  if (this.kit.dmgMult) m *= this.kit.dmgMult(this);
  if (this.has('competence')) m *= 1.2;
  if (this.has('tutorialBug')) m *= 0.8;
  if (this.has('bolhaAntiga')) m *= 1.15;
  return m;
};

CF.Fighter.prototype.startupMod = function () {
  var m = 0;
  if (this.has('slow')) m += 1;
  if (this.has('slow2')) m += 2;
  if (this.has('fast')) m -= 1;
  if (this.has('haste')) m -= 2;
  return m;
};

CF.Fighter.prototype.startMove = function (move, match) {
  this.state = 'attack';
  this.move = move;
  this.mt = 0;
  this.hitDone = false;
  this.startup = Math.max(1, move.startup + (move.kind === 'super' ? 0 : this.startupMod()));
  this.whiffAll = false;
  // "Isso não escala": repetir o mesmo botão faz o golpe sair no vazio
  if (this.has('naoEscala') && move.button && move.button === this.lastButton) {
    this.whiffAll = true;
    match.say(this, 'não escala', 40, '#ff7a1a');
  }
  if (move.button) {
    this.lastButton = move.button;
    this.usage[move.button] = (this.usage[move.button] || 0) + 1;
  }
  if (move.kind === 'special') CF.Audio.special(this.id);
  if (move.onStart) move.onStart(this, match);
};

CF.Fighter.prototype.activeBox = function () {
  var m = this.move;
  if (this.state !== 'attack' || !m || !m.box || this.hitDone || this.whiffAll) return null;
  if (this.mt < this.startup || this.mt >= this.startup + m.active) return null;
  return this.worldBox(m.box);
};

CF.Fighter.prototype.worldBox = function (b) {
  var s = this.scale;
  if (this.facing > 0) return [this.x + b[0] * s, this.y + b[1] * s, this.x + b[2] * s, this.y + b[3] * s];
  return [this.x - b[2] * s, this.y + b[1] * s, this.x - b[0] * s, this.y + b[3] * s];
};

CF.Fighter.prototype.hurtBox = function () {
  if (this.state === 'down' || this.state === 'ko' || this.hidden) return null;
  return this.worldBox(CF.HURT);
};

CF.Fighter.prototype.locked = function () {
  return this.state === 'stuck' || this.state === 'hitstun' || this.state === 'blockstun' ||
    this.state === 'down' || this.state === 'ko' || this.state === 'win' || this.state === 'super';
};

CF.Fighter.prototype.setStuck = function (frames, label, color, frame) {
  this.state = 'stuck';
  this.t = frames;
  this.move = null;
  this.vx = 0;
  this.stuckFrame = frame;
  this.label = label ? { text: label, color: color || '#fff' } : null;
};

CF.Fighter.prototype.handleInput = function (match, opp) {
  var c = this.ctrl;
  var canAttack = !this.has('noButtons') && !this.has('ally');
  if (canAttack) {
    if (c.take('super') && this.meter >= 100 && !this.has('noSuper')) { match.startSuper(this); return; }
    if (c.take('special') && !this.has('mute')) { this.startMove(this.kit.special, match); return; }
    if (c.take('kick')) {
      if (this.fwdHeld() && this.kit.normal) this.startMove(this.kit.normal, match);
      else this.startMove(CF.Moves.kick, match);
      return;
    }
    if (c.take('punch')) { this.startMove(CF.Moves.punch, match); return; }
  }
  if (c.held.up) {
    this.state = 'jump';
    this.vy = CF.JUMP_VY;
    this.vx = c.held.right ? 3.6 : c.held.left ? -3.6 : 0;
    if (this.has('haste')) this.vx *= 1.4;
    return;
  }
  var dir = (c.held.right ? 1 : 0) - (c.held.left ? 1 : 0);
  if (dir) {
    var fwd = dir === this.facing;
    var sp = fwd ? CF.WALK_FWD : CF.WALK_BACK;
    if (this.has('haste')) sp *= 1.5;
    this.x += dir * sp;
    this.state = 'walk';
  } else {
    this.state = 'idle';
  }
};

CF.Fighter.prototype.update = function (match, opp) {
  this.time++;
  if (this.invuln > 0) this.invuln--;
  if (this.flash > 0) this.flash--;
  for (var k in this.status) {
    var st = this.status[k];
    if (--st.t <= 0) { delete this.status[k]; if (st.onEnd) st.onEnd(this, match); }
  }
  if (this.kit.update) this.kit.update(this, match, opp);

  // vira para o oponente quando está livre no chão
  if (this.grounded() && (this.state === 'idle' || this.state === 'walk')) {
    this.facing = opp.x >= this.x ? 1 : -1;
  }

  switch (this.state) {
    case 'idle':
    case 'walk':
      this.handleInput(match, opp);
      break;
    case 'jump':
      if (!this.has('noButtons') && !this.has('ally')) {
        if (this.ctrl.take('kick')) this.startMove(CF.Moves.airKick, match);
        else if (this.ctrl.take('punch')) this.startMove(CF.Moves.airPunch, match);
      }
      break;
    case 'attack':
      var m = this.move;
      if (m.onFrame) m.onFrame(this, match, opp, this.mt);
      if (this.move !== m || this.state !== 'attack') break;
      if (this.mt === this.startup && m.sfx) CF.Audio[m.sfx]();
      this.mt++;
      if (!m.air && this.mt >= this.startup + m.active + m.recovery) {
        this.move = null;
        this.state = 'idle';
        if (m.onEnd) m.onEnd(this, match);
      }
      break;
    case 'hitstun':
    case 'blockstun':
    case 'stuck':
      if (--this.t <= 0 && this.grounded()) { this.state = 'idle'; this.label = null; }
      break;
    case 'down':
      if (--this.t <= 0) { this.state = 'idle'; this.invuln = 12; }
      break;
  }

  // física
  if (!this.grounded()) {
    this.vy += CF.GRAVITY;
    this.y += this.vy;
    this.x += this.vx;
    if (this.y >= CF.GROUND) {
      this.y = CF.GROUND; this.vy = 0; this.vx = 0;
      if (this.state === 'jump' || (this.state === 'attack' && this.move && this.move.air)) {
        this.state = 'idle'; this.move = null;
      }
    }
  } else if (this.vx) {
    this.x += this.vx;
  }
  this.x += this.push;
  this.push *= 0.82;
  if (Math.abs(this.push) < 0.1) this.push = 0;
  this.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, this.x));
};

CF.Fighter.prototype.frame = function () {
  var F = CF.FR;
  switch (this.state) {
    case 'idle': return Math.floor(this.time / 20) % 2 ? F.IDLE_B : F.IDLE_A;
    case 'walk': return Math.floor(this.time / 10) % 2 ? F.WALK_B : F.WALK_A;
    case 'jump': return F.JUMP;
    case 'attack':
      var m = this.move;
      if (m.frameAt) return m.frameAt(this, this.mt);
      return this.mt < this.startup ? m.wind : m.act;
    case 'hitstun': return F.HIT;
    case 'blockstun': return F.BLOCK;
    case 'stuck': return this.stuckFrame !== undefined ? this.stuckFrame : F.HIT;
    case 'down': case 'ko': return F.KO;
    case 'win': return F.WIN;
    case 'super': return this.superFrame !== undefined ? this.superFrame : F.SUPER;
  }
  return F.IDLE_A;
};
