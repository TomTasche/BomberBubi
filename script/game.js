var map;
var player;
var bombTTL;
var size = 3;
var bombQueue = [];

buildMap();
createPlayer();


function buildMap() {
    map = [];
    
    var body = document.body;

    var tbl = document.createElement("table");
    tbl.id = 'game_table';
    
    var tblBody = document.createElement("tbody");
    
    for (var i = 0; i < size; i++) {
        map[i] = [];
        
        var row = document.createElement("tr");
        
        for (var j = 0; j < size; j++) {
            map[i][j] = 0;
    
            for (var j = 0; j < size; j++) {
                var cell = document.createElement("td");
                var cellText = document.createTextNode(j + ',' + i);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            
            tblBody.appendChild(row);
    
            tbl.appendChild(tblBody);
            body.appendChild(tbl);
            tbl.setAttribute("border", "1");
        }
    }
}

function createPlayer() {
    player = {x: 0, y: 0};
    
    map[player.x][player.y] = 2;
    
    changeType(player.x, player.y, 2);
}

function movePlayer(deltaX, deltaY) {
    var tempX = player.x + deltaX;
    var tempY = player.y + deltaY;
    var oldX = player.x;
    var oldY = player.y;
    
    if (tempX >= 0 && tempX < size) {
        player.x = tempX;
    }
    if (tempY >= 0 && tempY < size) {
        player.y = tempY;
    }
    
    if (oldX != player.x || oldY != player.y) {
        changeType(player.x, player.y, 2);
        changeType(oldX, oldY, 0);
    }
    
    for (var i = 0; i < bombQueue.length; i++) {
        var bomb = bombQueue[i];
        
        if (map[bomb.x][bomb.y] == 0) {
            changeType(bomb.x, bomb.y, 3);
            
            bombQueue.splice(i, i + 1);
        }
    }
    
    if (bombTTL == 0) {
        fireBomb();
    } else {
        bombTTL--;
    }
}

function checkPlayer() {
    // TODO: check whether player is still at the position he should be at
    // TODO: if not, forget player and assume he's dead
    // TODO: otherwise, move.
}

function fireBomb() {
    // TODO: lit 2x2 range with fire
    // TODO: automagically deletes all players / items etc too
    // TODO: watch out for walls
}

function dropBomb() {
    console.log(bombQueue.length);
    
    if (bombQueue.length == 1) return;
    
    bombQueue[bombQueue.length] = {x: player.x, y: player.y};
    
    bombTTL = 3;
}

function changeType(x, y, type) {
    // TODO: send event to server
    
    map[x][y] = type;
    
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