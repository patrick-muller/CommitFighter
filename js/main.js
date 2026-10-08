// Loop de 60 fps com passo fixo e canvas ajustado à janela.
var CF = window.CF || (window.CF = {});

(function () {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var STEP = 1000 / 60, acc = 0, last = performance.now();

  function fit() {
    var s = Math.min(window.innerWidth / CF.W, window.innerHeight / CF.H);
    canvas.style.width = Math.floor(CF.W * s) + 'px';
    canvas.style.height = Math.floor(CF.H * s) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  CF.Assets.load();
  CF.Game.go(new CF.Screens.Opening());

  function frame(now) {
    acc += Math.min(100, now - last);
    last = now;
    while (acc >= STEP) {
      CF.Game.update();
      CF.Input.endFrame();
      acc -= STEP;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    CF.Game.draw(ctx);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ganchos para testes automatizados
  CF.debug = { step: function (n) { for (var i = 0; i < (n || 1); i++) { CF.Game.update(); CF.Input.endFrame(); } CF.Game.draw(ctx); } };
})();
