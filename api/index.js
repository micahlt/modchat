var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Filter = require('bad-words');
var filter = new Filter();
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  console.log('a user connected: ' /* + user */ );
  socket.on('chatMessage', (msg) => {
    console.log('message: ' + filter.clean(msg));

    io.emit('chatMessage', filter.clean(msg));
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
http.listen(3001, () => {
  console.log('listening on *:3001');
});