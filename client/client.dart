import 'dart:async';
import 'dart:convert';
import 'dart:html';

import 'arena.dart';
import 'bubi.dart';

class Client {
  static const Duration RECONNECT_DELAY = const Duration(milliseconds: 500);

  bool connectPending = false;
  WebSocket webSocket;

  DivElement resultsElement = querySelector('#results');
  
  var playerId;
  
  Arena arena;

  Client() {
    connect();
 
    window.onKeyDown.listen(onKeyEvent);
    
    arena = new Arena();
    arena.redraw();
  }
  
  void connect() {
    connectPending = false;
    
    webSocket = new WebSocket('ws://${Uri.base.host}:9223/ws');
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
    
    new Timer(RECONNECT_DELAY, connect);
  }

  void onMessage(data) {
    var json = JSON.decode(data);
    var response = json['response'];
    switch (response) {
      case 'login':
        playerId = json['playerId'];

        break;
        
      case 'newPlayer':
        var x = json['x'];
        var y = json['y'];
        var playerId = json['playerId'];
        
        arena.addBubi(new Bubi(playerId, x, y));
        arena.redraw();
        
        break;
      
      case 'movement':
        var deltaX = json['deltaX'];
        var deltaY = json['deltaY'];
        var playerId = json['playerId'];
        
        var bubis = arena.bubis;
        for (Bubi bubi in bubis) {
          if (this.playerId != playerId) return;
          
          bubi.x += deltaX;
          bubi.y += deltaY;
          
          break;
        }
        
        arena.redraw();
        
        break;

      default:
        print("Invalid response: '$response'");
    }
  }
  
  void onKeyEvent(KeyboardEvent event) {
    switch(event.keyCode){
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
    
    if (playerId == null) return;
    
    var request = {
      'request': 'movement',
      'keyCode': event.keyCode,
      'playerId': playerId
    };
    webSocket.send(JSON.encode(request));
  }
}


void main() {
  var client = new Client();
}
