import 'dart:async';
import 'dart:io';

import 'package:http_server/http_server.dart' as Http;
import 'package:route/server.dart' show Router;
import 'package:logging/logging.dart' show Logger, Level, LogRecord;

import '../lib/thing.dart';
import '../lib/arena.dart';
import '../lib/protocol.dart';
import '../lib/request.dart';
import '../lib/response.dart';

const Duration BOMB_TIMEOUT = const Duration(milliseconds: 1000);

final Logger LOGGER = new Logger('BomberBubi');

var id = 1;

List<WebSocket> sockets = new List<WebSocket>();

Arena arena = new Arena();

void filterSockets() {
  List<WebSocket> closedSockets = new List<WebSocket>();
  for (WebSocket socket in sockets) {
    if (socket.readyState != WebSocket.OPEN) {
      closedSockets.add(socket);
    }
  }

  for (WebSocket closedSocket in closedSockets) {
    sockets.remove(closedSocket);
  }
}

void broadcast(String requestJson) {
  filterSockets();

  for (WebSocket socket in sockets) {
    socket.add(requestJson);
  }
}

Thing registerThing(Thing newThing) {
  arena.addThing(newThing);

  id++;

  Response response = new Response.addThing(newThing);
  broadcast(response.toJson());

  return newThing;
}

void explodeBomb(Thing bomb) {
  arena.removeThing(bomb);

  Response response = new Response.removeThing(bomb);
  broadcast(response.toJson());
}

void handleWebSocket(WebSocket socket) {
  LOGGER.info('new web-socket connection opened');

  sockets.add(socket);

  socket
    .listen((jsonString) {
      Request request = new Request.fromJson(jsonString);
      switch (request.type) {
        case Protocol.KEY_LOGIN:
          Thing newBubi = new Thing.bubi(id, 0, 0);
          registerThing(newBubi);

          Response response = new Response.login(newBubi.id);
          socket.add(response.toJson());

          for (Thing thing in arena.things) {
            Response response = new Response.addThing(thing);
            socket.add(response.toJson());
          }

          break;
        case Protocol.KEY_MOVE_THING:
          int deltaX = 0;
          int deltaY = 0;

          switch(request.keyCode){
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
              Thing thing = arena.getThingForId(request.thingId);

              Thing newBomb = new Thing.bomb(id, thing.x, thing.y);
              registerThing(newBomb);

              new Timer(BOMB_TIMEOUT, () {
                explodeBomb(newBomb);
              });

              return;
            default:
              return;
          }

          Thing thing = arena.getThingForId(request.thingId);
          thing.x += deltaX;
          thing.y += deltaY;

          Response response = new Response.moveThing(request.thingId, deltaX, deltaY);
          broadcast(response.toJson());

          break;
      }
    }, onError: (error) {
      LOGGER.warning('bad WebSocket request');

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

  var portEnv = Platform.environment['PORT'];
  var port = portEnv == null ? 9223 : int.parse(portEnv);

  HttpServer.bind(InternetAddress.ANY_IP_V4, port).then((server) {
    LOGGER.info("server is running on "
             "'http://${server.address.address}:$port/'");

    var router = new Router(server);
    router.serve('/ws')
      .transform(new WebSocketTransformer())
      .listen(handleWebSocket);

    var buildDirectory = new Http.VirtualDirectory(buildPath);
    buildDirectory.jailRoot = false;
    buildDirectory.allowDirectoryListing = true;
    /*buildDirectory.directoryHandler = (dir, request) {
      var indexUri = new Uri.file(dir.path).resolve('index.html');
      buildDirectory.serveFile(new File(indexUri.toFilePath()), request);
    };*/

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

    router.serve("/arena_canvas.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/arena_canvas.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    router.serve("/lib/thing.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../lib/thing.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    router.serve("/lib/arena.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../lib/arena.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    router.serve("/lib/request.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../lib/request.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    router.serve("/lib/response.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../lib/response.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    router.serve("/lib/protocol.dart").listen((request) {
      Uri clientScript = Platform.script.resolve("../lib/protocol.dart");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });

    // don't use index.html from build/, but use the one in workspace
    router.serve("/index.html").listen((request) {
      Uri clientScript = Platform.script.resolve("../web/index.html");
      buildDirectory.serveFile(new File(clientScript.toFilePath()), request);
    });
  });
}
