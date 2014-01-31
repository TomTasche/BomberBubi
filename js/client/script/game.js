(function initGame() {
	var playerId, lastMovement;

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var changeType = function changeType(x, y, type) {
		var style;
		switch (type) {
		case 0:
			style = 'rgb(255, 255, 255)';

			break;

		case 1:
			style = 'rgb(126, 126, 126)';

			break;

		case 3:
			style = 'rgb(0, 0, 0)';

			break;

		case 4:
			style = 'rgb(255, 0, 0)';

			break;

		case playerId:
			style = 'rgb(0, 255, 0)';

			break;

		default:
			style = 'rgb(0, 0, 255)';

			break;
		}

		var yDistance = calculatePlayerDistance(y);
		var xDistance = calculatePlayerDistance(x);

		context.fillStyle = style;
		context.fillRect(yDistance, xDistance, 50, 50);
	};

	var socket = (function initSocket() {
		var onUpdate = function onUpdate(message) {
			var changes = message.changes, change;
			if (Object.prototype.toString.call(changes) != '[object Array]') {
				changes = [].push(changes);
			}

			for (var i = 0; i < changes.length; i++) {
				change = changes[i];

				changeType(change.y, change.x, change.type);

				if (change.type = playerId) {
					lockMovement = false;
				}
			}
		};

		var socket = io.connect('/socket.io');
		socket.on('HELLO', function onHello(data) {
			playerId = data.player_id;

			buildArena(data.size);

			onUpdate(data);
		});
		socket.on('UPDATE', onUpdate);

		return {
			sendMovement : function sendMovement(deltaX, deltaY) {
				var message = {
					player_id : playerId,
					deltaX : deltaX,
					deltaY : deltaY
				};

				socket.emit('TRIGGER', message);
			}
		};
	})();

	var calculateDistance = function(position) {
		var distance = (position * 50) + (position * (10 + 1))
				+ (position * (3 + 1));

		return distance;
	};

	var calculatePlayerDistance = function(position) {
		return 10 + calculateDistance(position);
	};

	var calculateGridDistance = function(position) {
		return 2 + calculateDistance(position);
	};

	var buildArena = function buildArena(size) {
		var length = calculateDistance(size) + 4, i = 0, distance = 0;

		canvas.width = length;
		canvas.height = length;

		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.beginPath();

		for (; i <= size; i++) {
			distance = calculateGridDistance(i);

			context.moveTo(distance, 0);
			context.lineTo(distance, length);

			context.moveTo(0, distance);
			context.lineTo(length, distance);
		}

		context.stroke();
	};

	var sendMovement = function sendMovement(deltaX, deltaY) {
		socket.sendMovement(deltaX, deltaY);
	};

	var makeMove = function makeMove() {
		if (!lastMovement)
			return;

		if (lockMovement)
			return;
		lockMovement = true;

		switch (lastMovement.keyCode) {
		case 37:
			// left
			sendMovement(-1, 0);

			break;

		case 38:
			// up
			sendMovement(0, -1);

			break;

		case 39:
			// right
			sendMovement(1, 0);

			break;

		case 40:
			// down
			sendMovement(0, 1);

			break;

		case 32:
			// space
			if (lockBomb)
				return;
			// holdBomb = true;

			sendMovement(0, 0);

			/*
			 * // if you want to decrease the number of bombs placed in the
			 * game, upper this timeout window.setTimeout(toggleBombLock, 500);
			 */
		}

		lastMovement = null;
	};

	var onKeyUp = function onKeyUp(event) {
		// prevent scrolling
		if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39
				|| event.keyCode == 40 || event.keyCode == 32) {
			event.preventDefault();
		}

		lastMovement = event;

		return true;
	};

	document.addEventListener("keydown", onKeyUp, false);

	window.setInterval(makeMove, 200);
})();