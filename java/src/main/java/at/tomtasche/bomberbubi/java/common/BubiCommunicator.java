package at.tomtasche.bomberbubi.java.common;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.Map;


public class BubiCommunicator implements Runnable {

	private final Socket socket;
	private final Map<String, Actionable> actions;
	private final OutputStreamWriter writer;
	private final BufferedWriter bufferedWriter;


	public BubiCommunicator(Socket socket, Map<String, Actionable> actions) throws IOException {
		this.socket = socket;
		this.actions = actions;
		
		writer = new OutputStreamWriter(socket.getOutputStream());
		bufferedWriter = new BufferedWriter(writer);
		
		new Thread(this, "BubiCommunicatorReader").start();
	}

	
	public void send(BubiMessage message) throws IOException {
		if (message == null) return;
		
		System.out.println("Sending action: " + BubiMessage.toJson(message));
		
		bufferedWriter.write(BubiMessage.toJson(message));
		bufferedWriter.newLine();
		bufferedWriter.flush();
	}
	
	public void run() {
		try {
			InputStreamReader reader = new InputStreamReader(socket.getInputStream());
			BufferedReader bufferedReader = new BufferedReader(reader);
			
			for (String s = bufferedReader.readLine(); s != null; s = bufferedReader.readLine()) {
				System.out.println("Received action: " + s);
				
				BubiMessage request = BubiMessage.fromJson(s);
				Actionable action = actions.get(request.getName());
				if (action == null) {
					System.err.println("Unimplemented action: " + s);
					return;
				}
				
				BubiMessage response = action.run(request);
				send(response);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
