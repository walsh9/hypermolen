var CIRCLE = Math.PI * 2;

Math.mod = function(x, y) {
  return ((x % y) + y) % y;
};

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};