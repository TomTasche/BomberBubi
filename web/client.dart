import 'dart:async';
import 'dart:convert';
import 'dart:html';

import 'arena_canvas.dart';
import '../lib/bubi.dart';

class Client {
  static const Duration BATTLEFIELD_TICK_RATE = const Duration(milliseconds: 250);
  
  bool connectPending = false;
  WebSocket webSocket;

  DivElement resultsElement = querySelector('#results');
  
  int lastKeyCode = 0;
  
  int playerId;
  
  ArenaCanvas arena;

  Client() {
    connect();
 
    window.onKeyDown.listen(onKeyEvent);
    
    arena = new ArenaCanvas();
    arena.redraw();
  }
  
  void connect() {
    connectPending = false;
    
    webSocket = new WebSocket('ws://${Uri.base.host}:${Uri.base.port}/ws');
    webSocket.onOpen.first.then((_) {
      onConnected();
      
      webSocket.onClose.first.then((_) {
        print("Connection disconnected to ${webSocket.url}");
        
        onDisconnected();
      });
    });
    
    webSocket.onError.first.then((_) {
      print("Failed to connect to ${webSocket.url}. Please run bin/server.dart and try again.");
      
      onDisconnected();
    });
  }

  void onConnected() {
    arena.redraw();
    
    webSocket.onMessage.listen((e) {
      onMessage(e.data);
    });
    
    var request = {
      'request': 'login'
    };
    webSocket.send(JSON.encode(request));
  }

  void onDisconnected() {
    if (connectPending) return;
    connectPending = true;

    // TODO: reload page
  }

  void onMessage(data) {
    var json = JSON.decode(data);
    var response = json['response'];
    switch (response) {
      case 'login':
        playerId = json['playerId'];
        
        new Timer.periodic(BATTLEFIELD_TICK_RATE, sendLastKeyCode);

        break;
        
      case 'newPlayer':
        var x = json['x'];
        var y = json['y'];
        var playerId = json['playerId'];
        
        if (arena.getBubiForId(playerId) == null) {
          arena.addBubi(new Bubi(playerId, x, y));
          arena.redraw();
        }
        
        break;
      
      case 'movement':
        var deltaX = json['deltaX'];
        var deltaY = json['deltaY'];
        var playerId = json['playerId'];

        var bubi = arena.getBubiForId(playerId);
        bubi.x += deltaX;
        bubi.y += deltaY;
          
        arena.redraw();
        
        break;

      default:
        print("Invalid response: '$response'");
    }
  }
  
  void sendLastKeyCode(Timer timer) {
    if (lastKeyCode <= 0) return;
    if (playerId == null) return;
    
    switch(lastKeyCode){
      case 37:
        // left
        break;
      case 38:
        // up
        break;
      case 39:
        // right
        break;
      case 40:
        // down
        break;
      case 32:
        // space
        break;
      default:
        return;
    }
    
    var request = {
      'request': 'movement',
      'keyCode': lastKeyCode,
      'playerId': playerId
    };
    webSocket.send(JSON.encode(request));
    
    lastKeyCode = 0;
  }
  
  void onKeyEvent(KeyboardEvent event) {
    lastKeyCode = event.keyCode;
  }
}


void main() {
  var client = new Client();
}
