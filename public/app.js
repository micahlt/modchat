document.getElementById("form").addEventListener("submit", function(event) {
  event.stopImmediatePropagation();
  event.preventDefault();
  socket.emit('chatMessage', document.getElementById("m").value);
  document.getElementById("m").value = "";
  return false;
})
var socket = io();
socket.on('chatMessage', function(msg) {
  var m = document.createElement('li');
  m.innerText = msg;
  document.getElementById('messages').appendChild(m);
});

function setUsername() {
  socket.emit('setUsername', document.getElementById('name').value);
};