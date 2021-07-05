const fs = require('fs');

module.exports = {
    makeid,
    readTxtFile,
}

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for( var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function readTxtFile(fileName) {
    const wordList = fs.readFileSync(fileName, 'utf8').split('\n');
    return wordList;
}