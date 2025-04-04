const socket = io('ws://localhost:3500')


const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')

const activity = document.querySelector('.activity')
const userList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

// send message to server
function sendMessage(e){
    e.preventDefault()
    if(msgInput.value && nameInput.value && chatRoom.value){
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value,
            
        })
        msgInput.value = ""
    }
    msgInput.focus()
}

// send room name that user want to join to server
function enterRoom(e){
    e.preventDefault()
    if(nameInput.value && chatRoom.value){
        socket.emit(
            'enterRoom', {
                name: nameInput.value,
                room: chatRoom.value
            }
        )
    }
}


// LISTEN ON FRONTEND

// listen for submit message event
document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

// listen for join room event
document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

// listen for typing event
msgInput.addEventListener('keypress', () => {
        socket.emit('activity', nameInput.value)
    })



// LISTEN FROM SERVER

// listen for a message
socket.on('message', (data)=> {
    activity.textContent = ""
    const {name, text, time} = data
    showMessage(name, text, time)
})

// listen for typing event from other user
let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    // clear after 10 sec
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 10000)
})

// listen for user list in the room
socket.on('userList', ({users}) =>{
    showUsers(users)
})

// listen for active room in the server
socket.on('roomList', ({rooms}) =>{
    showRooms(rooms)
})



// FUNCTION FOR SHOWING INCOMING DATA TO FRONEND

// show message to user
function showMessage(name, text, time){
    const li = document.createElement('li')
    li.className = 'post'
    if(name === nameInput.value) li.className = 'post post--right'
    if(name !== nameInput.value && name !== 'Admin') li.className = 'post post--left'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name===
        nameInput.value 
        ? 'post__header--user'
        : 'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>
        `
    } else{
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
}

// show user list in the room
function showUsers(users){
    userList.textContent = ''
    if(users){
        userList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            userList.textContent += ` ${user.name}`
            if(users.length > 1 && i !== users.length -1){
                userList.textContent += `,`
            }
        })
    }
}


// show active room in the server
function showRooms(rooms){
    roomList.textContent = ''
    if(rooms){
        roomList.innerHTML = `<em>Active Rooms:</em>`
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if(rooms.length > 1 && i !== rooms.length -1){
                roomList.textContent += `,`
            }
        })
    }
}
