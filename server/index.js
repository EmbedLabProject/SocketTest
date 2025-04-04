import express from 'express'
import {Server} from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
const ADMIN = "Admin"

const app = express()

app.use(express.static(path.join(__dirname, "public")))



const expressServer = app.listen(PORT, () =>{
    console.log(`listening on port ${PORT}`)
})

// state
const UserState = {
    users: [],
    setUsers: function (newUserArray) {
        this.users = newUserArray
    }
}


const io = new Server(expressServer, {
    cors:{
        origin: process.env.NODE_ENV === "production" ? false : 
        ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user
    socket.emit('message', buildMsg(ADMIN, "Welcome to Chat App!"))

    socket.on('enterRoom', ({name, room}) =>{
        //leave prev room
        console.log(`${name} enter room ${room}`)
        const prevRoom = getUser(socket.id)?.room

        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room)

        // cannot update previous room users list until after the state update in activate user
        if(prevRoom){
            io.to(prevRoom).emit('userList', {
                users: getUserInRoom(prevRoom)
            })
        }

        // join room
        socket.join(user.room)

        // To user who joined
        socket.emit('message', buildMsg(ADMIN, `You have joined the ${user.room} chat room`))

        // To everyone else
        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))

        // Update user list for room
        io.to(user.room).emit('userList', {
            users: getUserInRoom(user.room)
        })

        // Update room list for evryone
        io.emit('roomList', {
            rooms: getAllActiveRoom()
        })
    })
    // Upon connection - only to all others
    // socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} connected`)

    // When user disconnects - to all others
    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)
        
        if(user){
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit('userList', {
                users: getUserInRoom(user.room)
            })

            io.emit('roomList', {
                rooms: getAllActiveRoom()
            })
            
        }
        console.log(`User ${socket.id} disconnected`)
    })

    // Listening for a message event
    socket.on('message', ({name, text}) =>{
        
        const room = getUser(socket.id)?.room
        if(room){
            console.log(`${text} from ${name} in ${room}`)
            io.to(room).emit('message', buildMsg(name,text))
        }
    })
    
    // Listen for activity
    socket.on('activity', (name) => {
        
        const room = getUser(socket.id)?.room
        if(room){
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})

function buildMsg(name, text){
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default',{
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date()),
    }
}


// User function
function activateUser(id, name, room){
    const user = {id, name, room}
    UserState.setUsers([
        ...UserState.users.filter(user => user.id !== id),
        user])
        return user
}

function userLeavesApp(id){
    UserState.setUsers(
        UserState.users.filter(user => user.id !== id)
    )
}

function getUser(id) {
    return UserState.users.find(user => user.id === id)
}

function getUserInRoom(room) {
    return UserState.users.filter(user => user.room === room)
}

function getAllActiveRoom(){
    return Array.from(new Set(UserState.users.map(user => user.room)))
}