/* jshint node:true */

var cloak = require('cloak');
var connect = require('connect');

var expressServer = require('./express_server');
var roomUtils = require('./room_utils');

cloak.configure({
  express: expressServer,
  autoJoinLobby: false,
  messages: {
    joinRoom: function(roomName, user) {
      var room = roomUtils.getRoomForUrl(cloak, roomName);
      room.addMember(user);
    },

    room: {
      close: roomUtils.cleanUpRoomOnClose
    }
  }
});

cloak.run();
