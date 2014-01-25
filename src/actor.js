var _ = require('lodash');
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
