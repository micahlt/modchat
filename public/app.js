var socket = io(); // define socket
var getParams = function(url) {
  // set up the getParams function
  var params = {}; // set up a params object
  var parser = document.createElement("a"); // create a link parse
  parser.href = url; // set the parser's href to the url passed to the function
  var query = parser.search.substring(1); // query the string
  var vars = query.split("&"); // split the parameters with an ampersand
  for (var i = 0; i < vars.length; i++) {
    // loop through the string
    var pair = vars[i].split("="); // split into multiple params
    params[pair[0]] = decodeURIComponent(pair[1]); // decode the component
  }
  return params; // return the parameters as an object
};
let charCount = 0;
const charLimit = 250; // sets the char limit to 250
let usersTyping = [];
let root = document.documentElement;
let userName = window.localStorage.getItem("userName"); // grab the user object from localStorage if it exists
let sidebarOpen = false;
if (userName) {
  // if the user object contains a name
  console.log("User has already verified"); // ROP
  document.getElementsByClassName("blocker")[0].style.display = "none"; // hide the blocker
  document.getElementsByClassName("register")[0].style.display = "none"; // hide the registration popup
}
document.getElementById("changeTheme").addEventListener("click", changeTheme);

document.getElementById("pseudoUpload").addEventListener("input", function() {
  console.log('FILE UPLOADIG');
  let file = document.getElementById("pseudoUpload").files[0];
  var reader = new FileReader();
  reader.onload = function() {
    console.log(reader.result); // ROP
    socket.emit("image", {
      image: reader.result,
      sender: window.localStorage.getItem("userName")
    });
  };
  reader.readAsDataURL(file);
});
document.getElementById("imgUpload").addEventListener("click", function(e) {
  e.preventDefault();
  document.getElementById("pseudoUpload").click();
});

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

if (Notification.permission == "default") {
  Notification.requestPermission();
}

document.getElementById("signOut").addEventListener("click", function() {
  window.localStorage.removeItem("userName");
  window.localStorage.removeItem("userHash");
  window.location.reload();
});

window.addEventListener("load", setTheme);

document.getElementById("sidebarControl").addEventListener("click", slideSidebar);

function slideSidebar() {
  if (!sidebarOpen) {
    document.getElementsByClassName("sidebar")[0].style.display = "block";
    document.getElementById("sidebarControl").style.transform = "rotate(180deg)";
    document.getElementById("sidebarControl").style.boxShadow = "0 -3px 10px rgba(0, 0, 0, 0.4)";
    sidebarOpen = true;
  } else {
    document.getElementById("sidebarControl").style.transform = "rotate(0deg)";
    document.getElementById("sidebarControl").style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.4)";
    document.getElementsByClassName("sidebar")[0].style.display = "none";
    sidebarOpen = false;
  }
}

function setTheme() {
  if (window.localStorage.getItem("theme") == "light") {
    root.style.setProperty("--background-primary", "white");
    root.style.setProperty("--background-secondary", "rgb(230, 230, 230)");
    root.style.setProperty("--background-tertiary", "lightgray");
    root.style.setProperty("--text-primary", "#0a0a0a");
    root.style.setProperty("--transparent", "rgba(0, 0, 0, 0.02)");
    document.getElementsByClassName("register-img")[0].src = "/wordmark-black.png";
  } else if (window.localStorage.getItem("theme") == "dark") {
    root.style.setProperty("--background-primary", "#090A0B");
    root.style.setProperty("--background-secondary", "#131516");
    root.style.setProperty("--background-tertiary", "rgb(20, 20, 20)");
    root.style.setProperty("--text-primary", "#ffffff");
    root.style.setProperty("--transparent", "rgba(255, 255, 255, 0.02)");
    document.getElementsByClassName("register-img")[0].src = "/wordmark-white.png";
  }
}

function changeTheme() {
  if (window.localStorage.getItem("theme") == "dark") {
    window.localStorage.setItem("theme", "light");
    setTheme();
  } else if (window.localStorage.getItem("theme") == "light") {
    window.localStorage.setItem("theme", "dark");
    setTheme();
  } else {
    window.localStorage.setItem("theme", "light");
    setTheme();
  }
}
if (!getParams(window.location.href).r) {
  window.location.replace(window.location.href + "?r=default");
}

document.getElementById("changeRoom").addEventListener("click", function() {
  document.getElementById("roomName").style.display = "block";
  document.getElementsByClassName("blocker")[0].style.display = "block";
  document.getElementsByClassName("blocker")[0].addEventListener("click", function() {
    document.getElementsByClassName("blocker")[0].style.display = "none";
    document.getElementById("roomName").style.display = "none";
    document.getElementsByClassName("blocker")[0].removeEventListener("click");
  });
});

document.getElementById("roomName").addEventListener("submit", function(event) {
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  window.location.replace(window.location.href.split("?")[0] + "?r=" + document.getElementById("r").value);
});

document.getElementById("form").addEventListener("submit", function(event) {
  // listen for submits on the message sending form
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  const message = document.getElementById("m").value; // gets the users message value
  if (!(message.trim() == "") && charCount <= charLimit) {
    charCount = 0;
    document.getElementById("messageCharCount").innerHTML = charCount + "/" + charLimit + " chars"; // displays the amount of chars to the user
    socket.emit("chatMessage", {
      // send the chat message from the form value to the server
      message: message,
      sender: window.localStorage.getItem("userName"),
      hash: window.localStorage.getItem("userHash"),
      socket: socket.id
    });
    document.getElementById("m").value = ""; // reset the chat form's value
  } else if (charCount > charLimit) {
    document.getElementById("messageCharCount").classList.add("flashing");
    window.setTimeout(function() {
      document.getElementById("messageCharCount").classList.remove("flashing");
    }, 1000);
  } else {
    document.getElementById("messageCharCount").classList.add("flashing");
    window.setTimeout(function() {
      document.getElementById("messageCharCount").classList.remove("flashing");
    }, 1000);
  }
  return false;
});
document.getElementById("form").addEventListener("keydown", function(event) {
  socket.emit("userTyping", {
    username: window.localStorage.getItem("userName")
  });
  charCount = document.getElementById("m").value.length;
  document.getElementById("messageCharCount").innerHTML = charCount + "/" + charLimit + " chars"; // displays the amount of chars to the user
  if (charCount > charLimit) {
    document.getElementById("messageCharCount").style.color = "#d90429";
  } else {
    document.getElementById("messageCharCount").style.color = "var(--text-primary)";
  }
});
document.getElementById("username").addEventListener("submit", function(event) {
  // listen for user registration
  event.stopImmediatePropagation(); // stop reloads
  event.preventDefault(); // stop reloads
  document.getElementsByClassName("loader")[0].style.opacity = "1";
  socket.emit("userRegister", document.getElementById("username-input").value); // send the username to verify to the server
  return false;
});
socket.on("isTyping", function(username) {
  console.log(usersTyping.length); // ROP
  if (!usersTyping.includes(username)) {
    usersTyping.push(username);
    whosTyping();
    setTimeout(function() {
      var index = usersTyping.indexOf(username);
      usersTyping.splice(index, 1);
    }, 600);
    whosTyping();
  }
});
socket.on("bannedUser", function(boot) {
  localStorage.removeItem("userName");
  window.location.reload();
});
socket.on("chatMessage", function(object) {
  console.log('msg recieved');
  // handle recieving chat messages
  var m = document.createElement("li"); // create an element to display the message
  var p = document.createElement("p"); // create the actual message
  var img = document.createElement("img"); // create an element to display the sender's profile picture
  img.src = "https://cdn2.scratch.mit.edu/get_image/user/" + object.id + "_60x60.png";
  img.classList.add("pfp");
  img.onclick = function() {
    window.open("https://scratch.mit.edu/users/" + object.sender, "_blank");
  };
  if (object.sender == localStorage.getItem("userName")) {
    p.classList.add("yourMessage");
  }
  img.setAttribute("title", object.sender);
  let mentionsMessage = ""; // resets the mentions in the message
  messageToRender = object.message;
  console.log(messageToRender); // ROP
  if (messageToRender.includes("<img")) {
    p.classList.add("image");
  }
  messageToRender.split(" ").forEach(word => {
    if (word[0] == "@") {
      const USERNAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
      let mentionName = "";
      let i = 1;
      while (USERNAME_CHARS.includes(word[i])) {
        mentionName += word[i];
        i++;
      }
      let afterName = word.slice(i);
      const link = '<a class="mention" target="_blank" href="https://scratch.mit.edu/users/' + mentionName + '">@' + mentionName + "</a>"; // creates a link relevant to the user
      mentionsMessage = mentionsMessage + link + afterName + " ";
    } else if (word.startsWith("https://") || word.startsWith("http://")) {
      const link = '<a class="mention" target="_blank" href="' + word + '">' + word + "</a> "; // creates a link
      mentionsMessage = mentionsMessage + link;
    } else if (word[0] == "#") {
      const link = '<a class="mention" target="" href="/chat?r=' + word.substring(1, word.length) + '">' + word + "</a> "; // creates a link relevant to the room
      mentionsMessage = mentionsMessage + link;
    } else {
      mentionsMessage = mentionsMessage + word + " ";
    }
  });
  p.innerHTML = mentionsMessage; // add the message text to that element
  m.appendChild(img);
  m.appendChild(p);
  document.getElementById("messages").appendChild(m); // append the message to the message area
  window.scrollBy(0, 1700);
  if (document.hidden) {
    document.getElementById("favicon").href = "/fav-msg.png";
    if (!object.old) {
      var notification = new Notification("Modchat", {
        body: object.sender + " says: '" + object.message + "'",
        icon: "/fav-normal.png"
      });
    }
  }
});
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible") {
    document.getElementById("favicon").href = "/fav-normal.png";
  }
});
socket.on("botMessage", function(msg) {
  // handle recieving chat messages
  var m = document.createElement("li"); // create an element to display the message
  var p = document.createElement("p"); // create the actual message
  var img = document.createElement("img"); // create an element to display the sender's profile picture
  img.src = "https://images.emojiterra.com/openmoji/v12.2/512px/1f916.png";
  img.classList.add("pfp");
  img.onclick = function() {
    window.open("https://scratch.mit.edu/users/Modchat-Bot", "_blank");
  };
  p.innerHTML = msg; // add the message text to that element
  m.appendChild(img);
  m.appendChild(p);
  m.setAttribute("title", "Modchat Bot");
  document.getElementById("messages").appendChild(m); // append the message to the message area
  window.scrollBy(0, 1700);
  if (document.hidden) {
    document.getElementById("favicon").href = "/fav-msg.png";
  }
});

socket.on("svCodeToVerify", function(msg) {
  // handle recieving the SV code (after triggering the setUsername function)
  document.getElementsByClassName("loader")[0].style.opacity = "0";
  document.getElementById("svCode").value = msg; // display the code
  document.getElementById("completeSV").style.display = "block"; // display the completion button
  document.getElementById("completeSV").addEventListener("click", function() {
    // listen for clicks on the completion button
    socket.emit("finishVerification"); // tell the server to finish verification
  });
});

socket.on("verificationSuccess", function(msg) {
  // handle a successful verification with SV
  console.log("Verified!"); // ROP
  window.localStorage.setItem("userName", msg.username);
  window.localStorage.setItem("userHash", msg.hash);
  window.location.reload();
});

function setUsername() {
  socket.emit("setUsername", document.getElementById("name").value); // tell the server to begin SV registration
}

socket.on("disconnect", function() {
  socket.emit("userDisconnect", window.localStorage.getItem("userName"));
  console.log("user disconnected"); // ROP
});

socket.on("connect", function() {
  console.log("user connected"); // ROP
  document.getElementById("roomTitle").innerText = getParams(window.location.href).r;
  socket.emit("roomChange", {
    room: getParams(window.location.href).r,
    user: window.localStorage.getItem("userName"),
    hash: window.localStorage.getItem("userHash"),
    socket: socket.id
  });
});
setInterval(whosTyping, 500);

function whosTyping() {
  if (usersTyping.length > 0 && usersTyping.length < 2) {
    document.getElementById("typingSection").innerHTML = "<strong>" + usersTyping[0] + "</strong> is typing...";
  } else if (usersTyping.length > 1) {
    document.getElementById("typingSection").innerHTML = "<strong>" + usersTyping[0] + "</strong> and " + (
      usersTyping.length - 1) + " more are typing...";
  } else {
    document.getElementById("typingSection").innerHTML = "";
  }
}