import 'dart:async';
import 'dart:convert';
import 'dart:html';

import 'arena_canvas.dart';
import '../lib/thing.dart';
import '../lib/response.dart';
import '../lib/protocol.dart';
import '../lib/request.dart';

class Client {
  static const Duration BATTLEFIELD_TICK_RATE = const Duration(milliseconds: 250);
  
  bool connectPending = false;
  WebSocket webSocket;

  DivElement resultsElement = querySelector('#results');
  
  int lastKeyCode = 0;
  
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
    
    Request request = new Request.login();
    webSocket.send(request.toJson());
  }

  void onDisconnected() {
    if (connectPending) return;
    connectPending = true;

    window.location.reload();
  }

  void onMessage(data) {
    Response response = new Response.fromJson(data);
    switch (response.type) {
      case Protocol.KEY_LOGIN:
        arena.bubiId = response.thingId;
        
        new Timer.periodic(BATTLEFIELD_TICK_RATE, sendLastKeyCode);
    
        break;
      case Protocol.KEY_NEW_PLAYER:
        if (arena.getThingForId(response.thing.id) == null) {
          arena.addThing(response.thing);
          arena.redraw();
        }
        
        break;
      case Protocol.KEY_MOVEMENT:
        Thing thing = arena.getThingForId(response.thingId);
        thing.x += response.deltaX;
        thing.y += response.deltaY;
          
        arena.redraw();
        
        break;
    }
  }
  
  void sendLastKeyCode(Timer timer) {
    if (lastKeyCode <= 0) return;
    if (arena.bubiId == null) return;

    Request request = new Request.movement(arena.bubiId, lastKeyCode);
    webSocket.send(request.toJson());
    
    lastKeyCode = 0;
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
    
    lastKeyCode = event.keyCode;
  }
}


void main() {
  var client = new Client();
}
