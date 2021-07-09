const io = require('socket.io')();
const { updateGame, initGame, becomeSpymaster, switchTeams, startGame, endTurn } = require('./game');
const { MAX_PLAYERS } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('buttonClicked', handleButtonClicked);
    client.on('becomeSpymaster', handleBecomeSpymaster);
    client.on('switchTeams', handleSwitchTeams);
    client.on('startGame', handleStartGame);
    client.on('endTurn', handleEndTurn);

    function handleJoinGame(roomName, playerName) {
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if(room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if(allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if(numClients === 0) {
            client.emit('unknownGame');
            return;
        }
        else if(numClients === MAX_PLAYERS) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = numClients + 1;
        // mod by 2 to alternate adding to each of the teams
        teamNumber = client.number % 2;
        state[roomName].players.push( { playerNumber: client.number, username: playerName, team: teamNumber, spymaster: false } );
        
        client.emit('gameCode', roomName);
        client.emit('init', client.number);

        io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
    }

    function handleNewGame(playerName) {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();
        state[roomName].players.push( { playerNumber: 1, username: playerName, team: 1, spymaster: false } );

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);

        io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
    }

    function handleButtonClicked(roomName, team, id) {
        updatedState = updateGame(state[roomName], team, id);
        state[roomName] = updatedState;

        if(updatedState.winner === 0 || updatedState.winner === 1) {
            emitGameOver(roomName, state[roomName]);
        }
        else {
            emitGameState(roomName, state[roomName]);
        }
    }

    function handleBecomeSpymaster(username) {
        state[clientRooms[client.id]] = becomeSpymaster(state[clientRooms[client.id]], client.number, username);
        emitGameState(clientRooms[client.id], state[clientRooms[client.id]]);
    }

    function handleSwitchTeams(username) {
        state[clientRooms[client.id]] = switchTeams(state[clientRooms[client.id]], client.number, username);
        emitGameState(clientRooms[client.id], state[clientRooms[client.id]]);
    }

    function handleStartGame() {
        state[clientRooms[client.id]] = startGame(state[clientRooms[client.id]]);
        emitGameState(clientRooms[client.id], state[clientRooms[client.id]]);
    }

    function handleEndTurn() {
        state[clientRooms[client.id]] = endTurn(state[clientRooms[client.id]]);
        emitGameState(clientRooms[client.id], state[clientRooms[client.id]]);
    }
});

function emitGameState(room, gameState) {
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, gameState) {
    io.sockets.in(room).emit('gameOver', JSON.stringify(gameState));
}

io.listen(process.env.PORT || 3000);