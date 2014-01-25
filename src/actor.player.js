var Actor = require('./actor');
var playerInput = require('./playerinput');
var playerFilter = require('./playerfilter');

function PlayerActor(level, data) {
  Actor.call(this, level, data);

  this.input = {x: 0, y: 0};

  this.filter = playerFilter.FilterType[data.filter] ||
    playerFilter.FilterType.VisualAll;
}

PlayerActor.prototype = Object.create( Actor.prototype );
PlayerActor.prototype.constructor = PlayerActor;

PlayerActor.prototype.tick = function() {
  // Hacky clear velocity. Couldn't figure out how to make boxbox work with
  // its setVelocity.
  var vel = this.entity._body.GetLinearVelocity();
  vel.x = vel.y = 0;
  this.entity._body.SetLinearVelocity(
    vel,
    this.entity._body.GetWorldCenter()
  );
  if (this.input.x || this.input.y) {
    this.entity.applyImpulse(300, this.input.x, this.input.y);
  }

  this.updateSprite();
};

Actor.register('player', function(level, data) {
  return new PlayerActor(level, data);
});
