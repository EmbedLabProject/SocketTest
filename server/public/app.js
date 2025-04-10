const socket = io('ws://localhost:3500')


const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')

const activity = document.querySelector('.activity')
const userList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')
let username = ""


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
        username = nameInput.value
        console.log(username)
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
    console.log(name);
    const li = document.createElement('li')
    li.className = 'post'
    if(name === nameInput.value) li.className = 'post post--right'
    if(name !== nameInput.value && name !== 'Admin'){
        li.className = 'post post--left'
    } 
    if (name !== 'Admin') {
        if (name === username){
            li.innerHTML = `<div class="post__header ${name===
                nameInput.value 
                ? 'post__header--user'
                : 'post__header--reply'
                } flex flex-row justify-end w-full">
                <span class="post__header--name font-normal text-sm">You</span>
                </div>
                <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
                <p class="post__header--time font-light text-xs">${time}</p>
                <p class="w-fit max-w-48 bg-green-300 rounded-lg px-3 py-1 break-all">${text}</p>
                </div>
                `
        }
        else {
            li.innerHTML = `<div class="post__header ${name===
                nameInput.value 
                ? 'post__header--user'
                : 'post__header--reply'
                } flex flex-row justify-start w-full">
                <span class="post__header--name font-normal text-sm">${name}</span>
                </div>
                <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
                <p class="w-fit bg-white rounded-lg px-3 py-1">${text}</p>
                <p class="post__header--time font-light text-xs">${time}</p>
                </div>
                `
        }
        
    } else{
        li.innerHTML = `<div class="flex post__text w-full justify-center mt-3"><p class="w-fit bg-slate-500 px-3 py-1 rounded-full text-white">${text}</p></div>`
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
