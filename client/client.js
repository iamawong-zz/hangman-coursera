var SERVER_EVENTS = ['round', 'over']
, guessed
, socket;

function startGame() {
    socket = io.connect();

    socket.on('connect', function() {
	socket.emit('initialize');
	$('#start').css("visibility", "visible");
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
    clearGuessed();
    socket.emit('start');
    event.preventDefault();
}

function guess(e) {
    var self = this;
    if (e.keyCode == 13 && !e.ctrlKey && this.value && guessed.indexOf(this.value) < 0) {
	socket.emit('guess', this.value);
	addLetter(this.value);
	this.value = "";
	e.preventDefault();
    } else if (e.keyCode >= 97 && e.keyCode <= 122) {
	this.value = String.fromCharCode(e.keyCode);
    }
}

function round(data) {
    updatePhrase(data.phrase);
    updateMessage(data.numleft + ' guesses left. Type a letter and press enter to guess.');
}

function addLetter(letter) {
    guessed  = guessed + letter;
    $('#guess').children('h3').append(letter.toUpperCase());
}

function clearGuessed() {
    guessed = "";
    $('#guess').children('h3').empty();
}

function over(data) {
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