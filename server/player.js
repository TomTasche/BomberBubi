var PLAYER = (function initPlayer() {
    var PLAYER_PROTOTYPE = {
        id: -1,

        x: -1,
        y: -1
    };
    
    var PLAYERS = [];
    
    return {
        createPlayer: function createPlayer() {
            var player = Object.create(PLAYER_PROTOTYPE);
            player.id = PLAYERS.length;
            
            if (ARENA[0][0] == 0) {
                player.x = 0;
                player.y = 0;
            } else if (ARENA[ARENA.SIZE][0] == 0) {
                player.x = 0;
                player.y = ARENA.SIZE;
            } else if (ARENA[0][ARENA.SIZE] == 0) {
                player.x = 0;
                player.y = ARENA.SIZE;
            } else if (ARENA[ARENA.SIZE][ARENA.SIZE] == 0) {
                player.x = ARENA.SIZE;
                player.y = ARENA.SIZE;
            } else {
                // TODO: random!
            }
            
            PLAYERS.pop(player);
        }
    };
})();