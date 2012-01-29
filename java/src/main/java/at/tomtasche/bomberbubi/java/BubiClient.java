package at.tomtasche.bomberbubi.java;

import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class BubiClient implements Runnable {

	private final InetAddress address;
	private final int port;
	private final Map<String, Actionable> actions;


	public BubiClient(InetAddress address, int port) {
		this.address = address;
		this.port = port;

		actions = new HashMap<String, Actionable>();
		actions.put("mapChange", new Actionable() {

			public BubiMessage run(BubiMessage message) {
				System.out.println("map changed!");

				return null;
			}
		});

		new Thread(this, "BubiClient").start();
	}


	public void run() {
		try {
			Socket socket = new Socket(address, port);

			BubiCommunicator bubi = new BubiCommunicator(socket, actions);
			register(bubi);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void register(BubiCommunicator bubi) throws IOException {
		Map<String, String> values = new HashMap<String, String>();
		values.put("id", UUID.randomUUID().toString());

		bubi.send(new BubiMessage("SYN", values));
	}


	public static void main(String[] args) throws UnknownHostException {
		new BubiClient(Inet4Address.getLocalHost(), 12345);
	}
}
