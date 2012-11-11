var SERVER_EVENTS = ['round', 'over']
, socket;

function startGame() {
    socket = io.connect();

    socket.on('connect', function() {
	socket.emit('initialize');
    });
    
    SERVER_EVENTS.forEach(function(event) {
	socket.on(event, window[event]);
    });

    $('#start').click(start);
}

function start(event) {
    $('#start').css("visibility", "hidden");
    $('#wrap').show();
    $(document).keypress(guess);
    socket.emit('start');
    event.preventDefault();
}

function guess(e) {
    console.log(e);
    var self = this;
    if (e.keyCode == 13 && !e.ctrlKey && this.value) {
	socket.emit('guess', this.value);
	this.value = "";
	e.preventDefault();
    } else if (e.keyCode >= 97 && e.keyCode <= 122) {
	console.log('saving keycode');
	this.value = e.keyCode;
    }
}

function round(data) {
    console.log(data);
    updatePhrase(data.phrase);
    updateMessage(data.numleft + ' guesses left');
}

function over(data) {
    console.log(data);
    updatePhrase(data.phrase);
    $(document).keypress(function(event){});
    $('#start').css("visibility", "visible");
    if ('won' === data.state) {
	updateMessage('Congrats, you won! Try again?');
    } else {
	updateMessage('Aww, you lost. Try again?');
    }
}

function updateMessage(message) {
    $('#message').children('h2').text(message);
}

function updatePhrase(phrase) {
    $('#phrase').children('h2').text(phrase);
}