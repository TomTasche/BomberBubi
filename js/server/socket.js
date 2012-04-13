/*
Copyright (C) 2012 Thomas Taschauer, <http://tomtasche.at/>.

This file is part of BomberBubi, <https://github.com/TomTasche/BomberBubi>.

BomberBubi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BomberBubi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with BomberBubi. If not, see <http://www.gnu.org/licenses/>.
*/

var server = require('./server.js');
var socketio = require('socket.io').listen(server);
socketio.set('log level', 1);
socketio.set('transports', ['websocket', 'xhr-polling', 'htmlfile', 'jsonp-polling']);
socketio.enable('browser client minification');
socketio.enable('browser client etag');
socketio.enable('browser client cache');
// socketio.enable('browser client gzip');

var connectionListeners = [];
var addConnectionListener = function addConnectionListener(callback) {
    connectionListeners.push(callback);
};

var broadcast = function broadcast(room, type, data) {
    socketio.of(room).emit(type, data);
};
var on = function on(room, type, callback) {
    socketio.of(room).on(type, callback);
};

// socketio.sockets.on('connection', function onConnection(socket) {
on('/socket.io', 'connection', function onConnection(socket) {
    for (var i = 0; i < connectionListeners.length; i++) {
        connectionListeners[i](socket);
    }
});

module.exports = {
    broadcast: broadcast,
    on: on,
    addConnectionListener: addConnectionListener
};