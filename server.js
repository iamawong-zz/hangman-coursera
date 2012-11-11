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
socket.configure(function() {
    socket.set('transports', ['xhr-polling']);
    socket.set('polling duration', 10);
});

socket.sockets.on('connection', function(socket) {
    var game = null;
    socket.on('initialize', function(msg) {
	game = new Game(socket);
	game.registerPlayer(socket);
    });

    socket.on('disconnect', function() {
	game = null;
    });
});
