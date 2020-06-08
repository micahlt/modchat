// Import all needed modules
global.fetch = require("node-fetch"); // for web requests
global.btoa = require('btoa'); // for SV authenication
var express = require('express'); // for main server
var Filter = require('bad-words'); // for filtering messages
var Datastore = require('nedb') // for username info storage
var userDb = new Datastore({
  filename: 'users.db',
  autoload: true
});
var app = express(); // define the app var
var http = require('http').createServer(app); // init http server
var io = require('socket.io')(http); // attach socket to the server
// Begin Filter Setup
var filter = new Filter(); // set up the filter
let removeWords = ['god', 'God']; // Make a list of word to be uncensored.
filter.removeWords(...removeWords); //Remove those from the filter
let addWords = ['WTF', 'wtf', 'lmao', 'LMAO']; // Any words in this list will be censored.
filter.addWords(...addWords); //Add those to the filter
// End Filter Setup
let bannedList = [];
let modsList = ['-Ekmand-', '-Archon-', 'MicahLT', 'ContourLines', 'YodaLightSabr', 'MetaLabs'];
var svAppId = "4205845"; // register SV app id
var svAppSecret = "58402c158faf27abf7e89e723672d315c9a7bf40be0e7cb6bae2d8dcde886a0b"; // register SV app (secret token)
app.use(express.static(__dirname + '/public')); // tell express where to get public assets
app.get('/chat', (req, res) => { // set root location to index.html
  res.sendFile(__dirname + '/index.html');
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});
io.on('connection', (socket) => { // handle a user connecting
  var currentRoom; // make a placeholder for the room name
  socket.on('roomChange', (object) => { // handle a change in rooms
    socket.leave(currentRoom); // leave the current room
    currentRoom = object.room; // set the current room to the room sent by the client
    socket.join(currentRoom); // join the new current room
    if (!(object.user == null)) {
      if (bannedList.includes(socket.conn.remoteAddress)) {
        console.log("Banned user " + object.user + " at IP " + socket.conn.remoteAddress + " attempted to join.");
        socket.emit('bannedUser', true);
        socket.leave(currentRoom);
      }
      console.log("User " + object.user + " joined the " + object.room + " room at IP " + socket.conn.remoteAddress); // ROP
      io.to(currentRoom).emit('botMessage', "🎉 Welcome <b>" + object.user + "</b> to the <b>" + currentRoom + "</b> room! 🎉"); // emit a welcome method with the Modchat bot
    } else {
      console.log("An unauthorized user is trying to join the " + currentRoom + " room."); // ROP
    }
  });
  socket.on('userTyping', (username) => {
    socket.to(currentRoom).emit('isTyping', username);
  });
  socket.on('chatMessage', (object) => { // handle the server recieving messages
    if (bannedList.includes(object.user)) {
      socket.emit('bannedUser', true);
      socket.leave(currentRoom);
    } else {
      var locatedDoc = userDb.find({ // see if the user has a listing in the database; this reduces API requests to Scratch
        username: object.sender // set the username to find as the message sender's username
      }, function(err, docs) {
        if (docs[0] == null) { // if the user does not exist
          console.log("adding user " + object.sender); // ROP
          fetch('https://api.scratch.mit.edu/users/' + object.sender) // fetch the user's info from the Scratch API
            .then(response => response.json())
            .then(data => {
              var userDoc = { // make a new document object
                username: object.sender, // set the username as the message sender's name
                id: data.id, // set the user's ID to the ID recieved by the Scratch API
                socketId: socket.id
              }
              userDb.insert(userDoc, function(err, docc) { // insert the document to the database
                io.to(currentRoom).emit('chatMessage', { // emit the message to all clients in the room
                  "message": filter.clean(object.message), // set the message as a filtered version of the original
                  "sender": object.sender, // set the sender to the sender's username
                  "id": data.id, // set the sender's ID from the database
                });
              });
            })
        } else {
          var locateDoc = userDb.find({ // if the user does exist
            username: object.sender // set the username to the sender's username
          }, function(err, doc) {
            io.to(currentRoom).emit('chatMessage', { // emit the message to all clients in the room
              "message": filter.clean(object.message), // set the message as a filtered version of the original
              "sender": object.sender, // set the sender to the sender's username
              "id": doc[0].id // set the sender's ID from the database
            });
          })
        }
      });
    }
  });
  socket.on('userRegister', (msg) => { // handle user registration
    fetch('https://api.scratch.mit.edu/users/' + msg) // make a request to the Scratch API
      .then(response => response.json())
      .then(data => {
        if (data.id == null) { // make sure that the user exists
          console.log("user doesn't exist"); // ROP
        } else { // if they do exist, continue with registration
          console.log("confirming user id " + data.id); // ROP
          fetch('http://scratchverifier.ddns.net:8888/verify/' + msg, { // make a request to the SV server
            method: 'PUT',
            headers: {
              'Authorization': "Basic " + btoa(svAppId + ":" + svAppSecret) // use basic token auth to connect
            }
          }).then((response) => {
            return response.json();
          }).then((data) => {
            console.log(data.code); // ROP
            socket.emit("svCodeToVerify", data.code); // send the SV verification code back to the registering user
            socket.on('finishVerification', (msgTwo) => { // handle finishing verification
              console.log("AHH VERIFYY"); // ROP
              fetch('http://scratchverifier.ddns.net:8888/verify/' + msg, { // make a request to the SV server (again)
                method: 'POST',
                headers: {
                  'Authorization': "Basic " + btoa(svAppId + ":" + svAppSecret) // use basic token auth again
                }
              }).then((response) => {
                return response.ok;
              }).then((data) => {
                console.log('Response: ' + data); // ROP
                if (data) { // if the response was okay
                  socket.emit("verificationSuccess", msg); // Send a success message to the registering user
                } else { // if verification failed
                  // generate error here...
                  console.error("Error with verification: " + data); // ROP
                }
              })
            })
          })
        }
      });
  });
  socket.on('disconnect', () => { // handle user disconnecting from the server
    console.log('user disconnected'); // ROP
    userDb.remove({
      socketId: socket.id
    })
  });
});
http.listen((process.env.PORT || 3001), () => { // initialize the server
  console.log('listening on a port'); // ROP
});