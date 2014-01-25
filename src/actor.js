var _ = require('lodash');
var sound = require('./sound.js');

module.exports = Actor;

function Actor(level, data) {
  _.extend(this, data);

  var entity = this.entity = level.world.createEntity(data.entity);
  if (this.tick) {
    entity.onTick(this.tick.bind(this));
  }

  entity.onTick(Actor.tick.bind(this));

  // An array of currently playing sounds.
  this.sounds = [];
  var p = this.entity.position();
  this.lastPosition = {x:p.x, y:p.y};
}

var _actorTypes = {};
Actor.register = function(name, fn) {
  _actorTypes[name] = fn;
};

Actor.create = function(level, data) {
  return _actorTypes[data.type](level, data);
};

Actor.prototype.playSound = function(snd, callback){
  var p = this.entity.position();

  var callback = function(e){
    _.remove(this.sounds, function(i){
      return (i === s);
    });
  };

  var s = new sound.SoundNode(snd, p.x, p.y, 0, callback.bind(this));
  s.source.start(sound.ctx.currentTime);
  this.sounds.push(s);
  return s;
};

Actor.tick = function(){
  var p = this.entity.position();
  if (this.sounds.length === 0 || p === this.lastPosition){
    return;
  }

  for (s in this.sounds){
    this.sounds[s].panner.setPosition(p.x, p.y, 0);
  }
};
