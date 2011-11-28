var APP = require('./server.js').app;
var ARENA = require('./game.js').ARENA;
var SOCKET = require('socket.io').listen(APP);
ARENA.SOCKET = SOCKET;
SOCKET.sockets.on('connection', function (socket) {
   var player = PLAYER.createPlayer();

   socket.emit('HELLO', {map: ARENA, size: ARENA.SIZE, player_id: player.getId()});
   socket.on('TRIGGER', function onTrigger(data) {
      player.move(data.deltaX, data.deltaY);
   });
});

var PLAYER = (function initPlayer() {
    var PLAYER_PROTOTYPE = (function initPlayerPrototype() {
      var id = -1;
      var x = -1;
      var y = -1;

      var alive = true;

      var bombInHand;

      var toggleFire = function toggleFire(x, y, state) {
         ARENA[x][y].changeType(state);

         if (x + 1 < ARENA.SIZE) ARENA[x + 1][y].changeType(state);
         if (x + 2 < ARENA.SIZE) ARENA[x + 2][y].changeType(state);
         if (x - 1 >= 0) ARENA[x - 1][y].changeType(state);
         if (x - 2 >= 0) ARENA[x - 2][y].changeType(state);
         if (y + 1 < ARENA.SIZE) ARENA[x][y + 1].changeType(state);
         if (y + 2 < ARENA.SIZE) ARENA[x][y + 2].changeType(state);
         if (y - 1 >= 0) ARENA[x][y - 1].changeType(state);
         if (y - 2 >= 0) ARENA[x][y - 2].changeType(state);
      };

      return {
         getX: function getX() {
            return x;
         },

         setX: function setX(newX) {
            x = newX;
         },

         getY: function getY() {
            return y;
         },

         setY: function setY(newY) {
            y = newY;
         },

         getId: function getId() {
            return id;
         },

         setId: function setId(newId) {
            id = newId;
         },

         move: function move(deltaX, deltaY) {
            if (!alive) return;

             if (x < 0 && y < 0) return;
             if (ARENA[x][y].type != 2) {
               alive = false;

               return;
             }
             if (ARENA[x + deltaX][y + deltaY] && ARENA[x + deltaX][y + deltaY].type == 1 || ARENA[x + deltaX][y + deltaY].type == 3) return;
             if (ARENA[x + deltaX][y + deltaY] && ARENA[x + deltaX][y + deltaY].type == 4) {
                 ARENA[x][y].changeType(0);
                 
                 x = -1;
                 y = -1;

		alive = false;
                 
                 return;
             }
    
          var tempX = x + deltaX;
          var tempY = y + deltaY;
          var oldX = x;
          var oldY = y;

          if (tempX >= 0 && tempX < ARENA.SIZE) {
              x = tempX;
          }
          if (tempY >= 0 && tempY < ARENA.SIZE) {
              y = tempY;
          }
          
          if (oldX != x || oldY != y) {
              ARENA[x][y].changeType(2);
              ARENA[oldX][oldY].changeType(0);

              if (bombInHand) {
                 var bomb = bombInHand;
                setTimeout(function fireBomb() {
                  console.log('BOOM, at: ' + bomb.x + ',' + bomb.y);

                 toggleFire(bomb.x, bomb.y, 4);
                 
                 setTimeout(function clearFire() {
                    console.log('no more BOOM');
                    toggleFire(bomb.x, bomb.y, 0);
                 }, 1000);
                }, 2500);

                ARENA[bomb.x][bomb.y].changeType(3);

                bombInHand = null;
              }
          }
        },

        bomb: function bomb() {
            bombInHand = {x: x, y: y};
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
                // TODO: random!
            }

		ARENA[player.getX()][player.getY()].changeType(2);
            
            PLAYERS.pop(player);

            return player;
        }
    };
})();

this.PLAYER = PLAYER;
