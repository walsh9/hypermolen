Game.objects = Game.objects || {};

var colors = ["#00ffff","#ffff00","#ff9999","#ff3333","#ff00ff","#00ff00"];

Game.objects.Ball = {
  init: function(ctx, options) {
    this.ctx = ctx;
    this.w = canvas.width;
    this.h = canvas.height;
    this.center = {x: this.w/2, y: this.h/2}
    this.stage = options.stage;
    this.collection = options.collection;
    this.target = this.stage.molen.targets.random();
    this.color = colors.random();
    this.radius = 2;
    this.bounced = false;
    var x;
    var y;
    if (this.target.x !== this.stage.molen.pos.x) {
      this.tendency = "horizontal";
      y = Math.random() * this.h;
      if (this.target.x > this.stage.molen.pos.x) {
        x = this.h;
      }
      else {
        x = 0;
      }
    } else {
      this.tendency = "vertical";
      x = Math.random() * this.w;
      if (this.target.y > this.stage.molen.pos.y) {
        y = this.h;
      }
      else {
        y = 0;
      } 
    }
    this.pos = Vector2d.new({x: x, y: y});
    this.speed = Math.random() * 6 + 18;
    this.direction = this.pos.directionTo(this.target);
    this.index = this.collection.push(this) - 1;
    return this;
  },
  update: function(timePassed) {
      var speed = this.speed * timePassed;
      this.pos.move(this.direction, speed);
      if (!this.bounced && this.pos.isNear(this.target)) {
        if (this.stage.molen.checkBlocking(this.target)) {
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
  draw: function() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, CIRCLE);
    this.ctx.fill();
  },
  destroy: function() {
      delete this.collection[this.index];
  },
};