import 'thing.dart';

class Arena {
  
  var size;
  
  List<Thing> things = new List<Thing>();
  
  Arena() {
    size = 10;
  }
  
  void addThing(Thing newThing) {
    things.add(newThing);
  }
  
  Thing getThingForId(int id) {
    for (Thing thing in things) {
      if (thing.id == id) {
        return thing;
      }
    }
    
    return null;
  }
}  
