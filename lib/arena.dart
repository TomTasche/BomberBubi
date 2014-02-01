import 'bubi.dart';

class Arena {
  
  var size;
  
  List<Bubi> bubis = new List<Bubi>();
  
  Arena() {
    size = 10;
  }
  
  void addBubi(Bubi newBub) {
    bubis.add(newBub);
  }
  
  Bubi getBubiForId(int id) {
    for (Bubi bubi in bubis) {
      if (bubi.id == id) {
        return bubi;
      }
    }
    
    return null;
  }
}  
