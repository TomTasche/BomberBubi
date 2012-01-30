package at.tomtasche.bomberbubi.java.common;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class BubiMessage {

	public static BubiMessage fromJson(String s) {
		return Json.GSON.fromJson(s, BubiMessage.class);
	}
	
	public static String toJson(BubiMessage message) {
		return Json.GSON.toJson(message);
	}
	
	
	String name;
	Map<String, String> values;

	
	@SuppressWarnings("unused")
	private BubiMessage() {}
	
	public BubiMessage(String name) {
		this.name = name;
		this.values = new HashMap<String, String>();
	}
	
	public BubiMessage(String name, Map<String, String> values) {
		this.name = name;
		this.values = values;
	}
	
	
	public String getName() {
		return name;
	}
	
	public Map<String, String> getValues() {
		return Collections.unmodifiableMap(values);
	}
	
	public String getValue(String key) {
		return values.get(key);
	}
}
