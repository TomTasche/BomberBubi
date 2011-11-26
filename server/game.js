var ARENA = [];
var OBSTACLES = [];
var player;

function startGame(size) {
   buildMap(size);

   player = PLAYER.createPlayer();

   ARENA[player.getX()][player.getY()] = 2;
   ARENA.alterAt(player.getX(), player.getY(), 2);
}

function buildMap(size) {
   ARENA.SIZE = size;

    var body = document.body;

    var tbl = document.createElement("table");
    tbl.id = 'game_table';
    
    var tblBody = document.createElement("tbody");
    
    for (var i = 0; i < ARENA.SIZE; i++) {
        ARENA[i] = [];
        OBSTACLES[i] = [];
        
        var row = document.createElement("tr");
        
        for (var j = 0; j < ARENA.SIZE; j++) {
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

ARENA.alterAt = function alterAt(x, y, type) {
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

        case 4:
            style += 'fire';

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
            player.move(-1, 0);
            
            break;
            
        case 38:
            // up
            player.move(0, -1);
            
            break;
            
        case 39:
            // right
            player.move(1, 0);
            
            break;
            
        case 40:
            // down
            player.move(0, 1);
            
            break;
            
        case 32:
            // space
            player.bomb();
            
            break;
    }
};
