import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { SocketAddress } from "net";

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
  const user = activateUser(socket.id, "", "");

  // upon connection only to user
  socket.emit("setId", { id: socket.id });
  socket.emit("broadcast", buildMsg("", "", "Welcome to Chat App!"));

  // when user are joining the room
  socket.on("enterRoom", ({ room }) => {
    //leave prev room
    const name = getUser(socket.id)?.name;

    const user = activateUser(socket.id, name, room);

    socket.join(user.room);

    socket.emit(
      "broadcast",
      buildMsg("", "", `You have joined the ${user.room} chat room`)
    );

    socket.broadcast
      .to(user.room)
      .emit("broadcast", buildMsg("", "", `${user.name} has joined the room`));

    io.to(user.room).emit("userGroupList", {
      users: getUserInRoom(user.room),
    });

    io.emit("roomList", {
      rooms: getAllActiveRoom(),
    });

    io.emit("userList", {
      users: getAllUser(),
    });

    console.log(`${socket.id}(${name}) enter room ${room}`);
  });

  socket.on("leaveRoom", () => {
    const room = getUser(socket.id)?.room;
    const name = getUser(socket.id)?.name;

    // notify user in prev room about leaving the room
    if (!room) return;

    const user = activateUser(socket.id, name, "");

    socket.leave(room);

    io.to(room).emit(
      "broadcast",
      buildMsg("", "", `${name} has left the room`)
    );

    io.to(room).emit("userGroupList", {
      users: getUserInRoom(room),
    });

    io.emit("roomList", {
      rooms: getAllActiveRoom(),
    });

    io.emit("userList", {
      users: getAllUser(),
    });

    console.log(`${socket.id}(${name}) leave room ${room}`);
  });

  socket.on("changeName", ({ name }) => {
    const room = getUser(socket.id)?.room;
    const oldName = getUser(socket.id)?.name;

    if (oldName === "") {
      io.emit("superBroadcast", buildMsg("", "", `${name} has connected`));
    }

    const user = activateUser(socket.id, name, room);

    if (room) {
      io.emit(
        "superBroadcast",
        buildMsg("", "", `${oldName} has change name to ${name}`)
      );
    }

    io.to(room).emit("userGroupList", {
      users: getUserInRoom(room),
    });

    io.emit("roomList", {
      rooms: getAllActiveRoom(),
    });

    io.emit("userList", {
      users: getAllUser(),
    });

    console.log(`${oldName} has change name to ${name} in room ${room}`);
  });

  // when user disconnects
  socket.on("disconnect", () => {
    // update user info
    const user = getUser(socket.id);
    if (user.name !== "") {
      io.emit(
        "superBroadcast",
        buildMsg("", "", `${user.name} has disconnected`)
      );
    }

    userLeavesApp(socket.id);

    if (user) {
      // notify to all others in the room
      io.to(user.room).emit(
        "broadcast",
        buildMsg("", "", `${user.name} has left the room`)
      );

      // update user list
      io.to(user.room).emit("userGroupList", {
        users: getUserInRoom(user.room),
      });

      // update room list
      io.emit("roomList", {
        rooms: getAllActiveRoom(),
      });

      io.emit("userList", {
        users: getAllUser(),
      });
    }

    console.log(`User ${socket.id} disconnected`);
  });

  // listening for a message event
  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildMsg(socket.id, name, text));
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
function buildMsg(id, name, text) {
  return {
    id,
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

function getAllUser() {
  return UserState.users;
}

function getAllActiveRoom() {
  return Array.from(new Set(UserState.users.map((user) => user.room)));
}
