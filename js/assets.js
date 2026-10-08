// Carrega atlas, retratos e cenário (<img> funciona em file://) e desenha frames.
var CF = window.CF || (window.CF = {});

CF.Assets = (function () {
  var sheets = {}, portraits = {}, stage = null, pending = 0;

  function img(src, onload) {
    var im = new Image();
    pending++;
    im.onload = function () { pending--; if (onload) onload(im); };
    im.onerror = function () { pending--; };
    im.src = src;
    return im;
  }

  function load() {
    CF.ROSTER.forEach(function (r) {
      if (CF.ATLAS && CF.ATLAS[r.id]) sheets[r.id] = img(CF.ATLAS[r.id].src);
      portraits[r.id] = img('assets/portraits/' + r.id + '.png');
    });
    stage = img('assets/stage.jpg');
  }

  function ready(im) { return im && im.complete && im.naturalWidth > 0; }

  // Desenha o frame `fi` do lutador `id` com os pés em (x, y).
  function drawFighter(ctx, id, fi, x, y, facing, scale, alpha) {
    var s = scale || 1, im = sheets[id], at = CF.ATLAS && CF.ATLAS[id];
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(facing * s, s);
    if (ready(im) && at) {
      var f = at.frames[fi] || at.frames[0];
      ctx.drawImage(im, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]);
    } else {
      // placeholder até a folha existir
      var r = CF.byId(id);
      ctx.fillStyle = r ? r.color : '#888';
      ctx.fillRect(-28, -165, 56, 165);
      ctx.fillStyle = '#120c1c';
      ctx.fillRect(4, -150, 14, 8);
    }
    ctx.restore();
  }

  function drawPortrait(ctx, id, x, y, size, locked) {
    var im = portraits[id];
    ctx.save();
    if (locked || !ready(im)) {
      ctx.fillStyle = '#1b1528';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#6b5a8e';
      ctx.font = 'bold ' + Math.round(size * 0.4) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('???', x + size / 2, y + size / 2);
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(im, x, y, size, size);
    }
    ctx.restore();
  }

  return {
    load: load,
    loading: function () { return pending > 0; },
    drawFighter: drawFighter,
    drawPortrait: drawPortrait,
    stage: function () { return ready(stage) ? stage : null; },
    sheet: function (id) { return sheets[id]; }
  };
})();
