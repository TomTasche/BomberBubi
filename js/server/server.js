var FS = FS || require('fs');
var URL = URL || require("url");
var HTTP = HTTP || require('http');
var STATIC = STATIC || new require('node-static').Server(__dirname, {cache: 3600});

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
    console.log('serving: ' + uri);
    STATIC.serveFile(uri, 200, {}, request, response);
});
HTTP.listen(process.env.PORT || 80);

module.exports = HTTP;