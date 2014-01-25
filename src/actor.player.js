var Actor = require('./actor');

function PlayerActor(level, data) {
  Actor.call(this, level, data);
}

PlayerActor.prototype = Object.create( Actor.prototype );
PlayerActor.prototype.constructor = PlayerActor;

PlayerActor.prototype.tick = function() {};

Actor.register('player', function(level, data) {
  return new PlayerActor(level, data);
});
