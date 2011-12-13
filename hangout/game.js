var size = 10;

var sendUpdate = function sendUpdate(keyOrState) {
   // taken from: https://code.google.com/p/google-plus-hangout-samples/source/browse/samples/yes-no-maybe/ggs/yesnomaybe.js
   var state = null;
   if (typeof keyOrState === 'string') {
      state = {};
      state[keyOrState] = opt_value;
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

var sendMovement = function sendMovement(xDelta, yDelta) {
   sendUpdate({x: JSON.stringify(xDelta), y: JSON.stringify(yDelta)});
};

gapi.hangout.onApiReady.add(function onApiReadyCallback(event) {
   window.alert('waiting');
   if (event.isApiReady) {
      window.alert('ready');
      gapi.hangout.data.onStateChanged.add(function onStateChangedCallback(event) {
         window.alert('changes');
         window.alert(event);
         window.alert(event.addedKeys);
         window.alert(gapi.hangout.data.getState());
      });
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
