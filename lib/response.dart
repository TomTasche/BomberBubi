import 'dart:convert';

import 'protocol.dart';
import 'thing.dart';

class Response {
  
  String type;
  
  int thingId;
  
  int deltaX;
  int deltaY;
  
  Thing thing;
  
  Response.fromJson(String jsonString) {
    var json = JSON.decode(jsonString);
    this.type = json[Protocol.KEY_RESPONSE];
    switch (this.type) {
      case Protocol.KEY_LOGIN:
        this.thingId = json[Protocol.KEY_THING_ID];

        break;
      case Protocol.KEY_ADD_THING:
        this.thing = new Thing.fromJson(json[Protocol.KEY_THING]);
        
        break;
      case Protocol.KEY_MOVE_THING:
        this.deltaX = json[Protocol.KEY_DELTA_X];
        this.deltaY = json[Protocol.KEY_DELTA_Y];
        this.thingId = json[Protocol.KEY_THING_ID];

        break;
      case Protocol.KEY_REMOVE_THING:
        this.thing = new Thing.fromJson(json[Protocol.KEY_THING]);
        
        break;
      default:
        print("Invalid response: '$type'");
    }
  }
  
  Response.login(int thingId) {
    this.type = Protocol.KEY_LOGIN;
    this.thingId = thingId;
  }
  
  Response.addThing(Thing thing) {
    this.type = Protocol.KEY_ADD_THING;
    this.thing = thing;
  }
  
  Response.moveThing(int thingId, int deltaX, int deltaY) {
    this.type = Protocol.KEY_MOVE_THING;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.thingId = thingId;
  }
  
  Response.removeThing(Thing thing) {
    this.type = Protocol.KEY_REMOVE_THING;
    this.thing = thing;
  }
  
  String toJson() {
    Map json = new Map();
    json[Protocol.KEY_RESPONSE] = this.type;
    json[Protocol.KEY_DELTA_X] = this.deltaX;
    json[Protocol.KEY_DELTA_Y] = this.deltaY;
    json[Protocol.KEY_THING_ID] = this.thingId;
    if (this.thing != null) {
      json[Protocol.KEY_THING] = this.thing.toJson();
    }
    
    return JSON.encode(json);
  }
}