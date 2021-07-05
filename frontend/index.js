// local development socket
//const socket = io('localhost:3000');
// heroku deployment socket
const socket = io('https://serene-bastion-73077.herokuapp.com/');

const initialScreen = document.getElementById('initialScreen');
const playerListScreen = document.getElementById('playerListScreen');
const gameScreen = document.getElementById('gameScreen');

const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const spymasterBtn = document.getElementById('spymasterBtn');
const switchTeamBtn = document.getElementById('switchTeamBtn');
const startGameBtn = document.getElementById('startGameBtn');

const gameCodeInput = document.getElementById('gameCodeInput');
const usernameInput = document.getElementById('usernameInput');

const teamTurnDisplay = document.getElementById('teamTurnDisplay');
const redScoreDisplay = document.getElementById('redScoreDisplay');
const blueScoreDisplay = document.getElementById('blueScoreDisplay');

const redP1 = document.getElementById('redP1');
const redP2 = document.getElementById('redP2');
const redP3 = document.getElementById('redP3');
const redP4 = document.getElementById('redP4');
const redP5 = document.getElementById('redP5');
const blueP1 = document.getElementById('blueP1');
const blueP2 = document.getElementById('blueP2');
const blueP3 = document.getElementById('blueP3');
const blueP4 = document.getElementById('blueP4');
const blueP5 = document.getElementById('blueP5');
const redPlayerDisplays = [redP1, redP2, redP3, redP4, redP5];
const bluePlayerDisplays = [blueP1, blueP2, blueP3, blueP4, blueP5];

const label1 = document.getElementById('label1');
const label2 = document.getElementById('label2');
const label3 = document.getElementById('label3');
const label4 = document.getElementById('label4');
const label5 = document.getElementById('label5');
const label6 = document.getElementById('label6');
const label7 = document.getElementById('label7');
const label8 = document.getElementById('label8');
const label9 = document.getElementById('label9');
const label10 = document.getElementById('label10');
const label11 = document.getElementById('label11');
const label12 = document.getElementById('label12');
const label13 = document.getElementById('label13');
const label14 = document.getElementById('label14');
const label15 = document.getElementById('label15');
const label16 = document.getElementById('label16');
const label17 = document.getElementById('label17');
const label18 = document.getElementById('label18');
const label19 = document.getElementById('label19');
const label20 = document.getElementById('label20');
const label21 = document.getElementById('label21');
const label22 = document.getElementById('label22');
const label23 = document.getElementById('label23');
const label24 = document.getElementById('label24');
const label25 = document.getElementById('label25');
const labels = [label1, label2, label3, label4, label5,
                label6, label7, label8, label9, label10,
                label11, label12, label13, label14, label15,
                label16, label17, label18, label19, label20,
                label21, label22, label23, label24, label25];

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
spymasterBtn.addEventListener('click', becomeSpymaster);
switchTeamBtn.addEventListener('click', switchTeams);
startGameBtn.addEventListener('click', startGame);

for(let i = 0; i < 25; i++) {
    labels[i].addEventListener('click', function() { buttonClicked(i); });
}

let code;
let username;
let playerNumber;
let teamNumber;
let isSpymaster;

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

function newGame() {
    // check if username is not empty or just whitespace
    username = usernameInput.value;
    if(username.trim().length === 0) {
        alert('Please enter a valid username');
        usernameInput.value = '';
        return;
    }

    socket.emit('newGame', username);
    init();
}

function joinGame() {
    // check if username is not empty or just whitespace
    username = usernameInput.value;
    if(username.trim().length === 0) {
        alert('Please enter a valid username');
        usernameInput.value = '';
        return;
    }

    code = gameCodeInput.value;
    socket.emit('joinGame', code, username);
    init();
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    startGameBtn.disabled = true;
}

function paintGame(gameState) {
    state = JSON.parse(gameState);

    // reset player displays
    for(let i = 0; i < 5; i++) {
        redPlayerDisplays[i].innerText = '';
        bluePlayerDisplays[i].innerText = '';
    }

    // dsiplay players for each team
    let numRedPlayers = 0;
    let numBluePlayers = 0;
    for(let i = 0; i < state.players.length; i++) {
        player = state.players[i];

        // track information about the user's player
        if(player.username === username) {
            isSpymaster = player.spymaster;
            teamNumber = player.team;
        }

        // label spymasters correctly
        let spymasterText = '';
        if(player.spymaster) {
            spymasterText = ' SPYMASTER';
        }

        // display other players
        if(player.team === 0) {
            redPlayerDisplays[numRedPlayers].innerText = state.players[i].username + spymasterText;
            numRedPlayers++;
        }
        else if(player.team === 1) {
            bluePlayerDisplays[numBluePlayers].innerText = state.players[i].username + spymasterText;
            numBluePlayers++;
        }
    }

    // display board and words
    for(let i = 0; i < 25; i++) {
        label = state.board[i];
        if(state.active) {
            // either the word has been clicked previously or the player is the spymaster
            if(label.revealed || isSpymaster) {
                labels[i].disabled = true;
                if(label.team === 0) {
                    labels[i].style.background = 'red';
                }
                else if(label.team === 1) {
                    labels[i].style.background = 'blue';
                }
                else if(label.team === 2) {
                    labels[i].style.background = 'darkgray';
                }
                else if(label.team === 3) {
                    labels[i].style.background = 'black';
                }

                if(label.revealed) {
                    labels[i].innerText = '';
                }
                else {
                    labels[i].innerText = label.word;
                }
            }
            // these ones have not been clicked yet
            else {
                labels[i].disabled = !(state.teamTurn === teamNumber);
                labels[i].style.background = 'gray';
                labels[i].innerText = label.word;
            }
        }
        else {
            labels[i].disabled = true;
            labels[i].style.background = 'gray';
            labels[i].innerText = label.word;
        }
    }

    // display score
    redScoreDisplay.innerText = state.score.team0;
    blueScoreDisplay.innerText = state.score.team1;

    if(state.active) {
        // display which team's turn it is
        if(state.teamTurn === 0) {
            teamTurnDisplay.style.color = 'red';
            teamTurnDisplay.innerText = "Red Team's Turn";
        }
        else if(state.teamTurn === 1) {
            teamTurnDisplay.style.color = 'blue';
            teamTurnDisplay.innerText = "Blue Team's Turn";
        }
    }
}

function buttonClicked(id) {
    console.log('this.id: ' + this.id);
    socket.emit('buttonClicked', code, teamNumber, id);
}

function becomeSpymaster() {
    socket.emit('becomeSpymaster', username);
}

function switchTeams() {
    socket.emit('switchTeams', username);
}

function startGame() {
    socket.emit('startGame');
}

function handleInit(number) {
    playerNumber = number;
    
    // only the host can start the game
    if(playerNumber === 1) {
        startGameBtn.disabled = false;
    }
    else {
        startGameBtn.disabled = true;
    }
}

function handleGameState(data) {
    paintGame(data);
}

function handleGameOver(data) {
    gameActive = false;

    let state = JSON.parse(data);

    if(state.winner === teamNumber) {
        teamTurnDisplay.style.color = 'green';
        teamTurnDisplay.innerText = 'You Win!';
    }
    else {
        teamTurnDisplay.style.color = 'red';
        teamTurnDisplay.innerText = 'You Lose!';
    }

    // display board and words
    for(let i = 0; i < 25; i++) {
        label = state.board[i];

        labels[i].disabled = true;

        if(label.team === 0) {
            labels[i].style.background = 'red';
        }
        else if(label.team === 1) {
            labels[i].style.background = 'blue';
        }
        else if(label.team === 2) {
            labels[i].style.background = 'darkgray';
        }
        else if(label.team === 3) {
            labels[i].style.background = 'black';
        }

        if(label.revealed) {
            labels[i].innerText = '';
        }
        else {
            labels[i].innerText = label.word;
        }
    }

    // display score
    redScoreDisplay.innerText = state.score.team0;
    blueScoreDisplay.innerText = state.score.team1;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert('Unknown game code');
}

function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none';
}