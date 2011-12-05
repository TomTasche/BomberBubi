var ARENA = [];

var CELL = (function initCell() {
   return {
      x: -1,
      y: -1,
      type: -1,

      changeType: function changeType(type, enqueue) {
         this.type = type;

         if (enqueue) return this;

         var message = {changes: [{x: this.x, y: this.y, type: this.type}]};
         message = ARENA.JSONH.stringify(message);
         ARENA.SOCKET.sockets.emit('UPDATE', message);
      }
   };
})();


buildMap(10);

function buildMap(size) {
   ARENA = [];
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
}

this.ARENA = ARENA;
