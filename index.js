// Import all needed modules
global.fetch = require("node-fetch"); // for web requests
global.btoa = require('btoa'); // for SV authenication
var express = require('express'); // for main server
var Filter = require('bad-words'); // for filtering messages
var frenchBadwords = require('french-badwords-list'); // import French curse words for filtering
var filipinoBadwords = require("filipino-badwords-list"); // import Filipino curse words for filtering
var moreBadwords = require("badwordspluss");
var Datastore = require('nedb'); // for username info storage
var bcrypt = require('bcrypt'); // for hashing usernames
var userDb = new Datastore({
  filename: 'users.db',
  autoload: true
});
var app = express(); // define the app var
var http = require('http').createServer(app); // init http server
var io = require('socket.io')(http); // attach socket to the server
// Begin Filter Setup
var filter = new Filter({
  placeHolder: '_'
}); // set up the filter
let removeWords = ['GOD']; // Make a list of word to be uncensored.
filter.removeWords(...removeWords); //Remove those from the filter
let addWords = ['WTF', 'LMAO', 'DISCORD', 'INSTAGRAM', 'SLACK', 'SNAPCHAT']; // Any words in this list will be censored.
filter.addWords(...addWords); // Add those to the filter
filter.addWords(...frenchBadwords.array); // Add French curse words to the filter
filter.addWords(...filipinoBadwords.array); // Add Filipino curse words to the filter
filter.addWords(...moreBadwords); // Add other curse words to the filter
// End Filter Setup
let bannedList = ['WhatImWorkingOn', 'Spammer', 'PFPboi', 'WhatAmIWorkingOn'];
let modsList = ['-Ekmand-', '-Archon-', 'MicahLT', 'ContourLines', 'YodaLightsabr', 'MetaLabs'];
var svAppId = "4205845"; // register SV app id
var svAppSecret = "58402c158faf27abf7e89e723672d315c9a7bf40be0e7cb6bae2d8dcde886a0b"; // register SV app (secret token)
userDb.persistence.setAutocompactionInterval(30000);
app.use(express.static(__dirname + '/public')); // tell express where to get public assets
app.get('/chat', (req, res) => { // set chat location to the chat page
  res.sendFile(__dirname + '/index.html');
});
app.get('/', (req, res) => { // set root location to the landing page
  res.sendFile(__dirname + '/home.html');
});
app.get('/about', (req, res) => { // set about location to the about page
  res.sendFile(__dirname + '/about.html');
});
io.on('connection', (socket) => { // handle a user connecting
  var currentRoom; // make a placeholder for the room name
  socket.on('roomChange', (object) => { // handle a change in rooms
    socket.leave(currentRoom); // leave the current room
    currentRoom = object.room; // set the current room to the room sent by the client
    socket.join(currentRoom); // join the new current room
    if (!(object.user == null)) {
      if (bannedList.includes(object.user)) {
        console.log("Banned user " + object.user + " attempted to join.");
        socket.emit('bannedUser', true);
        socket.leave(currentRoom);
      } else {
        console.log("User " + object.user + " joined the " + object.room + " room"); // ROP
        bcrypt.compare(object.user, object.hash).then(function(result) {
          if (result) {
            io.to(currentRoom).emit('botMessage', "🎉 Welcome <b>" + object.user + "</b> to the <b>" + currentRoom + "</b> room! 🎉"); // emit a welcome message with the Modchat bot
          }
        }).catch(function(err) {
          console.log("Error:", err); // ROP
        });
      }
    } else {
      console.log("An unauthorized user is trying to join the " + currentRoom + " room."); // ROP
    }
  });
  socket.on('userTyping', (object) => {
    socket.to(currentRoom).emit('isTyping', object.username);
  });
  socket.on('chatMessage', (object) => { // handle the server recieving messages
    // console.log(object.sender, object.hash); // ROP
    bcrypt.compare(object.sender, object.hash).then(function(result) {
      // console.log(result) // ROP
      if (result) {
        if (bannedList.includes(object.sender)) {
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
                    socketId: socket.id,
                    room: currentRoom
                  }
                  userDb.insert(userDoc, function(err, docc) { // insert the document to the database
                    io.to(currentRoom).emit('chatMessage', { // emit the message to all clients in the room
                      "message": filter.clean(object.message), // set the message as a filtered version of the original
                      "sender": object.sender, // set the sender to the sender's username
                      "id": data.id, // set the sender's ID from the API request
                    });
                  });
                  if (object.message == "/who") {
                    var onlineList = userDb.find({
                      room: currentRoom
                    }, function(err, locatedDocs) {
                      var online = "";
                      console.log(locatedDocs);
                      if (locatedDocs[1] == undefined) {
                        io.to(currentRoom).emit('botMessage', "😫 Looks like you're all alone...");
                      } else {
                        for (let i = 0; i < locatedDocs.length; i++) {
                          online += "<br><b>" + locatedDocs[i].username + "</b>"
                        }
                        io.to(currentRoom).emit('botMessage', "Online users:<br>" + online);
                      }
                    })
                  }
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
                if (object.message == "/who") {
                  var onlineList = userDb.find({
                    room: currentRoom
                  }, function(err, locatedDocs) {
                    var online = "";
                    console.log(locatedDocs);
                    if (locatedDocs[1] == undefined) {
                      io.to(currentRoom).emit('botMessage', "😫 Looks like you're all alone...");
                    } else {
                      for (let i = 0; i < locatedDocs.length; i++) {
                        online += "<br><b>" + locatedDocs[i].username + "</b>";
                      }
                      io.to(currentRoom).emit('botMessage', "Online users:<br>" + online);
                    }
                  })
                }
              })
            }
          });
        }
      } else {
        console.log('User tampering!');
      }
    });
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
                  bcrypt.hash(msg, 10, function(err, hash) { // hash the username
                    socket.emit("verificationSuccess", {
                      "hash": hash,
                      "username": msg
                    }); // Send success  to the registering user
                    console.log(hash);
                  });
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
  socket.on('userDisconnect', (name) => {
    io.to(currentRoom).emit('botMessage', "😐 User <b>" + name + "</b> left the <b>" + currentRoom + "</b> room."); // emit a welcome message with the Modchat bot
    console.log('user disconnected'); // ROP
  })
  socket.on('disconnect', () => { // handle user disconnecting from the server
    userDb.remove({
      socketId: socket.id
    })
  });
});
http.listen((process.env.PORT || 3001), () => { // initialize the server
  console.log('listening on a port'); // ROP
});