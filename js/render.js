// Desenho da luta: stage, telão, lutadores, projéteis, efeitos e HUD.
var CF = window.CF || (window.CF = {});

CF.Render = (function () {
  var TELAO = [530, 96, 900, 278];   // área útil do telão no cenário
  var STATUS_LABEL = {
    mute: 'MUDO', ally: 'ALIADO', slow: '+1f', slow2: '+2f', fast: '-1f', haste: 'TURBO', marked: 'MARCADO',
    naoEscala: 'NÃO ESCALA', competence: 'COMPETENTE', tutorialBug: 'BUG DE TUTORIAL', inbox: 'INBOX',
    memory: 'MEMÓRIA', noButtons: 'SEM BOTÃO', noSuper: 'SEM SUPER', bolhaAntiga: '2014', halfSpecial: 'ESPECIAL 50%'
  };

  function font(px, bold) { return (bold === false ? '' : 'bold ') + px + 'px "Courier New", monospace'; }

  function text(ctx, s, x, y, color, px, align, outline, maxW) {
    ctx.font = font(px || 14);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    if (outline !== false) {
      ctx.lineWidth = Math.max(3, (px || 14) / 4);
      ctx.strokeStyle = '#0b0812';
      ctx.strokeText(s, x, y, maxW);
    }
    ctx.fillStyle = color || '#fff';
    ctx.fillText(s, x, y, maxW);
  }

  function balloon(ctx, s, x, y, color) {
    ctx.font = font(14);
    var w = Math.min(340, ctx.measureText(s).width + 18), h = 26;
    var bx = Math.max(6, Math.min(CF.W - w - 6, x - w / 2));
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx, y - h, w, h);
    ctx.fillRect(Math.max(bx + 6, Math.min(bx + w - 14, x - 4)), y, 8, 7);
    ctx.fillStyle = '#120c1c';
    ctx.fillRect(bx, y - h, w, 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color && color !== '#fff' ? '#120c1c' : '#120c1c';
    ctx.fillText(s, bx + w / 2, y - h / 2 + 1, w - 10);
    if (color && color !== '#fff') { ctx.fillStyle = color; ctx.fillRect(bx, y - 4, w, 4); }
  }

  // ---- stage ----------------------------------------------------------------

  function stage(ctx, m) {
    var bg = CF.Assets.stage();
    if (bg) ctx.drawImage(bg, 0, 0);
    else { ctx.fillStyle = '#120c1c'; ctx.fillRect(0, 0, CF.W, CF.H); }
    // placa AO VIVO
    var on = Math.floor(m.phaseT / 30) % 2 === 0;
    ctx.fillStyle = 'rgba(20,0,0,0.75)';
    ctx.fillRect(300, 100, 104, 28);
    ctx.fillStyle = on ? '#ff3344' : '#7a1a22';
    ctx.beginPath(); ctx.arc(316, 114, 6, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'AO VIVO', 328, 120, on ? '#ff6677' : '#a33', 14, 'left', false);

    if (m.retro > 0) {
      ctx.fillStyle = 'rgba(236,224,196,0.72)';
      ctx.fillRect(0, 0, CF.W, CF.H);
      ctx.fillStyle = '#3d5a99';
      ctx.fillRect(0, 88, CF.W, 26);
      text(ctx, 'forum.bolhadev.com.br — tópico: "vale a pena aprender jQuery em 2014?"', 12, 106, '#fff', 13, 'left', false);
    }
    telao(ctx, m);
  }

  function telao(ctx, m) {
    var x0 = TELAO[0], y0 = TELAO[1], w = TELAO[2] - TELAO[0], h = TELAO[3] - TELAO[1];
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.fillStyle = 'rgba(8,4,18,0.82)';
    ctx.fillRect(x0, y0, w, h);
    var tv = m.telao;
    if (tv && tv.type === 'super') {
      // corte do telão para o super
      var f = tv.f;
      ctx.fillStyle = f.r.color;
      ctx.globalAlpha = 0.25; ctx.fillRect(x0, y0, w, h); ctx.globalAlpha = 1;
      for (var i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x0 + ((i * 40 + tv.t * 8) % (w + 40)) - 40, y0, 20, h);
      }
      CF.Assets.drawFighter(ctx, f.id, CF.FR.SUPER, x0 + w * 0.32, y0 + h + 20, 1, 1.15);
      text(ctx, f.r.super.toUpperCase(), x0 + w * 0.66, y0 + h / 2, '#fff', 22, 'center');
      text(ctx, f.r.handle, x0 + w * 0.66, y0 + h / 2 + 26, f.r.color, 14, 'center');
    } else {
      text(ctx, 'URNA AO VIVO · ELEIÇÃO BOLHA DEV', x0 + 12, y0 + 22, '#39ff88', 13, 'left', false);
      for (var s = 0; s < 2; s++) {
        var fi = m.p[s], pct = CF.Store.pct(fi.id), y = y0 + 52 + s * 62;
        var glow = tv && tv.type === 'pct' && tv.f === fi;
        CF.Assets.drawPortrait(ctx, fi.id, x0 + 12, y - 18, 46);
        text(ctx, fi.r.name, x0 + 66, y - 2, '#fff', 14, 'left', false);
        if (pct === null) {
          text(ctx, 'chefão · fora da urna', x0 + 66, y + 18, '#e8743b', 13, 'left', false);
        } else {
          ctx.fillStyle = '#231a38'; ctx.fillRect(x0 + 66, y + 6, 200, 12);
          ctx.fillStyle = fi.r.color; ctx.fillRect(x0 + 66, y + 6, Math.min(200, pct / 25 * 200), 12);
          text(ctx, pct.toFixed(2).replace('.', ',') + '%', x0 + 276, y + 18, glow ? '#39ff88' : '#fff', 16, 'left', false);
          if (glow) text(ctx, '+0,4', x0 + 276, y - 4 - Math.min(10, tv.t / 4), '#39ff88', 14, 'left', false);
        }
      }
    }
    ctx.restore();
  }

  // ---- lutadores, projéteis, entidades -----------------------------------------

  function fighter(ctx, f) {
    // sombra oval no chão, menor no ar
    var air = Math.max(0, CF.GROUND - f.y), k = Math.max(0.4, 1 - air / 220);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(f.x, CF.GROUND + 2, 44 * k * f.scale, 9 * k, 0, 0, Math.PI * 2); ctx.fill();
    if (f.hidden) return;
    if (f.invuln > 0 && f.state === 'idle' && f.time % 4 < 2) return;
    var fr = f.frame();
    CF.Assets.drawFighter(ctx, f.id, fr, f.x, f.y, f.facing, f.scale);
    if (f.flash > 4) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      CF.Assets.drawFighter(ctx, f.id, fr, f.x, f.y, f.facing, f.scale, 0.45);
      ctx.restore();
    }
  }

  function labels(ctx, f) {
    if (f.hidden) return;
    var y = f.y - 185 * f.scale, list = [];
    for (var k in f.status) if (STATUS_LABEL[k]) list.push(STATUS_LABEL[k]);
    if (f.label) text(ctx, f.label.text, f.x, y - 18, f.label.color, 14, 'center');
    if (list.length) text(ctx, list.join(' · '), f.x, y, '#c9bfe6', 11, 'center');
  }

  function projectile(ctx, p) {
    var x = p.x, y = p.y, d = p.vx >= 0 ? 1 : -1;
    ctx.save();
    switch (p.type) {
      case 'slide':
        ctx.fillStyle = 'rgba(79,216,255,0.35)'; ctx.fillRect(x - 35, y - 45, 70, 90);
        ctx.strokeStyle = '#4fd8ff'; ctx.lineWidth = 3; ctx.strokeRect(x - 35, y - 45, 70, 90);
        ctx.fillStyle = '#e6fbff';
        for (var i = 0; i < 5; i++) ctx.fillRect(x - 26, y - 34 + i * 14, i === 0 ? 52 : 36 + (i * 7) % 16, 4);
        text(ctx, 'CURSO', x, y + 38, '#fff', 11, 'center', false);
        break;
      case 'mail':
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 15, y - 11, 30, 22);
        ctx.strokeStyle = '#3b5bdb'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 15, y - 11); ctx.lineTo(x, y + 2); ctx.lineTo(x + 15, y - 11); ctx.stroke();
        ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.arc(x + 13, y - 10, 5, 0, 7); ctx.fill();
        break;
      case 'bee':
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(x - 6, y - 14 - (p.t % 4 < 2 ? 2 : 0), 10, 8);
        ctx.fillStyle = '#f5c518'; ctx.beginPath(); ctx.ellipse(x, y, 13, 9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#120c1c'; ctx.fillRect(x - 4, y - 9, 3, 18); ctx.fillRect(x + 3, y - 9, 3, 18);
        ctx.fillRect(x + d * 12, y - 1, d * 6, 2);
        break;
      case 'wave':
        ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 1 - p.t / 32) + ')'; ctx.lineWidth = 4;
        for (var w = 0; w < 4; w++) {
          ctx.beginPath(); ctx.arc(x - d * w * 16, y, 20 + w * 12, d > 0 ? -0.9 : Math.PI - 0.9, d > 0 ? 0.9 : Math.PI + 0.9); ctx.stroke();
        }
        break;
      case 'student':
        var bob = Math.abs(Math.sin(p.t / 3)) * 4;
        ctx.fillStyle = p.buggy ? '#ff4d6d' : '#3b5bdb'; ctx.fillRect(x - 10, y - 28 - bob, 20, 26);
        ctx.fillStyle = '#d79b6e'; ctx.fillRect(x - 8, y - 46 - bob, 16, 16);
        ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 9, y - 48 - bob, 18, 6);
        ctx.fillStyle = '#9aa'; ctx.fillRect(x + d * 4, y - 22 - bob, d * 14, 9);
        if (p.buggy) text(ctx, '?', x, y - 54, '#ff4d6d', 14, 'center');
        break;
      case 'interns':
        for (var n = 0; n < 5; n++) {
          var ix = x - d * (n * 30 - 60), ib = Math.abs(Math.sin(p.t / 3 + n)) * 4;
          ctx.fillStyle = ['#3b5bdb', '#2f9e44', '#e8590c', '#7048e8', '#1098ad'][n]; ctx.fillRect(ix - 9, y - 4 - ib, 18, 24);
          ctx.fillStyle = '#d79b6e'; ctx.fillRect(ix - 7, y - 20 - ib, 14, 14);
          ctx.fillStyle = '#3a2618'; ctx.fillRect(ix - 8, y - 22 - ib, 16, 5);
          ctx.fillStyle = '#c0c0d0'; ctx.fillRect(ix + d * 3, y + 2 - ib, d * 12, 8);
        }
        text(ctx, '500 estagiários', x, y - 34, '#4fd8ff', 11, 'center');
        break;
      case 'thumb':
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 35, y - 25, 70, 50);
        ctx.fillStyle = '#ffd43b'; ctx.fillRect(x - 35, y + 14, 70, 11);
        ctx.fillStyle = '#e03131'; ctx.beginPath(); ctx.moveTo(x - 8, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x - 8, y + 12); ctx.fill();
        text(ctx, 'OLHA ISSO', x, y + 23, '#120c1c', 10, 'center', false);
        break;
      case 'bubble':
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 28, y - 20, 56, 36); ctx.fillRect(x - d * 18, y + 16, 10, 8);
        ctx.strokeStyle = '#e8743b'; ctx.lineWidth = 3; ctx.strokeRect(x - 28, y - 20, 56, 36);
        ctx.fillStyle = '#e8743b';
        for (var b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(x - 14 + b * 14, y - 2, 4, 0, 7); ctx.fill(); }
        break;
      case 'eagle':
        var flap = Math.sin(p.t / 2) * 18;
        ctx.fillStyle = '#6b4423';
        ctx.beginPath(); ctx.moveTo(x - d * 30, y); ctx.lineTo(x, y - 30 - flap); ctx.lineTo(x + d * 10, y); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - d * 30, y); ctx.lineTo(x, y + 20 + flap * 0.4); ctx.lineTo(x + d * 10, y); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, y, 34, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + d * 32, y - 4, 10, 0, 7); ctx.fill();
        ctx.fillStyle = '#f2b134'; ctx.fillRect(x + d * 40, y - 4, d * 10, 5);
        break;
      case 'like': case 'heart':
        ctx.font = font(26, false); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'like' ? '👍' : '❤️', x, y);
        break;
      case 'primeiro':
        ctx.fillStyle = '#e03131'; ctx.fillRect(x - 46, y - 14, 92, 28);
        text(ctx, 'PRIMEIRO', x, y + 6, '#fff', 15, 'center', false);
        break;
    }
    ctx.restore();
  }

  function entity(ctx, e, m) {
    ctx.save();
    switch (e.type) {
      case 'tree':
        var y = CF.GROUND - 4, pulse = 0.5 + 0.5 * Math.sin(e.t / 3), done = e.t >= 50;
        ctx.strokeStyle = 'rgba(79,216,255,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(e.nodes[1], y - 40); ctx.lineTo(e.nodes[0], y); ctx.moveTo(e.nodes[1], y - 40); ctx.lineTo(e.nodes[2], y);
        ctx.moveTo(e.nodes[1], y - 40); ctx.lineTo(e.nodes[1], y); ctx.stroke();
        e.nodes.forEach(function (nx, i) {
          var ok = i === e.ok;
          ctx.fillStyle = ok ? 'rgba(57,255,136,' + (0.5 + pulse * 0.5) + ')' : (done ? '#ff4d6d' : 'rgba(255,77,109,0.6)');
          ctx.beginPath(); ctx.ellipse(nx, y, 40, 10, 0, 0, 7); ctx.fill();
        });
        text(ctx, 'leetcode reverso: fique no nó verde', e.nodes[1], y - 50, '#4fd8ff', 12, 'center');
        break;
      case 'form':
        var a = Math.min(1, e.t / 8);
        ctx.globalAlpha = 0.92 * a;
        ctx.fillStyle = '#fff'; ctx.fillRect(220, 120, 520, 320);
        ctx.fillStyle = '#ff7a1a'; ctx.fillRect(220, 120, 520, 36);
        text(ctx, 'Formulário de contato (1 de 37)', 236, 144, '#fff', 16, 'left', false);
        ctx.fillStyle = '#ddd';
        for (var i = 0; i < 6; i++) ctx.fillRect(240, 175 + i * 40, 480, 24);
        text(ctx, 'GUARDA = preencher · qualquer outra coisa = fechar', 480, 428, '#120c1c', 13, 'center', false);
        break;
      case 'greenlog':
        ctx.globalAlpha = Math.max(0, 1 - e.t / 120) * 0.8;
        ctx.fillStyle = 'rgba(0,30,10,0.6)'; ctx.fillRect(0, 0, CF.W, CF.H);
        ctx.font = font(13, false); ctx.fillStyle = '#39ff88'; ctx.textAlign = 'left';
        for (var l = 0; l < 26; l++) ctx.fillText('[deploy] ✔ step ' + (l + e.t) + ' ok · pushed to production', 20 + (l % 3) * 300, ((l * 21 + e.t * 4) % 560));
        break;
      case 'newsletter':
        ctx.fillStyle = '#f5f0e0'; ctx.fillRect(e.x - 60, e.y - 40, 120, 80);
        ctx.strokeStyle = '#120c1c'; ctx.lineWidth = 3; ctx.strokeRect(e.x - 60, e.y - 40, 120, 80);
        text(ctx, 'NEWSLETTER', e.x, e.y - 18, '#120c1c', 13, 'center', false);
        ctx.fillStyle = '#999';
        for (var n = 0; n < 4; n++) ctx.fillRect(e.x - 48, e.y - 6 + n * 10, 96, 4);
        break;
      case 'spinner':
        var cx = CF.W / 2, cy = 230;
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, CF.W, CF.H);
        ctx.strokeStyle = '#e8743b'; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, 50, e.t / 5, e.t / 5 + 4.2); ctx.stroke();
        text(ctx, 'Estou pensando...', cx, cy + 90, '#e8743b', 22, 'center');
        break;
    }
    ctx.restore();
  }

  function fx(ctx, m) {
    m.fx.forEach(function (e) {
      if (e.type === 'px') {
        ctx.globalAlpha = Math.max(0, 1 - e.t / e.life);
        ctx.fillStyle = e.color;
        ctx.fillRect(Math.round(e.x), Math.round(e.y), e.size, e.size);
        ctx.globalAlpha = 1;
      } else if (e.type === 'text') {
        ctx.globalAlpha = Math.max(0, 1 - e.t / e.life);
        text(ctx, e.text, e.x, e.y, e.color, 14, 'center');
        ctx.globalAlpha = 1;
      } else if (e.type === 'say') {
        if (!e.who.hidden) balloon(ctx, e.text, e.who.x, e.who.y - 205 * e.who.scale, e.color);
      }
    });
  }

  // ---- HUD --------------------------------------------------------------------

  function bar(ctx, x, y, w, h, frac, color, rightAnchor, trail) {
    ctx.fillStyle = '#0b0812'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#3a1020'; ctx.fillRect(x, y, w, h);
    if (trail !== undefined) {
      ctx.fillStyle = '#ff4d6d';
      var tw = w * trail; ctx.fillRect(rightAnchor ? x + w - tw : x, y, tw, h);
    }
    var fw = w * Math.max(0, frac);
    ctx.fillStyle = color; ctx.fillRect(rightAnchor ? x + w - fw : x, y, fw, h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(rightAnchor ? x + w - fw : x, y, fw, 4);
  }

  function hud(ctx, m) {
    for (var s = 0; s < 2; s++) {
      var f = m.p[s], right = s === 1;
      f.trail = f.trail === undefined ? f.hp : Math.max(f.hp, f.trail - 4);
      var px = right ? CF.W - 66 : 10;
      CF.Assets.drawPortrait(ctx, f.id, px, 8, 56);
      ctx.strokeStyle = f.r.color; ctx.lineWidth = 2; ctx.strokeRect(px, 8, 56, 56);
      var bx = right ? 520 : 74, bw = 366;
      var low = f.hp / f.maxHp < 0.3;
      bar(ctx, bx, 16, bw, 20, f.hp / f.maxHp, low ? '#ffd43b' : '#39ff88', right, f.trail / f.maxHp);
      text(ctx, f.r.name.toUpperCase(), right ? bx + bw : bx, 56, '#fff', 15, right ? 'right' : 'left');
      text(ctx, f.r.handle, right ? bx + bw : bx, 72, f.r.color, 12, right ? 'right' : 'left');
      // rounds vencidos
      for (var w = 0; w < 2; w++) {
        ctx.fillStyle = w < f.wins ? '#ffd43b' : '#2a2140';
        ctx.fillRect(right ? bx + 6 + w * 16 : bx + bw - 18 - w * 16, 42, 12, 12);
      }
      // super com foguete
      var mx = right ? CF.W - 250 : 50, my = 506;
      bar(ctx, mx, my, 200, 12, f.meter / 100, f.meter >= 100 ? (m.phaseT % 10 < 5 ? '#fff' : '#b14dff') : '#b14dff', right);
      ctx.font = font(20, false); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🚀', right ? CF.W - 30 : 30, my + 6);
      if (f.meter >= 100) text(ctx, 'SUPER!', right ? mx + 200 : mx, my - 6, '#fff', 12, right ? 'right' : 'left');
      var kb = f.kit.meterBar && f.kit.meterBar(f);
      if (kb) {
        bar(ctx, mx, my - 26, 120, 8, kb.value, kb.alert && m.phaseT % 10 < 5 ? '#fff' : kb.color, right);
        text(ctx, kb.label, right ? mx + 200 - 128 : mx + 128, my - 18, kb.color, 11, right ? 'right' : 'left');
      }
    }
    // timer central
    var secs = m.training ? '∞' : String(Math.max(0, Math.ceil((CF.ROUND_FRAMES - m.roundTime) / 60)));
    ctx.fillStyle = '#0b0812'; ctx.fillRect(CF.W / 2 - 34, 8, 68, 50);
    ctx.strokeStyle = '#b14dff'; ctx.lineWidth = 2; ctx.strokeRect(CF.W / 2 - 34, 8, 68, 50);
    text(ctx, secs, CF.W / 2, 48, secs !== '∞' && +secs <= 10 ? '#ff4d6d' : '#fff', 34, 'center');
    // banner fixo
    ctx.fillStyle = 'rgba(11,8,18,0.85)'; ctx.fillRect(CF.W / 2 - 130, 498, 260, 30);
    ctx.strokeStyle = '#39ff88'; ctx.strokeRect(CF.W / 2 - 130, 498, 260, 30);
    text(ctx, 'ELEIÇÃO BOLHA DEV', CF.W / 2, 519, '#39ff88', 16, 'center');
    chat(ctx, m);
  }

  function chat(ctx, m) {
    var cols = [[8, 150], [CF.W - 200, 300]];
    for (var s = 0; s < 2; s++) {
      var msgs = m.chatLog.filter(function (c) { return c.side === s; }).slice(-6);
      var x = cols[s][0], y = cols[s][1];
      ctx.fillStyle = 'rgba(11,8,18,0.55)'; ctx.fillRect(x, y, 192, 140);
      text(ctx, 'chat · ao vivo', x + 6, y + 14, '#b14dff', 11, 'left', false);
      msgs.forEach(function (c, i) {
        var yy = y + 34 + i * 18 + Math.max(0, 8 - c.t);
        ctx.globalAlpha = Math.min(1, c.t / 8);
        text(ctx, c.user + ':', x + 6, yy, '#8a7fa8', 11, 'left', false);
        ctx.font = font(11, false);
        var uw = ctx.measureText(c.user + ': ').width;
        text(ctx, c.text, x + 6 + uw, yy, '#fff', 11, 'left', false);
        ctx.globalAlpha = 1;
      });
    }
  }

  function overlays(ctx, m) {
    if (m.phase === 'intro') {
      var s = m.phaseT < 60 ? 'ROUND ' + m.round : 'SHIPA!';
      text(ctx, s, CF.W / 2, 250, m.phaseT < 60 ? '#fff' : '#39ff88', 56, 'center');
    } else if (m.phase === 'roundEnd') {
      text(ctx, m.endReason, CF.W / 2, 240, '#ff4d6d', 60, 'center');
      if (m.roundWinner) text(ctx, m.roundWinner.r.name + ' vence o round', CF.W / 2, 285, '#fff', 22, 'center');
      else text(ctx, 'round não conta', CF.W / 2, 285, '#fff', 22, 'center');
    } else if (m.phase === 'matchEnd') {
      var w = m.p[m.result.winner];
      text(ctx, w.r.name.toUpperCase() + ' VENCEU', CF.W / 2, 240, '#ffd43b', 44, 'center');
    }
    if (m.training) text(ctx, 'TREINO · T: boneco ' + (m.dummyMode === 'block' ? 'BLOQUEANDO' : 'PARADO') + ' · Esc: pausa', CF.W / 2, 490, '#c9bfe6', 13, 'center');
    if (m.hudHidden > 0) text(ctx, 'HUD cortado: acabou a verba', CF.W / 2, 30, '#c9a86a', 16, 'center');
    if (m.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, CF.W, CF.H);
      text(ctx, 'PAUSA', CF.W / 2, 240, '#fff', 54, 'center');
      text(ctx, 'Enter: continuar · Esc: sair para o menu', CF.W / 2, 285, '#c9bfe6', 18, 'center');
    }
  }

  function match(ctx, m) {
    ctx.save();
    if (m.shake > 0) ctx.translate((Math.random() - 0.5) * m.shake, (Math.random() - 0.5) * m.shake);
    var fz = m.freeze;
    if (fz) {
      // super: congela, escurece o fundo e dá zoom no lutador
      var z = 1 + 0.3 * Math.min(1, (60 - fz.t) / 10);
      ctx.translate(fz.f.x, fz.f.y - 90);
      ctx.scale(z, z);
      ctx.translate(-fz.f.x, -(fz.f.y - 90));
    }
    stage(ctx, m);
    if (fz) { ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(-200, -200, CF.W + 400, CF.H + 400); }
    m.entities.forEach(function (e) { if (e.type === 'tree' || e.type === 'greenlog') entity(ctx, e, m); });
    var order = m.p.slice().sort(function (a, b) { return (a.state === 'attack' || a.state === 'super') - (b.state === 'attack' || b.state === 'super'); });
    order.forEach(function (f) { fighter(ctx, f); });
    m.projectiles.forEach(function (p) { projectile(ctx, p); });
    m.entities.forEach(function (e) { if (e.type !== 'tree' && e.type !== 'greenlog') entity(ctx, e, m); });
    m.p.forEach(function (f) { labels(ctx, f); });
    fx(ctx, m);
    ctx.restore();
    if (!m.hudHidden) hud(ctx, m);
    overlays(ctx, m);
  }

  return { match: match, text: text, balloon: balloon, font: font };
})();
