// Porcentagens da urna e desbloqueio do chefão, salvos no localStorage.
var CF = window.CF || (window.CF = {});

CF.Store = (function () {
  var KEY_PCT = 'commitfighter.pct', KEY_BOSS = 'commitfighter.boss';
  var pct = {};

  function defaults() {
    var d = {};
    CF.ROSTER.forEach(function (r) { if (r.pct !== null) d[r.id] = r.pct; });
    return d;
  }

  function load() {
    pct = defaults();
    try {
      var saved = JSON.parse(localStorage.getItem(KEY_PCT) || 'null');
      if (saved) for (var k in saved) if (k in pct) pct[k] = saved[k];
    } catch (e) { /* file:// sem storage: segue com o padrão */ }
  }

  function save() {
    try { localStorage.setItem(KEY_PCT, JSON.stringify(pct)); } catch (e) { /* idem */ }
  }

  load();

  return {
    pct: function (id) { return id in pct ? pct[id] : null; },
    // +0,4 para quem venceu o round, −0,4 para quem perdeu (chefão fora da urna)
    roundResult: function (winner, loser) {
      if (winner in pct) pct[winner] = Math.round((pct[winner] + 0.4) * 100) / 100;
      if (loser in pct) pct[loser] = Math.max(0, Math.round((pct[loser] - 0.4) * 100) / 100);
      save();
    },
    reset: function () { pct = defaults(); save(); },
    bossUnlocked: function () {
      try { return localStorage.getItem(KEY_BOSS) === '1'; } catch (e) { return CF.Store._boss; }
    },
    unlockBoss: function () {
      CF.Store._boss = true;
      try { localStorage.setItem(KEY_BOSS, '1'); } catch (e) { /* idem */ }
    },
    _boss: false
  };
})();
