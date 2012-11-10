var http = require('http')
, socket = require('socket.io')
, ams = require('ams')
, connect = require('connect')
, game = require('./game')
, app
, server
, clientDir = __dirname + '/client'
, publicDir = __dirname + '/public';

function configFiles() {
    var options = {
	uglifyjs: false,
	jstransport: false,
	cssabspath: false,
	cssdataimg: false,
	texttransport: false
    };
    ams.build
	.create(publicDir)
	.add(clientDir + '/client.js')
	.add(clientDir + '/style.css')
	.process(options)
	.write(publicDir)
	.end()
};

function urls(req, res, next) {
    if (/^\/human/.exec(req.url)) {
	req.url = '/human.html';
    } else if (/^\/comp/.exec(req.url)) {
	req.url = '/comp.html';
    } else if (/^\/?$/.exec(req.url)) {
	req.url = '/index.html';
    }
    return next();
}

function getHash() {
    do { 
	var hash = randString(5);
    } while (hash in games);
    return hash;
}

var CHARSET = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','T','V','W','X','Y','Z'];

function randString(num) {
    var string = "";
    while (string.length < num) {
	string += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return string;
}

configFiles();

app = connect()
    .use(connect.logger(':status :remote-addr :url in :response-time ms'))
    .use(urls)
    .use(connect.static(publicDir));

server = http.createServer(app).listen(3000);

socket = socket.listen(server);
socket.configure('production', function() {
  socket.enable('browser client minification');  // send minified client
  socket.enable('browser client etag');          // apply etag caching logic based on version number
  socket.enable('browser client gzip');          // gzip the file
  socket.set('log level', 1);                    // reduce logging
  socket.set('transports', [                     // enable all transports (optional if you want flashsocket)
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});

socket.sockets.on('connection', function(socket) {
    var game = null;
    socket.on('initialize', function(msg) {
	game = new Game(socket, getHash());
	game.registerPlayer(socket);
	socket.emit('hash', game.hash);
    });

    socket.on('disconnect', function() {
	game = null;
    });
});
