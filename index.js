// import https from 'https';
// import path from 'path';
// import config from './config/env';
// import app from './config/express';
const http = require('http')
const fs = require('fs');
const express = require('express');
const logger = require('morgan');
const socketIo = require('socket.io')
const _ = require('lodash');
const app = express();
const port = 8080;
const database = {};
const server = http.createServer(app)
const io = socketIo(server, {origins: '*:*'})
const sala = io.of('public_chat')
const messageKey = 'test_message'
sala.on('connection', socket => {
    console.log('New user connected', socket.id)
    socket.on(messageKey, data => {
        console.log('received: ', data)
        sala.emit(messageKey, data)
    })
})

/** ===== Board helpers ======== */
const words = fs.readFileSync('codenames.txt').toString().split("\n");

function getWords () {
  // Shuffle array and take first 25 elements
  return _.shuffle(words).slice(0,25);
}

function generateBoard() {
  let board = []
  let wordRow = [];
  let reds = _.fill(Array(9), 'red');
  let blues = _.fill(Array(8), 'blue');
  let neutral = _.fill(Array(7), 'neutral');
  let black = ['black'];
  let colors = [ ...reds, ...blues, ...neutral, ...black];
  console.log("colors length", colors.length)
  let shuffledColors =  _.shuffle(colors);
  console.log('shuffledColors:', shuffledColors);
  const selectedWords = getWords();
  console.log("selectedWords", selectedWords);
  console.log("selectedWords length", selectedWords.length)
  selectedWords.forEach((word, i) => {
    wordRow.push( { word, color: shuffledColors[i] })
    if ((i + 1) % 5 == 0) {
      board.push(wordRow)
      wordRow = [];
    }
  })
  return board;
}

/** ===== End of Board helpers ======== */

app.use(logger('dev')); 

app.get('/board', function (req, res) {
  if (_.isUndefined(database.board)) {
    res.send('please create a new board first!');
  } else {
    res.json({
      board: database.board
    })
  }
})


app.post('/board', function (req, res) {
  // Need to debounce or something
  database.board = generateBoard();
  return res.status(200).send('ok');
})

server.listen(port, () => console.log(`Socket runing at port: ${port}`))
