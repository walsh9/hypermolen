Game.objects = Game.objects || {};

Game.objects.Molen = {
  init: function(ctx, options) {
    this.ctx = ctx;
    this.w = canvas.width;
    this.h = canvas.height;
    this.center = {x: this.w/2, y: this.h/2};
    this.armCount   = options.armCount;
    this.armWidth   = options.armWidth;
    this.arms = this._createArms(options.armCount, options.armWidth);
    this.towerColor = options.towerColor;
    this.capColor   = options.capColor;
    this.wheelColor = options.wheelColor;
    this.armColor   = options.armColor;
    this.frameColor = options.frameColor;
    this.sailColor  = options.sailColor;
    this.windSpeed = -3;
    this.angle = 0;
    if (options.terrain === "land") {
      this.pos = {x: this.center.x, y:10};
      this.armRadius = 20;
      this.targetCount = 1;
    } else if (options.terrain === "mirror") {
      this.pos = {x: this.center.x, y: this.center.y};
      this.armRadius = 15;      
       this.targetCount = 2;
    } else if (options.terrain === "space") {
      this.pos = {x: this.center.x, y: this.center.y};
      this.armRadius = 15;      
      this.targetCount = 4;
    }
    this.heartRadius = 4;
    switch (this.targetCount) {
    case 1: 
      this.targets = [{x: 32, y: 33, angle: CIRCLE * 0.25}];
      break;
    case 2:
      this.targets = 
        [{x: this.pos.x, y: this.pos.y + this.armRadius, angle: CIRCLE * 0.25}, 
         {x: this.pos.x, y: this.pos.y - this.armRadius, angle: CIRCLE * 0.75}];
      break;
    case 4:
      this.targets = 
        [{x: this.pos.x, y: this.pos.y + this.armRadius, angle: CIRCLE * 0.25}, 
         {x: this.pos.x, y: this.pos.y - this.armRadius, angle: CIRCLE * 0.75},
         {x: this.pos.x + this.armRadius, y: this.pos.y, angle: CIRCLE * 1.00},
         {x: this.pos.x - this.armRadius, y: this.pos.y, angle: CIRCLE * 0.50}];
      break;
    }
    return this;
  },
  update: function(delta) {
    var speed = delta * 2;
    this.angle = Math.mod(this.angle + this.windSpeed * speed, CIRCLE);
    if (Game.Input.pressed("right")) {
      this.angle = Math.mod(this.angle - speed, CIRCLE);
    }
    if (Game.Input.pressed("left")) {
      this.angle = Math.mod(this.angle + speed, CIRCLE);
    }
  },
  _createArms: function(numArms, width) {
    var start, end;
    var arms = [];
    for (var n = 0; n < numArms; n++) {
      start = n * 1 / numArms;
      end = start + width;
      arms.push({start: start, end: end});
    }
    return arms;
  },
  checkBlocking: function(target) {
    var armStart, armEnd;
    var molen = this;
    offset = target.angle;
    return molen.arms.some(function(arm) {
      armStart = Math.mod(arm.start * CIRCLE + molen.angle, CIRCLE);
      armEnd =   Math.mod(arm.end   * CIRCLE + molen.angle, CIRCLE);
      console.log(armStart, offset, armEnd)
      if (offset > armStart && offset < armEnd || 
        offset > armStart   && armEnd < armStart || 
        offset < armEnd     && armEnd < armStart) {
        return true;
      }
    });
  }
}