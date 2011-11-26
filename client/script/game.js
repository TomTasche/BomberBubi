var GAME = (function initGame() {
   var CELL = (function initCell() {
      return {
         x: -1,
         y: -1,
         type: -1,

         cell: null,

         changeType: function changeType(newType) {
            type = newType;

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

         cell.className = style;
         }
      };
   })();

   var ARENA = [];
   var SOCKET;
   var PLAYER_ID;
   var READY_DIV = document.getElementById('ready_div');

   var openSocket = function openSocket() {
      SOCKET = new WebSocket("ws://127.0.0.1/");
      SOCKET.onmessage = onMessage;
      SOCKET.onopen = onOpen;
      SOCKET.onerror = onError;
      SOCKET.onclose = onClose;
   };
   var onOpen = function onOpen(event) {
      console.log(event);
   };
   var onMessage = function onMessage(message) {
      console.log(message);

      message = JSON.parse(message);

      if (message.type == 0) {
         buildMap(message.map);
      }

      PLAYER_ID = message.player_id;
      READY_DIV.innerText = 'Ready!';

      var changes = message.changes;
      for (var change in changes) {
         ARENA[change.x][change.y].changeType(change.type);
      }
   };
   var onError = function onError(event) {
      console.log(event);

      READY_DIV.innerText = 'Meh. Error!';
   };
   var onClose = function onClose(event) {
      console.log(event);

      READY_DIV.innerText = 'Connection closed';
   };

   var buildArena = function buildArena(map) {
      ARENA = [];

       var body = document.body;

       var tbl = document.createElement("table");
       tbl.id = 'game_table';
       
       var tblBody = document.createElement("tbody");
       
       for (var i = 0; i < map.SIZE; i++) {
           ARENA[i] = [];
           
           var row = document.createElement("tr");
           
           for (var j = 0; j < map.SIZE; j++) {
               var tableCell = document.createElement("td");
               tableCell.innerText = j + ',' + i;
               row.appendChild(tableCell);
               
               tblBody.appendChild(row);
       
               tbl.appendChild(tblBody);
               body.appendChild(tbl);
               tbl.setAttribute("border", "1");

               var cell = Object.create(CELL);
               cell.cell = tableCell;
               cell.x = j;
               cell.y = i;
               cell.changeType(map[i][j]);

               ARENA[i][j] = cell;
           }
       }
      };

      
      return {
         sendKey: function sendKey(keycode) {
            var message = {player_id: PLAYER_ID, keycode: keycode, timestamp: new Date().getTime()};

            SOCKET.send(message);
         }
      };
   })();


document.onkeyup = function onKeyUp(event) {
    switch(event.keyCode) {
        case 37:
            // left
        case 38:
            // up
        case 39:
            // right
        case 40:
            // down
        case 32:
            // space
            GAME.sendKey(event.keyCode);
    }
};
