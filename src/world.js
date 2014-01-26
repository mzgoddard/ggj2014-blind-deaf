var boxbox = require('boxbox');

module.exports = {
  get: getWorld,
  destroy: destroyWorld
};

var _worlds = {};
function getWorld(id) {
  if (!_worlds[id]) {
    var canvas = document.querySelector('canvas:nth-child(1)');
    canvas.style='display:none';
    _worlds[id] = boxbox.createWorld(canvas, {
      debugDraw: false,
      gravity: {x: 0, y: 0}
    });
  }
  return _worlds[id];
}

function destroyWorld(id) {
  delete _worlds[id];
}
