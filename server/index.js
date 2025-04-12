import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// user state (collect all user in the socket)
const UserState = {
  users: [],
  setUsers: function (newUserArray) {
    this.users = newUserArray;
  },
};

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:3500", "http://127.0.0.1:3500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  // upon connection only to user
  socket.emit("broadcast", buildMsg("", "Welcome to Chat App!"));

  // when user are joining the room
  socket.on("enterRoom", ({ name, room }) => {
    //leave prev room
    console.log(`${name} enter room ${room}`);
    const prevRoom = getUser(socket.id)?.room;

    // notify user in prev room about leaving the room
    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        "broadcast",
        buildMsg("", `${name} has left the room`)
      );
    }

    // cannot update previous room users list until after the state update in activate user

    // update all user information (mainly fot room)
    const user = activateUser(socket.id, name, room);

    // update userlist in prev room
    if (prevRoom) {
      io.to(prevRoom).emit("userList", {
        users: getUserInRoom(prevRoom),
      });
    }

    // user join room
    socket.join(user.room);

    // notify to user who joined the room
    socket.emit(
      "broadcast",
      buildMsg("", `You have joined the ${user.room} chat room`)
    );

    // notify to everyone else in the room
    socket.broadcast
      .to(user.room)
      .emit("broadcast", buildMsg("", `${user.name} has joined the room`));

    // update user list for this room
    io.to(user.room).emit("userList", {
      users: getUserInRoom(user.room),
    });

    // update room list for everyone
    io.emit("roomList", {
      rooms: getAllActiveRoom(),
    });
  });

  // when user disconnects
  socket.on("disconnect", () => {
    // update user info
    const user = getUser(socket.id);
    userLeavesApp(socket.id);

    if (user) {
      // notify to all others in the room
      io.to(user.room).emit(
        "broadcast",
        buildMsg("", `${user.name} has left the room`)
      );

      // update user list
      io.to(user.room).emit("userList", {
        users: getUserInRoom(user.room),
      });

      // update room list
      io.emit("roomList", {
        rooms: getAllActiveRoom(),
      });
    }

    console.log(`User ${socket.id} disconnected`);
  });

  // listening for a message event
  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });

  // listen for activity
  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

// Message format
function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

// User function
function activateUser(id, name, room) {
  const user = { id, name, room };
  UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UserState.setUsers(UserState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UserState.users.find((user) => user.id === id);
}

function getUserInRoom(room) {
  return UserState.users.filter((user) => user.room === room);
}

function getAllActiveRoom() {
  return Array.from(new Set(UserState.users.map((user) => user.room)));
}
