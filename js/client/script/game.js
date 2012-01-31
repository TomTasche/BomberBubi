var GAME = (function initGame() {
    var CELL = function initCell() {
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
    
                    case PLAYER_ID:
    
                    default:
                        style += 'player';
                }

                if (newType == PLAYER_ID) {
                    this.cell.style.backgroundColor = '#00FF00';
                } else {
                    this.cell.style.backgroundColor = '';
                }
                
                this.cell.className = style;
            }
        };
    };

    var SOCKET = (function initSocket() {
        var onUpdate = function onUpdate(message) {
            if (!ARENA) return;

            var changes = message.changes;
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];

                ARENA[change.y][change.x].changeType(change.type);
            }
        };

        var SOCKET = io.connect(window.location.href + 'sockets');
        SOCKET.on('KILL', function onKill(data) {
            // window.location.reload();
            console.log(data);
        });
        SOCKET.on('HELLO', function onHello(data) {
            PLAYER_ID = data.player_id;

            buildArena(data.size);

            onUpdate(data);
        });
        SOCKET.on('UPDATE', onUpdate);

        return {
            sendMovement: function sendMovement(deltaX, deltaY) {
                var message = {
                    player_id: PLAYER_ID,
                    deltaX: deltaX,
                    deltaY: deltaY
                };

                SOCKET.emit('TRIGGER', message);
            }
        };
    })();

    var ARENA;
    var SOCKET;
    var PLAYER_ID;

    var buildArena = function buildArena(size) {
        ARENA = [];

        var root = document.getElementById('game');

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
                tbl.setAttribute("border", "1");

                var cell = new CELL;
                cell.cell = tableCell;
                cell.changeType(0);

                ARENA[i][j] = cell;
            }
        }

        root.innerHTML = '';
        root.appendChild(tbl);
    };

    var sendMovement = function sendMovement(deltaX, deltaY) {
        SOCKET.sendMovement(deltaX, deltaY);
    }

    var JOYSTICK = new VirtualJoystick({mouseSupport: true, container: document.getElementById('game')});
    var isKeyActive = function isKeyActive(keys, name) {
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === name) return true;
        }

        return false;
    }
    var hold = false;
    var checkInput = function checkInput() {
        var keys = KeyboardJS.activeKeys();

        if (JOYSTICK.left() || isKeyActive(keys, 'left')) {
            sendMovement(-1, 0);
        } else if (JOYSTICK.up() || isKeyActive(keys, 'up')) {
            sendMovement(0, -1);
        } else if (JOYSTICK.right() || isKeyActive(keys, 'right')) {
            sendMovement(1, 0);
        } else if (JOYSTICK.down() || isKeyActive(keys, 'down')) {
            sendMovement(0, 1);
        } else if (isKeyActive(keys, 'space') || isKeyActive(keys, 'spacebar')) {
            if (hold) return;
            hold = true;

            sendMovement(0, 0);
            
            // if you want to decrease the number of bombs placed in the game, upper the timeout
            window.setTimeout(function onToggleHold() {
                hold = false;
            }, 0);
        }
    };
    window.setInterval(checkInput, 500);

    document.addEventListener('keydown', checkInput);
})();

document.onkeydown = function(e) {
    //Prevent scrolling
    if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 32) {
        e.preventDefault();
        
        return false;
    }
    
    return true;
};
