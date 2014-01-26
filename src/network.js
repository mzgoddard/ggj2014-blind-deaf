window._ = require('lodash');

window.io = require('../bower_components/socket.io-client/dist/socket.io.min.js');
require('cloak-client');

var pushMessageToQueue = function(type) {
  return function(data) {
    messageQueue.push({
      type: type,
      data: data
    });
  };
};

module.exports.start = function(Level) {
  cloak.configure({
    messages: {
      reportPosition: function(data) {
        Level.netUpdate(JSON.parse(data));
      },

      reportLevelChange: console.log.bind(console),

      reportAction: console.log.bind(console),

      roomFull: function() {
        window.alert('This room is full');
        window.location.pathname = '/' + parseInt(Math.random() * 1000000000);
      },

      assignRole: function(role) {
        Level.setPlayerSlot(role === 'deaf'? 0 : 1);
      },

      nav: function(url) {
        window.location = url;
      }
    },

    serverEvents: {
      begin: function() {
        cloak.message('joinRoom', window.location.pathname);
      },

      joinedRoom: console.log.bind(console),
    }
  });

  cloak.run('localhost');
};

module.exports.reportPosition = function(player) {
  var data = {
    rotation: player.entity.rotation(),
    position: player.entity.position()
  };
  cloak.message('reportPosition', JSON.stringify(data));
};

module.exports.reportLevelChange = function(newLevel) {
  cloak.message('reportLevelChange', newLevel);
};

module.exports.reportAction = function(action) {
  cloak.message('reportAction', action);
};
