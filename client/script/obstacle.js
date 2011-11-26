var OBSTACLES = (function initObstacles() {
    var obstacles = [];
    
    
    return {
        isObstacle: function isObstacle(x, y) {
            return obstacles[x][y];
        },
        
        generateObstacles: function generateObstacles(mapSize) {
            
        }
    };
})();