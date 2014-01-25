var _ = require('lodash');
var sound = require('./sound');
var PIXI = require('pixi');

var playerFilter = require('./playerfilter');
var renderer = require('./renderer');

module.exports = Actor;

function Actor(level, data) {
  _.extend(this, data);
  this.level = level;
  this.data = data;

  var entity = this.entity = level.world.createEntity({
    draw: function() {}
  }, data.entity);

  if (this.tick) {
    entity.onTick(this.tick.bind(this));
  }

  this.shouldUpdateSound = data.shouldUpdateSound;
  if (this.shouldUpdateSound === true){
    entity.onTick(Actor.updateSoundNodes.bind(this));
    // An array of currently playing sounds.
    this.sounds = [];
  }

  var p = this.entity.position();
  this.lastPosition = {x:p.x, y:p.y};

  if (this.data.sprite) {
    var texture;
    if (this.data.sprite.texture) {
      texture = PIXI.Texture.fromImage(this.data.sprite.texture);
    }
    this.sprite = new PIXI.Sprite(texture);
    if (this.data.sprite.anchor) {
      this.sprite.anchor.x = this.data.sprite.anchor.x;
      this.sprite.anchor.y = this.data.sprite.anchor.y;
    }

    this.updateSprite();

    level.stage.addChild(this.sprite);

    playerFilter.filterGraphics(this.data.sprite.filter, this.sprite);
  }

}

Actor.prototype.updateSprite = function() {
  var position = this.entity.position();
  this.sprite.position.x = position.x;
  this.sprite.position.y = position.y;

  this.sprite.rotation = this.entity.rotation() / 180 * Math.PI;

  this.sprite.width = this.data.entity.radius * 2;
  this.sprite.height = this.data.entity.radius * 2;
};

var _actorTypes = {};
Actor.register = function(name, fn) {
  _actorTypes[name] = fn;
};

Actor.create = function(level, data) {
  return _actorTypes[data.type](level, data);
};

Actor.prototype.loadSound = function(snd, cb){
  // Gets the sound ready and starts tracking the sound, but doesn't play it
  // incase you want to mess with the settings first.
  var p = this.entity.position();

  var callback = function(e){
  if (this.shouldUpdateSound === true){
    _.remove(this.sounds, function(i){
      return (i === s);
    });
  }
    if (cb !== undefined){
      cb();
    }
  };
  var s = new sound.SoundNode(snd, p.x, p.y, 0, callback.bind(this));
  if (this.shouldUpdateSound === true){
    this.sounds.push(s);
  }
  return s;
};

Actor.prototype.playSound = function(snd, cb){
  var s = this.loadSound(snd, cb);
  s.source.start(sound.ctx.currentTime);
  return s;
};

Actor.updateSoundNodes = function(){
  var p = this.entity.position();
  if (this.sounds.length === 0 || p === this.lastPosition){
    return;
  }

  for (s in this.sounds){
    this.sounds[s].panner.setPosition(p.x, p.y, 0);
  }
};
