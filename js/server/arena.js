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

var socket = require('./socket.js');
var Cell = require('./cell.js');

var findEmptyPlace = function findEmptyPlace() {
    var size = this.size;
    var result = {};
    
    if (this.map[0][0].type === 0) {
        result.x = 0;
        result.y = 0;
    } else if (this.map[size - 1][0].type === 0) {
        result.x = size - 1;
        result.y = 0;
    } else if (this.map[0][size - 1].type === 0) {
        result.x = 0;
        result.y = size - 1;
    } else if (this.map[size - 1][this.map.length - 1].type === 0) {
        result.x = size - 1;
        result.y = size - 1;
    } else {
        while (!iterateMap(size, result)) {}
    }
    
    return result;
};
var iterateMap = function iterateMap(size, result) {
    for (var i = 0; i < size; i++) {
        if (this.map[i][0].type === 0) {
            result.x = i;
            result.y = 0;

            return result;
        }

        if (this.map[0][i].type === 0) {
            result.x = 0;
            result.y = i;

            return result;
        }
    }
    
    return null;
};
var placeBomb = function placeBomb(x, y) {
    var that = this;
    
    setTimeout(function fireBomb() {
        that.toggleFire(x, y, 4);

        setTimeout(function clearFire() {
            that.toggleFire(x, y, 0);
        }, 1000);
    }, 2500);
};
var placeObstacles = function placeObstacles() {
    var random = function random(size) {
        size = size - 1;
        
        return Math.round(Math.random() * size);
    };
    
    var changes = [];
    var size = this.map.length;

    for (var i = 0; i < size * size / 2; i++) {
        changes.push(this.map[random(size)][random(size)].changeType(1));
    }

    socket.broadcast(this.room, 'UPDATE', {
        changes: changes
    });
};
var toggleFire = function toggleFire(x, y, state) {
    var changes = [];
    var size = this.size;

    changes.push(this.map[x][y].changeType(state));

    if (x + 1 < size) {
        changes.push(this.map[x + 1][y].changeType(state));
    }
    if (x + 2 < size) {
        changes.push(this.map[x + 2][y].changeType(state));
    }
    if (x - 1 >= 0) {
        changes.push(this.map[x - 1][y].changeType(state));
    }
    if (x - 2 >= 0) {
        changes.push(this.map[x - 2][y].changeType(state));
    }
    if (y + 1 < size) {
        changes.push(this.map[x][y + 1].changeType(state));
    }
    if (y + 2 < size) {
        changes.push(this.map[x][y + 2].changeType(state));
    }
    if (y - 1 >= 0) {
        changes.push(this.map[x][y - 1].changeType(state));
    }
    if (y - 2 >= 0) {
        changes.push(this.map[x][y - 2].changeType(state));
    }

    socket.broadcast(this.room, 'UPDATE', {
        changes: changes
    });
};

module.exports = function initArena(size, room) {
    var map = [];

    for (var i = 0; i < size; i += 1) {
        map[i] = [];

        for (var j = 0; j < size; j++) {
            var cell = new Cell(i, j, 0);

            map[i][j] = cell;
        }
    }
    
    var arena = {};
    arena.map = map;
    arena.room = room;
    arena.placeBomb = placeBomb;
    arena.placeObstacles = placeObstacles;
    arena.findEmptyPlace = findEmptyPlace;
    arena.toggleFire = toggleFire;
    arena.size = size;

    return arena;
};