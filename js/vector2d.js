var Vector2d = {
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
  move: function(direction, speed) {
    this.x += direction.x * speed;
    this.y += direction.y * speed;
  },
  moveTowards: function(pos, speed) {
    var direction = this.directionTo(pos);
    this.x += direction.x * speed;
    this.y += direction.y * speed;
  },
  isNear: function(pos) {
    return(this.distanceTo(pos) < 1);
  }
};