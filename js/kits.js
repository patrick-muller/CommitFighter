// Kits dos lutadores: Normal (frente+chute), Especial, Super e passivos.
// O status de cada kit (completo / simplificado) está no comentário do index.html.
var CF = window.CF || (window.CF = {});
CF.Kits = {};

(function () {
  var F = CF.FR;

  function special(o) {
    return Object.assign({ kind: 'special', button: 'special', startup: 14, active: 4, recovery: 18,
      dmg: 0, hitstun: 14, blockstun: 10, push: 8, hitpause: 4, wind: F.SP_CHARGE, act: F.SPECIAL }, o);
  }
  function normal(o) {
    return Object.assign({ kind: 'normal', button: 'normal', startup: 8, active: 4, recovery: 14,
      dmg: 40, hitstun: 12, blockstun: 8, push: 6, wind: F.KICK_WIND, act: F.KICK, sfx: 'kick' }, o);
  }
  function dirTo(f, t) { return t.x >= f.x ? 1 : -1; }
  function grounded(t) { return t.grounded() || t.state === 'hitstun'; }

  // Projétil padrão em linha reta.
  function shot(f, m, o) {
    return m.spawn(Object.assign({ owner: f, x: f.x + f.facing * 70, y: f.y - 115, vx: f.facing * 6,
      w: 40, h: 34, life: 160, kind: 'special' }, o));
  }

  // Super genérico: avança rápido e conecta no contato (erra quem está no ar).
  function rushSuper(o) {
    o = o || {};
    return {
      start: function (f, m, opp) {
        f.facing = dirTo(f, opp);
        f.invuln = 8;
        f.startMove(Object.assign({ kind: 'super', startup: 4, active: 34, recovery: 22, dmg: 280,
          hitstun: 30, push: 10, hitpause: 6, box: [0, -165, 70, 0], wind: F.SUPER, act: F.SUPER,
          onFrame: function (f2, m2, opp2, t) {
            if (t >= 4 && t < 38 && !f2.hitDone) f2.vx = f2.facing * 13;
            else f2.vx = 0;
          },
          onEnd: function (f2) { f2.vx = 0; }
        }, o.move || {}), m);
        if (o.onStart) o.onStart(f, m, opp);
      }
    };
  }

  // --------------------------------------------------------------- Mano Deyvin
  CF.Kits.deyvin = {
    init: function (f) { f.data.chopp = 0; },
    normal: normal({
      name: 'Fala, papai', dmg: 20, hitstun: 10, push: 14, box: [20, -160, 110, -50], wind: F.SP_CHARGE, act: F.WIN,
      onStart: function (f, m) { m.say(f, 'FALA, PAPAI!', 40, '#f2b134'); },
      onHit: function (f, t, d, m) {
        // pelas costas: o oponente vira e aplaude
        if (t.facing === f.facing && t.state !== 'down') {
          t.facing = -t.facing;
          t.setStuck(20, '👏 👏', '#f2b134', F.WIN);
          m.say(t, 'aplaudindo', 20, '#f2b134');
        }
      }
    }),
    special: special({
      name: 'Escala 7x0', active: 5, recovery: 20, dmg: 100, box: [10, -170, 120, -40],
      onFrame: function (f, m, opp, t) {
        if (t === 14) { f.hidden = true; f.invuln = 8; m.sparks(f.x, f.y - 90, '#f2b134', 10); }
        if (t === 20) {
          var d = dirTo(f, opp);
          f.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, opp.x - d * 75));
          f.facing = d;
          f.hidden = false;
          m.sparks(f.x, f.y - 90, '#f2b134', 10);
        }
      },
      frameAt: function (f, t) { return t < 14 ? F.SP_CHARGE : F.SPECIAL; },
      startup: 21
    }),
    super: {
      start: function (f, m, opp) {
        rushSuper({
          move: {
            dmg: 0, raw: true, hitstun: 1,
            onHit: function (f2, t2, d, m2) {
              // preso no palanque ouvindo o agradecimento
              t2.setStuck(130, 'ouvindo o agradecimento...', '#f2b134', F.HIT);
              t2.invuln = 0;
              f2.state = 'stuck'; f2.t = 130; f2.stuckFrame = F.SUPER; f2.vx = 0;
              m2.confetti(f2.x, f2.y, 80);
              m2.say(f2, 'OBRIGADO, OBRIGADO! SUBIU A RAMPA!', 120, '#f2b134');
              m2.later(128, function (m3) {
                if (m3.phase !== 'fight') return;
                t2.state = 'idle';
                m3.applyHit(f2, t2, { dmg: 280, kind: 'super', unblockable: true, knockdown: true, hitpause: 8, canHit: function () { return true; } });
              });
            }
          }
        }).start(f, m, opp);
      }
    },
    // Medidor de chopp: +1 por hit; com 7 o próximo golpe é crítico (dano em dobro).
    modifyDamage: function (f, t, dmg, info, m) {
      if (f.data.chopp >= 7 && dmg > 0) {
        f.data.chopp = 0;
        m.popup(t.x, t.y - 230, 'CRÍTICO 7x0!', '#f2b134', 60);
        return dmg * 2;
      }
      return dmg;
    },
    onDealHit: function (f, t, dmg) { if (dmg > 0 && f.data.chopp < 7) f.data.chopp++; },
    meterBar: function (f) { return { label: 'CHOPP', value: f.data.chopp / 7, color: '#f2b134' }; }
  };

  // ------------------------------------------------------------ Augusto Galego
  CF.Kits.galego = {
    normal: normal({
      name: 'Visto de nômade', startup: 6, active: 12, recovery: 14, dmg: 45, box: [10, -150, 80, -30],
      wind: F.WALK_B, act: F.SUPER,
      onFrame: function (f, m, opp, t) { f.vx = (t >= 6 && t < 18) ? f.facing * 9 : 0; },
      onEnd: function (f) { f.vx = 0; },
      onHit: function (f, t, d, m) {
        // rouba 1 frame de startup por 5s
        t.addStatus('slow', 300); f.addStatus('fast', 300);
        m.popup(t.x, t.y - 225, '-1 frame', '#c9a86a');
      }
    }),
    special: special({
      name: 'Curso relâmpago', box: null, recovery: 24,
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        shot(f, m, {
          vx: f.facing * 4.5, w: 70, h: 90, y: f.y - 110, type: 'slide', life: 200, reflectable: true,
          // ler (guarda) = 80; pular ou não reagir = 120
          onContact: function (p, tgt, m2) {
            var read = tgt.canBlock();
            var res = m2.applyHit(p.owner, tgt, { dmg: read ? 80 : 120, kind: 'special', unblockable: true,
              hitstun: 14, push: 8, fromX: p.x, canHit: function () { return true; } });
            if (res === 'hit') m2.say(tgt, read ? 'leu o slide' : 'não fez o exercício', 50, '#4fd8ff');
            return res !== 'miss';
          }
        });
      }
    }),
    super: rushSuper({
      onStart: function (f, m) {
        m.hudHidden = 480;
        f.addStatus('haste', 480);
        m.say(f, 'Já era a verba!', 60, '#c9a86a');
        m.chat('cadê o patrocínio?');
      }
    })
  };

  // ----------------------------------------------------------------- Raul Sena
  CF.Kits.raul = {
    normal: normal({
      name: 'Carguinho', startup: 10, dmg: 40, box: [20, -140, 100, -80], wind: F.IDLE_A, act: F.WIN,
      onStart: function (f, m) { m.say(f, 'aceita um carguinho?', 40, '#3b5bdb'); },
      onBlock: function (f, t, m) {
        // segurou guarda = aceitou o cargo: aliado por 2s, depois a facada pelas costas
        t.addStatus('ally', 120, function (t2, m2) { m2.damage(f, t2, 60, 'pelas costas', '#3b5bdb'); });
        m.say(t, 'agora é aliado', 60, '#3b5bdb');
      }
    }),
    special: special({
      name: 'Daily virou e-mail', box: null, recovery: 30,
      onStart: function (f) { f.data.unread = 0; f.data.mails = 0; },
      onFrame: function (f, m, opp, t) {
        if (t < 14 || t > 44 || (t - 14) % 10 !== 0) return;
        shot(f, m, {
          vx: f.facing * 3.5, w: 30, h: 22, y: f.y - 95 - ((t - 14) / 10) * 12, type: 'mail', life: 260,
          onContact: function (p, tgt, m2) {
            f.data.mails++;
            if (tgt.canBlock()) { m2.heal(tgt, 20); }
            else {
              f.data.unread++;
              m2.applyHit(p.owner, tgt, { dmg: 25, kind: 'special', unblockable: true, hitstun: 10, push: 3, hitpause: 0, fromX: p.x });
              if (f.data.unread === 4) {
                tgt.addStatus('inbox', 240);
                m2.say(tgt, '4 não lidos', 60, '#ff4d6d');
              }
            }
            return true;
          }
        });
      }
    }),
    super: rushSuper({
      move: {
        onHit: function (f, t, d, m) {
          var stun = t.id === 'claude' ? 60 : 30;
          m.later(56, function (m2) { if (m2.phase === 'fight' && t.state === 'idle') t.setStuck(stun, 'RATE LIMIT 429', '#ff4d6d'); });
        }
      }
    }),
    update: function (f, m, opp) {
      if (opp.has('inbox') && m.matchTime % 30 === 0) m.damage(f, opp, 5, 'inbox', '#ff4d6d');
    }
  };

  // ---------------------------------------------------------------- Sam Santos
  CF.Kits.sam = {
    normal: normal({
      name: 'Promise pendente', startup: 7, dmg: 0, raw: true, hitstun: 12, box: [20, -145, 100, -95],
      wind: F.PUNCH_WIND, act: F.PUNCH,
      onHit: function (f, t, d, m) {
        m.popup(t.x, t.y - 225, 'Promise <pending>', '#f5c518', 60);
        m.later(180, function (m2) { m2.damage(f, t, 70 * f.dmgMult(), 'resolved', '#f5c518'); });
      }
    }),
    special: special({
      name: 'BeeThreads', box: null, recovery: 22,
      onFrame: function (f, m, opp, t) {
        if (t !== 14 && t !== 20 && t !== 26) return;
        var k = (t - 14) / 6;
        shot(f, m, {
          vx: f.facing * 7, w: 26, h: 22, y: f.y - 120 + k * 18, type: 'bee', life: 120, seed: k,
          info: { dmg: 35, kind: 'special', hitstun: 12, push: 3, hitpause: 2 },
          update: function (p) { p.vy = Math.sin(p.t / 4 + p.seed) * 1.6; }
        });
      }
    }),
    super: rushSuper({
      move: {
        onHit: function (f, t, d, m) {
          if (t.hp > 0 && t.hp < t.maxHp * 0.3) {
            m.later(30, function (m2) { m2.damage(f, t, 200, 'BUILD QUEBROU', '#ff4d6d'); });
          }
        }
      },
      onStart: function (f, m) { m.addEntity({ type: 'greenlog', life: 120 }); m.say(f, 'Ship-it!', 50, '#39ff88'); }
    })
  };

  // ------------------------------------------------------------- Lucas Montano
  CF.Kits.montano = {
    onRound: function (f) { f.data.greet = true; },
    update: function (f, m) {
      if (f.data.greet && m.phase === 'fight') { f.data.greet = false; m.say(f, 'Se hidrate.', 60, '#4fd8ff'); }
    },
    normal: normal({
      name: 'Laptop Positivo', kind: 'normal', startup: 5, active: 3, recovery: 10, dmg: 35, hitstun: 10, push: 14,
      box: [20, -140, 95, -105], wind: F.PUNCH_WIND, act: F.PUNCH, sfx: 'punch',
      // frame data de notebook de entrada por 4s
      onHit: function (f, t, d, m) { t.addStatus('slow2', 240); m.popup(t.x, t.y - 225, 'rodando num Positivo', '#4fd8ff'); }
    }),
    special: special({
      name: 'Quinhentos estagiários', box: null, recovery: 24,
      onStart: function (f, m) { m.say(f, 'vou contratar 500 estagiários', 40, '#4fd8ff'); },
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        // a fila corre rente ao chão: quem está no ar passa por cima
        m.spawn({ owner: f, x: f.x + f.facing * 60, y: f.y - 30, vx: f.facing * 6, w: 150, h: 60, life: 200,
          type: 'interns', reflectable: false, noClash: true,
          info: { dmg: 120, kind: 'special', hitstun: 14, push: 10, canHit: function (tgt) { return tgt.grounded(); } } });
      }
    }),
    super: rushSuper({
      onStart: function (f, m, opp) {
        // fórum de 2014 até o fim do round; os especiais do oponente saem pela metade
        m.retro = 999999;
        opp.addStatus('halfSpecial', 999999);
        m.say(f, 'A bolha de antes...', 60, '#c8b98a');
        if (opp.id === 'claude') m.say(opp, 'contexto de 2014', 60, '#e8743b');
      }
    })
  };

  // -------------------------------------------------------- Sibelius Seraphini
  CF.Kits.sibelius = {
    normal: normal({
      name: 'Isso não escala', startup: 6, dmg: 40, box: [20, -150, 95, -90], wind: F.PUNCH_WIND, act: F.WIN,
      onStart: function (f, m) { m.say(f, 'isso não escala', 35, '#ff7a1a'); },
      onHit: function (f, t, d, m) { t.addStatus('naoEscala', 240); t.lastButton = null; }
    }),
    special: special({
      name: 'Sem form', box: null, recovery: 22,
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        m.addEntity({
          type: 'form', life: 40, owner: f,
          update: function (e, m2) {
            if (e.t !== 30) return;
            var tgt = m2.opp(e.owner);
            if (tgt.state === 'down' || tgt.invuln > 0) return;
            if (tgt.canBlock()) {
              tgt.setStuck(60, 'preenchendo form...', '#ff7a1a', F.BLOCK);
            } else {
              m2.applyHit(e.owner, tgt, { dmg: 100, kind: 'special', unblockable: true, fromX: e.owner.x, canHit: function () { return true; } });
              m2.say(tgt, 'lead perdido', 45, '#ff7a1a');
            }
          }
        });
      }
    }),
    super: {
      // Pix no round: a vida vira saldo e cai em centavos, 260 no total
      start: function (f, m, opp) {
        f.startMove({ kind: 'super', startup: 1, active: 1, recovery: 70, box: null, wind: F.SUPER, act: F.SUPER }, m);
        if (!(opp.grounded() || opp.state === 'hitstun')) { m.say(f, 'pix recusado', 40); return; }
        if (opp.canBlock()) { m.damage(f, opp, 26, 'pix bloqueado', '#ff7a1a'); return; }
        opp.setStuck(70, 'saldo caindo...', '#39ff88', F.HIT);
        for (var i = 0; i < 26; i++) {
          (function (k) {
            m.later(2 + k * 2, function (m2) {
              m2.damage(f, opp, 10, 'R$', '#39ff88');
              if (k % 4 === 0) CF.Audio.coin();
              if (k === 25 && opp.hp > 0) { opp.state = 'down'; opp.t = 40; }
            });
          })(i);
        }
      }
    }
  };

  // --------------------------------------------------------------- Fabio Akita
  CF.Kits.akita = {
    normal: normal({
      name: 'Bloqueio', startup: 4, active: 20, recovery: 10, dmg: 40, box: [20, -150, 85, -60],
      wind: F.BLOCK, act: F.BLOCK, sfx: 'block',
      onStart: function (f) { f.addStatus('reflect', 24); },
      onHit: function (f, t, d, m) { CF.Kits.akita.onReflect(f, t, m); }
    }),
    // reflete projétil e deixa o oponente mudo (sem especial) por 3s
    onReflect: function (f, t, m) {
      t.addStatus('mute', 180);
      m.say(t, 'BLOQUEADO', 50, '#d9d9d9');
    },
    special: special({
      name: 'Grito pras nuvens', box: null, recovery: 22,
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        shot(f, m, {
          vx: f.facing * 9, w: 70, h: 110, y: f.y - 120, life: 32, type: 'wave', reflectable: false,
          info: {
            dmg: 90, kind: 'special', hitstun: 14, push: 16,
            onHit: function (a, tgt, d, m2) {
              var nearWall = tgt.x < CF.WALL_L + 80 || tgt.x > CF.WALL_R - 80;
              if (nearWall && tgt.state === 'hitstun') { tgt.t = 50; m2.say(tgt, 'ouvindo o rant', 50, '#d9d9d9'); }
            }
          }
        });
      }
    }),
    super: {
      // ai-memory: a águia cruza o fundo e pune o botão mais usado
      start: function (f, m, opp) {
        f.startMove({ kind: 'super', startup: 1, active: 1, recovery: 40, box: null, wind: F.SUPER, act: F.SUPER }, m);
        var fav = 'punch', u = opp.usage;
        ['kick', 'special', 'normal'].forEach(function (k) { if ((u[k] || 0) > (u[fav] || 0)) fav = k; });
        m.say(f, 'lembro do teu ' + ({ punch: 'soco', kick: 'chute', special: 'especial', normal: 'normal' })[fav], 70, '#d9d9d9');
        m.spawn({ owner: f, x: f.facing > 0 ? -60 : CF.W + 60, y: f.y - 140, vx: f.facing * 16, w: 90, h: 80,
          life: 90, type: 'eagle', reflectable: false, noClash: true,
          info: { dmg: 280, kind: 'super', hitstun: 30, hitpause: 6 } });
        opp.data.memoryBan = fav;
        opp.addStatus('memory', 300, function (o) { o.data.memoryBan = null; });
      }
    },
    update: function (f, m, opp) {
      // memória: o botão favorito do oponente é punido assim que ele aperta
      if (!opp.has('memory') || opp.state !== 'attack' || opp.mt !== 1) return;
      var b = opp.move.button;
      if (b === opp.data.memoryBan) {
        delete opp.status.memory;
        m.applyHit(f, opp, { dmg: 60, kind: 'special', unblockable: true, hitstun: 16, canHit: function () { return true; } });
        m.say(f, 'já sabia', 40, '#d9d9d9');
      }
    }
  };

  // ------------------------------------------------------------------ Vini Lana
  CF.Kits.vini = {
    normal: normal({
      name: 'Aula ao vivo', startup: 7, dmg: 30, box: [20, -160, 130, -80], wind: F.IDLE_A, act: F.IDLE_A,
      onStart: function (f, m) { m.say(f, 'ó, repara aqui', 40, '#e03131'); },
      onHit: function (f, t, d, m) { t.addStatus('marked', 300); m.popup(t.x, t.y - 225, 'ponto fraco marcado', '#e03131', 60); }
    }),
    special: special({
      name: 'Academia', box: null, recovery: 26,
      onFrame: function (f, m, opp, t) {
        if (t !== 14 && t !== 24 && t !== 34) return;
        var k = (t - 14) / 10, bug = f.data.bug === undefined ? (f.data.bug = Math.floor(Math.random() * 3)) : f.data.bug;
        var buggy = k === bug;
        shot(f, m, {
          vx: f.facing * (buggy ? -2 : 4.5), w: 30, h: 60, y: f.y - 30, type: 'student', life: buggy ? 50 : 200,
          buggy: buggy, info: { dmg: 35, kind: 'special', hitstun: 12, push: 4, hitpause: 2 },
          onDeath: function (p, m2) { if (p.buggy) m2.popup(p.x, p.y - 40, 'bug', '#ff4d6d'); }
        });
        if (k === 2) f.data.bug = undefined;
      }
    }),
    super: {
      // 37k inscritos: o chat entra, likes viram projétil, um "primeiro" atrasado acerta no meio
      start: function (f, m, opp) {
        f.startMove({ kind: 'super', startup: 1, active: 1, recovery: 60, box: null, wind: F.SUPER, act: F.SUPER }, m);
        for (var i = 0; i < 6; i++) {
          (function (k) {
            m.later(k * 6, function (m2) {
              m2.spawn({ owner: f, x: f.x + f.facing * 60, y: f.y - 150 + (k % 3) * 35, vx: f.facing * 9, w: 30, h: 30,
                life: 120, type: k % 2 ? 'heart' : 'like', noClash: true,
                info: { dmg: 35, kind: 'super', hitstun: 14, hitpause: 2 } });
            });
          })(i);
        }
        m.later(40, function (m2) {
          m2.spawn({ owner: f, x: f.x + f.facing * 60, y: f.y - 110, vx: f.facing * 7, w: 60, h: 30, life: 140,
            type: 'primeiro', noClash: true, info: { dmg: 70, kind: 'super', hitstun: 20, knockdown: true } });
        });
        m.chat('PRIMEIRO'); m.chat('37k!!');
      }
    }
  };

  // ---------------------------------------------------------- Filipe Deschamps
  CF.Kits.deschamps = {
    normal: normal({
      name: 'Competência', startup: 10, active: 1, recovery: 16, dmg: 0, box: null, wind: F.SP_CHARGE, act: F.WIN,
      onStart: function (f, m, opp) {
        f.addStatus('competence', 240);
        m.opp(f).addStatus('tutorialBug', 240);
        m.say(f, 'quer se sentir competente?', 50, '#ffd43b');
      }
    }),
    special: special({
      name: 'Olha isso', box: null, recovery: 22,
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        shot(f, m, {
          vx: f.facing * 2.5, w: 70, h: 50, y: f.y - 125, life: 150, type: 'thumb',
          info: { dmg: 100, kind: 'special', hitstun: 14, push: 6 },
          // quem apertar soco com a thumbnail na tela entra no vídeo
          update: function (p, m2) {
            var tgt = m2.opp(p.owner);
            if (tgt.state === 'attack' && tgt.mt === 0 && tgt.move && tgt.move.button === 'punch') {
              p.dead = true;
              tgt.setStuck(60, 'assistindo o vídeo...', '#ffd43b', F.IDLE_B);
            }
          }
        });
      }
    }),
    super: {
      // Newsletter: cai em cima (160) e a leitura obrigatória segura o oponente
      start: function (f, m, opp) {
        f.startMove({ kind: 'super', startup: 1, active: 1, recovery: 50, box: null, wind: F.SUPER, act: F.SUPER }, m);
        m.addEntity({ type: 'newsletter', x: opp.x, y: -80, life: 40, owner: f,
          update: function (e, m2) {
            e.y += 14;
            var tgt = m2.opp(e.owner);
            if (e.t === 36) {
              var res = m2.applyHit(e.owner, tgt, { dmg: 160, kind: 'super', hitstun: 10, push: 0, hitpause: 6, fromX: tgt.x - e.owner.facing });
              if (res === 'hit') {
                tgt.state = 'idle';
                tgt.setStuck(240, 'lendo a newsletter...', '#ffd43b', F.HIT);
                tgt.data.reading = true;
              }
            }
          } });
      }
    },
    update: function (f, m, opp) {
      // martelar botões acelera a leitura
      if (opp.state === 'stuck' && opp.data.reading) {
        var c = opp.ctrl.pressed;
        if (c.punch || c.kick || c.special) opp.t -= 8;
        if (opp.t <= 1) opp.data.reading = false;
      }
    }
  };

  // -------------------------------------------------------------- Claude (chefão)
  CF.Kits.claude = {
    init: function (f) { f.data.ctx = 0; f.data.first = null; f.data.forgot = false; },
    normal: normal({
      name: 'Recusa educada', startup: 3, active: 20, recovery: 12, dmg: 0, box: null, wind: F.BLOCK, act: F.BLOCK, sfx: null,
      onStart: function (f) { f.addStatus('parry', 23); }
    }),
    // Recusa educada: para o golpe, dano zero, o oponente perde os botões por 12 frames
    onIncoming: function (f, att, info, m) {
      if (!f.has('parry') || info.kind === 'super') return null;
      delete f.status.parry;
      att.addStatus('noButtons', 12);
      if (att.state === 'attack') { att.state = 'blockstun'; att.t = 12; att.move = null; }
      m.say(f, 'Não posso ajudar com isso.', 45, '#e8743b');
      m.sparks(f.x + f.facing * 30, f.y - 120, '#e8743b', 10);
      CF.Audio.block();
      return 'parry';
    },
    special: special({
      name: 'Resposta longa', box: null, recovery: 22,
      onFrame: function (f, m, opp, t) {
        if (t !== 14) return;
        shot(f, m, { vx: f.facing * 6, w: 56, h: 40, type: 'bubble', info: { dmg: 100, kind: 'special', hitstun: 14, push: 8 } });
      }
    }),
    super: {
      // Estou pensando: o spinner trava os dois; depois uppercut em 3 passos (300)
      start: function (f, m, opp) {
        f.setStuck(60, null, null, F.SP_CHARGE);
        var hit = opp.grounded() || opp.state === 'hitstun';
        if (hit && !opp.canBlock()) opp.setStuck(60, 'Claude está pensando...', '#e8743b', F.IDLE_A);
        m.addEntity({ type: 'spinner', who: f, life: 60 });
        var half = f.data.forgot;
        m.later(60, function (m2) {
          if (m2.phase !== 'fight') return;
          var d = dirTo(f, opp);
          f.x = Math.max(CF.WALL_L, Math.min(CF.WALL_R, opp.x - d * 60));
          f.facing = d;
          f.startMove({ kind: 'super', startup: 1, active: 1, recovery: 40, box: null, wind: F.SUPER, act: F.SUPER }, m2);
          for (var k = 0; k < 3; k++) {
            (function (step) {
              m2.later(step * 8, function (m3) {
                var last = step === 2;
                m3.applyHit(f, opp, { dmg: half ? 50 : 100, kind: last ? 'super' : 'special', hitstun: 20, push: 2,
                  knockdown: last, hitpause: 4, canHit: function (t) { return step > 0 || grounded(t); } });
              });
            })(k);
          }
          if (half) { f.data.forgot = false; m2.later(30, function (m3) { m3.say(f, 'desculpa', 60, '#e8743b'); }); }
        });
      }
    },
    // Context window: +10% de dano a cada 10s; ao estourar, esquece e repete o primeiro golpe, errado
    update: function (f, m) {
      if (m.matchTime % 600 === 0 && m.matchTime > 0) {
        f.data.ctx++;
        if (f.data.ctx >= 6) {
          f.data.ctx = 0;
          f.data.forgot = true;
          m.say(f, 'contexto cheio: esqueci o começo', 70, '#e8743b');
        }
      }
    },
    dmgMult: function (f) { return 1 + 0.1 * f.data.ctx; },
    meterBar: function (f) { return { label: 'CONTEXTO', value: f.data.ctx / 6, color: '#e8743b', alert: f.data.forgot }; }
  };

  // Primeiro golpe do Claude no set, para ser repetido "errado" depois do estouro.
  var claudeStart = CF.Fighter.prototype.startMove;
  CF.Fighter.prototype.startMove = function (move, match) {
    if (this.id === 'claude' && move.kind !== 'super') {
      if (!this.data.first && move.button) this.data.first = move;
      else if (this.data.forgot && this.data.first && move.button && !move._wrong) {
        this.data.forgot = false;
        var src = this.data.first;
        move = Object.assign({}, src, {
          _wrong: true, dmg: Math.round((src.dmg || 0) / 2),
          box: src.box ? [src.box[0] + 40, src.box[1] + 30, src.box[2] + 40, src.box[3] + 30] : null
        });
        match.say(this, 'repetindo o primeiro golpe... errado', 50, '#e8743b');
      }
    }
    return claudeStart.call(this, move, match);
  };
})();
