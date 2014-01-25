/* jshint node:true */

var cloak = require('cloak');
var connect = require('connect');

var expressServer = require('./express_server');
var roomUtils = require('./room_utils');

var messageOtherMembers = function(user, message, data){
  var room = user.getRoom();
  var members = room.getMembers();

  var otherMembers = members.filter(function(member) {
    return member !== user;
  });

  otherMembers.forEach(function(member) {
    member.message(message, data);
  });
};

const ROOM_SIZE = 2;

cloak.configure({
  express: expressServer,
  autoJoinLobby: false,
  defaultRoomSize: ROOM_SIZE,
  pruneEmptyRooms: 15000,
  messages: {
    joinRoom: function(roomName, user) {
      var room = roomUtils.getRoomForUrl(cloak, roomName);
      if (room.getMembers().length >= ROOM_SIZE) {
        user.message('roomFull', roomName);
      } else {
        room.addMember(user);
      }
    },

    room: {
      close: roomUtils.cleanUpRoomOnClose
    },

    reportPosition: function(user, data) {
      messageOtherMembers(user, 'reportPosition', data);
    },

    reportLevelChange: function(data, user) {
      user.getRoom().messageMembers('reportLevelChange', data);
    },

    reportAction: function(user, data) {
      user.getRoom().messageMembers('reportAction', data);
    },
  }
});

cloak.run();
