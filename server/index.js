/* jshint node:true */

var cloak = require('cloak');
var connect = require('connect');
var _ = require('lodash');

var expressServer = require('./express_server');
var roomUtils = require('./room_utils');
var nameGen = require('./name_generator');

var messageOtherMembers = function(user, message, data){
  var room = user.getRoom();

  // If you are not in a room yet don't do anything.
  if (!room) {
    return;
  }
  var members = room.getMembers();

  var otherMembers = members.filter(function(member) {
    return member !== user;
  });

  otherMembers.forEach(function(member) {
    member.message(message, data);
  });
};

var getActiveMembers = function(members) {
  return members.filter(function(member) {
    return !member._socket.disconnected;
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

      // The root room is special
      if (roomName === '/') {
        room.addMember(user);
        return;
      }


      // Filter out any users with closed connections
      var activeMembers = getActiveMembers(members);

      // Prevent more then 2 users from joining this room.
      if (activeMembers.length >= ROOM_SIZE && !_.contains(members, user)) {
        user.message('roomFull', roomName);
        return;
      }

      var activeRoles = _.compact(activeMembers.map(function(user) {
        return roles[user.id];
      }));

      role = activeRoles[0] === 'deaf'? 'blind' : 'deaf';

      roles[user.id] = role;
      user.message('assignRole', role);
      room.addMember(user);
    },

    reportPosition: function(data, user) {
      messageOtherMembers(user, 'reportPosition', data);
    },

    reportLevelChange: function(data, user) {
      user.getRoom().messageMembers('reportLevelChange', data);
    },

    reportAction: function(data, user) {
      user.getRoom().messageMembers('reportAction', data);
    },

  },

  room: {
    close: roomUtils.cleanUpRoomOnClose,

    newMember: function() {
      var room = this;
      var activeMembers = getActiveMembers(room.getMembers());
      if (room.name === '/' && activeMembers.length >= 2) {

        var roomName = nameGen.roomName();
        var users = _.take(activeMembers, 2);

        users.forEach(function(user) {
          room.removeMember(user);
          user.message('nav', '/' + roomName);
        });
      }
    }

  },
});

cloak.run();
