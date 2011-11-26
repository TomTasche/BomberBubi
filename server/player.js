var PLAYER = (function initPlayer() {
    var PLAYER_PROTOTYPE = (function initPlayerPrototype() {
      var id = -1;
      var x = -1;
      var y = -1;

      var alive = true;

      var bombInHand;

	            var toggleFire = function toggleFire(x, y, state) {
            ARENA.alterAt(x, y, state);
            
            if (x + 1 < ARENA.SIZE) ARENA.alterAt(x + 1, y, state);
            if (x + 2 < ARENA.SIZE) ARENA.alterAt(x + 2, y, state);
            if (x - 1 >= 0) ARENA.alterAt(x - 1, y, state);
            if (x - 2 >= 0) ARENA.alterAt(x - 2, y, state);
            if (y + 1 < ARENA.SIZE) ARENA.alterAt(x, y + 1, state);
            if (y + 2 < ARENA.SIZE) ARENA.alterAt(x, y + 2, state);
            if (y - 1 >= 0) ARENA.alterAt(x, y - 1, state);
            if (y - 2 >= 0) ARENA.alterAt(x, y - 2, state);
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

        move: function move(deltaX, deltaY, verified) {
           if (!verified) {
            if (!alive) return;

             if (x < 0 && y < 0) return;
             if (ARENA[x][y] != 2) {
               alive = false;

               return;
             }
             if (ARENA[x + deltaX][y + deltaY] == 1 || ARENA[x + deltaX][y + deltaY] == 3) return;
             if (ARENA[x + deltaX][y + deltaY] == 4) {
                 ARENA.alterAt(x, y, 0);
                 
                 x = -1;
                 y = -1;
                 
                 return;
             }
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
              ARENA.alterAt(x, y, 2);
              ARENA.alterAt(oldX, oldY, 0);

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

                ARENA.alterAt(bomb.x, bomb.y, 3);

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
            
            if (ARENA[0][0] == 0) {
                player.setX(0);
                player.setY(0);
            } else if (ARENA[ARENA.SIZE][0] == 0) {
                player.setX(0);
                player.setY(ARENA.SIZE);
            } else if (ARENA[0][ARENA.SIZE] == 0) {
                player.setX(0);
                player.setY(ARENA.SIZE);
            } else if (ARENA[ARENA.SIZE][ARENA.SIZE] == 0) {
                player.setX(ARENA.SIZE);
                player.setY(ARENA.SIZE);
            } else {
                // TODO: random!
            }
            
            PLAYERS.pop(player);

            return player;
        }
    };
})();
