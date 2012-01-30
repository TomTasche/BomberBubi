package at.tomtasche.bomberbubi.java.client;

import java.net.UnknownHostException;

import javax.swing.table.AbstractTableModel;

import at.tomtasche.bomberbubi.java.common.element.Element;

@SuppressWarnings("serial")
public class MapModel extends AbstractTableModel {

	private final BubiClient bubi;

	public MapModel(BubiClient bubi) throws UnknownHostException {
		this.bubi = bubi;
	}


	@Override
	public int getColumnCount() {
		return bubi.getSize();
	}

	@Override
	public int getRowCount() {
		return bubi.getSize();
	}

	@Override
	public Object getValueAt(int rowIndex, int columnIndex) {
		Element[][] map = bubi.getMap();
		
		synchronized (map) {
			return map[rowIndex][columnIndex];
		}
	}
}
