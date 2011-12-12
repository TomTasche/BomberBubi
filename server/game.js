var SOCKET = require('./socket.js');
var ARENA = ARENA || (function initArena(size) {
   var map = [];
   map.length = size;

   for (var i = 0; i < size; i += 1) {
      map[i] = [];

      for (var j = 0; j < size; j++) {
         var cell = new CELL(i, j, 0);

         map[i][j] = cell;
      }
   }

   return map;
})(10);

var CELL = CELL || (function initCell(x, y, type) {
   return {
      x: i,
      y: j,
      type: type,

      changeType: function changeType(type, enqueue) {
         this.type = type;

         if (enqueue) {
            return this;
         } else {
            var message = {changes: [{x: this.x, y: this.y, type: this.type}]};
            SOCKET.broadcast('UPDATE', message);
         }
      }
   };
})();

var placeObstacles = function placeObstacles() {

};
var placeItems = function placeItems() {
   // setInterval(placeItems);
};
var toggleFire = function toggleFire(x, y, state) {
   var changes = [];
   var size = ARENA.length;

   changes.push(ARENA[x][y].changeType(state, true));

   if (x + 1 < size) {
      changes.push(ARENA[x + 1][y].changeType(state, true));
   }
   if (x + 2 < size) {
      changes.push(ARENA[x + 2][y].changeType(state, true));
   }
   if (x - 1 >= 0) {
      changes.push(ARENA[x - 1][y].changeType(state, true));
   }
   if (x - 2 >= 0) {
      changes.push(ARENA[x - 2][y].changeType(state, true));
   }
   if (y + 1 < size) {
      changes.push(ARENA[x][y + 1].changeType(state, true));
   }
   if (y + 2 < size) {
      changes.push(ARENA[x][y + 2].changeType(state, true));
   }
   if (y - 1 >= 0) {
      changes.push(ARENA[x][y - 1].changeType(state, true));
   }
   if (y - 2 >= 0) {
      changes.push(ARENA[x][y - 2].changeType(state, true));
   }

   SOCKET.broadcast('UPDATE', {changes: changes});
};
var placeBomb = function placeBomb(x, y) {
   setTimeout(function fireBomb() {
      toggleFire(x, y, 4);

      setTimeout(function clearFire() {
         toggleFire(x, y, 0);
      }, 1000);
   }, 2500);
};

ARENA.placeBomb = placeBomb;

module.exports = ARENA;

var PLAYERS = PLAYERS || require('./player.js');
