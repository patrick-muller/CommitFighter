// Partida: rounds, timer, colisão, dano, projéteis, hitpause, congelamento do super.
var CF = window.CF || (window.CF = {});

CF.overlap = function (a, b) {
  return a && b && a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
};

// opts: { p1, p2 (roster), ctrl1, ctrl2, boss2, training, onDone(result), roundsToWin }
CF.Match = function (opts) {
  this.opts = opts;
  this.training = !!opts.training;
  this.p = [
    new CF.Fighter(opts.p1, 0, opts.ctrl1, { fullMeter: this.training }),
    new CF.Fighter(opts.p2, 1, opts.ctrl2, { boss: opts.boss2 })
  ];
  var self = this;
  this.p.forEach(function (f) { if (f.ctrl.ai) f.ctrl.ai.bind(f, self); });
  this.round = 0;
  this.matchTime = 0;
  this.chatLog = [];
  this.chatT = 0;
  this.telao = null;
  this.newRound();
};

CF.Match.prototype.opp = function (f) { return f === this.p[0] ? this.p[1] : this.p[0]; };

CF.Match.prototype.newRound = function () {
  this.round++;
  this.phase = 'intro';
  this.phaseT = 0;
  this.roundTime = 0;
  this.hitpause = 0;
  this.freeze = null;
  this.projectiles = [];
  this.fx = [];
  this.entities = [];
  this.queue = [];
  this.hudHidden = 0;
  this.retro = 0;
  this.shake = 0;
  this.lastHitT = [0, 0];
  this.p[0].reset(330, 1);
  this.p[1].reset(630, -1);
  CF.Audio.round();
};

// ---- utilidades para os kits -------------------------------------------------

CF.Match.prototype.later = function (frames, fn) { this.queue.push({ t: frames, fn: fn }); };

CF.Match.prototype.say = function (f, text, frames, color) {
  this.fx.push({ type: 'say', who: f, text: text, color: color || '#fff', t: 0, life: frames || 60 });
};

CF.Match.prototype.popup = function (x, y, text, color, life) {
  this.fx.push({ type: 'text', x: x, y: y, text: text, color: color, t: 0, life: life || 45 });
};

CF.Match.prototype.sparks = function (x, y, color, n) {
  for (var i = 0; i < (n || 10); i++) {
    var a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
    this.fx.push({ type: 'px', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, color: color,
      size: 4 + Math.floor(Math.random() * 4), t: 0, life: 18 + Math.floor(Math.random() * 10) });
  }
};

CF.Match.prototype.confetti = function (x, y, n) {
  var cols = ['#39ff88', '#b14dff', '#f2b134', '#4fd8ff', '#ff4d6d', '#fff'];
  for (var i = 0; i < (n || 60); i++) {
    this.fx.push({ type: 'px', x: x + (Math.random() - 0.5) * 300, y: y - Math.random() * 260,
      vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2, color: cols[i % cols.length], size: 5,
      t: 0, life: 90 + Math.floor(Math.random() * 40), grav: 0.02 });
  }
};

CF.Match.prototype.spawn = function (p) {
  p.t = 0;
  p.vy = p.vy || 0;
  p.info = p.info || {};
  if (p.reflectable === undefined) p.reflectable = true;
  this.projectiles.push(p);
  return p;
};

CF.Match.prototype.addEntity = function (e) { e.t = 0; this.entities.push(e); return e; };

CF.Match.prototype.chat = function (text) {
  var u = CF.CHAT_USERS[Math.floor(Math.random() * CF.CHAT_USERS.length)];
  this.chatLog.push({ user: u, text: text, side: Math.random() < 0.5 ? 0 : 1, t: 0 });
  if (this.chatLog.length > 14) this.chatLog.shift();
};

CF.Match.prototype.heal = function (f, amount) {
  f.hp = Math.min(f.maxHp, f.hp + amount);
  this.popup(f.x, f.y - 190, '+' + amount + ' lido', '#4fd8ff');
  CF.Audio.heal();
};

// Dano direto (DoT, dano atrasado). Não causa hitstun, a não ser que peça.
CF.Match.prototype.damage = function (att, tgt, amount, label, color) {
  if (this.phase !== 'fight' || tgt.state === 'ko') return;
  amount = Math.round(amount);
  tgt.hp = Math.max(0, tgt.hp - amount);
  tgt.flash = 8;
  att.meter = Math.min(100, att.meter + amount / 5);
  tgt.meter = Math.min(100, tgt.meter + amount / 10);
  this.popup(tgt.x, tgt.y - 190, (label ? label + ' ' : '') + '-' + amount, color || '#ff4d6d');
  this.lastHitT[tgt.side] = this.matchTime;
  if (tgt.hp <= 0) this.ko(tgt);
};

// Resolve um acerto. Retorna 'hit', 'block', 'parry' ou 'miss'.
CF.Match.prototype.applyHit = function (att, tgt, info) {
  if (tgt.invuln > 0 || tgt.state === 'down' || tgt.state === 'ko' || tgt.hidden) return 'miss';
  if (this.phase !== 'fight') return 'miss';
  if (info.kind === 'super' && !(tgt.grounded() || tgt.state === 'hitstun')) return 'miss';
  if (info.canHit && !info.canHit(tgt)) return 'miss';
  if (tgt.kit.onIncoming) {
    var r = tgt.kit.onIncoming(tgt, att, info, this);
    if (r) return r;
  }
  var fromX = info.fromX !== undefined ? info.fromX : att.x;
  var dir = tgt.x >= fromX ? 1 : -1;
  var hx = tgt.x - dir * 25, hy = tgt.y - 120;

  if (!info.unblockable && tgt.canBlock()) {
    var chip = (info.kind === 'special' || info.kind === 'super') ? Math.round(info.dmg * 0.1) : 0;
    if (chip) { tgt.hp = Math.max(0, tgt.hp - chip); this.popup(tgt.x, tgt.y - 190, 'chip -' + chip, '#9aa'); }
    tgt.state = 'blockstun';
    tgt.t = info.blockstun || 10;
    tgt.move = null;
    this.pushApart(att, tgt, dir, (info.push || 4) * 0.8);
    tgt.meter = Math.min(100, tgt.meter + 2);
    this.sparks(hx, hy, '#4fd8ff', 6);
    CF.Audio.block();
    if (info.onBlock) info.onBlock(att, tgt, this);
    if (tgt.hp <= 0) this.ko(tgt);
    return 'block';
  }

  var dmg = info.raw ? info.dmg : info.dmg * att.dmgMult();
  if (tgt.has('marked') && dmg > 0) {
    dmg *= 2;
    delete tgt.status.marked;
    this.popup(tgt.x, tgt.y - 215, 'ponto fraco!', '#e03131');
  }
  if (att.has('halfSpecial') && info.kind === 'special') dmg *= 0.5;
  if (att.kit.modifyDamage) dmg = att.kit.modifyDamage(att, tgt, dmg, info, this);
  dmg = Math.round(dmg);

  tgt.hp = Math.max(0, tgt.hp - dmg);
  tgt.flash = 8;
  att.meter = Math.min(100, att.meter + dmg / 5);
  tgt.meter = Math.min(100, tgt.meter + dmg / 10);
  tgt.move = null;
  tgt.vx = 0;
  this.lastHitT[tgt.side] = this.matchTime;

  var knock = info.knockdown || info.kind === 'super' || (info.kind === 'special' && dmg >= 110);
  if (knock) {
    tgt.state = 'down';
    tgt.t = info.downTime || 55;
    if (tgt.grounded()) tgt.vy = -5;
    tgt.vx = dir * 3;
    tgt.y -= 1;
  } else {
    tgt.state = 'hitstun';
    tgt.t = info.hitstun || 12;
  }
  this.pushApart(att, tgt, dir, info.push || 4);
  this.hitpause = Math.max(this.hitpause, info.hitpause || (info.kind === 'normal' ? 0 : 4));
  if (info.kind !== 'normal') this.shake = 8;

  this.sparks(hx, hy, '#39ff88', 12);
  if (dmg > 0) {
    this.popup(hx, hy - 30, '+1 commit', '#39ff88', 35);
    this.popup(tgt.x, tgt.y - 200, 'build failed -' + dmg, '#ff4d6d');
  }
  CF.Audio.hit();
  if (Math.random() < 0.25 || info.kind === 'super') this.chat(info.kind === 'super' ? 'KKKKKKKKK' : CF.CHAT[Math.floor(Math.random() * CF.CHAT.length)]);

  if (att.kit.onDealHit) att.kit.onDealHit(att, tgt, dmg, info, this);
  if (info.onHit) info.onHit(att, tgt, dmg, this);
  if (tgt.hp <= 0) this.ko(tgt);
  return 'hit';
};

// Empurra o alvo; se ele estiver na parede, quem recua é o atacante.
CF.Match.prototype.pushApart = function (att, tgt, dir, amount) {
  var atWall = (dir > 0 && tgt.x >= CF.WALL_R - 5) || (dir < 0 && tgt.x <= CF.WALL_L + 5);
  if (atWall && att !== tgt) att.push = -dir * amount;
  else tgt.push = dir * amount;
};

CF.Match.prototype.ko = function (f) {
  if (this.phase !== 'fight') return;
  if (this.training) { f.hp = f.maxHp; f.state = 'down'; f.t = 55; this.popup(f.x, f.y - 220, 'KO (treino)', '#ffd43b', 60); return; }
  f.state = 'ko';
  f.move = null;
  if (f.grounded()) f.vy = -6;
  this.endRound(this.opp(f), 'KO');
};

CF.Match.prototype.startSuper = function (f) {
  f.meter = 0;
  f.state = 'super';
  f.move = null;
  f.invuln = 200;
  f.superFrame = CF.FR.SP_CHARGE;
  this.freeze = { f: f, t: 60 };
  this.telao = { type: 'super', f: f, t: 0 };
  CF.Audio.jingle();
  this.chat('SUPER!!');
};

// ---- loop --------------------------------------------------------------------

CF.Match.prototype.update = function () {
  this.phaseT++;
  this.updateFx();
  if (this.paused) return;

  if (this.phase === 'intro') {
    if (this.phaseT >= 100) { this.phase = 'fight'; this.phaseT = 0; }
    this.p[0].ctrl.update(); this.p[1].ctrl.update();
    return;
  }
  if (this.phase === 'roundEnd' || this.phase === 'matchEnd') {
    this.p.forEach(function (f) { f.ctrl.locked = true; f.ctrl.update(); f.ctrl.locked = false; });
    this.p.forEach(function (f) { if (f.state !== 'ko' && f.state !== 'win') { f.state = 'idle'; f.move = null; } });
    this.physicsOnly();
    if (this.phase === 'roundEnd' && this.phaseT >= 160) this.afterRound();
    if (this.phase === 'matchEnd' && this.phaseT >= 200) this.opts.onDone(this.result);
    return;
  }

  this.p[0].ctrl.update();
  this.p[1].ctrl.update();

  if (this.freeze) {
    var fz = this.freeze;
    fz.t--;
    if (fz.t === 30) fz.f.superFrame = CF.FR.SUPER;
    if (fz.t <= 0) {
      this.freeze = null;
      fz.f.state = 'idle';
      fz.f.superFrame = undefined;
      fz.f.invuln = 20;
      fz.f.kit.super.start(fz.f, this, this.opp(fz.f));
    }
    return;
  }
  if (this.hitpause > 0) { this.hitpause--; return; }

  this.matchTime++;
  this.roundTime++;
  if (this.hudHidden > 0) this.hudHidden--;
  if (this.retro > 0) this.retro--;

  for (var i = this.queue.length - 1; i >= 0; i--) {
    if (--this.queue[i].t <= 0) { var q = this.queue.splice(i, 1)[0]; q.fn(this); }
  }

  this.p[0].update(this, this.p[1]);
  this.p[1].update(this, this.p[0]);
  this.separate();
  this.checkHits();
  this.updateProjectiles();
  this.updateEntities();

  if (this.training) this.trainingTick();
  else if (this.phase === 'fight' && this.roundTime >= CF.ROUND_FRAMES) this.timeUp();

  if (--this.chatT <= 0) { this.chatT = 40 + Math.floor(Math.random() * 70); this.chat(CF.CHAT[Math.floor(Math.random() * CF.CHAT.length)]); }
};

CF.Match.prototype.physicsOnly = function () {
  var self = this;
  this.p.forEach(function (f) {
    f.time++;
    if (!f.grounded()) {
      f.vy += CF.GRAVITY; f.y += f.vy; f.x += f.vx;
      if (f.y >= CF.GROUND) { f.y = CF.GROUND; f.vy = 0; f.vx = 0; }
    }
    f.x += f.push; f.push *= 0.82;
    f.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, f.x));
  });
  this.updateProjectiles(true);
  this.entities.length = 0;
  void self;
};

// Corpos não se atravessam no chão.
CF.Match.prototype.separate = function () {
  var a = this.p[0], b = this.p[1];
  if (a.hidden || b.hidden || a.state === 'down' || b.state === 'down') return;
  var dx = b.x - a.x, min = 56;
  if (Math.abs(dx) < min && Math.abs(a.y - b.y) < 120) {
    var o = (min - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
    if (dx === 0) s = a.facing;
    a.x -= s * o; b.x += s * o;
    a.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, a.x));
    b.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, b.x));
  }
};

CF.Match.prototype.checkHits = function () {
  for (var i = 0; i < 2; i++) {
    var att = this.p[i], tgt = this.p[1 - i];
    var box = att.activeBox();
    if (!box) continue;
    if (!CF.overlap(box, tgt.hurtBox())) continue;
    att.hitDone = true;
    var m = att.move;
    this.applyHit(att, tgt, {
      dmg: m.dmg, kind: m.kind, hitstun: m.hitstun, blockstun: m.blockstun, push: m.push,
      hitpause: m.hitpause, knockdown: m.knockdown, unblockable: m.unblockable, canHit: m.canHit,
      raw: m.raw, onHit: m.onHit, onBlock: m.onBlock, move: m
    });
  }
};

CF.Match.prototype.updateProjectiles = function (frozen) {
  var list = this.projectiles;
  for (var i = list.length - 1; i >= 0; i--) {
    var p = list[i];
    p.t++;
    if (p.update) p.update(p, this);
    p.x += p.vx; p.y += p.vy;
    var dead = p.dead || p.t >= p.life || p.x < -100 || p.x > CF.W + 100;
    if (!dead && !frozen && p.w) {
      var tgt = this.opp(p.owner);
      var box = [p.x - p.w / 2, p.y - p.h / 2, p.x + p.w / 2, p.y + p.h / 2];
      // projétil contra projétil se anulam
      for (var j = 0; j < list.length; j++) {
        var q = list[j];
        if (q !== p && q.owner !== p.owner && q.w && !q.dead && !q.noClash && !p.noClash &&
            CF.overlap(box, [q.x - q.w / 2, q.y - q.h / 2, q.x + q.w / 2, q.y + q.h / 2])) {
          p.dead = q.dead = true;
          this.sparks(p.x, p.y, '#fff', 8);
        }
      }
      if (!p.dead && CF.overlap(box, tgt.hurtBox())) {
        if (tgt.has('reflect') && p.reflectable) {
          p.owner = tgt; p.vx = -p.vx; p.t = 0;
          if (tgt.kit.onReflect) tgt.kit.onReflect(tgt, this.opp(tgt), this);
          this.sparks(p.x, p.y, '#4fd8ff', 10);
        } else if (p.onContact) {
          if (p.onContact(p, tgt, this) !== false) p.dead = true;
        } else {
          var info = Object.assign({ fromX: p.x - p.vx * 3 }, p.info);
          var res = this.applyHit(p.owner, tgt, info);
          if (res !== 'miss') p.dead = true;
        }
      }
      dead = p.dead;
    }
    if (dead) { list.splice(i, 1); if (p.onDeath) p.onDeath(p, this); }
  }
};

CF.Match.prototype.updateEntities = function () {
  for (var i = this.entities.length - 1; i >= 0; i--) {
    var e = this.entities[i];
    e.t++;
    if (e.update) e.update(e, this);
    if (e.dead || e.t >= e.life) this.entities.splice(i, 1);
  }
};

CF.Match.prototype.updateFx = function () {
  for (var i = this.fx.length - 1; i >= 0; i--) {
    var e = this.fx[i];
    e.t++;
    if (e.type === 'px') { e.x += e.vx; e.y += e.vy; e.vy += e.grav !== undefined ? e.grav : 0.25; }
    if (e.type === 'text') e.y -= 0.8;
    if (e.t >= e.life) this.fx.splice(i, 1);
  }
  for (var c = 0; c < this.chatLog.length; c++) this.chatLog[c].t++;
  if (this.telao) { this.telao.t++; if (this.telao.t > (this.telao.life || 150)) this.telao = null; }
  if (this.shake > 0) this.shake--;
};

CF.Match.prototype.trainingTick = function () {
  var self = this;
  this.p.forEach(function (f) {
    if (self.matchTime - self.lastHitT[f.side] > 120 && f.hp < f.maxHp && f.state !== 'down') f.hp = Math.min(f.maxHp, f.hp + 8);
    if (f.state === 'ko') { f.state = 'idle'; f.hp = f.maxHp; }
  });
  var p1 = this.p[0];
  if (p1.meter < 100) { p1.refill = (p1.refill || 0) + 1; if (p1.refill > 120) { p1.meter = 100; p1.refill = 0; } }
};

CF.Match.prototype.timeUp = function () {
  var a = this.p[0], b = this.p[1];
  var ra = a.hp / a.maxHp, rb = b.hp / b.maxHp;
  if (Math.abs(ra - rb) < 0.0005) this.endRound(null, 'EMPATE');
  else this.endRound(ra > rb ? a : b, 'TEMPO!');
};

CF.Match.prototype.endRound = function (winner, reason) {
  var self = this;
  // duplo KO: o outro também zerou neste frame
  if (winner && winner.hp <= 0) { winner = null; reason = 'DUPLO KO'; }
  this.phase = 'roundEnd';
  this.phaseT = 0;
  this.endReason = reason;
  this.roundWinner = winner;
  this.freeze = null;
  this.hitpause = reason === 'KO' || reason === 'DUPLO KO' ? 30 : 0;
  this.p.forEach(function (f) { f.totalHp += Math.max(0, f.hp); f.status = {}; f.hidden = false; });
  if (reason === 'KO' || reason === 'DUPLO KO') CF.Audio.ko();
  if (winner) {
    winner.wins++;
    var loser = this.opp(winner);
    if (!this.training) {
      CF.Store.roundResult(winner.id, loser.id);
      this.telao = { type: 'pct', f: winner, t: 0, life: 160 };
    }
    this.chat(winner.r.name.split(' ')[0] + ' +0,4%');
  }
  void self;
};

CF.Match.prototype.afterRound = function () {
  var a = this.p[0], b = this.p[1];
  var need = this.opts.roundsToWin || 2;
  var winner = a.wins >= need ? a : b.wins >= need ? b : null;
  if (!winner && this.round >= 5) {
    // depois de 5 rounds sem decisão: mais rounds vencidos, depois mais vida somada
    winner = a.wins !== b.wins ? (a.wins > b.wins ? a : b) : (a.totalHp >= b.totalHp ? a : b);
  }
  if (winner) {
    this.phase = 'matchEnd';
    this.phaseT = 0;
    winner.state = 'win';
    winner.move = null;
    this.say(winner, winner.r.quote, 200, '#fff');
    this.result = { winner: winner.side, winnerId: winner.id, loserId: this.opp(winner).id };
  } else {
    this.newRound();
  }
};
