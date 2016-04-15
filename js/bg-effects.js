Game.bgEffects = {};

Game.bgEffects.plasma = {
  init: function(ctx, options) {
    this.ctx = ctx;
    options = options || {};
    this.w = ctx.canvas.width;
    this.h = ctx.canvas.height;
    this.s = options.s || Math.floor(Math.random() * 120 + 8);
    this.paletteOffset = 0;
    this.imgData = ctx.createImageData(this.w, this.h);
    this.palette = [];
    var rx = Math.pow(2, options.rx || Math.floor(Math.random() * 6 + 3)); //factors of 256 will loop nice
    var gx = Math.pow(2, options.gx || Math.floor(Math.random() * 6 + 3));
    var bx = Math.pow(2, options.bx || Math.floor(Math.random() * 6 + 3));

    var i, r, g, b;
    for (i = 0; i < 256; i++) {
        r = Math.floor(128 + 128 * Math.sin(3.1415 * i / rx));
        g = Math.floor(128 + 128 * Math.sin(3.1415 * i / gx));
        b = Math.floor(128 + 128 * Math.sin(3.1415 * i / bx));
        this.palette.push([r, g, b]);
    }
    return this;

  },
  update: function(delta) {
    var speed = 300;
    var step = ((delta * 60) / 1000) * speed;
    this.paletteOffset += step;
  },
  draw: function(angles) {
    var x, y, c;
    var plasmas = [
    function (x, y, s) {
        return 128 + (128 * Math.sin(x / s));
    },
    function (x, y, s) {
        return 128 + (128 * Math.sin(y / s));
    }];
    var p, color, offset;
    for (x = 0; x < this.w; x++) {
      for (y = 0; y < this.h; y++) {
        c = 0;
        for (p = 0; p < plasmas.length; p++) {
            c += plasmas[p](x, y, this.s);
        }
        c = Math.floor(c / plasmas.length);
        color = this.palette[(c + Math.floor(this.paletteOffset)) % 255];
        offset = (x + y * this.w) * 4;
        this.imgData.data[offset + 0] = color[0];
        this.imgData.data[offset + 1] = color[1];
        this.imgData.data[offset + 2] = color[2];
        this.imgData.data[offset + 3] = 255; //opaque
      }
    }
    this.ctx.putImageData(this.imgData, 0, 0);
  }
}

Game.bgEffects.starfield = {
  init: function(ctx, options) {
    this.ctx = ctx;
    options = options || {};
    this.stars = [];
    this.w = ctx.canvas.width;
    this.h = ctx.canvas.height;
    this.center = Object.create(Vector2d).init({
      x: this.w / 2,
      y: this.h / 2
    });
    var starCount = options.starCount || 50;
    var star;
    for(var n = 0; n < starCount; n++) {
      star = {
        pos: Object.create(Vector2d).init({
          x: Math.random() * this.w,
          y: Math.random() * this.h
        }),
        speed: Math.random() * 0.002 + 0.001
      };
      star.direction = this.center.directionTo(star.pos);
      this.stars.push(star);
    }
    return this;
  },
  update: function(delta) {
    var self = this;
    this.stars.forEach(function(star) {
      if (star.pos.x > self.w || 
          star.pos.x < 0 || 
          star.pos.y > self.h ||
          star.pos.y < 0) {
        star.pos.x = self.center.x + Math.random() * 1 - 0.5;
        star.pos.y = self.center.y + Math.random() * 1 - 0.5;
        star.direction = self.center.directionTo(star.pos);
      } else {
        star.pos.move(star.direction, star.speed);
      }
    });
  },
  draw: function(angle) {
    var self = this;
    this.stars.forEach(function(star) {
      self.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      self.ctx.fillRect(Math.round(star.pos.x), Math.round(star.pos.y), 1, 1);
    })
  }
}