/*
Copyright (C) 2012 Thomas Taschauer, <http://tomtasche.at/>.

This file is part of BomberBubi, <https://github.com/TomTasche/BomberBubi>.

BomberBubi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BomberBubi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with BomberBubi. If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require('fs');
var url = require("url");
var http = require('http');
var staticfs = require('node-static');
staticfs = new staticfs.Server(__dirname, {cache: 3600});

http = http.createServer(function onRequest(request, response) {
    var uri = url.parse(request.url).pathname;
    if (uri == '/socket.io/socket.io.js') return;
    if (uri.search('favicon.ico') >= 0) {
      response.end(null, 404);

      return;
    }
    
    if (uri == '/') {
        uri = '/index.html';
    }

    uri = '/../client' + uri;
    staticfs.serveFile(uri, 200, {}, request, response);
});
http.listen(process.env.PORT || 80);

module.exports = http;