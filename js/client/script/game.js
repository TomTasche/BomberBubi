(function initGame() {
    var changeType = function changeType(x, y, type) {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        
        var style;
        switch (type) {
            case 0:
                style = 'rgb(255, 255, 255)';

                break;

            case 1:
                style = 'rgb(126, 126, 126)';

                break;

            case 3:
                style = 'rgb(0, 0, 0)';

                break;

            case 4:
                style = 'rgb(255, 0, 0)';

                break;

            case playerId:

            default:
                style = 'rgb(0, 0, 255)';
                
                break;
        }
        
        context.fillStyle = style;
        context.fillRect(y * 60, x * 60, 50, 50);
    };

    var socket = (function initSocket() {
        var onUpdate = function onUpdate(message) {
            var changes = message.changes;
            if (Object.prototype.toString.call(changes) != '[object Array]') {
                changes = [].push(changes);
            }
            
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];
                
                changeType(change.y, change.x, change.type);
            }
        };

        var socket = io.connect('/socket.io');
        socket.on('HELLO', function onHello(data) {
            playerId = data.player_id;

            buildArena(data.size);

            onUpdate(data);
        });
        socket.on('UPDATE', onUpdate);
        
        return {
            sendMovement: function sendMovement(deltaX, deltaY) {
                var message = {
                    player_id: playerId,
                    deltaX: deltaX,
                    deltaY: deltaY
                };

                socket.emit('TRIGGER', message);
            }
        };
    })();

    var socket;
    var playerId;

    var buildArena = function buildArena(size) {
        // TODO?
    };

    var sendMovement = function sendMovement(deltaX, deltaY) {
        socket.sendMovement(deltaX, deltaY);
    }

    var holdMovement = false;
    var holdBomb = false;
    var onKeyUp = function onKeyUp(event) {
        if (holdMovement) return;
        
        switch (event.keyCode) {
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
                if (holdBomb) return;
                holdBomb = true;
                
                sendMovement(0, 0);
                
                // if you want to decrease the number of bombs placed in the game, upper this timeout
                window.setTimeout(function toggleHold() {
                    holdBomb = false;
                }, 300);
        }
        
        holdMovement = true;
        
        // if you want to decrease the game's speed, upper this timeout
        window.setTimeout(function toggleHold() {
            holdMovement = false;
        }, 300);
    };
    
    document.addEventListener("keydown", onKeyUp, false);
})();

document.onkeydown = function(e) {
    // prevent scrolling
    if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 32) {
        e.preventDefault();
        
        return false;
    }
    
    return true;
};