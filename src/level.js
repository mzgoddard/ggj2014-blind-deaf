var PIXI = require('pixi');
var when = require('when');
require('when/monitor/console');

var Actor = require('./actor');
var playerInput = require('./playerinput');
var playerFilter = require('./playerfilter');
var renderer = require('./renderer');
var world = require('./world');
var sound = require('./sound');
var cache = require('./cache');
var Network = require('./network');

module.exports = Level;

function Level(name) {
  this.name = name;
  this.world = world.get(name);
  var _stage = this._stage = new PIXI.Stage();
  var background = this.background = new PIXI.DisplayObjectContainer();
  var middleground = this.middleground = new PIXI.DisplayObjectContainer();
  var stage = this.stage = new PIXI.DisplayObjectContainer();
  this.stage.addChild(background);
  this.stage.addChild(middleground);
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
      player.listener = sound.listener;

      var updateListener = function(){
        var p = this.entity.position();
        this.listener.setPosition(p.x, p.y, 0);
      };

      player.entity.onTick(updateListener.bind(player));

      // stage.rotation = 1.5;

      Network.reportPosition(player);
    }

    _renderer.render(_stage);
  });

  _currentLevel = this;
  playerFilter.setLevel(this);

  this.actorMap = {};

  this._assetsPromise = Level.preload(name);
  this._dataPromise = this._assetsPromise.then(function(values) {
    return values[0];
  }).otherwise(function(e){ console.error(e.stack||e); throw e; });

  this._dataPromise.then(this._onload.bind(this)).otherwise(function(e){ console.error(e.stack||e); throw e; });
}

var _currentLevel = null;
var _playerSlot = 0;
Level.setPlayerSlot = function(slot) {
  if (slot === undefined) {
    slot = _playerSlot;
  }
  _playerSlot = slot;
  if (playerInput.actors[slot]) {
    playerInput.setActor(playerInput.actors[slot]);
    playerFilter.setLocalFilter(playerInput.actors[slot].filter);
  }
};

Level.prototype._onload = function(data) {
  data.actors.forEach(function(actorData) {
    Level.dataExtend(actorData).then(function(actorData) {
      var actor = Actor.create(this, actorData);

      if (actor.name) {
        this.actorMap[actor.name] = actor;
      }

      if (actorData.type === 'player') {
        playerInput.actors[actor.playerSlot] = actor;

        Level.setPlayerSlot();
      }
    }.bind(this)).otherwise(function(e){ console.error(e.stack||e); throw e; });
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

Level.preload = function(name) {
  var dataPromise = this.data(name);

  var progressMap = {};

  var assetsPromise = dataPromise.then(function(level) {
    // Preload all assets.
    return when.join(level, when.map(level.files, function(file) {
      progressMap[file] = 0;
      return Level.raw(file, Level.assetRoot + file, 'arraybuffer').then(function(d){
        // Cache buffers for sound.
        var suffix = file.substr(file.length - 3, file.length);
        if (suffix === "wav" || suffix === "mp3"){
          return when.promise(function(resolve, reject){
            // Try to create a buffer off an audio tag?
            var audio = new Audio();
            audio.src = "sound/" + file;

            //audio.controls = true;
            //audio.autoplay = true;

            // Not sure this is necessary.
            document.body.appendChild(audio);

            cache[file] = audio;
            resolve(d);
          }).then(function(e){
            //console.log(e);
}).otherwise(function(e){ console.error(e.stack||e); throw e; });
        } else {
          cache[file] = d.response;
        }
      }).otherwise(function(e){ console.error(e.stack||e); throw e; });
    })).otherwise(function(e){ console.error(e.stack||e); throw e; });
  });

  assetsPromise.then(null, null, function(progress) {
    if (progress.name === name) { return; }
    progressMap[progress.name] = progress.progress;
    // Example progress reduction we can use for a loading widget.
    // console.log(_.reduce(progressMap, function(v, a) {
    //   return v + a;
    // }, 0), progressMap);
  }).otherwise(function(e){ console.error(e.stack||e); throw e; });
  return assetsPromise.otherwise(function(e){ console.error(e.stack||e); throw e; });
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
  }).then(null, function(e){console.error(e);throw e;}).otherwise(function(e){ console.error(e.stack||e); throw e; });

  xhr.send();

  return xhrPromise;
};

Level.data = function(name) {
  return Level.raw(name, Level.jsonRoot + name + '.json', undefined).then(function(data){
    return Level.dataExtend(JSON.parse(data.responseText));
}).otherwise(function(e){ console.error(e.stack||e); throw e; });
};

Level.dataExtend = function(data) {
  if (data.super) {
    return Level.data(data.super).then(function(superData) {
      return _.merge(superData, data);
    }).otherwise(function(e){ console.error(e.stack||e); throw e; });
  } else {
    return when(data);
  }
};

Level.netUpdate = function(data) {
  var netPlayer = playerInput.getNetPlayer();
  if (netPlayer) {
    netPlayer.entity.rotation(data.rotation);
    netPlayer.entity.position(data.position);
  }
};

Network.start(Level);
