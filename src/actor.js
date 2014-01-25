var _ = require('lodash');

module.exports = Actor;

function Actor(level, data) {
  _.extend(this, data);

  var entity = this.entity = level.world.createEntity(data.entity);
  if (this.tick) {
    entity.onTick(this.tick.bind(this));
  }
}

var _actorTypes = {};
Actor.register = function(name, fn) {
  _actorTypes[name] = fn;
};

Actor.create = function(level, data) {
  return _actorTypes[data.type](level, data);
};
