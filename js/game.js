Vector2d = {
  init: function(pos) {
    this.x = pos.x;
    this.y = pos.y;
    return this;
  },
  new: function(pos) {
    return Object.create(Vector2d).init(pos);
  },
  distanceTo(pos) {
    var deltaX = pos.x - this.x;
    var deltaY = pos.y - this.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  },
  directionTo: function(pos) {
    var deltaX = pos.x - this.x;
    var deltaY = pos.y - this.y;
    var distance = this.distanceTo(pos)
    var dirX = deltaX / distance;
    var dirY = deltaY / distance;
    return Vector2d.new({x: dirX , y: dirY});
  },
  moveTowards: function(pos, speed) {
    var dir = this.directionTo(pos);
    this.x += dir.x * speed;
    this.y += dir.y * speed;
  },
  isNear: function(pos) {
    return(this.distanceTo(pos) < 1)
  }
}

Math.mod = function(x, y) {
  return ((x % y) + y) % y;
},

HyperMolen = function(canvas) {
  var CIRCLE = Math.PI * 2;
  var W = canvas.width;
  var H = canvas.height;
  var ctx = canvas.getContext("2d");
  var keysDown = {};
  var gameOver = false;
  var isPaused = false;
  var MID_X = W / 2;
  var greenLeft  = MID_X + 10;
  var greenRight = MID_X - 10;
  var greenPerspective = 6;

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

  var molen = {};
  molen.angle = 0;//CIRCLE / 4 - CIRCLE * 0.125;
  molen.pos = {x: MID_X, y:10};
  molen.armRadius = 25;
  molen.armCount = 4;
  molen.armWidth = 0.125;
  molen.arms = createArms(molen.armCount, molen.armWidth);
  molen.heartRadius = 4;
  var windSpeed = -3;
  var balls = [];


  var checkHit = function(offset) {
    var armStart, armEnd
    offset = offset || CIRCLE * 0.25;
    return molen.arms.some(function(arm) {
      armStart = Math.mod(arm.start * CIRCLE + molen.angle, CIRCLE);
      armEnd =   Math.mod(arm.end   * CIRCLE + molen.angle, CIRCLE);
      if (offset > armStart && offset < armEnd || 
        offset > armStart && armEnd < armStart || 
        offset < armStart && armEnd < armStart) {
        return true;
      }
    });
  };
  var randomColor = function() {
    var colors = ["#00ffff","#ffff00","#ff9999","ff3333","ff00ff","00ff00"];
    return colors[Math.floor(Math.random() * colors.length)]
  }

  var ball = {
    init: function() {
      this.color = randomColor();
      this.radius = 2;
      this.pos = Vector2d.new({x: Math.random() * 64, y: 64});
      this.speed = Math.random() * 6 + 18;
      this.targets = [Vector2d.new({x: 32, y: 33})];
      this.index = balls.push(this) - 1;
      return this;
    },
    update: function(timePassed) {
      if (this.targets.length > 0) {
        var speed = this.speed * timePassed;
        this.pos.moveTowards(this.targets[0], speed);
        if (this.pos.isNear(this.targets[0])) {
          if (checkHit()) {
            this.targets.shift();
            this.targets.push({x: Math.random() * 64, y: 68}); 
          } else {
            this.targets.shift();
          }
        }
      } else {
        delete balls[this.index];
      }
    }
  };

  var addBall = function() {
    Object.create(ball).init();
  };

  /* Keyboard handling */
  addEventListener("keydown", function (e) {
      keysDown[e.keyCode] = true;
  }, false);
  addEventListener("keyup", function (e) {
      delete keysDown[e.keyCode];
  }, false);


  var update = function(timePassed) {
    if (isPaused) {
      return;
    }
    var delta = timePassed * 2;
    molen.angle = Math.mod(molen.angle + windSpeed * timePassed, CIRCLE);
    if (39 in keysDown) { // right
      molen.angle = Math.mod(molen.angle - delta, CIRCLE);
    }
    if (37 in keysDown) { // left
      molen.angle = Math.mod(molen.angle + delta, CIRCLE);
    }
    if (38 in keysDown) { // up
      delete keysDown[38];
      addBall();
    }
    balls.forEach(function(ball) {
      ball.update(timePassed);
    });
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

  var draw = function() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);
    //draw body
    ctx.beginPath();
    ctx.fillStyle = "#D2B48C";
    ctx.moveTo(42, 35);
    ctx.lineTo(40, 16);
    ctx.lineTo(24, 16);
    ctx.lineTo(22, 35);
    ctx.fill();
    ctx.beginPath();    
    ctx.fillStyle = "#996633";
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

    //draw green
    ctx.beginPath();
    ctx.fillStyle = "#007700";
    ctx.moveTo(greenLeft, 35);
    ctx.lineTo(greenRight, 35);
    ctx.lineTo(greenRight - greenPerspective, 64);
    ctx.lineTo(greenLeft + greenPerspective, 64);
    ctx.fill();

    //draw heart
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(molen.heartRadius, 0, molen.armRadius - 5, (arm.end - arm.start) * 130)
      ctx.fillStyle = "#ff6600";
      ctx.fillRect(0, 0, molen.armRadius + molen.heartRadius - 5, (arm.end - arm.start) * 20)
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    //draw balls
    balls.forEach(function(ball) {
      ctx.beginPath();
      ctx.fillStyle = ball.color;
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, CIRCLE);
      ctx.fill();
    });


  };



  var runTime = 0;
  var timeStep = 1 / 30; 
  var currentTime = Date.now();
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
      draw();
      if (!gameOver) {
          requestAnimationFrame(mainLoop, canvas);
      }
      else {
          drawGameOver(ctx);
          window.addEventListener("keydown", function(e) {
              if(e.keyCode === 82) {
                  location.reload();
              }
          }, false);
      }
  };

  window.addEventListener('blur', function() {isPaused = true;})
  window.addEventListener('focus', function() {isPaused = false;})

  // initGame();
  // initLevel(1);
  mainLoop();
}(document.querySelector('#canvas'));