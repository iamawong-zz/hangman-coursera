var CLIENT_EVENTS = ['start', 'guess']
, BASE_URI = 'http://hangman.coursera.org/hangman/game'
, request = require('request');

var Game = function(socket, hash) {
    this.socket = socket;
    this.hash = hash;
    this.key = null;
}

Game.prototype.registerPlayer = function(socket) {
    var self = this;
    CLIENT_EVENTS.forEach(function(event) {
	socket.on(event, self.handleClientMessage(event, socket));
    });
}

Game.prototype.handleClientMessage = function(event, socket) {
    var self = this;
    return function(msg) {
	console.log('receiving ' + event + ' with message ' + msg);
	self[event].call(self, msg);
    }
}

Game.prototype.start = function(msg) {
    this.makeRequest(BASE_URI, {
	"email" : "iamawong@outlook.com"
    });
}

Game.prototype.guess = function(msg) {
    this.makeRequest(BASE_URI + '/' + this.key, {
	"guess" : msg.guess
    });
}

Game.prototype.makeRequest = function(uri, data) {
    request(uri, {
	method: 'POST',
	json: data
    }, this.responseCall);
}

Game.prototype.responseCall = function(error, response, data) {
    if (!error && 200 == response.statusCode) {
	console.log('got a response');
	console.log(data);
	this.key = data.game_key;
	if ('alive' == data.state) {
	    this.sendMessage('round', {
		numleft : data.num_tries_left,
		phrase : data.phrase
	    });
	} else {
	    this.sendMessage('over', {
		state : data.state,
		phrase: data.phrase
	    });
	}
    } else {
	console.log('failed call');
	console.log(response.statusCode);
    }
}

Game.prototype.sendMessage = function(event, msg) {
    console.log('for game: ' + this.hash);
    console.log('sending message: ' + event + ' with message: ' + msg);
    this.socket.emit(event, msg);
}

module.exports = Game;