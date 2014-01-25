var slice = [].slice;

function PlayerInput() {
  this.actors = [];
  this.activeActor = null;

  window.addEventListener('keydown', this._onKeyDown.bind(this));
  window.addEventListener('keyup', this._onKeyUp.bind(this));

  this.keyCodeMap = {};

  this.registerHold({
    keys: 'W',
    args: ['actor'],
    down: function(actor) {
      actor.input.y = -1;
    },
    up: function(actor) {
      if (actor.input.y === -1) {
        actor.input.y = 0;
      }
    }
  });

  this.registerHold({
    keys: 'S',
    args: ['actor'],
    down: function(actor) {
      actor.input.y = 1;
    },
    up: function(actor) {
      if (actor.input.y === 1) {
        actor.input.y = 0;
      }
    }
  });

  this.registerHold({
    keys: 'A',
    args: ['actor'],
    down: function(actor) {
      actor.input.x = -1;
    },
    up: function(actor) {
      if (actor.input.x === -1) {
        actor.input.x = 0;
      }
    }
  });

  this.registerHold({
    keys: 'D',
    args: ['actor'],
    down: function(actor) {
      actor.input.x = 1;
    },
    up: function(actor) {
      if (actor.input.x === 1) {
        actor.input.x = 0;
      }
    }
  });
}

PlayerInput.prototype.setActor = function(actor) {
  this.activeActor = actor;
  this.activeActor.input.x = 0;
  this.activeActor.input.y = 0;
};

PlayerInput.prototype.getActor = function() {
  return this.activeActor;
};

// The networked player
PlayerInput.prototype.getNetPlayer = function() {
  var player = this.getActor();
  var nonPlayers = this.actors.filter(function(actor) {
    return actor != player;
  });
  return nonPlayers[0];
};

PlayerInput.prototype.registerHold = function(options) {
  options.keys.split('').forEach(function(key) {
    var down = options.down;
    var up = options.up;

    if (options.args) {
      options.args.forEach(function(argName) {
        if (argName === 'actor') {
          down = (function(down) {
            return function() {
              if (!this.activeActor) { return; }
              var args = slice.call(arguments);
              args.push(this.activeActor);
              down.apply(this, args);
            }.bind(this);
          }.bind(this)(down));

          up = (function(up) {
            return function() {
              if (!this.activeActor) { return; }
              var args = slice.call(arguments);
              args.push(this.activeActor);
              up.apply(this, args);
            }.bind(this);
          }.bind(this)(up));
        }
      }, this);
    }

    this.keyCodeMap[key.charCodeAt(0)] = {
      down: down,
      up: up
    };
  }, this);
};

PlayerInput.prototype._onKeyDown = function(e) {
  if (this.keyCodeMap[e.keyCode]) {
    this.keyCodeMap[e.keyCode].down();
  }
};

PlayerInput.prototype._onKeyUp = function(e) {
  if (this.keyCodeMap[e.keyCode]) {
    this.keyCodeMap[e.keyCode].up();
  }
};

module.exports = new PlayerInput();
