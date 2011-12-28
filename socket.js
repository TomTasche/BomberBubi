// var SERVER = SERVER || require('./server.js');
var SOCKETIO = SOCKETIO || require('socket.io').listen(80);
SOCKETIO.set('transports', [
       'websocket',
       'htmlfile', 'xhr-polling', 'jsonp-polling'
]);
SOCKETIO.enable('browser client minification');
SOCKETIO.enable('browser client etag');
SOCKETIO.enable('browser client cache');
SOCKETIO.enable('browser client gzip');

// SOCKETIO.set('log level', 1);

var broadcast = function broadcast(type, data) {
   SOCKETIO.of('/sockets').emit(type, data);
};
var on = function on(type, callback) {
   SOCKETIO.of('/sockets').on(type, callback);
};

module.exports = {
   broadcast: broadcast,
   on: on
};
