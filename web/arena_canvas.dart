import 'dart:html';

import '../lib/arena.dart';
import '../lib/thing.dart';

class ArenaCanvas extends Arena {

  CanvasElement canvas;
  var context;
  int bubiId;

  ArenaCanvas() : super() {
    canvas = querySelector('#canvas');

    context = canvas.context2D;
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

    for (Thing thing in things) {
      var style;
      if (thing.id == bubiId) {
        style = 'rgb(0, 255, 0)';
      } else {
        switch (thing.type) {
          case Thing.TYPE_BUBI:
            style = 'rgb(255, 0, 0)';

            break;
          case Thing.TYPE_BOMB:
            style = 'rgb(0, 0, 0)';

            break;
        }
      }

      var yDistance = calculatePlayerDistance(thing.y);
      var xDistance = calculatePlayerDistance(thing.x);

      context.fillStyle = style;
      context.fillRect(xDistance, yDistance, 50, 50);
    }

    context.stroke();
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
