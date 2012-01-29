package at.tomtasche.bomberbubi.java;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

public class BubiServer implements Runnable {

	Map<String, Thread> bubis;
	Map<String, Actionable> actions;


	public BubiServer() {
		bubis = new HashMap<String, Thread>();
		actions = new HashMap<String, Actionable>();
		actions.put("SYN", new Actionable() {

			public BubiMessage run(BubiMessage message) {
				bubis.put(message.getValue("id"), Thread.currentThread());

				return new BubiMessage("ACK");
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


	public static void main(String[] args) {
		new BubiServer();
	}
}
