package at.tomtasche.bomberbubi.java.server;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import at.tomtasche.bomberbubi.java.client.BubiFrame;
import at.tomtasche.bomberbubi.java.common.Actionable;
import at.tomtasche.bomberbubi.java.common.BubiCommunicator;
import at.tomtasche.bomberbubi.java.common.BubiMessage;
import at.tomtasche.bomberbubi.java.common.Json;
import at.tomtasche.bomberbubi.java.common.element.Coordinates;
import at.tomtasche.bomberbubi.java.common.element.Element;
import at.tomtasche.bomberbubi.java.common.element.PathElement;
import at.tomtasche.bomberbubi.java.common.element.PlayerElement;
import at.tomtasche.bomberbubi.java.common.element.Coordinates.Direction;

public class BubiServer implements Runnable {

	private final Map<String, Element> bubis;
	private final Map<String, Actionable> actions;
	
	private final int size;
	private final Element[][] map;


	public BubiServer(int size) {
		this.size = size;
		
		map = new Element[size][size];
		for (int i = 0; i < size; i++) {
			for (int j = 0; j < size; j++) {
				map[i][j] = new PathElement(new Coordinates(i, j));
			}
		}
		
		bubis = new HashMap<String, Element>();
		actions = new HashMap<String, Actionable>();
		actions.put("SYN", new Actionable() {

			public BubiMessage run(BubiMessage message) {
				String id = UUID.randomUUID().toString();
				
				// TODO: randomize start-position
				bubis.put(id, new PlayerElement());

				Map<String, String> values = new HashMap<String, String>();
				synchronized (map) {
					values.put("MAP", Element.toJson(map));
				}
				values.put("SIZE", Integer.toString(BubiServer.this.size));
				values.put("ID", id);
				
				return new BubiMessage("ACK", values);
			}
		});
		actions.put("QUERY", new Actionable() {
			
			@Override
			public BubiMessage run(BubiMessage message) {
				Element player = bubis.get(message.getValue("ID"));
				Direction direction = Json.GSON.fromJson(message.getValue("DIRECTION"), Direction.class);
				
				synchronized (map) {
					player.move(direction);
				}
				
				Map<String, String> values = new HashMap<String, String>();
				
				// TODO: broadcast!
				return new BubiMessage("UPDATE", values);
			}
		});

		new Thread(this, "BubiServer").start();
	}


	public void run() {
		try {
			ServerSocket server = new ServerSocket(12345);

			do {
				Socket socket = server.accept();

				Thread thread = new Thread(new BubiCommunicator(socket, actions), "BubiCommunicator");
				thread.start();
			} while (true);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}


	public static void main(String[] args) throws UnknownHostException {
		new BubiServer(5);
		
		new BubiFrame();
	}
}
