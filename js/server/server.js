var FS = FS || require('fs');
var URL = URL || require("url");
var HTTP = require('http');
var STATIC = require('node-static');
STATIC = new STATIC.Server(__dirname, {cache: 3600});

HTTP = HTTP.createServer(function onRequest(request, response) {
    var uri = URL.parse(request.url).pathname;
    if (uri == '/socket.io/socket.io.js') return;
    if (uri.search('favicon.ico') >= 0) {
      response.end(null, 404);

      return;
    }
    
    if (uri == '/') {
        uri = '/index.html';
    }

    uri = '/../client' + uri;
    STATIC.serveFile(uri, 200, {}, request, response);

    /*console.log(uri);

    FS.readFile(__dirname + '/../client' + uri, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + uri);
        }

        res.writeHead(200);
        res.end(data);
    });*/
});
HTTP.listen(process.env.PORT || 80);

console.log('server running');

module.exports = HTTP;
