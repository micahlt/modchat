var socket = io(); // define socket
var userObject = window.localStorage.getItem("userObject"); // grab the user object from localStorage if it exists
if (userObject) { // if the user object contains a name
  console.log("User has already verified"); // ROP
  document.getElementsByClassName("blocker")[0].style.display = "none";
  document.getElementsByClassName("register")[0].style.display = "none";
}
document.getElementById("form").addEventListener("submit", function(event) { // listen for submits on the message sending form
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  socket.emit('chatMessage', document.getElementById("m").value); // send the chat message from the form value to the server
  document.getElementById("m").value = ""; // reset the chat form's value
  return false;
});
document.getElementById("username").addEventListener("submit", function(event) { // listen for user registration
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  socket.emit('userRegister', document.getElementById("username-input").value); // send the username to verify to the server
  return false;
});
socket.on('chatMessage', function(msg) { // handle recieving chat messages
  var m = document.createElement('li'); // create an element to display the message
  m.innerText = msg; // add the message text to that element
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
  window.localStorage.setItem("userObject", {
    "name": msg,
    "verified": true
  });
  window.location.reload();
})

function setUsername() {
  socket.emit('setUsername', document.getElementById('name').value); // tell the server to begin SV registration
};