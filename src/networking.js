window._ = require('lodash');

window.io = require('../bower_components/socket.io-client/dist/socket.io.min.js');
require('cloak-client');

cloak.configure({
  messages: {

  },

  serverEvents: {
    begin: function() {
      cloak.message('joinRoom', window.location.pathname);
    },

    joinedRoom: console.log.bind(console)
  }
});

cloak.run('localhost');
