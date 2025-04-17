import {
  getBroadcastComponent,
  getGroupMessageComponent,
  getDirectMessageComponent,
  getGroupStickerComponent,
  getDirectStickerComponent,
  getRoomList,
  getUserList,
  getChatList,
  getSuperBoardcastComponent,
  getAlertComponent,
} from "./component.js";


const socket = io("ws://localhost:3500");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const userGroupList = document.querySelector(".userGroup-list");
const userList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");
const superBroadcast = document.getElementById("superBroadcast-container");
const chatSelector = document.querySelector("#chat-selector");

const stickerId = [":OIIA", ":Hamtaro", ":Rickroll"];

let userName = "";
let userId = "";
let userRoom = "";
let typingUsers = new Map();

// ## SOCKET SECTION ##
function containsHTML(str) {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

function containsScriptTag(str) {
  return /<\s*script.*?>.*?<\s*\/\s*script\s*>/gis.test(str);
}

// SENDER: Send message to server
function sendMessage(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const msg = msgInput.value.trim();
  const roomId = chatSelector.options[chatSelector.selectedIndex].id;

  if (msg && name && chatRoom.value) {
    if (containsHTML(msg) || containsScriptTag(msg)) {
      showAlert("Attack attempt detected, dialed 191 successfully");
    }
    else if (stickerId.includes(msg)) {
      socket.emit("sticker", {
        name: name,
        text: msg.slice(1),
        to: roomId,
      });
    } else {
      socket.emit("message", {
        name: name,
        text: msg,
        to: roomId,
      });
    }
    msgInput.value = "";
    msgInput.focus();
  }
  
}

// SENDER: Send room name that user want to join to server
function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    const name = nameInput.value;
    const room = chatRoom.value;

    if (name !== userName && room !== userRoom) {
      socket.emit("leaveRoom", {});
      socket.emit("changeName", { name: name });
      socket.emit("enterRoom", { room: room });
    } else if (name !== userName) {
      socket.emit("changeName", { name: name });
    } else if (room !== userRoom) {
      socket.emit("leaveRoom", {});
      socket.emit("enterRoom", { room: room });
    }

    userName = name;
    userRoom = room;
  }
}

socket.on("setId", (data) => {
  userId = data.id;
});

// HANDLER: Listen for a message
socket.on("groupMessage", (data) => {
  activity.textContent = "";
  const { id, name, text, time } = data;
  showGroupMessage(id, userId, name, text, time);
});

socket.on("directMessage", (data) => {
  activity.textContent = "";
  const { id, name, text, time } = data;
  showDirectMessage(id, userId, name, text, time);
});

socket.on("groupSticker", (data) => {
  activity.textContent = "";
  const { id, name, text, time } = data;
  showGroupSticker(id, userId, name, text, time);
});

socket.on("directSticker", (data) => {
  activity.textContent = "";
  const { id, name, text, time } = data;
  showDirectSticker(id, userId, name, text, time);
});

socket.on("broadcast", (data) => {
  activity.textContent = "";
  const { text } = data;
  showBroadcast(text);
});

socket.on("superBroadcast", (data) => {
  activity.textContent = "";
  const { text } = data;
  showSuperBroadcast(text);
});

// HANDLER: Listen for typing event from other user

socket.on("activity", (name) => {
  if (typingUsers.has(name)) {
    clearTimeout(typingUsers.get(name));
  }

  const timer = setTimeout(() => {
    typingUsers.delete(name);
    updateTypingMessage();
  }, 10000);

  typingUsers.set(name, timer);
  updateTypingMessage();
});

function updateTypingMessage() {
  const names = Array.from(typingUsers.keys());
  if (names.length === 0) {
    activity.textContent = "";
  } else if (names.length === 1) {
    activity.textContent = `${names[0]} is typing...`;
  } else {
    activity.textContent = `${names.join(", ")} are typing...`;
  }
}

// HANDLER: Listen for user list in the room
socket.on("userGroupList", ({ users }) => {
  showGroupUsers(users);
});

// HANDLER: Listen for active room in the server
socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("chatList", ({ users }) => {
  showChats(users);
});

// ## USER INTERFACE SECTION ##

// HANDLER: On message submission
document.querySelector(".form-msg").addEventListener("submit", sendMessage);

// HANDLER: On room join
document.querySelector(".form-join").addEventListener("submit", enterRoom);

// HANDLER: On typing state
msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

// UPDATE: Show message to user
function showGroupMessage(id, userId, name, text, time) {
  const li = getGroupMessageComponent(id, userId, name, text, time);
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function showDirectMessage(id, userId, name, text, time) {
  const li = getDirectMessageComponent(id, userId, name, text, time);
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function showGroupSticker(id, userId, name, stickId, time) {
  const li = getGroupStickerComponent(id, userId, name, stickId, time);
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function showDirectSticker(id, userId, name, stickId, time) {
  const li = getDirectStickerComponent(id, userId, name, stickId, time);
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function showBroadcast(text) {
  const li = getBroadcastComponent(text);
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// UPDATE: Show user list in the room
function showGroupUsers(users) {
  userGroupList.innerHTML = getUserList(users);
}

function showUsers(users) {
  if(users[0].name == "" && users.length == 1) return
  userList.innerHTML = getUserList(users);
}

// UPDATE: Show active room in the server
function showRooms(rooms) {
  if(rooms[0] == "" && rooms.length == 1) return
  roomList.innerHTML = getRoomList(rooms);
}

function showChats(users) {
  chatSelector.innerHTML = getChatList(users, userId);
}

function showSuperBroadcast(text, duration = 3000) {
  const box = getSuperBoardcastComponent(text);
  superBroadcast.prepend(box);

  requestAnimationFrame(() => {
    box.classList.remove("-translate-y-full", "opacity-0");
    box.classList.add("translate-y-0", "opacity-100");
  });

  setTimeout(() => {
    box.classList.remove("translate-y-0", "opacity-100");
    box.classList.add("-translate-y-full", "opacity-0");
    setTimeout(() => {
      box.remove();
    }, 500);
  }, duration);
}

function showAlert(text, duration = 3000) {
  const box = getAlertComponent(text)
  superBroadcast.prepend(box);

  requestAnimationFrame(() => {
    box.classList.remove("-translate-y-full", "opacity-0");
    box.classList.add("translate-y-0", "opacity-100");
  });

  setTimeout(() => {
    box.classList.remove("translate-y-0", "opacity-100");
    box.classList.add("-translate-y-full", "opacity-0");
    setTimeout(() => {
      box.remove();
    }, 500);
  }, duration);
}
