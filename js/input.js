Game.Input = {
  keys: {
    left:  37,
    up:    38,
    right: 39,
  },
  keysDown: {},
  setKey: function(keycode) {
    this.keysDown[keycode] = true;
  },
  clearKey: function(keycode) {
    delete this.keysDown[keycode];
  },
  pressed: function(keyname) {
    return (this.keys[keyname] in this.keysDown)
  }
}

addEventListener("keydown", function (e) {
  Game.Input.setKey(e.keyCode)
}, false);
addEventListener("keyup", function (e) {
  Game.Input.clearKey(e.keyCode)    
}, false);