var ARENA = require('./game.js');
var SOCKET = require('./socket.js');
var PLAYERS = [];

var PLAYER = function initPlayer() {
    var bombInHand;

    return {
        alive: true,
        id: -1,
        x: -1,
        y: -1,

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
                var coordinates = findEmptyPlace();
                this.x = coordinates.x;
                this.y = coordinates.y;
                this.alive = true;
                
                ARENA[this.x][this.y].changeType(this.id);
                
                return;
            }

            var oldX = this.x;
            var oldY = this.y;
            var tempX = oldX + deltaX;
            var tempY = oldY + deltaY;
            var size = ARENA.length;

            if (oldX < 0 || oldY < 0 || tempX < 0 || tempX >= size || tempY < 0 || tempY >= size) {
                return;
            }
            if (ARENA[oldX][oldY].type != this.id) {
                this.kill('weird location');

                return;
            }

            if (deltaX === 0 && deltaY === 0) {
                this.bomb();

                return;
            }

            if (ARENA[oldX + deltaX][oldY + deltaY].type == 1 || ARENA[oldX + deltaX][oldY + deltaY].type == 3) {
                return;
            }
            if (ARENA[oldX + deltaX][oldY + deltaY].type == 4) {
                ARENA[oldX][oldY].changeType(0);

                this.kill('fire');

                return;
            }
            if (ARENA[oldX + deltaX][oldY + deltaY].type > 4) {
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
                changes.push(ARENA[this.x][this.y].changeType(this.id, true));
                changes.push(ARENA[oldX][oldY].changeType(0, true));

                if (bombInHand) {
                    ARENA.placeBomb(bombInHand.x, bombInHand.y);

                    changes.push(ARENA[bombInHand.x][bombInHand.y].changeType(3, true));

                    bombInHand = null;
                }
            }

            SOCKET.broadcast('UPDATE', {
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

var findEmptyPlace = function findEmptyPlace() {
    var size = ARENA.length;
    var result = {};
    
    if (ARENA[0][0].type === 0) {
        result.x = 0;
        result.y = 0;
    } else if (ARENA[size - 1][0].type === 0) {
        result.x = size - 1;
        result.y = 0;
    } else if (ARENA[0][size - 1].type === 0) {
        result.x = 0;
        result.y = size - 1;
    } else if (ARENA[size - 1][ARENA.length - 1].type === 0) {
        result.x = size - 1;
        result.y = size - 1;
    } else {
        while (!iterateMap(size, result)) {}
    }
    
    return result;
};

var iterateMap = function iterateMap(size, result) {
    for (var i = 0; i < size; i++) {
        if (ARENA[i][0].type === 0) {
            result.x = i;
            result.y = 0;

            return result;
        }

        if (ARENA[0][i].type === 0) {
            result.x = 0;
            result.y = i;

            return result;
        }
    }
    
    return null;
};

var createPlayer = function createPlayer() {
    var player = new PLAYER();
    player.id = 5 + PLAYERS.length;
    PLAYERS.length += 1;

    var coordinates = findEmptyPlace();
    player.x = coordinates.x;
    player.y = coordinates.y;

    PLAYERS[player.id - 5] = player;

    ARENA[player.x][player.y].changeType(player.id);

    return player;
};

SOCKET.on('connection', function(socket) {
    var size = ARENA.length;
    var player = createPlayer();

    player.socket = socket;
    var arena = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var cell = ARENA[i][j];
            if (cell.type !== 0) {
                arena.push(cell);
            }
        }
    }

    var map = {
        changes: arena,
        size: size,
        player_id: player.id
    };
    socket.emit('HELLO', map);
    socket.on('TRIGGER', function onTrigger(data) {
        player.move(data.deltaX, data.deltaY);
    });
});