var BOMBS = (function initBombs() {
    var BOMB = (function initBomb() {
        var clearFire = function clearFire() {
            ARENA.alterMap(x, y, ARENA.PATH);
            
            fires[x][y] = 1;
            if (x + 1 < size) delete fires[x + 1][y];
            if (x + 2 < size) delete fires[x + 2][y];
            if (x - 1 > 0) delete fires[x - 1][y];
            if (x - 2 > 0) delete fires[x - 2][y];
            if (y + 1 < size) delete fires[x][y + 1];
            if (y + 2 < size) delete fires[x][y + 2];
            if (y - 1 > 0) delete fires[x][y - 1];
            if (y - 2 > 0) delete fires[x][y - 2];
        };
        
        
        return {
            x: -1,
            
            y: -1,
            
            litBomb: function litBomb() {
                delete bombs[x][y];
                
                var fire = Object.create(FIRE);
                fire.x = x;
                fire.y = y;
                
                fires[x][y] = 1;
                if (x + 1 < size) fires[x + 1][y] = 1;
                if (x + 2 < size) fires[x + 2][y] = 1;
                if (x - 1 > 0) fires[x - 1][y] = 1;
                if (x - 2 > 0) fires[x - 2][y] = 1;
                if (y + 1 < size) fires[x][y + 1] = 1;
                if (y + 2 < size) fires[x][y + 2] = 1;
                if (y - 1 > 0) fires[x][y - 1] = 1;
                if (y - 2 > 0) fires[x][y - 2] = 1;
                
                // clearFire.bind(this);
                window.setTimeout(clearFire, 1000);
            }
        };
    })();
    var FIRE = {
        x: -1,
        
        y: -1
    };
    
    var fires = [];
    var bombs = [];
    for (var i = 0; i < ARENA.SIZE; i++) {
        bombs[i] = [];
        fires[i] = [];
    }


    return {
        isBomb: function isBomb(x, y) {
            return bombs[x][y];
        },
        
        addBomb: function addBomb(x, y) {
            if (bombs.length == 1) return;
            
            var bomb = Object.create(BOMB);
            bomb.x = x;
            bomb.y = y;
            
            bombs[x][y] = bomb;
            
            window.setTimeout(bomb.litBomb, 0);
        },
        
        isOnFire: function isOnFire(x, y) {
            return fires[x][y];
        }
    };
})();