import 'dart:convert';

class Thing {

  static const int TYPE_BUBI = 1;
  static const int TYPE_BOMB = 2;

  int id;

  int x;
  int y;

  int type;

  Thing.fromJson(String jsonString) {
    Map json = JSON.decode(jsonString);

    this.id = json['id'];

    this.x = json['x'];
    this.y = json['y'];

    this.type = json['type'];
  }

  Thing(int id, int x, int y, int type) {
    this.id = id;

    this.x = x;
    this.y = y;

    this.type = type;
  }

  Thing.bubi(int id, int x, int y) {
    this.id = id;

    this.x = x;
    this.y = y;

    this.type = TYPE_BUBI;
  }

  Thing.bomb(int id, int x, int y) {
    this.id = id;

    this.x = x;
    this.y = y;

    this.type = TYPE_BOMB;
  }

  bool isBomb() => this.type == TYPE_BOMB;

  bool isBubi() => this.type == TYPE_BUBI;

  String toJson() {
    Map json = new Map();
    json["id"] = this.id;
    json["x"] = this.x;
    json["y"] = this.y;
    json["type"] = this.type;

    return JSON.encode(json);
  }

  bool operator ==(Thing other) {
    return (other.id == id);
  }
}