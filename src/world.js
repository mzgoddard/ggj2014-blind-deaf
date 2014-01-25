var boxbox = require('boxbox');

module.exports = {
  get: getWorld,
  destroy: destroyWorld
};

var _worlds = {};
function getWorld(id) {
  if (!_worlds[id]) {
    _worlds[id] = boxbox.createWorld(document.querySelector('canvas'), {
      debugDraw: false,
      gravity: {x: 0, y: 0}
    });
  }
  return _worlds[id];
}

function destroyWorld(id) {
  delete _worlds[id];
}
