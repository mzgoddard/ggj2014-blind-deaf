var when = require('when');

var Actor = require('./actor');
var world = require('./world');

module.exports = Level;

function Level(name) {
  this.name = name;
  this.world = world.get(name);

  this._assetsPromise = Level.preload(name);
  this._dataPromise = this._assetsPromise.then(function(values) {
    return values[0];
  });

  this._dataPromise.then(this._onload.bind(this));
}

Level.prototype._onload = function(data) {
  data.actors.forEach(function(actorData) {
    Level.dataExtend(actorData).then(function(actorData) {
      Actor.create(this, actorData);
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
      return Level.raw(file, Level.assetRoot + file, 'arraybuffer', function(d){
        Level.cache[file] = d;
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

Level.raw = function(name, path, type, then){
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
  }).then(function(e) {
    if (then !== undefined){
      return then(xhr);
    }
  }).then(null, console.error.bind(console));

  xhr.send();

  return xhrPromise;
};

Level.data = function(name) {
  return Level.raw(name, Level.jsonRoot + name + '.json', undefined, function(data){
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
