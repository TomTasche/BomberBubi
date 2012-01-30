package at.tomtasche.bomberbubi.java.client;

import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

import at.tomtasche.bomberbubi.java.common.Actionable;
import at.tomtasche.bomberbubi.java.common.BubiCommunicator;
import at.tomtasche.bomberbubi.java.common.BubiMessage;
import at.tomtasche.bomberbubi.java.common.Json;
import at.tomtasche.bomberbubi.java.common.element.Coordinates.Direction;
import at.tomtasche.bomberbubi.java.common.element.Element;

public class BubiClient implements Runnable {

	private final InetAddress address;
	private final int port;
	private final Map<String, Actionable> actions;
	private final Runnable callback;
	
	private BubiCommunicator bubi;
	private int size;
	private Element[][] map;
	private String id;
	

	public BubiClient(InetAddress address, int port, Runnable callback) {
		this.address = address;
		this.port = port;
		this.callback = callback;
		this.map = new Element[0][0];

		actions = new HashMap<String, Actionable>();
		actions.put("ACK", new Actionable() {

			@Override
			public BubiMessage run(BubiMessage message) {
				synchronized (map) {
					map = Element.fromJson(message.getValue("MAP"));
				}
				
				id = message.getValue("ID");
				size = Integer.parseInt(message.getValue("SIZE"));

				return null;
			}
		});
		actions.put("UPDATE", new Actionable() {
			
			@Override
			public BubiMessage run(BubiMessage message) {
				synchronized (map) {
					Element[] changes = Json.GSON.fromJson(message.getValue("CHANGES"), Element[].class);
					for (int i = 0; i < changes.length; i++) {
						Element changed = changes[i];
						map[changed.getCoordinates().getX()][changed.getCoordinates().getY()] = changed;
					}
				}

				BubiClient.this.callback.run();
				
				return null;
			}
		});

		new Thread(this, "BubiClient").start();
	}


	public void run() {
		try {
			Socket socket = new Socket(address, port);

			bubi = new BubiCommunicator(socket, actions);
			register();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void register() throws IOException {
		Map<String, String> values = new HashMap<String, String>();
		values.put("ROOM", "");
		values.put("NAME", "tomtasche");
		values.put("AVATAR", "https://lh3.googleusercontent.com/-xnmC2NFb6Vc/AAAAAAAAAAI/AAAAAAAAFkM/1Fi0k-mViws/s200-c-k/photo.jpg");

		bubi.send(new BubiMessage("SYN", values));
	}
	
	public void move(Direction direction) throws IOException {
		Map<String, String> values = new HashMap<String, String>();
		values.put("ID", id);
		values.put("DIRECTION", Json.GSON.toJson(direction));
		
		bubi.send(new BubiMessage("QUERY", values));
	}
	
	public void bomb() throws IOException {
		move(Direction.BOMB);
	}
	
	public Element[][] getMap() {
		return map;
	}
	
	public int getSize() {
		return size;
	}
}
