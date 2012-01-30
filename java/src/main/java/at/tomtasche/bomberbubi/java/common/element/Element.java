package at.tomtasche.bomberbubi.java.common.element;

import at.tomtasche.bomberbubi.java.common.Json;

public abstract class Element {

	public static Element[][] fromJson(String json) {
		return Json.GSON.fromJson(json, Element[][].class);
	}
	
	public static String toJson(Element[][] map) {
		return Json.GSON.toJson(map);
	}
	
	
	private int type;
	

	public Element(int type) {
		this.type = type;
	}

	
	public int getType() {
		return type;
	}

	
	@Override
	public String toString() {
		return "Element [type=" + type + "]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + type;
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Element other = (Element) obj;
		if (type != other.type)
			return false;
		return true;
	}
}
