var PLAYER = {id: 0, x: 0, y: 0};
var SIZE = 3;
var ARENA = [];
var OBSTACLES = [];

buildMap();

ARENA[PLAYER.x][PLAYER.y] = 2;
changeType(PLAYER.x, PLAYER.y, 2);

function buildMap() {
    var body = document.body;

    var tbl = document.createElement("table");
    tbl.id = 'game_table';
    
    var tblBody = document.createElement("tbody");
    
    for (var i = 0; i < SIZE; i++) {
        ARENA[i] = [];
        OBSTACLES[i] = [];
        
        var row = document.createElement("tr");
        
        for (var j = 0; j < SIZE; j++) {
            ARENA[i][j] = 0;
    
            var cell = document.createElement("td");
            var cellText = document.createTextNode(j + ',' + i);
            cell.appendChild(cellText);
            row.appendChild(cell);
            
            tblBody.appendChild(row);
    
            tbl.appendChild(tblBody);
            body.appendChild(tbl);
            tbl.setAttribute("border", "1");
        }
    }
}


function movePlayer(deltaX, deltaY) {
    if (PLAYER.x < 0 && PLAYER.y < 0) return;
    if (isObstacled(PLAYER.x, PLAYER.y)) return;
    if (isOnFire(PLAYER.x, PLAYER.y)) {
        changeType(PLAYER.x, PLAYER.y, 0);
        
        PLAYER.x = -1;
        PLAYER.y = -1;
        
        return;
    }
    
    var tempX = PLAYER.x + deltaX;
    var tempY = PLAYER.y + deltaY;
    var oldX = PLAYER.x;
    var oldY = PLAYER.y;
    
    if (tempX >= 0 && tempX < SIZE) {
        PLAYER.x = tempX;
    }
    if (tempY >= 0 && tempY < SIZE) {
        PLAYER.y = tempY;
    }
    
    if (oldX != PLAYER.x || oldY != PLAYER.y) {
        changeType(PLAYER.x, PLAYER.y, 2);
        changeType(oldX, oldY, 0);
    }
}

function changeType(x, y, type) {
    ARENA[x][y] = type;
    
    var cell = document.getElementById('game_table').rows[y].cells[x];
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
            
        default:
            style = '';
    }
    
    cell.className = style;
}

function isObstacled(x, y) {
    return OBSTACLES[x][y];
}

function isOnFire(x, y) {
    return ARENA[x, y] == 4;
}


document.onkeyup = function onKeyUp(event) {
    switch(event.keyCode) {
        case 37:
            // left
            movePlayer(-1, 0);
            
            break;
            
        case 38:
            // up
            movePlayer(0, -1);
            
            break;
            
        case 39:
            // right
            movePlayer(1, 0);
            
            break;
            
        case 40:
            // down
            movePlayer(0, 1);
            
            break;
            
        case 32:
            // space
            dropBomb();
            
            break;
    }
};