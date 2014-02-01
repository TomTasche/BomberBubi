import 'dart:html';

import 'bubi.dart';

class Arena {
  
  CanvasElement canvas;
  var context;
  var size;
  
  List<Bubi> bubis = new List<Bubi>();
  
  Arena() {
    canvas = querySelector('#canvas');

    context = canvas.context2D;
    
    size = 10;
  }
  
  void redraw() {
    var length = calculateDistance(size) + 4, i = 0, distance = 0;

    context.clearRect(0, 0, length, length);
    
    canvas.width = length;
    canvas.height = length;

    context.lineWidth = 3;
    context.strokeStyle = "black";
    context.beginPath();

    for (var i = 0; i <= size; i++) {
      distance = calculateGridDistance(i);

      context.moveTo(distance, 0);
      context.lineTo(distance, length);

      context.moveTo(0, distance);
      context.lineTo(length, distance);
    }
    
    for (Bubi bubi in bubis) {
      var style = 'rgb(0, 255, 0)';

      var yDistance = calculatePlayerDistance(bubi.y);
      var xDistance = calculatePlayerDistance(bubi.x);
  
      context.fillStyle = style;
      context.fillRect(xDistance, yDistance, 50, 50);
    }

    context.stroke();
  }
  
  void addBubi(Bubi newBub) {
    bubis.add(newBub);
  }
  
  calculateDistance(position) {
    var distance = (position * 50) + (position * (10 + 1))
        + (position * (3 + 1));

    return distance;
  }

  calculatePlayerDistance(position) {
    return 10 + calculateDistance(position);
  }

  calculateGridDistance(position) {
    return 2 + calculateDistance(position);
  }
}
