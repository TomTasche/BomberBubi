var ARENA = require('./game.js');
var SOCKET = require('./socket.js');
var PLAYERS = [];

var PLAYER = (function initPlayer() {
   var PLAYER_PROTOTYPE = (function initPlayerPrototype() {
      var bombInHand;

      return {
         alive: true,
         id: -1,
         x: -1,
         y: -1,

         move: function move(deltaX, deltaY) {
            if (!this.alive) {
               return;
            }

            if (this.x < 0 && this.y < 0) {
               return;
            }
            if (ARENA[this.x][this.y].type != 2) {
               this.x = -1;
               this.y = -1;

               this.alive = false;

               return;
            }

            if (deltaX === 0 && deltaY === 0) {
               this.bomb();

               return;
            }

            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && (ARENA[this.x + deltaX][this.y + deltaY].type == 1 || ARENA[this.x + deltaX][this.y + deltaY].type == 3)) {
               return;
            }
            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && ARENA[this.x + deltaX][this.y + deltaY].type == 4) {
               ARENA[this.x][this.y].changeType(0);

               this.x = -1;
               this.y = -1;

               this.alive = false;

               return;
            }
            if (ARENA[this.x + deltaX] && ARENA[this.x + deltaX][this.y + deltaY] && ARENA[this.x + deltaX][this.y + deltaY].type == 2) {
               return;
            }

            var changes = [];
            var tempX = this.x + deltaX;
            var tempY = this.y + deltaY;
            var oldX = this.x;
            var oldY = this.y;

            if (tempX >= 0 && tempX < ARENA.length) {
               this.x = tempX;
            }
            if (tempY >= 0 && tempY < ARENA.length) {
               this.y = tempY;
            }

            if (oldX != this.x || oldY != this.y) {
               changes.push(ARENA[this.x][this.y].changeType(2, true));
               changes.push(ARENA[oldX][oldY].changeType(0, true));

               if (bombInHand) {
                  ARENA.placeBomb(bombInHand.x, bombInHand.y);

                  changes.push(ARENA[bombInHand.x][bombInHand.y].changeType(3, true));

                  bombInHand = null;
               }
            }

            SOCKET.broadcast('UPDATE', {changes: changes});
         },

         bomb: function bomb() {
            bombInHand = {x: this.x, y: this.y};
         }
      };
   })();


   return {
      createPlayer: function createPlayer() {
         var player = new PLAYER();
         player.id = PLAYERS.length;
         PLAYERS.length += 1;

         if (ARENA[0][0].type === 0) {
            player.x = 0;
            player.y = 0;
         } else if (ARENA[ARENA.length - 1][0].type === 0) {
            player.x = ARENA.length - 1;
            player.y = 0;
         } else if (ARENA[0][ARENA.length - 1].type === 0) {
            player.x = 0;
            player.y = ARENA.length - 1;
         } else if (ARENA[ARENA.length - 1][ARENA.length - 1].type === 0) {
            player.x = ARENA.length - 1;
            player.y = ARENA.length - 1;
         } else {
            for (var i = 0; i < ARENA.length; i++) {
               if (ARENA[i] && ARENA[i][0] && ARENA[i][0].type == 0) {
                  player.x = i;
                  player.y = 0;

                  break;
               }

               if (ARENA[0] && ARENA[0][i] && ARENA[0][i].type == 0) {
                  player.x = 0;
                  player.y = i;

                  break;
               }
            }
         }

         ARENA[player.x][player.y].changeType(2);

         PLAYERS.push(player);

         return player;
      }
   };
})();

SOCKET.on('connection', function (socket) {
   var player = PLAYER.createPlayer();

   var arena = [];
   for (var i = 0; i < ARENA.length; i++) {
      for (var j = 0; j < ARENA.length; j++) {
         var cell = ARENA[i][j];
         if (cell.type !== 0) {
            arena.push(cell);
         }
      }
   }

   var map = {changes: arena, size: ARENA.length, player_id: player.id};
   socket.emit('HELLO', map);
   socket.on('TRIGGER', function onTrigger(data) {
      player.move(data.deltaX, data.deltaY);
   });
});
