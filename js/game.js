Game.isPaused = false;
Game.gameOver = false;
Game.activeScreen = "game";

var HyperMolen = function(canvas) {
  var CIRCLE = Math.PI * 2;
  var W = canvas.width;
  var H = canvas.height;
  var MID_X = W / 2;
  var MID_Y = H / 2;
  var ctx = canvas.getContext("2d");
  var keysDown = {};
  var greenLeft  = MID_X + 10;
  var greenRight = MID_X - 10;

  Game.init = function() {
    ctx.imageSmoothingEnabled = false;
  }

  var createArms = function(numArms, width) {
    var start, end;
    var arms = [];
    for (var n = 0; n < numArms; n++) {
      start = n * 1 / numArms;
      end = start + width;
      arms.push({start: start, end: end});
    }
    return arms;
  };

  var Stage = {};

  Game.initStage = function(stage) {
    var options = Game.stages[stage];
    Stage.terrain    = options.terrain;
    Stage.skyColor   = options.skyColor;
    Stage.landColor  = options.landColor;
    Stage.greenColor = options.greenColor;

    if (options.bgEffect) {
      Stage.bgEffect = Object.create(Game.bgEffects[options.bgEffect]).init(ctx);
    }

    Stage.molen = {};
    Stage.molen.armCount   = options.molen.arms;
    Stage.molen.armWidth   = options.molen.armWidth;
    Stage.molen.arms = createArms(Stage.molen.armCount, Stage.molen.armWidth);
    Stage.molen.towerColor = options.molen.towerColor;
    Stage.molen.capColor   = options.molen.capColor;
    Stage.molen.wheelColor = options.molen.wheelColor;
    Stage.molen.armColor   = options.molen.armColor;
    Stage.molen.frameColor = options.molen.frameColor;
    Stage.molen.sailColor  = options.molen.sailColor;

    Stage.molen.angle = 0;
    if (Stage.terrain === "land") {
      Stage.molen.pos = {x: MID_X, y:10};
      Stage.molen.armRadius = 20;
      Stage.targetCount = 1;
    } else if (Stage.terrain === "mirror") {
      Stage.molen.pos = {x: MID_X, y: MID_Y};
      Stage.molen.armRadius = 15;      
       Stage.targetCount = 2;
    } else if (Stage.terrain === "space") {
      Stage.molen.pos = {x: MID_X, y: MID_Y};
      Stage.molen.armRadius = 15;      
      Stage.targetCount = 4;
    }
    Stage.molen.heartRadius = 4;
    switch (Stage.targetCount) {
    case 1: 
      Stage.targets = [{x: 32, y: 33}];
      break;
    case 2:
      Stage.targets = 
        [{x: Stage.molen.pos.x, y: Stage.molen.pos.y + Stage.molen.armRadius}, 
         {x: Stage.molen.pos.x, y: Stage.molen.pos.y - Stage.molen.armRadius}];
      break;
    case 4:
      Stage.targets = 
        [{x: Stage.molen.pos.x, y: Stage.molen.pos.y + Stage.molen.armRadius}, 
         {x: Stage.molen.pos.x, y: Stage.molen.pos.y - Stage.molen.armRadius},
         {x: Stage.molen.pos.x + Stage.molen.armRadius, y: Stage.molen.pos.y},
         {x: Stage.molen.pos.x - Stage.molen.armRadius, y: Stage.molen.pos.y}];
      break;
    }
  }


  var Ball = {
    init: function(collection) {
      this.target = Stage.targets.random();
      this.color = colors.random();
      this.radius = 2;
      this.bounced = false;
      var x;
      var y;
      if (this.target.x !== Stage.molen.pos.x) {
        this.tendency = "horizontal";
        y = Math.random() * H;
        if (this.target.x > Stage.molen.pos.x) {
          x = H;
        }
        else {
          x = 0;
        }
      } else {
        this.tendency = "vertical";
        x = Math.random() * W;
        if (this.target.y > Stage.molen.pos.y) {
          y = H;
        }
        else {
          y = 0;
        } 
      }
      this.pos = Vector2d.new({x: x, y: y});
      this.speed = Math.random() * 6 + 18;
      this.direction = this.pos.directionTo(this.target);
      this.collection = collection;
      this.index = collection.push(this) - 1;
      return this;
    },
    update: function(timePassed) {
        var speed = this.speed * timePassed;
        this.pos.move(this.direction, speed);
        if (!this.bounced && this.pos.isNear(this.target)) {
          if (checkBlocking()) {
            this.bounced = true;
            if (this.tendency === "horizontal") {
              this.direction.x = -(this.direction.x);
            } else {
              this.direction.y = -(this.direction.y);
            }
          } else {
            this.destroy();
          }
        }
        if (this.pos.y > 70 || this.pos.y < -10) {
          this.destroy();
        }
    },
    destroy: function() {
        delete this.collection[this.index];
    },
  };

  var windSpeed = -3;
  var balls = [];

  var colors = ["#00ffff","#ffff00","#ff9999","#ff3333","#ff00ff","#00ff00"];

  var checkBlocking = function(offset) {
    var armStart, armEnd
    offset = offset || CIRCLE * 0.25;
    return Stage.molen.arms.some(function(arm) {
      armStart = Math.mod(arm.start * CIRCLE + Stage.molen.angle, CIRCLE);
      armEnd =   Math.mod(arm.end   * CIRCLE + Stage.molen.angle, CIRCLE);
      if (offset > armStart && offset < armEnd || 
        offset > armStart && armEnd < armStart || 
        offset < armStart && armEnd < armStart) {
        return true;
      }
    });
  };

  var addBall = function() {
    Object.create(Ball).init(balls);
  };

  /* Keyboard handling */
  addEventListener("keydown", function (e) {
      keysDown[e.keyCode] = true;
  }, false);
  addEventListener("keyup", function (e) {
      delete keysDown[e.keyCode];
  }, false);


  var update = function(timePassed) {
    var delta = timePassed * 2;
    Stage.molen.angle = Math.mod(Stage.molen.angle + windSpeed * timePassed, CIRCLE);
    if (39 in keysDown) { // right
      Stage.molen.angle = Math.mod(Stage.molen.angle - delta, CIRCLE);
    }
    if (37 in keysDown) { // left
      Stage.molen.angle = Math.mod(Stage.molen.angle + delta, CIRCLE);
    }
    if (38 in keysDown) { // up
      delete keysDown[38];
      addBall();
    }
    balls.forEach(function(ball) {
      ball.update(timePassed);
    });
    if (Stage.bgEffect) {
      Stage.bgEffect.update(timePassed);
    }
  };

  var drawPieSlice = function(ctx, x, y, radius, startAngle, endAngle) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
    ctx.restore();
  };

  var drawSky = function(ctx, stage, molen) {
    ctx.fillStyle = stage.skyColor;
    if (stage.terrain === "land") {
      ctx.fillRect(0, 0, W, 35);
    } else if (stage.terrain === "mirror" || stage.terrain === "space") {
      ctx.fillRect(0, 0, W, H);
    }
  }

  var drawTower = function(ctx, stage, molen) {
    if (stage.terrain === "land") {
      //draw body
      ctx.beginPath();
      ctx.fillStyle = molen.towerColor;
      ctx.moveTo(42, 35);
      ctx.lineTo(40, 16);
      ctx.lineTo(24, 16);
      ctx.lineTo(22, 35);
      ctx.fill();
      ctx.beginPath();    
      ctx.fillStyle = molen.capColor;
      ctx.moveTo(40, 16);
      ctx.lineTo(37, 3);
      ctx.lineTo(27, 3);
      ctx.lineTo(24, 16);
      ctx.fill();

      //draw portal
      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.arc(molen.pos.x, 36, molen.heartRadius, CIRCLE/2, 0);
      ctx.fill();
    } else if (stage.terrain === "mirror") {
      //draw body
      ctx.fillStyle = molen.towerColor;
      ctx.fillRect(22, molen.pos.y - molen.armRadius, 20, molen.armRadius * 2);
      ctx.fillStyle = molen.capColor;
      ctx.fillRect(22, 24, 20, 16);

      //draw portal
      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.arc(molen.pos.x, molen.pos.y + molen.armRadius, molen.heartRadius, CIRCLE/2, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x, molen.pos.y - molen.armRadius, molen.heartRadius, 0, CIRCLE/2);
      ctx.fill();

    } else if (stage.terrain === "space") {
      ctx.beginPath();
      ctx.fillStyle = molen.towerColor;
      ctx.arc(molen.pos.x, molen.pos.y, molen.armRadius, 0, CIRCLE);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = molen.capColor;
      ctx.arc(molen.pos.x, molen.pos.y, molen.armRadius * 0.6, 0, CIRCLE);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.arc(molen.pos.x, molen.pos.y + molen.armRadius, 2, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x, molen.pos.y - molen.armRadius, 2, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x + molen.armRadius, molen.pos.y, 2, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x - molen.armRadius, molen.pos.y, 2, CIRCLE, 0);
      ctx.fill();


    }
  }

  var drawGreen = function(ctx, stage, molen) {
    if (stage.terrain === "land") {
      ctx.beginPath();
      ctx.fillStyle = stage.greenColor;
      ctx.moveTo(greenLeft, 35);
      ctx.lineTo(greenRight, 35);
      ctx.lineTo(0, 64);
      ctx.lineTo(64, 64);
      ctx.fill();
    } else if (stage.terrain === "mirror") {
      ctx.beginPath();
      ctx.fillStyle = stage.greenColor;
      ctx.moveTo(greenLeft, molen.pos.y + molen.armRadius);
      ctx.lineTo(greenRight, molen.pos.y + molen.armRadius);
      ctx.lineTo(0, 64);
      ctx.lineTo(64, 64);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = stage.greenColor;
      ctx.moveTo(0, 0);
      ctx.lineTo(64, 0);
      ctx.lineTo(greenLeft, molen.pos.y - molen.armRadius);
      ctx.lineTo(greenRight, molen.pos.y - molen.armRadius);
      ctx.fill();
    } else if (stage.terrain === "space") {
      //todo
    }
  }

  var drawWheel = function(ctx, stage, molen) {
    //draw heart
    ctx.beginPath();
    ctx.fillStyle = molen.wheelColor;
    ctx.arc(molen.pos.x, molen.pos.y, molen.heartRadius, 0, CIRCLE);
    ctx.fill();

    ctx.translate(molen.pos.x, molen.pos.y)
    ctx.rotate(molen.angle)
    //draw arms
    molen.arms.forEach(function(arm) {
      // drawPieSlice(ctx, molen.pos.x, molen.pos.y, 
      //              molen.armRadius, 
      //              CIRCLE * arm.start + molen.angle, 
      //              CIRCLE * arm.end + molen.angle);
      ctx.rotate(1 / molen.armCount * CIRCLE)
      var bladeLength = molen.armRadius;
      var bladeAngle = (arm.end - arm.start) * CIRCLE;
      var bladeChord = Math.sqrt(2 * Math.pow(bladeLength, 2) - 2 * Math.pow(bladeLength, 2) * Math.cos(bladeAngle));
      var otherAngle = (CIRCLE/2 - bladeAngle)/2
      var bladeHeight = Math.sin(otherAngle) * bladeChord;
      var fakeHeight = (arm.end - arm.start) * 130;
      var frameThickness = bladeLength/20;
      var armThickness = frameThickness * 2;

      var sailColor = molen.sailColor;
      var frameColor = molen.frameColor;
      var lengthSectors = 6;
      var heightSectors = 3;

      ctx.fillStyle = frameColor;
      ctx.fillRect(molen.heartRadius, 0, bladeLength, bladeHeight);
      // ctx.fillRect(molen.heartRadius, 0, molen.armRadius - 5, (arm.end - arm.start) * 130);

      ctx.fillStyle = sailColor;
      ctx.fillRect(molen.heartRadius + frameThickness, frameThickness, bladeLength - frameThickness * 2, bladeHeight - frameThickness * 2);
      //ctx.fillRect(molen.heartRadius + 1, 0 + 1, molen.armRadius - 5 -2, (arm.end - arm.start) * 130 - 2);

      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, molen.heartRadius + bladeLength, armThickness);

      for (var line = 1; line <= lengthSectors; line++) {
         var x = (bladeLength - frameThickness * 2) * line / lengthSectors;
         ctx.fillRect(molen.heartRadius + x, 0, frameThickness, bladeHeight)
      }

      for (var line = 1; line <= heightSectors; line++) {
        var y = (bladeHeight - frameThickness * 2) * line / heightSectors;
        ctx.fillRect(molen.heartRadius, y + frameThickness, bladeLength, frameThickness)
      }

    });
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }


  var draw = function(stage) {
    var molen = stage.molen
    //clear screen
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    //draw sky
    if (stage.bgEffect) {
      stage.bgEffect.draw(molen.angle);
    } else {
      drawSky(ctx, stage, molen);
    }

    //draw tower
    drawTower(ctx, stage, molen);

    //draw green
    drawGreen(ctx, stage, molen);
    
    // draw windwheel
    drawWheel(ctx, stage, molen);

    //draw balls
    balls.forEach(function(ball) {
      ctx.beginPath();
      ctx.fillStyle = ball.color;
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, CIRCLE);
      ctx.fill();
    });
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
              update(delta / 1000);
              frameTime -= delta;
              runTime += delta;
          }
      draw(Stage);
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
  Game.initStage(2);
  initLoop();
  mainLoop();
}(document.querySelector('#canvas'));