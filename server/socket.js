var SERVER = SERVER || require('./server.js');
var SOCKETIO = SOCKETIO || require('socket.io').listen(SERVER);

var broadcast = function broadcast(type, data) {
   SOCKETIO.sockets.emit(type, data);
};
var on = function on(type, callback) {
   SOCKETIO.sockets.on(type, callback);
};

module.exports = {
   broadcast: broadcast,
   on: on
};
