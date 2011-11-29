var app = require('http').createServer(handler)
  , fs = require('fs'), url = require ("url");

app.listen(process.env.PORT || 1337);

function handler (req, res) {
    var uri = url.parse(req.url).pathname;

	if (uri == '/') uri = '/client/game.html';

	if (uri == '/socket.io/socket.io.js') uri = '/socket.io/socket.io.js';

  fs.readFile('/home/tom/BomberBubi' + uri,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + uri);
    }

    res.writeHead(200);
    res.end(data);
  });
}

console.log('server running');

module.exports.app = app;
