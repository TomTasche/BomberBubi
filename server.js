var app = require('http').createServer(handler)
, fs = require('fs'), url = require ("url");

var PORT = process.env.PORT || 1337;
console.log(PORT);
app.listen(PORT);

function handler (req, res) {
   var uri = url.parse(req.url).pathname;

   if (uri == '/') uri = '/game.html';

   //	if (uri == '/socket.io/socket.io.js') uri = '/node_modules/socket.io/lib/socket.io.js';

   fs.readFile(__dirname + '/client' + uri,
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
