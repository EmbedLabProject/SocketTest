import {
  getBroadcastComponent,
  getMessageComponent,
  getRoomList,
  getUserList,
  getSuperBoardcastComponent,
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

let userName = "";
let userId = "";
let userRoom = "";

// ## SOCKET SECTION ##

// SENDER: Send message to server
function sendMessage(e) {
  e.preventDefault();
  if (msgInput.value && nameInput.value && chatRoom.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
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
socket.on("message", (data) => {
  activity.textContent = "";
  const { id, name, text, time } = data;
  showMessage(id, userId, name, text, time);
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
let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  // Clear after 10 sec passed
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 10000);
});

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
function showMessage(id, userId, name, text, time) {
  const li = getMessageComponent(id, userId, name, text, time);
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
  userList.innerHTML = getUserList(users);
}

// UPDATE: Show active room in the server
function showRooms(rooms) {
  roomList.innerHTML = getRoomList(rooms);
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
