window._ = require('lodash');

window.io = require('../bower_components/socket.io-client/dist/socket.io.min.js');
require('cloak-client');

cloak.configure({
  messages: {
    reportPosition: console.log.bind(console),

    reportLevelChange: console.log.bind(console),

    reportAction: console.log.bind(console),

    roomFull: console.log.bind(console)

  },

  serverEvents: {
    begin: function() {
      cloak.message('joinRoom', window.location.pathname);
    },

    joinedRoom: console.log.bind(console),
  }
});

cloak.run('localhost');

module.exports.reportPosition = function(player) {
  var data = _.pick(player.entity._ops, 'x', 'y', 'rotation');
  cloak.message('reportPosition', JSON.stringify(data));
};

module.exports.reportLevelChange = function(newLevel) {
  cloak.message('reportLevelChange', newLevel);
};

module.exports.reportAction = function(action) {
  cloak.message('reportAction', action);
};
