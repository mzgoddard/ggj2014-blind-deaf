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
    },

    reportPosition: function(user, data) {
      messageOtherMembers(user, 'reportPosition', data);
    },

    reportLevelChange: function(data, user) {
      console.log(user);
      user.getRoom().messageMembers('reportLevelChange', data);
    },

    reportAction: function(user, data) {
      user.getRoom().messageMembers('reportAction', data);
    },
  }
});

cloak.run();
