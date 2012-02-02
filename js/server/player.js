var arena = require('./game.js');
var socket = require('./socket.js');

module.exports = function initPlayer() {
    var bombInHand;

    return {
        alive: true,
        id: -1,
        x: -1,
        y: -1,
        socket: null,

        kill: function kill(message) {
            this.alive = false;
            this.x = -1;
            this.y = -1;

            console.log('KILLED! because: ' + message);

            this.socket.emit('KILL', {
                cause: message
            });
        },

        move: function move(deltaX, deltaY) {
            if (!this.alive) {
                var coordinates = arena.findEmptyPlace();
                this.x = coordinates.x;
                this.y = coordinates.y;
                this.alive = true;
                
                arena.map[this.x][this.y].changeType(this.id);
                
                return;
            }

            var oldX = this.x;
            var oldY = this.y;
            var tempX = oldX + deltaX;
            var tempY = oldY + deltaY;
            var size = arena.size;

            if (oldX < 0 || oldY < 0 || tempX < 0 || tempX >= size || tempY < 0 || tempY >= size) {
                return;
            }
            if (arena.map[oldX][oldY].type != this.id) {
                this.kill('weird location');

                return;
            }

            if (deltaX === 0 && deltaY === 0) {
                this.bomb();

                return;
            }

            if (arena.map[oldX + deltaX][oldY + deltaY].type == 1 || arena.map[oldX + deltaX][oldY + deltaY].type == 3) {
                return;
            }
            if (arena.map[oldX + deltaX][oldY + deltaY].type == 4) {
                socket.broadcast('UPDATE', arena.map[oldX][oldY].changeType(0));

                this.kill('fire');

                return;
            }
            if (arena.map[oldX + deltaX][oldY + deltaY].type > 4) {
                return;
            }

            var changes = [];

            if (tempX >= 0 && tempX < size) {
                this.x = tempX;
            }
            if (tempY >= 0 && tempY < size) {
                this.y = tempY;
            }

            if (this.x != oldX || this.y != oldY) {
                changes.push(arena.map[this.x][this.y].changeType(this.id));
                changes.push(arena.map[oldX][oldY].changeType(0));

                if (bombInHand) {
                    arena.placeBomb(bombInHand.x, bombInHand.y);

                    changes.push(arena.map[bombInHand.x][bombInHand.y].changeType(3));

                    bombInHand = null;
                }
            }

            socket.broadcast('UPDATE', {
                changes: changes
            });
        },

        bomb: function bomb() {
            bombInHand = {
                x: this.x,
                y: this.y
            };
        }
    };
};