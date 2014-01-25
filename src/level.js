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

Level.preload = function(name) {
  var dataPromise = this.data(name);

  var progressMap = {};
  var assetsPromise = dataPromise.then(function(level) {
    // Preload all assets.
    return when.join(level, when.map(level.files, function(file) {
      progressMap[file] = 0;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', Level.assetRoot + file);
      // We won't pay attention to the content but inform the browser to treat
      // it as binary data anyway.
      // (mzgoddard: I don't know if this is beneficial or harmful.)
      xhr.responseType = 'arraybuffer';

      var promise = when.promise(function(resolve, reject, notify) {
        xhr.onload = function(e) {
          resolve();
        };
        xhr.onerror = function(e) {
          reject(new Error(e.message));
        };
        xhr.onprogress = function(e) {
          notify({name: file, progress: e.loaded / e.total});
        };
      });

      xhr.send();

      return promise;
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

Level.data = function(name) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', Level.jsonRoot + name + '.json');

  var xhrPromise = when.promise(function(resolve, reject, notify) {
    xhr.onload = resolve;
    xhr.onerror = function(e) {
      reject(new Error(e.message));
    };
    xhr.onprogress = function(e) {
      notify({name: name, progress: e.loaded / e.total});
    };
  }).then(function(e) {
    return Level.dataExtend(JSON.parse(xhr.responseText));
  });

  xhr.send();

  return xhrPromise;
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
