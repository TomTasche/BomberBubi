package at.tomtasche.bomberbubi.java.common;

import at.tomtasche.bomberbubi.java.common.element.Element;
import at.tomtasche.bomberbubi.java.common.element.ElementJsonAdapter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Json {
	
	public final static Gson GSON;
	
	static {
		GsonBuilder builder = new GsonBuilder();
		builder.registerTypeAdapter(Element.class, new ElementJsonAdapter());
		GSON = builder.create();
	}
}
