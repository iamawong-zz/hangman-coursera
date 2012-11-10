var SERVER_EVENTS = ['hash', 'round', 'over']
, socket;

function startGame() {
    socket = io.connect;
    socket.on('connect', function() {
	socket.emit('initialize');
    });
    
    SERVER_EVENTS.forEach(function(event) {
	socket.on(event, window[event]);
    });

    $('#start').click(start);
}

function start(event) {
    $('#start').hide(500);
    socket.emit('start');
    event.preventDefault();
}

function guess(e) {
    e = e || event;
    var self = this;
    if (e.which === 13 && !e.ctrlKey) {
	socket.emit('chat', this.value);
	this.value = "";
	e.preventDefault();
    }
}

function hash(hash) {
}

function round(data) {
    updatePhrase(data.phrase);
    // data.numLeft
}

function over(data) {
    updatePhrase(data.phrase);
    if ('won' === data.state) {
    } else {
    }
}

function updatePhrase(phrase) {
}