import 'dart:async';
import 'dart:convert';
import 'dart:html';

class Client {
  static const Duration RECONNECT_DELAY = const Duration(milliseconds: 500);

  bool connectPending = false;
  WebSocket webSocket;

  DivElement resultsElement = querySelector('#results');

  Client() {
    connect();
 
    window.onKeyDown.listen(onKeyEvent);
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
      print("Failed to connect to ${webSocket.url}. "
            "Please run bin/server.dart and try again.");
      
      onDisconnected();
    });
  }

  void onConnected() {
    webSocket.onMessage.listen((e) {
      onMessage(e.data);
    });
  }

  void onDisconnected() {
    if (connectPending) return;
    connectPending = true;
    
    new Timer(RECONNECT_DELAY, connect);
  }

  void setStatus(String status) {
    resultsElement.appendText(status);
    resultsElement.appendHtml("<br />");
  }

  void onMessage(data) {
    var json = JSON.decode(data);
    var response = json['response'];
    switch (response) {
      case 'movementResult':
        var keyCode = json['keyCode'];
        setStatus("pressed key #$keyCode");
        
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
    
    var request = {
      'request': 'movement',
      'keyCode': event.keyCode
    };
    webSocket.send(JSON.encode(request));
  }
}


void main() {
  var client = new Client();
}
