var HyperMolen = function(canvas) {
  var ctx = canvas.getContext("2d");

  Game.init = function() {
    ctx.imageSmoothingEnabled = false;
    Game.isPaused = false;
    Game.gameOver = false;
    Game.activeScreen = "main";
    Game.stage = 3;
    Game.currentScreen = Game.screens[Game.activeScreen];
    Game.currentScreen.init(ctx, Game.stages[Game.stage]);
  }

  var update = function(delta) {
    Game.currentScreen.update(delta);
  };

  var draw = function(stage) {
    Game.currentScreen.draw();
  };

  var runTime, timeStep, currentTime
  var initLoop = function() {
    runTime = 0;
    timeStep = 1 / 30; 
    currentTime = Date.now();
  }
  var mainLoop = function () {
          var newTime = Date.now();
          var frameTime = newTime - currentTime;
          currentTime = newTime;
          while (frameTime > 0) {
              var delta = Math.min(frameTime, timeStep);
              Game.currentScreen.update(delta / 1000);
              frameTime -= delta;
              runTime += delta;
          }
      Game.currentScreen.draw();
      if (!Game.gameOver && !Game.isPaused) {
          requestAnimationFrame(mainLoop, canvas);
      }
      else {
          // drawGameOver(ctx);
          // window.addEventListener("keydown", function(e) {
          //     if(e.keyCode === 82) {
          //         location.reload();
          //     }
          // }, false);
      }
  };

  window.addEventListener('blur', function() {Game.isPaused = true;})
  window.addEventListener('focus', function() {Game.isPaused = false; initLoop(); mainLoop();})

  Game.init();
  initLoop();
  mainLoop();
}(document.querySelector('#canvas'));