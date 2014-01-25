/* jshint node:true */

var cloak = require('cloak');
var connect = require('connect');
var _ = require('lodash');

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
  reconnectWait: 1000,
  messages: {
    joinRoom: function(roomName, user) {
      var role;
      var room = roomUtils.getRoomForUrl(cloak, roomName);
      var roles = room.data.roles = room.data.roles || {};
      var members = room.getMembers();

      var activeMembers = members.filter(function(member) {
        return !member._socket.disconnected;
      });

      if (activeMembers.length >= ROOM_SIZE && !_.contains(members, user)) {
        user.message('roomFull', roomName);
        return;
      }

      var activeRoles = _.compact(activeMembers.map(function(user) {
        return roles[user.id];
      }));

      role = activeRoles[0] === 'deaf'? 'blind' : 'deaf';

      console.log(user.id, role);
      roles[user.id] = role;
      user.message('assignRole', role);
      room.addMember(user);
    },

    room: {
      close: roomUtils.cleanUpRoomOnClose,

      memberLeaves: function() {
        console.log('asdfasdf');
      }
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
