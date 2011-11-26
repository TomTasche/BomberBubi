var PLAYER = (function initPlayer() {
    // TODO: check for fire on current position before moving
    
    function isAlive() {
        return BOMBS.isOnFire[player.x][player.y];
    }
})();