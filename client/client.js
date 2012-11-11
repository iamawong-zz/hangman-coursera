var SERVER_EVENTS = ['round', 'over']
, automated
, guessed
, socket;

function initGame() {
    socket = io.connect();

    socket.on('connect', function() {
	socket.emit('initialize');
	$('#start, #comp').css("visibility", "visible");
    });
    
    SERVER_EVENTS.forEach(function(event) {
	socket.on(event, window[event]);
    });

    $('#start').click(start);
    $('#comp').click(comp);
}

function comp(event) {
    automated = true;
    $('#comp').css('visibility', 'hidden');
    startGame();
}

function start(event) {
    automated = false;
    $('#start').css("visibility", "hidden");
    $(document).keypress(guess);
    startGame();
}

function startGame() {
    $('#wrap').show();
    clearGuessed();
    socket.emit('start');
    event.preventDefault();
}

function guess(e) {
    var self = this;
    if (e.keyCode == 13 && !e.ctrlKey && this.value && guessed.indexOf(this.value) < 0) {
	addLetter(this.value);
	this.value = "";
	e.preventDefault();
    } else if (e.keyCode >= 97 && e.keyCode <= 122) {
	this.value = String.fromCharCode(e.keyCode);
    }
}

function autoGuess() {
    var self = this;
    var charcode;
    do {
	// Generate a keycode from 97 to 122 inclusive
	charcode = String.fromCharCode(Math.floor((Math.random()*(122 - 97 + 1) + 97)));
    } while (guessed.indexOf(charcode) > -1)

    addLetter(charcode);
}

function round(data) {
    updatePhrase(data.phrase);
    updateMessage(data.numleft + ' guesses left' + (automated ? ' for the computer.' : '. Type a letter and press enter to guess.'));
    // If we are watching the computer play, it'll guess every two seconds.
    if (automated) {
	setTimeout(autoGuess, 2000);
    }
}

function addLetter(letter) {
    socket.emit('guess', letter);
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
    $('#start, #comp').css("visibility", "visible");
    if ('won' === data.state) {
	updateMessage('Congrats,' + (automated ? ' computer' : ' you') + ' won! Try again?');
    } else {
	updateMessage('Aww,' + (automated ? ' computer' : ' you') + ' lost. Try again?');
    }
}

function updateMessage(message) {
    $('#message').children('h2').text(message);
}

function updatePhrase(phrase) {
    $('#phrase').children('h2').text(phrase);
}