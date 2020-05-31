var socket = io(); // define socket
var getParams = function(url) { // set up the getParams function
  var params = {}; // set up a params object
  var parser = document.createElement('a'); // create a link parse
  parser.href = url; // set the parser's href to the url passed to the function
  var query = parser.search.substring(1); // query the string
  var vars = query.split('&'); // split the parameters with an ampersand
  for (var i = 0; i < vars.length; i++) { // loop through the string
    var pair = vars[i].split('='); // split into multiple params
    params[pair[0]] = decodeURIComponent(pair[1]); // decode the component
  }
  return params; // return the parameters as an object
};
var userName = window.localStorage.getItem("userName"); // grab the user object from localStorage if it exists
if (userName) { // if the user object contains a name
  console.log("User has already verified"); // ROP
  document.getElementsByClassName("blocker")[0].style.display = "none"; // hide the blocker
  document.getElementsByClassName("register")[0].style.display = "none"; // hide the registration popup
}
if (!(getParams(window.location.href).r)) {
  window.location.replace(window.location.href + "?r=def");
} else {
  socket.emit('roomChange', getParams(window.location.href).r);
}

document.getElementById("form").addEventListener("submit", function(event) { // listen for submits on the message sending form
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  socket.emit('chatMessage', { // send the chat message from the form value to the server
    "message": document.getElementById("m").value,
    "sender": window.localStorage.getItem("userName")
  });
  document.getElementById("m").value = ""; // reset the chat form's value
  return false;
});
document.getElementById("username").addEventListener("submit", function(event) { // listen for user registration
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  socket.emit('userRegister', document.getElementById("username-input").value); // send the username to verify to the server
  return false;
});
socket.on('chatMessage', function(object) { // handle recieving chat messages
  var m = document.createElement('li'); // create an element to display the message
  m.innerText = object.message + "  -" + object.sender + "#" + object.id; // add the message text to that element
  document.getElementById('messages').appendChild(m); // append the message to the message area
});

socket.on('svCodeToVerify', function(msg) { // handle recieving the SV code (after triggering the setUsername function)
  document.getElementById('svCode').innerText = msg; // display the code
  document.getElementById('completeSV').style.display = "block"; // display the completion button
  document.getElementById('completeSV').addEventListener('click', function() { // listen for clicks on the completion button
    socket.emit('finishVerification'); // tell the server to finish verification
  })
});

socket.on('verificationSuccess', function(msg) { // handle a successful verification with SV
  console.log("Verified!"); // ROP
  window.localStorage.setItem("userName", msg);
  window.location.reload();
})

function setUsername() {
  socket.emit('setUsername', document.getElementById('name').value); // tell the server to begin SV registration
};