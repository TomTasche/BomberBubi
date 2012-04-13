
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
    arena.findEmptyPlace = findEmptyPlace;
    arena.size = size;

    return arena;
};