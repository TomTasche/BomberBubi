(function initGame() {
    var Cell = function initCell() {
        return {
            type: -1,
            cell: null,

            changeType: function changeType(newType) {
                this.type = newType;

                var style = 'map_';

                switch (newType) {
                    case 0:
                        style += 'path';
    
                        break;
    
                    case 1:
                        style += 'wall';
    
                        break;
    
                    case 3:
                        style += 'bomb';
    
                        break;
    
                    case 4:
                        style += 'fire';
    
                        break;
    
                    case playerId:
    
                    default:
                        style += 'player';
                }

                if (newType == playerId) {
                    this.cell.style.backgroundColor = '#00FF00';
                } else {
                    this.cell.style.backgroundColor = '';
                }
                
                this.cell.className = style;
            }
        };
    };

    var socket = (function initSocket() {
        var onUpdate = function onUpdate(message) {
            if (!arena) return;
            
            var changes = message.changes;
            if (Object.prototype.toString.call(changes) != '[object Array]') {
                changes = [].push(changes);
            }
            
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];

                arena[change.y][change.x].changeType(change.type);
            }
        };

        var socket = io.connect('/socket.io');
        socket.on('KILL', function onKill(data) {
            // window.location.reload();
        });
        socket.on('ACK', function onHello(data) {
            playerId = data.player_id;

            buildArena(data.size);

            onUpdate(data);
        });
        socket.on('UPDATE', onUpdate);
        socket.on('HELLO', function onHello(data) {
            socket.emit('SYN', '');
        });
        
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

    var arena;
    var socket;
    var playerId;

    var buildArena = function buildArena(size) {
        arena = [];

        var root = document.getElementById('game');

        var tbl = document.createElement("table");
        tbl.id = 'game_table';

        var tblBody = document.createElement("tbody");

        for (var i = 0; i < size; i++) {
            arena[i] = [];

            var row = document.createElement("tr");

            for (var j = 0; j < size; j++) {
                var tableCell = document.createElement("td");
                row.appendChild(tableCell);

                tblBody.appendChild(row);

                tbl.appendChild(tblBody);
                tbl.setAttribute("border", "1");

                var cell = new Cell;
                cell.cell = tableCell;
                cell.changeType(0);

                arena[i][j] = cell;
            }
        }

        root.innerHTML = '';
        root.appendChild(tbl);
    };

    var sendMovement = function sendMovement(deltaX, deltaY) {
        socket.sendMovement(deltaX, deltaY);
    }

    var joystick = new VirtualJoystick({mouseSupport: true, container: document.getElementById('mouse_control')});
    var checkInput = function checkInput() {
        if (joystick.left()) {
            sendMovement(-1, 0);
        } else if (joystick.up()) {
            sendMovement(0, -1);
        } else if (joystick.right()) {
            sendMovement(1, 0);
        } else if (joystick.down()) {
            sendMovement(0, 1);
        }
    };
    // decrease this timeout if you want to move faster using the joystick
    window.setInterval(checkInput, 500);
    
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