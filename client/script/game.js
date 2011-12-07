var GAME = (function initGame() {
   var CELL = (function initCell() {
      return {
         type: -1,

         cell: null,

         changeType: function changeType(newType) {
            this.type = newType;

            var style = 'map_';

            switch(newType) {
               case 0:
                  style += 'path';

               break;

               case 1:
                  style += 'wall';

               break;

               case 2:
                  style += 'player';

               break;

               case 3:
                  style += 'bomb';

               break;

               case 4:
                  style += 'fire';

               break;

               default:
                  style = '';
            }

            this.cell.className = style;
         }
      };
   })();

   var SOCKET = (function initSocket() {
      var SOCKET = io.connect('http://184.73.187.157/');
      // var SOCKET = io.connect('http://127.0.0.1/');
      SOCKET.on('HELLO', function onHello(data) {
         console.log(data);
         // data = JSONH.parse(data);
         console.log(data);

         PLAYER_ID = data.player_id;

         buildArena(data.map, data.size);
      });
      SOCKET.on('UPDATE', function onUpdate(message) {
         if (!ARENA) return;
         
         console.log(message);
         // message = JSONH.parse(message);
         console.log(message);

         var changes = message.changes;
         console.log(changes.length);
         for (var i = 0; i < changes.length; i++) {
            var change = changes[i];

            ARENA[change.y][change.x].changeType(change.type);
         }
      });

      return {
         sendMovement: function sendMovement(deltaX, deltaY) {
            var message = {player_id: PLAYER_ID, deltaX: deltaX, deltaY: deltaY};
            // message = JSONH.stringify(message);

            SOCKET.emit('TRIGGER', message);
         }
      };
   })();

   var ARENA;
   var SOCKET;
   var PLAYER_ID;

   var buildArena = function buildArena(map, size) {
      console.log(size);
      console.log(map);

      ARENA = [];

      var body = document.body;

      var tbl = document.createElement("table");
      tbl.id = 'game_table';

      var tblBody = document.createElement("tbody");

      for (var i = 0; i < size; i++) {
         ARENA[i] = [];

         var row = document.createElement("tr");

         for (var j = 0; j < size; j++) {
            var tableCell = document.createElement("td");
            row.appendChild(tableCell);

            tblBody.appendChild(row);

            tbl.appendChild(tblBody);
            body.appendChild(tbl);
            tbl.setAttribute("border", "1");

            var cell = Object.create(CELL);
            cell.cell = tableCell;
            cell.changeType(map[j][i].type);

            ARENA[i][j] = cell;
         }
      }
   };

   return {
      sendMovement: function sendMovement(deltaX, deltaY) {
         SOCKET.sendMovement(deltaX, deltaY);
      }
   };
})();


document.onkeyup = function onKeyUp(event) {
   switch(event.keyCode) {
      case 37:
         // left
         GAME.sendMovement(-1, 0);

      break;

      case 38:
         // up
         GAME.sendMovement(0, -1);

      break;

      case 39:
         // right
         GAME.sendMovement(1, 0);

      break;

      case 40:
         // down
         GAME.sendMovement(0, 1);

      break;

      case 32:
         // space
         GAME.sendMovement(0, 0);
   }
};
