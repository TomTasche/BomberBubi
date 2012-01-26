var size = 10;
var x = -1;
var y = -1;
var alive = false;
var queue = [];
var table;
var bombInHand;

var prepareUpdate = function prepareUpdate(type, avatar) {
   var object = {
      type: type,
      avatar: avatar
   };

   return JSON.stringify(object);
};

var placeBomb = function placeBomb(x, y) {
   setTimeout(function fireBomb() {
      toggleFire(x, y, 4);

      setTimeout(function clearFire() {
         toggleFire(x, y, 0);
      }, 1000);
   }, 2500);
};

var kill = function kill(reason) {
   console.log('killed because ' + reason);

   alive = false;
   x = -1;
   y = -1;
};

var flushQueue = function flushQueue() {
   var object = {};
   for (var i = 0; i < queue.length; i++) {
      object[queue[i].key] = queue[i].value;
   }

   queue = [];

   gapi.hangout.data.submitDelta(object);
};

var alterMap = function alterMap(x, y, type, enqueue) {
      var update = {};
      update.key = JSON.stringify({x: x, y: y});
      update.value = prepareUpdate(type);

      queue.push(update);

      if (!enqueue) {
         flushQueue();
      }
};

var changeStyle = function changeStyle(x, y, type) {
   var style = 'map_';
   switch(type) {
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

   table.rows[y].cells[x].className = style;
}

var toggleFire = function toggleFire(x, y, state) {
   console.log('fire!!');

   alterMap(x, y, state, true);

   if (x + 1 < size) {
      alterMap(x + 1, y, state, true);
   }
   if (x + 2 < size) {
      alterMap(x + 2, y, state, true);
   }
   if (x - 1 >= 0) {
      alterMap(x - 1, y, state, true);
   }
   if (x - 2 >= 0) {
      alterMap(x - 2, y, state, true);
   }
   if (y + 1 < size) {
      alterMap(x, y + 1, state, true);
   }
   if (y + 2 < size) {
      alterMap(x, y + 2, state, true);
   }
   if (y - 1 >= 0) {
      alterMap(x, y - 1, state, true);
   }
   if (y - 2 >= 0) {
      alterMap(x, y - 2, state, true);
   }

   flushQueue();
};

var getCellForCoordinates = function getCellForCoordinates(x, y) {
   var name = JSON.stringify({x: x, y: y});
   var cell = gapi.hangout.data.getState()[name];
   
   if (cell) {
      cell = JSON.parse(cell);
   }

   return cell;
};

var sendMovement = function sendMovement(xDelta, yDelta) {
   if (!alive || x < 0 || y < 0) {
      kill('dead');

      return;
   }

   var changes = [];

   var tempX = x + xDelta;
   var tempY = y + yDelta;

   if (getCellForCoordinates(x, y) && getCellForCoordinates(x, y).type != 2) {
      kill('unknown');

      return;
   }

   if (getCellForCoordinates(tempX, tempY) && xDelta !== 0 && yDelta !== 0 &&
       (getCellForCoordinates(tempX, tempY).type == 1 || getCellForCoordinates(tempX, tempY).type == 2 || getCellForCoordinates(tempX, tempY).type == 3)) {
      return;
   }
   if (getCellForCoordinates(tempX, tempY) && getCellForCoordinates(tempX, tempY).type == 4) {
      alterMap(oldX, oldY, 0);

      kill('fire');

      return;
   }

   if (xDelta === 0 && yDelta === 0) {
      bombInHand = {x: x, y: y};

      return;
   }

   if (tempX >= 0 && tempX < size && tempY >= 0 && tempY < size) {
      alterMap(x, y, 0, true);

      x = tempX;
      y = tempY;


      if (bombInHand) {
         placeBomb(bombInHand.x, bombInHand.y);

         alterMap(bombInHand.x, bombInHand.y, 3, true);

         bombInHand = null;
      }

      alterMap(x, y, 2, true);
   }

   flushQueue();
};

var buildTable = function buildTable() {
   var root = document.getElementById('game');

   var tbl = document.createElement("table");
   tbl.id = 'game_table';

   var tblBody = document.createElement("tbody");

   for (var i = 0; i < size; i++) {
      var row = document.createElement("tr");

      for (var j = 0; j < size; j++) {
         var tableCell = document.createElement("td");
         row.appendChild(tableCell);

         tblBody.appendChild(row);

         tbl.appendChild(tblBody);
         tbl.setAttribute("border", "1");
         tbl.className = 'map_path';
      }
   }

   root.appendChild(tbl);

   table = tbl;
};


gapi.hangout.onApiReady.add(function onApiReadyCallback(event) {
   if (event.isApiReady) {
      gapi.hangout.data.onStateChanged.add(function onStateChangedCallback(event) {
         console.log('event: ' + JSON.stringify(event));
         console.log('added: ' + JSON.stringify(event.addedKeys));
         console.log('state: ' + JSON.stringify(event.state));

         for (var i = 0; i < event.addedKeys.length; i++) {
            var move = event.addedKeys[i];
            var coordinates = JSON.parse(move.key);
            var value = JSON.parse(move.value);

            changeStyle(coordinates.x, coordinates.y, value.type);
         }
      });

      buildTable();

      alive = true;
      x = 0;
      y = 0;
      alterMap(x, y, 2);
   }
});

var onKeyUp = function onKeyUp(event) {
   switch(event.keyCode) {
      case 37:
         // left
         sendMovement(-1, 0);

      break;

      case 38:
         // up
         sendMovement(0, -1);

      break;

      case 39:
         // right
         sendMovement(1, 0);

      break;

      case 40:
         // down
         sendMovement(0, 1);

      break;

      case 32:
         // space
         sendMovement(0, 0);
   }
};
document.addEventListener("keyup", onKeyUp, false);
