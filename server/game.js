var SOCKET = require('./socket.js');
var ARENA = ARENA || [];

var CELL = CELL || (function initCell() {
   return {
      x: -1,
      y: -1,
      type: -1,

      changeType: function changeType(type, enqueue) {
         this.type = type;

         if (enqueue) {
            return this;
         } else {
            var message = {changes: [{x: this.x, y: this.y, type: this.type}]};
            // message.changes = ARENA.JSONH.stringify(message.changes);
            SOCKET.broadcast('UPDATE', message);
         }
      }
   };
})();

(function buildMap(size) {
   if (ARENA.length !== 0) {
      return;
   }
   ARENA.SIZE = size;

   for (var i = 0; i < size; i++) {
      ARENA[i] = [];

      for (var j = 0; j < size; j++) {
         var cell = Object.create(CELL);
         cell.type = 0;
         cell.x = i;
         cell.y = j;

         ARENA[i][j] = cell;
      }
   }
})(10);

module.exports = ARENA;

var PLAYERS = PLAYERS || require('./player.js');
