const { GRID_SIZE } = require('./constants');
const { readTxtFile } = require('./utils');

module.exports = {
    initGame,
    updateGame,
    becomeSpymaster,
    switchTeams,
    startGame,
}

function initGame() {
    const state = createGameState();
    return state;
}

function createGameState() {
    newGameState = {
        players: [
            /*
            format for how players are added and their data is stored
            {
                playerNumber: -1;
                username: '',
                team: -1,
                spymaster: false,
            },
            */
        ],
        board: [ // 25 positions for a 5x5 board
            { word: '', team: -1, revealed: false },    // team 0 : red team
            { word: '', team: -1, revealed: false },    // team 1 : blue team
            { word: '', team: -1, revealed: false },    // team 2 : neutral
            { word: '', team: -1, revealed: false },    // team 3 : insta loss
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
            { word: '', team: -1, revealed: false },
        ],
        teamTurn: 0,
        score: { team0: 9, team1: 8 },
        winner: -1,
        active: false,
    };

    // randomize words
    let wordList = readTxtFile('./word_list.txt');
    
    let usedNumbers = [];
    for(let i = 0; i < 25; i++) {
        let num = Math.floor(Math.random() * wordList.length);
        let numFound = false;

        for(let j = 0; j < usedNumbers.length; j++) {
            if(usedNumbers[j] === num) {
                numFound = true;
                break;
            }
        }

        if(numFound) {
            i--;
            continue;
        }
        else {
            usedNumbers[i] = num;
            newGameState.board[i].word = wordList[num];
            newGameState.board[i].team = 2;
        }
    }

    // randomize words for teams
    usedNumbers = [];
    for(let i = 0; i < 18; i++) {
        let num = Math.floor(Math.random() * 25);
        let numFound = false;

        for(let j = 0; j < usedNumbers.length; j++) {
            if(usedNumbers[j] === num) {
                numFound = true;
                break;
            }
        }

        if(numFound) {
            i--;
            continue;
        }
        else {
            usedNumbers[i] = num;
            if(i < 9) {
                newGameState.board[num].team = 0;
            }
            else if(i < 17) {
                newGameState.board[num].team = 1;
            }
            else if(i < 18) {
                newGameState.board[num].team = 3;
            }
        }
    }

    return newGameState;
}

function updateGame(state, team, id) {
    // team that the chosen square is a part of
    let labelTeam;

    // if the black square is clicked
    if(state.board[id].team === 3) {
        // returns 1 if input is 0 and 0 if input is 1
        state.winner = (state.teamTurn + 1) % 2;
        state.active = false;
        return state;
    }
    else {
        state.board[id].revealed = true;
        
        if(state.board[id].team === 0) {
            state.score.team0--;
            
            if(state.score.team0 === 0) {
                state.winner = 0;
                state.active = false;
                return state;
            }
        }
        else if(state.board[id].team === 1) {
            state.score.team1--;

            if(state.score.team1 === 1) {
                state.winner = 1;
                state.active = false;
                return state;
            }
        }
        
        labelTeam = state.board[id].team;
    }

    if(labelTeam !== team) {
        state.teamTurn = (state.teamTurn + 1) % 2;
    }

    return state;
}

function becomeSpymaster(state, playerNumber, username) {
    if(state.active) {
        return state;
    }

    spymasterExists = false;
    team = -1;
    playerIndex = -1;
    // iterate through players to find the player that wants to be the spymaster
    for(let i = 0; i < state.players.length; i++) {
        // check if the current element is the player
        if(state.players[i].playerNumber === playerNumber && state.players[i].username === username) {
            // if the player is a spymaster, make them not the spymaster and return the state
            if(state.players[i].spymaster) {
                state.players[i].spymaster = false;
                return state;
            }
            team = state.players[i].team;
            playerIndex = i;
            break;
        }
    }

    for(let i = 0; i < state.players.length; i++) {
        // if the current element is on the player's team and is the spymaster, do nothing and return
        if(state.players[i].team === team && state.players[i].spymaster) {
            return state;
        }
    }

    // this should not happen
    if(playerIndex === -1) {
        console.error('Cannot find player of playerNumber: ' + playerNumber + ' and username: ' + username);
        return null;
    }

    // the player is able to become the spymaster
    state.players[playerIndex].spymaster = true;
    return state;
}

function switchTeams(state, playerNumber, username) {
    if(state.active) {
        return state;
    }

    spymasterExists = false;
    for(let i = 0; i < state.players.length; i++) {
        if(state.players[i].playerNumber === playerNumber && state.players[i].username === username) {
            state.players[i].team = (state.players[i].team + 1) % 2;
            state.players[i].spymaster = false;
            return state;
        }
    }

    console.error('Error switch teams for playerNumber: ' + playerNumber + ' and username: ' + username);
    return null;
}

function startGame(state) {
    state.active = true;
    return state;
}