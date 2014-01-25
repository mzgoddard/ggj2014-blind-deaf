// Used to map urls to room ids
var roomNameMap = Object.create(null);

exports.getRoomForUrl = function(cloak, url) {
  var roomName = url;
  var id = roomNameMap[roomName];
  var room = cloak.getRoom(id);
  if (!room) {
    room = cloak.createRoom(roomName);
    roomNameMap[roomName] = room.id;
  }

  return room;
};

exports.cleanUpRoomOnClose = function() {
  delete roomNameMap[this.name];
};
