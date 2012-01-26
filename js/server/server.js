var FS = FS || require('fs');
var URL = URL || require ("url");
var HTTP = require('http');

HTTP = HTTP.createServer(function onRequest(req, res) {
   var uri = URL.parse(req.url).pathname;
   if (uri == '/') {
      uri = '/game.html';
   }

   console.log(uri);

   FS.readFile(__dirname + '/../client' + uri,
               function (err, data) {
                  if (err) {
                     res.writeHead(500);
                     return res.end('Error loading ' + uri);
                  }

                  res.writeHead(200);
                  res.end(data);
               });
});
HTTP.listen(80);

console.log('server running at 80');

module.exports = HTTP;
