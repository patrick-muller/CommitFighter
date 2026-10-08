// Telas: título, seleção, versus, luta, chefão, continue e faixa presidencial.
var CF = window.CF || (window.CF = {});

(function () {
  var I = CF.Input, T = function () { return CF.Render.text.apply(null, arguments); };
  var UP = ['KeyW', 'ArrowUp'], DOWN = ['KeyS', 'ArrowDown'], LEFT = ['KeyA', 'ArrowLeft'], RIGHT = ['KeyD', 'ArrowRight'];
  var OK = ['Enter', 'KeyF', 'Space'], BACK = ['Escape'];

  CF.Game = {
    scene: null,
    go: function (s) { this.scene = s; if (s.enter) s.enter(); },
    update: function () {
      if (I.hit('KeyM') && !(this.scene instanceof Fight)) {
        var muted = CF.Audio.toggle();
        if (this.scene.video) this.scene.video.muted = muted;
      }
      this.scene.update();
    },
    draw: function (ctx) { this.scene.draw(ctx); }
  };

  function backdrop(ctx, dim) {
    var bg = CF.Assets.stage();
    if (bg) ctx.drawImage(bg, 0, 0); else { ctx.fillStyle = '#120c1c'; ctx.fillRect(0, 0, CF.W, CF.H); }
    ctx.fillStyle = 'rgba(8,4,18,' + (dim === undefined ? 0.78 : dim) + ')';
    ctx.fillRect(0, 0, CF.W, CF.H);
  }

  function logo(ctx, y, t) {
    T(ctx, 'COMMIT', CF.W / 2 - 4, y, '#39ff88', 54, 'right');
    T(ctx, 'FIGHTER', CF.W / 2 + 4, y, '#b14dff', 54, 'left');
    T(ctx, '— ELEIÇÃO DA BOLHA —', CF.W / 2, y + 28, Math.floor(t / 30) % 2 ? '#fff' : '#ffd43b', 18, 'center');
  }

  function candidates() { return CF.ROSTER; }
  function bossLocked() { return !CF.Store.bossUnlocked(); }

  function checkCheat(scene) {
    if (I.typed('claude')) {
      CF.Store.unlockBoss();
      CF.Audio.boss();
      scene.toast = { text: 'Claude desbloqueado', t: 120 };
    }
  }
  function drawToast(ctx, s) {
    if (!s.toast) return;
    if (--s.toast.t <= 0) { s.toast = null; return; }
    ctx.fillStyle = 'rgba(232,116,59,0.9)'; ctx.fillRect(CF.W / 2 - 150, 8, 300, 30);
    T(ctx, s.toast.text, CF.W / 2, 29, '#fff', 16, 'center', false);
  }

  // ---------------------------------------------------------------- abertura
  // "Aperte Enter" e depois o vídeo da bolha uma vez, pulável. O Enter libera o som no navegador.
  function Opening() { this.t = 0; this.phase = 'press'; this.video = null; }
  Opening.prototype.update = function () {
    this.t++;
    if (this.phase === 'press') {
      if (I.any(OK)) { CF.Audio.confirm(); this.play(); }
      return;
    }
    var v = this.video;
    var stalled = this.t > 180 && (!v || v.readyState < 2);
    if (I.any(OK.concat(BACK)) || (v && v.ended) || this.failed || stalled) this.finish();
  };
  Opening.prototype.play = function () {
    var self = this, v = document.createElement('video');
    v.src = 'assets/bolhadev.mp4';
    v.playsInline = true;
    v.muted = CF.Audio.isMuted();
    v.volume = 0.8;
    v.onerror = function () { self.failed = true; };
    var p = v.play();
    // sem permissão de som: toca mudo
    if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () { self.failed = true; }); });
    this.video = v;
    this.phase = 'video';
    this.t = 0;
  };
  Opening.prototype.finish = function () {
    if (this.video) { this.video.pause(); this.video.removeAttribute('src'); this.video.load(); }
    CF.Game.go(new Title());
  };
  Opening.prototype.draw = function (ctx) {
    if (this.phase === 'press') {
      backdrop(ctx, 0.7);
      logo(ctx, 210, this.t);
      if (Math.floor(this.t / 30) % 2 === 0) T(ctx, 'APERTE ENTER', CF.W / 2, 330, '#fff', 30, 'center');
      T(ctx, '10 candidatos · 1 chefão · uma faixa presidencial', CF.W / 2, 372, '#c9bfe6', 14, 'center', false);
      T(ctx, 'Paródia de fã, sem afiliação. Ninguém aqui foi consultado.', CF.W / 2, 525, '#6b5a8e', 11, 'center', false);
      return;
    }
    backdrop(ctx, 0.9);
    // moldura de celular com o vídeo vertical
    var h = 500, w = Math.round(h * 9 / 16), x = (CF.W - w) / 2, y = 20, v = this.video;
    ctx.fillStyle = '#0b0812'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
    ctx.strokeStyle = '#b14dff'; ctx.lineWidth = 3; ctx.strokeRect(x - 10, y - 10, w + 20, h + 20);
    if (v && v.readyState >= 2) {
      var vw = v.videoWidth || 9, vh = v.videoHeight || 16, s = Math.min(w / vw, h / vh);
      ctx.drawImage(v, x + (w - vw * s) / 2, y + (h - vh * s) / 2, vw * s, vh * s);
    } else {
      T(ctx, 'carregando...', CF.W / 2, y + h / 2, '#c9bfe6', 16, 'center', false);
    }
    T(ctx, 'COMMIT', 150, 250, '#39ff88', 40, 'center');
    T(ctx, 'FIGHTER', 150, 292, '#b14dff', 40, 'center');
    if (v && v.muted) T(ctx, 'sem som (M liga o som)', CF.W - 150, 250, '#8a7fa8', 13, 'center', false);
    if (Math.floor(this.t / 30) % 2 === 0) T(ctx, 'Enter: pular', CF.W - 150, 292, '#fff', 18, 'center');
  };

  // ------------------------------------------------------------------ título
  function Title() { this.sel = 0; this.t = 0; }
  Title.prototype.items = function () {
    return ['Arcade', 'Versus · P2 humano', 'Versus · P2 CPU', 'Treino', 'Zerar porcentagens'];
  };
  Title.prototype.update = function () {
    this.t++;
    checkCheat(this);
    var n = this.items().length;
    if (I.any(UP)) { this.sel = (this.sel + n - 1) % n; CF.Audio.menu(); }
    if (I.any(DOWN)) { this.sel = (this.sel + 1) % n; CF.Audio.menu(); }
    if (I.any(OK)) {
      CF.Audio.confirm();
      var mode = ['arcade', 'versus', 'cpu', 'training', 'reset'][this.sel];
      if (mode === 'reset') { CF.Store.reset(); this.toast = { text: 'porcentagens zeradas', t: 90 }; return; }
      CF.Game.go(new Select(mode));
    }
  };
  Title.prototype.draw = function (ctx) {
    backdrop(ctx, 0.72);
    logo(ctx, 70, this.t);
    var list = candidates();
    for (var i = 0; i < list.length; i++) {
      var r = list[i], col = i % 5, row = Math.floor(i / 5);
      var x = 60 + col * 172, y = 118 + row * 112;
      var locked = r.boss && bossLocked();
      ctx.fillStyle = 'rgba(27,21,40,0.9)'; ctx.fillRect(x, y, 160, 104);
      ctx.strokeStyle = locked ? '#3a2d55' : r.color; ctx.lineWidth = 2; ctx.strokeRect(x, y, 160, 104);
      CF.Assets.drawPortrait(ctx, r.id, x + 6, y + 6, 60, locked);
      T(ctx, locked ? '???' : r.name, x + 72, y + 24, '#fff', 12, 'left', false, 84);
      T(ctx, locked ? 'chefão' : r.handle, x + 72, y + 42, locked ? '#6b5a8e' : r.color, 11, 'left', false, 84);
      var p = CF.Store.pct(r.id);
      T(ctx, p === null ? (locked ? '' : 'fora da urna') : p.toFixed(2).replace('.', ',') + '%', x + 72, y + 64, '#39ff88', p === null ? 11 : 18, 'left', false);
      ctx.fillStyle = '#231a38'; ctx.fillRect(x + 8, y + 84, 144, 8);
      if (p !== null) { ctx.fillStyle = r.color; ctx.fillRect(x + 8, y + 84, Math.min(144, p / 25 * 144), 8); }
    }
    var items = this.items();
    for (var k = 0; k < items.length; k++) {
      var on = k === this.sel;
      T(ctx, (on ? '▶ ' : '  ') + items[k], CF.W / 2 - 110, 365 + k * 26, on ? '#39ff88' : '#c9bfe6', 18, 'left');
    }
    T(ctx, 'P1: A/D andar · W pular · F soco · G chute · H especial · J super · frente+G = normal do kit', CF.W / 2, 505, '#8a7fa8', 12, 'center', false);
    T(ctx, "P2: setas · K soco · L chute · ; especial · ' super · Guarda = segurar para trás · M: som", CF.W / 2, 521, '#8a7fa8', 12, 'center', false);
    T(ctx, 'Paródia de fã, sem afiliação. Ninguém aqui foi consultado.', CF.W / 2, 537, '#6b5a8e', 11, 'center', false);
    drawToast(ctx, this);
  };

  // ---------------------------------------------------------------- seleção
  function Select(mode) {
    this.mode = mode;
    this.t = 0;
    this.c = [{ i: 0, done: false }, { i: 4, done: false }];
    this.step = 0;      // modos de 1 jogador: 0 = você, 1 = oponente
  }
  Select.prototype.selectable = function (i) { var r = CF.ROSTER[i]; return !(r.boss && bossLocked()); };
  Select.prototype.move = function (c, dx, dy) {
    var i = c.i;
    for (var tries = 0; tries < 10; tries++) {
      var col = (i % 5 + dx + 5) % 5, row = (Math.floor(i / 5) + dy + 2) % 2;
      i = row * 5 + col;
      if (this.selectable(i)) break;
    }
    c.i = i;
    CF.Audio.menu();
  };
  Select.prototype.update = function () {
    this.t++;
    checkCheat(this);
    var self = this;
    if (this.mode === 'versus') {
      var sets = [
        { c: this.c[0], l: ['KeyA'], r: ['KeyD'], u: ['KeyW'], d: ['KeyS'], ok: ['KeyF', 'Enter'], back: ['KeyG'] },
        { c: this.c[1], l: ['ArrowLeft'], r: ['ArrowRight'], u: ['ArrowUp'], d: ['ArrowDown'], ok: ['KeyK'], back: ['KeyL'] }
      ];
      sets.forEach(function (s) {
        if (s.c.done) { if (I.any(s.back)) s.c.done = false; return; }
        if (I.any(s.l)) self.move(s.c, -1, 0);
        if (I.any(s.r)) self.move(s.c, 1, 0);
        if (I.any(s.u)) self.move(s.c, 0, -1);
        if (I.any(s.d)) self.move(s.c, 0, 1);
        if (I.any(s.ok) && self.selectable(s.c.i)) { s.c.done = true; CF.Audio.confirm(); }
      });
      if (I.any(BACK)) { CF.Game.go(new Title()); return; }
      if (this.c[0].done && this.c[1].done) this.start();
      return;
    }
    var c = this.c[this.step];
    if (I.any(LEFT)) this.move(c, -1, 0);
    if (I.any(RIGHT)) this.move(c, 1, 0);
    if (I.any(UP)) this.move(c, 0, -1);
    if (I.any(DOWN)) this.move(c, 0, 1);
    if (I.any(BACK)) {
      if (this.step === 1) { this.step = 0; this.c[0].done = false; } else CF.Game.go(new Title());
      return;
    }
    if (I.any(OK.concat(['KeyK'])) && this.selectable(c.i)) {
      CF.Audio.confirm();
      c.done = true;
      if (this.mode === 'arcade') { CF.Arcade.start(CF.ROSTER[this.c[0].i]); return; }
      if (this.step === 0) { this.step = 1; this.c[1].done = false; return; }
      this.start();
    }
  };
  Select.prototype.start = function () {
    var mode = this.mode, a = CF.ROSTER[this.c[0].i], b = CF.ROSTER[this.c[1].i];
    var back = function () { CF.Game.go(new Select(mode)); };
    CF.Game.go(new Versus(a, b, function () {
      CF.Game.go(new Fight({ p1: a, p2: b, mode: mode, onDone: back, onQuit: back }));
    }));
  };
  Select.prototype.draw = function (ctx) {
    backdrop(ctx, 0.8);
    var head = { arcade: 'ARCADE · ESCOLHA SEU CANDIDATO', versus: 'VERSUS · P1 E P2 ESCOLHEM', cpu: 'VERSUS CPU', training: 'TREINO' }[this.mode];
    var sub = this.mode === 'versus' ? 'P1: WASD + F · P2: setas + K' : (this.step === 0 ? 'escolha você (setas/WASD + Enter)' : (this.mode === 'training' ? 'escolha o boneco' : 'escolha o oponente (CPU)'));
    T(ctx, head, CF.W / 2, 36, '#39ff88', 24, 'center');
    T(ctx, sub, CF.W / 2, 58, '#c9bfe6', 14, 'center', false);
    for (var i = 0; i < CF.ROSTER.length; i++) {
      var r = CF.ROSTER[i], col = i % 5, row = Math.floor(i / 5);
      var x = 70 + col * 166, y = 74 + row * 170;
      var locked = !this.selectable(i);
      ctx.fillStyle = 'rgba(27,21,40,0.92)'; ctx.fillRect(x, y, 156, 160);
      CF.Assets.drawPortrait(ctx, r.id, x + 23, y + 8, 110, locked);
      T(ctx, locked ? '???' : r.name, x + 78, y + 134, '#fff', 13, 'center', false, 148);
      T(ctx, locked ? 'derrote no Arcade' : r.handle, x + 78, y + 151, locked ? '#6b5a8e' : r.color, 11, 'center', false);
      for (var p = 0; p < 2; p++) {
        var c = this.c[p];
        var show = this.mode === 'versus' || p === 0 || this.step === 1 || (p === 1 && c.done);
        if (this.mode !== 'versus' && p === 1 && this.step === 0) show = false;
        if (!show || c.i !== i) continue;
        var colr = p === 0 ? '#b14dff' : '#39ff88';
        ctx.strokeStyle = c.done ? '#fff' : colr; ctx.lineWidth = c.done ? 5 : 4;
        ctx.strokeRect(x - 2 + p * 4, y - 2 + p * 4, 160 - p * 8, 164 - p * 8);
        T(ctx, (p === 0 ? '1P' : (this.mode === 'versus' ? '2P' : 'CPU')) + (c.done ? ' ✔' : ''), x + 6 + p * 100, y + 22, colr, 14, 'left');
      }
    }
    // kit de quem está em foco
    var focus = this.mode === 'versus' ? [0, 1] : [this.step];
    for (var k = 0; k < focus.length; k++) {
      var rr = CF.ROSTER[this.c[focus[k]].i];
      if (!this.selectable(this.c[focus[k]].i)) continue;
      var bx = focus.length === 1 ? CF.W / 2 - 230 : 40 + k * 460;
      ctx.fillStyle = 'rgba(11,8,18,0.85)'; ctx.fillRect(bx, 424, 460, 96);
      ctx.strokeStyle = rr.color; ctx.strokeRect(bx, 424, 460, 96);
      T(ctx, rr.name + ' ' + rr.handle + (rr.boss ? ' · CHEFÃO' : ''), bx + 12, 446, rr.color, 15, 'left', false);
      T(ctx, 'frente+chute: ' + rr.normal, bx + 12, 468, '#fff', 13, 'left', false);
      T(ctx, 'especial: ' + rr.special, bx + 12, 487, '#fff', 13, 'left', false);
      T(ctx, 'super: ' + rr.super + '   ·   "' + rr.quote + '"', bx + 12, 506, '#c9bfe6', 12, 'left', false);
    }
    drawToast(ctx, this);
  };

  // ----------------------------------------------------------------- versus
  function Versus(a, b, next, label) { this.a = a; this.b = b; this.next = next; this.t = 0; this.label = label; }
  Versus.prototype.update = function () { if (++this.t > 110 || (this.t > 20 && I.any(OK))) this.next(); };
  Versus.prototype.draw = function (ctx) {
    ctx.fillStyle = this.a.color; ctx.fillRect(0, 0, CF.W / 2, CF.H);
    ctx.fillStyle = this.b.color; ctx.fillRect(CF.W / 2, 0, CF.W / 2, CF.H);
    ctx.fillStyle = 'rgba(8,4,18,0.7)'; ctx.fillRect(0, 0, CF.W, CF.H);
    var slide = Math.max(0, 30 - this.t) * 12;
    CF.Assets.drawFighter(ctx, this.a.id, CF.FR.IDLE_A, 240 - slide, 450, 1, 1.5);
    CF.Assets.drawFighter(ctx, this.b.id, CF.FR.IDLE_A, 720 + slide, 450, -1, 1.5);
    T(ctx, 'VS', CF.W / 2, 260, '#fff', 80, 'center');
    T(ctx, this.a.name, 240, 500, '#fff', 24, 'center');
    T(ctx, this.a.handle, 240, 522, this.a.color, 14, 'center');
    T(ctx, this.b.name, 720, 500, '#fff', 24, 'center');
    T(ctx, this.b.handle, 720, 522, this.b.color, 14, 'center');
    if (this.label) T(ctx, this.label, CF.W / 2, 60, '#ffd43b', 22, 'center');
  };

  // ------------------------------------------------------------------- luta
  // cfg: { p1, p2, mode: 'versus'|'cpu'|'training'|'arcade'|'boss', onDone(result), onQuit() }
  function Fight(cfg) {
    this.cfg = cfg;
    var c1 = new CF.Controller(CF.KEYS.p1), c2 = new CF.Controller(CF.KEYS.p2);
    if (cfg.mode === 'cpu' || cfg.mode === 'arcade') c2.ai = new CF.AI('easy');
    if (cfg.mode === 'boss') c2.ai = new CF.AI('boss');
    if (cfg.mode === 'training') c2.ai = new CF.AI('dummy');
    this.dummy = cfg.mode === 'training' ? c2.ai : null;
    this.m = new CF.Match({
      p1: cfg.p1, p2: cfg.p2, ctrl1: c1, ctrl2: c2, boss2: cfg.mode === 'boss',
      training: cfg.mode === 'training', onDone: cfg.onDone
    });
    this.m.dummyMode = 'stand';
  }
  Fight.prototype.update = function () {
    var m = this.m;
    if (m.paused) {
      if (I.hit('Enter')) m.paused = false;
      else if (I.hit('Escape')) this.cfg.onQuit();
      return;
    }
    if (I.hit('Escape')) { m.paused = true; return; }
    if (this.dummy && I.hit('KeyT')) {
      this.dummy.mode = this.dummy.mode === 'stand' ? 'block' : 'stand';
      m.dummyMode = this.dummy.mode;
    }
    m.update();
  };
  Fight.prototype.draw = function (ctx) { CF.Render.match(ctx, this.m); };

  // ------------------------------------------------------------------ arcade
  CF.Arcade = {
    start: function (player) {
      var pool = CF.ROSTER.filter(function (r) { return !r.boss && r.id !== player.id; });
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      this.player = player;
      this.ladder = pool.slice(0, 3);
      this.idx = 0;
      this.next();
    },
    next: function () {
      var self = this, p = this.player;
      if (this.idx < this.ladder.length) {
        var opp = this.ladder[this.idx];
        CF.Game.go(new Versus(p, opp, function () { self.fight(opp, 'arcade'); }, 'LUTA ' + (this.idx + 1) + ' DE 4'));
      } else {
        CF.Game.go(new BossIntro(function () {
          CF.Game.go(new Versus(p, CF.byId('claude'), function () { self.fight(CF.byId('claude'), 'boss'); }, 'LUTA FINAL'));
        }));
      }
    },
    fight: function (opp, mode) {
      var self = this;
      CF.Game.go(new Fight({
        p1: this.player, p2: opp, mode: mode,
        onQuit: function () { CF.Game.go(new Title()); },
        onDone: function (res) {
          if (res.winner === 0) {
            if (mode === 'boss') CF.Game.go(new Faixa(self.player));
            else { self.idx++; self.next(); }
          } else {
            CF.Game.go(new Continue(function () { self.fight(opp, mode); }));
          }
        }
      }));
    }
  };

  function BossIntro(next) { this.next = next; this.t = 0; }
  BossIntro.prototype.enter = function () { CF.Audio.boss(); };
  BossIntro.prototype.update = function () { if (++this.t > 220 || (this.t > 40 && I.any(OK))) this.next(); };
  BossIntro.prototype.draw = function (ctx) {
    ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, CF.W, CF.H);
    for (var i = 0; i < 18; i++) {
      ctx.fillStyle = 'rgba(232,116,59,' + (Math.random() * 0.15) + ')';
      ctx.fillRect(0, Math.random() * CF.H, CF.W, 2 + Math.random() * 6);
    }
    var a = Math.min(1, this.t / 90);
    CF.Assets.drawFighter(ctx, 'claude', CF.FR.IDLE_A, CF.W / 2, 470, -1, 1.6, a);
    ctx.strokeStyle = '#e8743b'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(CF.W / 2, 110, 28, this.t / 6, this.t / 6 + 4.2); ctx.stroke();
    if (this.t > 30) T(ctx, 'UM NOVO DESAFIANTE ENTROU NO CHAT', CF.W / 2, 190, '#fff', 30, 'center');
    if (this.t > 80) T(ctx, 'Claude · @claudeai · chefão final', CF.W / 2, 222, '#e8743b', 18, 'center');
    if (this.t > 120) T(ctx, '"Posso ajudar com mais alguma coisa?"', CF.W / 2, 520, '#c9bfe6', 16, 'center');
  };

  function Continue(retry) { this.retry = retry; this.t = 0; }
  Continue.prototype.update = function () {
    this.t++;
    if (I.hit('Enter') || I.hit('KeyF')) { CF.Audio.confirm(); this.retry(); return; }
    if (I.hit('Escape') || this.t > 600) CF.Game.go(new Title());
  };
  Continue.prototype.draw = function (ctx) {
    backdrop(ctx, 0.85);
    var s = Math.max(0, 10 - Math.floor(this.t / 60));
    T(ctx, 'CONTINUAR?', CF.W / 2, 220, '#fff', 54, 'center');
    T(ctx, String(s), CF.W / 2, 320, s <= 3 ? '#ff4d6d' : '#ffd43b', 90, 'center');
    T(ctx, 'Enter: tentar de novo · Esc: menu', CF.W / 2, 380, '#c9bfe6', 18, 'center');
    T(ctx, 'git commit -m "agora vai"', CF.W / 2, 420, '#39ff88', 14, 'center', false);
  };

  // Tela final do Arcade: faixa presidencial da bolha
  function Faixa(winner) {
    this.w = winner; this.t = 0;
    this.newUnlock = bossLocked();
    CF.Store.unlockBoss();
    this.fx = [];
  }
  Faixa.prototype.enter = function () { CF.Audio.jingle(); };
  Faixa.prototype.update = function () {
    this.t++;
    if (this.t % 3 === 0) this.fx.push({ x: Math.random() * CF.W, y: -10, vy: 1.5 + Math.random() * 2, c: ['#39ff88', '#b14dff', '#ffd43b', '#4fd8ff'][this.t % 4] });
    this.fx.forEach(function (p) { p.y += p.vy; });
    this.fx = this.fx.filter(function (p) { return p.y < CF.H + 10; });
    if (this.t > 60 && I.any(OK.concat(BACK))) CF.Game.go(new Title());
  };
  Faixa.prototype.draw = function (ctx) {
    backdrop(ctx, 0.6);
    this.fx.forEach(function (p) { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 6, 6); });
    var x = CF.W / 2, y = 470;
    CF.Assets.drawFighter(ctx, this.w.id, CF.FR.WIN, x, y, 1, 1.5);
    // a faixa presidencial, verde e amarela, atravessando o peito
    ctx.save();
    ctx.translate(x, y - 170);
    ctx.rotate(-0.55);
    ctx.fillStyle = '#1f9d55'; ctx.fillRect(-90, -12, 180, 24);
    ctx.fillStyle = '#ffd43b'; ctx.fillRect(-90, -4, 180, 8);
    ctx.restore();
    T(ctx, 'PRESIDENTE DA BOLHA', x, 60, '#ffd43b', 40, 'center');
    T(ctx, this.w.name + ' ' + this.w.handle + ' leva a faixa presidencial', x, 92, '#fff', 18, 'center');
    CF.Render.balloon(ctx, '"' + this.w.quote + '"', x, 160, this.w.color);
    if (this.newUnlock) T(ctx, 'Claude desbloqueado no Versus e no Treino', x, 515, '#e8743b', 16, 'center');
    if (this.t > 60) T(ctx, 'Enter: voltar ao menu', x, 535, '#c9bfe6', 13, 'center', false);
  };

  CF.Screens = { Opening: Opening, Title: Title, Select: Select, Fight: Fight };
})();
