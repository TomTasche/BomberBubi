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
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];

                arena[change.y][change.x].changeType(change.type);
            }
        };

        var socket = io.connect(window.location.href + 'sockets');
        socket.on('KILL', function onKill(data) {
            // window.location.reload();
        });
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

    var joystick = new VirtualJoystick({mouseSupport: true, container: document.getElementById('game')});
    var isKeyActive = function isKeyActive(keys, name) {
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === name) return true;
        }

        return false;
    }
    var hold = false;
    var checkInput = function checkInput() {
        var keys = KeyboardJS.activeKeys();

        if (joystick.left() || isKeyActive(keys, 'left')) {
            sendMovement(-1, 0);
        } else if (joystick.up() || isKeyActive(keys, 'up')) {
            sendMovement(0, -1);
        } else if (joystick.right() || isKeyActive(keys, 'right')) {
            sendMovement(1, 0);
        } else if (joystick.down() || isKeyActive(keys, 'down')) {
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