import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http_server/http_server.dart' as Http;
import 'package:route/server.dart' show Router;
import 'package:logging/logging.dart' show Logger, Level, LogRecord;

import '../lib/bubi.dart';
import '../lib/arena.dart';

final Logger LOGGER = new Logger('BomberBubi');

var id = 1;

List<WebSocket> sockets = new List<WebSocket>();

Arena arena = new Arena();

void filterSockets() {
  for (WebSocket socket in sockets) {
    if (socket.readyState != WebSocket.OPEN) {
      sockets.remove(socket);
    }
  }
}

void broadcast(var request) {
  filterSockets();
  
  for (WebSocket socket in sockets) {
    socket.add(JSON.encode(request));
  }
}

void broadcastPlayers() {
  for (Bubi bubi in arena.bubis) {
    var request = {
      'response': 'newPlayer',
      'playerId': bubi.id,
      'x': bubi.x,
      'y': bubi.y
    };
    
    broadcast(request);
  }
}

void handleWebSocket(WebSocket socket) {
  LOGGER.info('new web-socket connection opened');
  
  sockets.add(socket);

  socket
    .map((string) => JSON.decode(string))
    .listen((json) {
      var request = json['request'];
      switch (request) {
        case 'login':
          Bubi bubi = new Bubi(id, 0, 0);
          arena.addBubi(bubi);
          
          id++;
          
          var request = {
            'response': 'login',
            'playerId': bubi.id
          };
          
          socket.add(JSON.encode(request));

          broadcastPlayers();
          
          break;
          
        case 'movement':
          var playerId = json['playerId'];

          var deltaX = 0;
          var deltaY = 0;
          
          var keyCode = json['keyCode'];
          switch(keyCode){
            case 37:
              // left
              deltaX = -1;
              
              break;
            case 38:
              // up
              deltaY = -1;
              
              break;
            case 39:
              // right
              deltaX = 1;
              
              break;
            case 40:
              // down
              deltaY = 1;
              
              break;
            case 32:
              // space
              // TODO: bomb
              
              break;
            default:
              return;
          }
          
          var response = {
            'response': 'movement',
            'deltaX': deltaX,
            'deltaY': deltaY,
            'playerId': playerId
          };
          
          Bubi bubi = arena.getBubiForId(playerId);
          bubi.x += deltaX;
          bubi.y += deltaY;
          
          broadcast(response);
          
          break;

        default:
          LOGGER.warning("Invalid request '$request'.");
      }
    }, onError: (error) {
      LOGGER.warning('Bad WebSocket request');
      
      sockets.remove(socket);
    });
}

void main() {
  Logger.root.level = Level.ALL;
  Logger.root.onRecord.listen((LogRecord rec) {
    print('${rec.level.name}: ${rec.time}: ${rec.message}');
  });

  var buildPath = Platform.script.resolve('../build').toFilePath();
  if (!new Directory(buildPath).existsSync()) {
    LOGGER.severe("The 'build/' directory was not found. Please run 'pub build'.");
    return;
  }

  int port = 9223;
  HttpServer.bind(InternetAddress.LOOPBACK_IP_V4, port).then((server) {
    LOGGER.info("server is running on "
             "'http://${server.address.address}:$port/'");

    var router = new Router(server);
    router.serve('/ws')
      .transform(new WebSocketTransformer())
      .listen(handleWebSocket);

    var buildDirectory = new Http.VirtualDirectory(buildPath);
    buildDirectory.jailRoot = false;
    buildDirectory.allowDirectoryListing = true;
    buildDirectory.directoryHandler = (dir, request) {
      var indexUri = new Uri.file(dir.path).resolve('index.html');
      buildDirectory.serveFile(new File(indexUri.toFilePath()), request);
    };

    buildDirectory.errorPageHandler = (HttpRequest request) {
      LOGGER.warning("Resource not found ${request.uri.path}");
      
      request.response.statusCode = HttpStatus.NOT_FOUND;
      request.response.close();
    };

    // Serve everything not routed elsewhere through the virtual directory.
    buildDirectory.serve(router.defaultStream);

    // Special handling of client.dart. Running 'pub build' generates
    // JavaScript files but does not copy the Dart files, which are
    // needed for the Dartium browser.
    router.serve("/client.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/client.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });
    router.serve("/arena.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/arena.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });
    router.serve("/bubi.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/bubi.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });
    
    // don't use index.html from build/, but use the one in workspace
    router.serve("/index.html").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/index.html");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });
  });
}
