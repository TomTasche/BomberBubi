var games = require('./games.js');
var socket = require('./socket.js');

module.exports = function initPlayer() {
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
            var arena = games[this.socket.flags.endpoint];
            var map = arena.map;
            
            if (!this.alive) {
                var coordinates = arena.findEmptyPlace();
                this.x = coordinates.x;
                this.y = coordinates.y;
                this.alive = true;
                
                map[this.x][this.y].changeType(this.id);
                
                return;
            }

            var oldX = this.x;
            var oldY = this.y;
            var tempX = oldX + deltaX;
            var tempY = oldY + deltaY;
            var size = arena.size;

            if (oldX < 0 || oldY < 0 || tempX < 0 || tempX >= size || tempY < 0 || tempY >= size) return;
            if (map[oldX][oldY].type != this.id) {
                this.kill('weird location');

                return;
            }

            if (map[tempX][tempY].type == 1 || map[tempX][tempY].type == 3) {
                return;
            }
            if (map[tempX][tempY].type == 4) {
                socket.broadcast(arena.room, 'UPDATE', map[oldX][oldY].changeType(0));

                this.kill('fire');

                return;
            }
            if (map[oldX + deltaX][oldY + deltaY].type > 4) {
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
                changes.push(map[this.x][this.y].changeType(this.id));
                changes.push(map[oldX][oldY].changeType(0));
            }

            socket.broadcast(arena.room, 'UPDATE', {
                changes: changes
            });
        }
    };
};