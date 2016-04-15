Game.screens = {};

Game.screens.main = {
  init: function(ctx, options) {
    this.ctx = ctx;
    this.w = canvas.width;
    this.h = canvas.height;
    this.center = {x: this.w/2, y: this.h/2}
    this.stage = {};
    this.stage.terrain    = options.terrain;
    this.stage.skyColor   = options.skyColor;
    this.stage.landColor  = options.landColor;
    this.stage.greenColor = options.greenColor;
    if (options.bgEffect) {
      this.stage.bgEffect = Object.create(Game.bgEffects[options.bgEffect]).init(ctx, options.bgOptions);
    }
    options.molen.terrain = this.stage.terrain;
    options.molen.targetCount = this.stage.targetCount;
    this.stage.molen = Object.create(Game.objects.Molen).init(ctx, options.molen);
    this.balls = [];
    return this;
  },
  update: function(delta) {
    this.stage.molen.update(delta);

    if (Game.Input.pressed("up")) { // up
      Game.Input.clearKey(Game.Input.keys.up)
      Object.create(Game.objects.Ball).init(this.ctx, {collection: this.balls, stage: this.stage});
    }
    this.balls.forEach(function(ball) {
      ball.update(delta);
    });
    if (this.stage.bgEffect) {
      this.stage.bgEffect.update(delta);
    }
  },
  draw: function() {
    var stage = this.stage;
    var molen = stage.molen;
    var ctx = this.ctx;

    //clear screen
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.w, this.h);

    //draw sky
    if (stage.bgEffect) {
      stage.bgEffect.draw(molen.angle);
    } else {
      this._drawSky(ctx, stage, molen);
    }

    //draw tower
    this._drawTower(ctx, stage, molen);

    //draw green
    this._drawGreen(ctx, stage, molen);
    
    // draw windwheel
    this._drawWheel(ctx, stage, molen);

    //draw balls
    this.balls.forEach(function(ball) {
      ball.draw()
    });
  },
  _drawSky: function(ctx, stage, molen) {
    ctx.fillStyle = stage.skyColor;
    ctx.fillRect(0, 0, this.w, this.h);
  },
  _drawTower: function(ctx, stage, molen) {
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
      var targetDistance = molen.armRadius - 1
      ctx.arc(molen.pos.x, molen.pos.y + targetDistance, 2.5, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x, molen.pos.y - targetDistance, 2.5, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x + targetDistance, molen.pos.y, 2.5, CIRCLE, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(molen.pos.x - targetDistance, molen.pos.y, 2.5, CIRCLE, 0);
      ctx.fill();
    }
  },
  _drawGreen: function(ctx, stage, molen) {
    var greenLeft  = this.center.x + 10;
    var greenRight = this.center.y - 10;

    if (stage.terrain === "land") {
      ctx.fillStyle = stage.landColor
      ctx.fillRect(0, 35, 64, 29)
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
  },
  _drawWheel: function(ctx, stage, molen) {
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

      ctx.fillStyle = sailColor;
      ctx.fillRect(molen.heartRadius + frameThickness, frameThickness, bladeLength - frameThickness * 2, bladeHeight - frameThickness * 2);

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
};