var size = 10;
var x = 0;
var y = 0;
var queue = [];
var table;

var sendUpdate = function sendUpdate(keyOrState) {
   // taken from: https://code.google.com/p/google-plus-hangout-samples/source/browse/samples/yes-no-maybe/ggs/yesnomaybe.js
   var state = null;
   if (typeof keyOrState === 'string') {
      state = {};
      state[keyOrState] = '';
   } else if (typeof keyOrState === 'object' && null !== keyOrState) {
      // Ensure that no prototype-level properties are hitching a ride.
      state = {};
      for (var key in keyOrState) {
         if (keyOrState.hasOwnProperty(key)) {
            state[key] = keyOrState[key];
         }
      }
   }

   gapi.hangout.data.submitDelta(state);
};

var prepareUpdate = function prepareUpdate(type, avatar) {
   var object = {
      type: type,
      avatar: avatar
   };

   return JSON.stringify(object);
};

var alterMap = function alterMap(x, y, type, enqueue) {
   var update = {};
   update.key = JSON.stringify({x: x, y: y});
   update.value = prepareUpdate(type);

   queue.push(update);

   if (!enqueue) {
      flushQueue();
   }

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
};

var flushQueue = function flushQueue() {
   var object = {};
   for (var i = 0; i < queue.length; i++) {
      object[queue[i].key] = queue[i].value;
   }

   sendUpdate(object);

   queue = [];
};

var sendMovement = function sendMovement(xDelta, yDelta) {
   var changes = [];

   var tempX = x + xDelta;
   var tempY = y + yDelta;

   // if (xDelta === 0 && yDelta === 0) {
   // bomb...
   // }

   if (tempX >= 0 && tempX < size && tempY >= 0 && tempY < size) {
      alterMap(x, y, 0, true);

      x += xDelta;
      y += yDelta;

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
         window.alert('event: ' + JSON.stringify(event));
         window.alert('added: ' + JSON.stringify(event.addedKeys));
         window.alert('state: ' + JSON.stringify(event.state));
      });

      buildTable();
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
