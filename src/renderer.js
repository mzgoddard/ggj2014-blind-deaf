var PIXI = require('pixi');

var _renderer;
module.exports = function() {
  if (!_renderer) {
    _renderer = PIXI.autoDetectRenderer(
      window.innerWidth, window.innerHeight,
      document.querySelector('canvas'),
      true,
      true
    );
  }
  return _renderer;
};

module.exports.scale = 30;
