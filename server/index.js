/* jshint node:true */

var cloak = require('cloak');
var _ = require('underscore');
var connect = require('connect');

var express = require('express');
var app = express();
app.use(express.static('dist'));
app.get('*', function (req, res) {
  res.sendfile('./dist/index.html');
});
var expressServer = app.listen(3000);


var roomUtils = require('./room_utils');

var clientPort = 8080;
var serverPort = 8090;

cloak.configure({
  express: expressServer,
  messages: {
    chat: function(msg, user) {
      user.getRoom().messageMembers('chat', msg);
    },

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
