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

  var entity;
  if (data.entity) {
    entity = this.entity = level.world.createEntity({
      draw: function() {}
    }, data.entity);
  }

  if (this.tick) {
    entity.onTick(this.tick.bind(this));
  }

  if (this.shouldUpdateSound === true){
    entity.onTick(this.updateSoundNodes.bind(this));
    // An array of currently playing sounds.
    this.sounds = [];
  }

  var p = this.position || this.entity.position();
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

    playerFilter.filterGraphics(
      playerFilter.FilterType[this.data.sprite.filter],
      this.sprite
    );
  }

  if (this.data.onmove) {
    var position = this.position || this.entity.position();
    this._lastMoveUpdatePosition = {x: position.x, y: position.y};
    this.entity.onTick(this.updateMove.bind(this));
  }

  if (this.data.livefor) {
    setTimeout(this.destroy.bind(this), this.data.livefor * 1000);
  }

}

Actor.prototype.destroy = function() {
  if (this.entity) {
    this.entity.destroy();
  }
  if (this.sprite && this.sprite.parent) {
    this.sprite.parent.removeChild(this.sprite);
  }
};

Actor.prototype.updateSprite = function() {
  var position = this.position || this.entity.position();
  this.sprite.position.x = position.x;
  this.sprite.position.y = position.y;

  this.sprite.rotation = (this.rotation || this.entity.rotation()) /
    180 * Math.PI;

  var radius = this.radius || this.data.entity.radius;
  this.sprite.width = radius * 2;
  this.sprite.height = radius * 2;
};

// See if a "move" actor event has happened. Example use to create a walk queue.
Actor.prototype.updateMove = function() {
  var lastPosition = this._lastMoveUpdatePosition;
  var position = this.position || this.entity.position();
  var dx = position.x - lastPosition.x, dy = position.y - lastPosition.y;
  var diffDot = (dx * dx) + (dy * dy);
  if (diffDot > this.data.onmove.distance * this.data.onmove.distance) {
    this._lastMoveUpdatePosition.x = position.x;
    this._lastMoveUpdatePosition.y = position.y;

    Actor.create(
      this.level,
      _.extend(
        {
          position: _.clone(position),
          rotation: Math.atan2(position.y, position.x) / Math.PI * 180
        },
        this.data.onmove
      )
    );
  }
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

Actor.prototype.updateSoundNodes = function(){
  var p = this.entity.position();
  if (this.sounds.length === 0 || p === this.lastPosition){
    return;
  }

  for (s in this.sounds){
    this.sounds[s].panner.setPosition(p.x, p.y, 0);
  }
};
