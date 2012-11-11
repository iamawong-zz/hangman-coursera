var http = require('http')
, socket = require('socket.io')
, ams = require('ams')
, connect = require('connect')
, Game = require('./game')
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
        .add(__dirname + '/headjs/src/load.js')
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

configFiles();

app = connect()
    .use(connect.logger(':status :remote-addr :url in :response-time ms'))
    .use(urls)
    .use(connect.static(publicDir));

server = http.createServer(app).listen(process.env.PORT || 3000);

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
	console.log('blah!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	game = new Game(socket);
	game.registerPlayer(socket);
	console.log('blah@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    });

    socket.on('disconnect', function() {
	game = null;
    });
});
