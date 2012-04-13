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

var games = {};

var initGame = function initGame(room) {
    var arena = new require('./arena.js')(10, room);
    
    var players = [];
    
    var createPlayer = function createPlayer(socket) {
        var player = new Player();
        player.socket = socket;
        player.id = 5 + players.length;
        players.length += 1;
    
        var coordinates = arena.findEmptyPlace();
        player.x = coordinates.x;
        player.y = coordinates.y;
    
        players[player.id - 5] = player;
    
        arena.map[player.x][player.y].changeType(player.id);
    
        return player;
    };
    
    var ackPlayer = function ackPlayer(socket) {
        var size = arena.size;
        var player = createPlayer(socket);
        
        var map = [];
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                var cell = arena.map[i][j];
                if (cell.type !== 0) {
                    map.push(cell);
                }
            }
        }
    
        var data = {
            changes: map,
            size: size,
            player_id: player.id
        };
        socket.emit('HELLO', data);
        socket.on('TRIGGER', function onTrigger(data) {
            player.move(data.deltaX, data.deltaY);
        });
    };

    arena.createPlayer = ackPlayer;

    games[room] = arena;
    
    return arena;
};

games.createGame = initGame;

module.exports = games;

var Player = require('./player.js');