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

var sockets = require('./socket.js');
var games = require('./games.js');

try {
    sockets.addConnectionListener(function onConnection(socket) {
        var room = socket.flags.endpoint;
        var arena = games[room];
        if (!arena) {
            console.log('create game for ' + room);
            arena = games.createGame(room);
        }
        
        socket.on('SYN', function onSyn(data) {
            arena.createPlayer(socket, data);
        });
        socket.emit('HELLO', '');
    });
} catch (e) {
    console.error(e);
}