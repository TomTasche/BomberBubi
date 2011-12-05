var APP = require('./server.js').app;
var ARENA = require('./game.js').ARENA;
var SOCKET = require('socket.io').listen(APP);
var JSONH = require('./JSONH/js/jsonh.js');
ARENA.SOCKET = SOCKET;
ARENA.JSONH = JSONH;
SOCKET.sockets.on('connection', function (socket) {
   var temp = PLAYER.createPlayer();

   socket.emit('HELLO', {map: ARENA, size: ARENA.SIZE, player_id: temp.getId()});
   socket.on('TRIGGER', function onTrigger(data) {
      var player = PLAYER.getPlayer(data.player_id);
      player.move(data.deltaX, data.deltaY);
   });
});

var PLAYER = (function initPlayer() {
   var PLAYER_PROTOTYPE = (function initPlayerPrototype() {
      var alive = true;

      var bombInHand;

      var toggleFire = function toggleFire(x, y, state) {
         var changes = [];
         
         changes.push(ARENA[x][y].changeType(state, true));

         if (x + 1 < ARENA.SIZE) changes.push(ARENA[x + 1][y].changeType(state, true));
         if (x + 2 < ARENA.SIZE) changes.push(ARENA[x + 2][y].changeType(state, true));
         if (x - 1 >= 0) changes.push(ARENA[x - 1][y].changeType(state, true));
         if (x - 2 >= 0) changes.push(ARENA[x - 2][y].changeType(state, true));
         if (y + 1 < ARENA.SIZE) changes.push(ARENA[x][y + 1].changeType(state, true));
         if (y + 2 < ARENA.SIZE) changes.push(ARENA[x][y + 2].changeType(state, true));
         if (y - 1 >= 0) changes.push(ARENA[x][y - 1].changeType(state, true));
         if (y - 2 >= 0) changes.push(ARENA[x][y - 2].changeType(state, true));

         changes = JSONH.stringify(changes);
         ARENA.SOCKET.sockets.emit('UPDATE', {changes: changes});
      };

      return {
         id: -1,
         x: -1,
         y: -1,

         getX: function getX() {
            return this.x;
         },

         setX: function setX(newX) {
            this.x = newX;
         },

         getY: function getY() {
            return this.y;
         },

         setY: function setY(newY) {
            this.y = newY;
         },

         getId: function getId() {
            return this.id;
         },

         setId: function setId(newId) {
            this.id = newId;
         },

         move: function move(deltaX, deltaY) {
            if (!alive) return;

            if (this.x < 0 && this.y < 0) return;
            if (ARENA[this.x][this.y].type != 2) {
               alive = false;

               return;
            }

            if (deltaX == 0 && deltaY == 0) {
               this.bomb();

               return;
            }

            var changes = [];

            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && (ARENA[this.x + deltaX][this.y + deltaY].type == 1 || ARENA[this.x + deltaX][this.y + deltaY].type == 3)) return;
            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && ARENA[this.x + deltaX][this.y + deltaY].type == 4) {
               changes.push(ARENA[this.x][this.y].changeType(0, true));

               this.x = -1;
               this.y = -1;

               alive = false;

               return;
            }
            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && ARENA[this.x + deltaX][this.y + deltaY].type == 2) return;

            var tempX = this.x + deltaX;
            var tempY = this.y + deltaY;
            var oldX = this.x;
            var oldY = this.y;

            if (tempX >= 0 && tempX < ARENA.SIZE) {
               this.x = tempX;
            }
            if (tempY >= 0 && tempY < ARENA.SIZE) {
               this.y = tempY;
            }

            if (oldX != this.x || oldY != this.y) {
               changes.push(ARENA[this.x][this.y].changeType(2, true));
               changes.push(ARENA[oldX][oldY].changeType(0, true));

               if (bombInHand) {
                  console.log('bombInHand: ' + bombInHand);
                  var bomb = Object.create(bombInHand);
                  console.log('bomb: ' + bomb);

                  setTimeout(function fireBomb() {
                     console.log('BOOM, at: ' + bomb.x + ',' + bomb.y);

                     toggleFire(bomb.x, bomb.y, 4);

                     setTimeout(function clearFire() {
                        console.log('no more BOOM');
                        toggleFire(bomb.x, bomb.y, 0);
                     }, 1000);
                  }, 2500);

                  changes.push(ARENA[bomb.x][bomb.y].changeType(3, true));

                  bombInHand = null;
               }
            }

            changes = JSONH.stringify(changes);
            ARENA.SOCKET.sockets.emit('UPDATE', {changes: changes});
         },

         bomb: function bomb() {
            bombInHand = {x: this.x, y: this.y};
         }
      };
   })();

   var PLAYERS = [];

   return {
      createPlayer: function createPlayer() {
         var player = Object.create(PLAYER_PROTOTYPE);
         player.setId(PLAYERS.length);

         if (ARENA[0][0].type == 0) {
            player.setX(0);
            player.setY(0);
         } else if (ARENA[ARENA.SIZE - 1][0].type == 0) {
            player.setX(ARENA.SIZE - 1);
            player.setY(0);
         } else if (ARENA[0][ARENA.SIZE - 1].type == 0) {
            player.setX(0);
            player.setY(ARENA.SIZE - 1);
         } else if (ARENA[ARENA.SIZE - 1][ARENA.SIZE - 1].type == 0) {
            player.setX(ARENA.SIZE - 1);
            player.setY(ARENA.SIZE - 1);
         } else {
            for (var i = 0; i < ARENA.SIZE; i++) {
               if (ARENA[i] && ARENA[i][0] && ARENA[i][0].type == 0) {
                  player.setX(i);
                  player.setY(0);
               }

               if (ARENA[0] && ARENA[0][i] && ARENA[0][i].type == 0) {
                  player.setX(0);
                  player.setY(i);
               }
            }
         }

         ARENA[player.getX()][player.getY()].changeType(2);

         PLAYERS.push(player);

         return player;
      },

      getPlayer: function getPlayer(index) {
         return PLAYERS[index];
      }
   };
})();

this.PLAYER = PLAYER;
