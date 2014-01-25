var PIXI = require('pixi');
var when = require('when');

var Actor = require('./actor');
var playerInput = require('./playerinput');
var playerFilter = require('./playerfilter');
var renderer = require('./renderer');
var world = require('./world');

module.exports = Level;

function Level(name) {
  this.name = name;
  this.world = world.get(name);
  var _stage = this._stage = new PIXI.Stage();
  var stage = this.stage = new PIXI.DisplayObjectContainer();
  this._stage.addChild(stage);

  var scale = 20;
  stage.scale.x = stage.scale.y = scale;

  this.world.onRender(function() {
    var _renderer = renderer();

    var player = playerInput.getActor();
    if (player) {
      var position = player.sprite.position;
      stage.position.x = _renderer.view.width / 2 - position.x * scale;
      stage.position.y = _renderer.view.height / 2 - position.y * scale;
      // stage.rotation = 1.5;
    }

    _renderer.render(_stage);
  });

  _currentLevel = this;
  playerFilter.setLevel(this);

  this._assetsPromise = Level.preload(name);
  this._dataPromise = this._assetsPromise.then(function(values) {
    return values[0];
  });

  this._dataPromise.then(this._onload.bind(this));
}

var _currentLevel = null;
var _playerSlot = 0;
Level.setPlayerSlot = function(slot) {
  if (slot === undefined) {
    slot = _playerSlot;
  }
  if (playerInput.actors[slot]) {
    playerInput.setActor(playerInput.actors[slot]);
    playerFilter.setLocalFilter(playerInput.actors[slot].filter);
  }
};

Level.prototype._onload = function(data) {
  data.actors.forEach(function(actorData) {
    Level.dataExtend(actorData).then(function(actorData) {
      if (actorData.type === 'player') {
        var actor = Actor.create(this, actorData);
        playerInput.actors[actor.playerSlot] = actor;

        Level.setPlayerSlot();
      }
    }.bind(this));
  }, this);
};

Level.prototype.reset = function() {
  this.destroy();
  new Level(this.name);
};

Level.prototype.destroy = function() {
  this.world.destroy();
  world.destroy(this.name);
};

Level.jsonRoot = 'json/';
Level.assetRoot = './';

Level.cache = {};

Level.preload = function(name) {
  var dataPromise = this.data(name);

  var progressMap = {};

  var assetsPromise = dataPromise.then(function(level) {
    // Preload all assets.
    return when.join(level, when.map(level.files, function(file) {
      progressMap[file] = 0;
      return Level.raw(file, Level.assetRoot + file, 'arraybuffer').then(function(d){
        Level.cache[file] = d.response;
      });
    }));
  });

  assetsPromise.then(null, null, function(progress) {
    if (progress.name === name) { return; }
    progressMap[progress.name] = progress.progress;
    // Example progress reduction we can use for a loading widget.
    // console.log(_.reduce(progressMap, function(v, a) {
    //   return v + a;
    // }, 0), progressMap);
  });

  return assetsPromise;
};

Level.raw = function(name, path, type){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path);

  if (type !== undefined) {
    xhr.responseType = type;
  }

  var xhrPromise = when.promise(function(resolve, reject, notify) {
    xhr.onload = resolve;
    xhr.onerror = function(e) {
      reject(new Error(e.message));
    };
    xhr.onprogress = function(e) {
      notify({name: name, progress: e.loaded / e.total});
    };
  }).then(function(e){
    return xhr;
  }).then(null, function(e){console.error(e);throw e;});

  xhr.send();

  return xhrPromise;
};

Level.data = function(name) {
  return Level.raw(name, Level.jsonRoot + name + '.json', undefined).then(function(data){
    return Level.dataExtend(JSON.parse(data.responseText));
});
};

Level.dataExtend = function(data) {
  if (data.super) {
    return Level.data(data.super).then(function(superData) {
      return _.merge(superData, data);
    });
  } else {
    return when(data);
  }
};
