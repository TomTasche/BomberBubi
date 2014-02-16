import 'dart:convert';
import 'protocol.dart';
import 'thing.dart';

class Request {
  
  String type;
  
  int thingId;
  
  int deltaX;
  int deltaY;
  
  int keyCode;
  
  Thing thing;
  
  Request.fromJson(String jsonString) {
    var json = JSON.decode(jsonString);
    this.type = json[Protocol.KEY_REQUEST];
    switch (this.type) {
      case Protocol.KEY_LOGIN:
        break;
      case Protocol.KEY_MOVE_THING:
        this.thingId = json[Protocol.KEY_THING_ID];

        this.keyCode = json[Protocol.KEY_KEYCODE];
        
        break;

      default:
        print("Invalid request: '$type'");
    }
  }
  
  Request.login() {
    this.type = Protocol.KEY_LOGIN;
  }
  
  Request.movement(int thingId, int keyCode) {
    this.type = Protocol.KEY_MOVE_THING;
    this.thingId = thingId;
    this.keyCode = keyCode;
  }
  
  String toJson() {
    Map json = new Map();
    json[Protocol.KEY_REQUEST] = this.type;
    json[Protocol.KEY_DELTA_X] = this.deltaX;
    json[Protocol.KEY_DELTA_Y] = this.deltaY;
    json[Protocol.KEY_THING_ID] = this.thingId;
    json[Protocol.KEY_KEYCODE] = this.keyCode;
    if (this.thing != null) {
      json[Protocol.KEY_THING] = this.thing.toJson();
    }
    
    return JSON.encode(json);
  }
}