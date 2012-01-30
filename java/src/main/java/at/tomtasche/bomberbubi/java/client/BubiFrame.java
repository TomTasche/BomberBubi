package at.tomtasche.bomberbubi.java.client;

import java.awt.FlowLayout;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.UnknownHostException;

import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.UIManager;

import at.tomtasche.bomberbubi.java.common.element.Coordinates.Direction;

@SuppressWarnings("serial")
public class BubiFrame extends JFrame implements KeyListener {

	private final BubiClient bubi;
	private final MapModel model;


	public BubiFrame() throws UnknownHostException {
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {}

		setTitle("BomberBubi");
		setLayout(new FlowLayout());

		bubi = new BubiClient(Inet4Address.getLocalHost(), 12345, new Runnable() {

			@Override
			public void run() {
				model.fireTableDataChanged();
			}
		});
		model = new MapModel(bubi);

		JTable table = new JTable();
		table.setModel(model);

		JScrollPane pane = new JScrollPane(table);
		addKeyListener(this);
		add(pane);

		setSize(400, 400);
		setDefaultCloseOperation(DISPOSE_ON_CLOSE);
		setVisible(true);
	}


	@Override
	public void keyPressed(KeyEvent e) {
		try {
			Direction direction;

			switch (e.getKeyCode()) {
			case 37:
				// left
				direction = Direction.WEST;

				break;

			case 38:
				// up
				direction = Direction.NORTH;

				break;

			case 39:
				// right
				direction = Direction.EAST;

				break;

			case 40:
				// down
				direction = Direction.SOUTH;

				break;

			case 32:
				// space
				bubi.bomb();

				return;

			default:
				return;
			}

			bubi.move(direction);
		} catch (IOException exception) {
			exception.printStackTrace();
		}
	}

	@Override
	public void keyReleased(KeyEvent e) {}

	@Override
	public void keyTyped(KeyEvent e) {}
}
