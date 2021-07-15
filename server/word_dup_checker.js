const fs = require('fs');
const wordList = fs.readFileSync('./word_list.txt', 'utf8').split('\n');
let repeats = [];

for(let i = 0; i < wordList.length; i++) {
    for(let j = i + 1; j < wordList.length; j++) {
        if(wordList[i] === wordList[j]) {
            repeats.push(wordList[i]);
        }
    }
}

console.log(repeats);