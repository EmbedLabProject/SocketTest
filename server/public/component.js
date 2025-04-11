export function getMessageComponent(name, username, text, time){
    const li = document.createElement('li')
    if (name === 'Admin'){
        li.innerHTML = `<div class="flex post__text w-full justify-center mt-3"><p class="w-fit bg-slate-500 px-3 py-1 rounded-full text-white">${text}</p></div>`
    }

    else if (name === username){
        li.innerHTML = `<div class="flex flex-row justify-end w-full">
            <span class="post__header--name text-sm text-gray-500 font-medium">You</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            <p class="w-fit max-w-48 bg-green-300 rounded-lg px-3 py-1 break-all">${text}</p>
            </div>
            `
    }
    else {
        li.innerHTML = `<div class="flex flex-row justify-start w-full">
            <span class="post__header--name font-medium text-sm text-gray-500">${name}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
            <p class="w-fit max-w-48 bg-white rounded-lg px-3 py-1 break-all">${text}</p>
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            </div>
            `
    }
    return li
}

export function getRoomList(rooms){
    let list = ``
    if(rooms){
        rooms.forEach((room, i) => {
            list += `<li>${room}</li>`
        })
    }
    return list
}

export function getUserList(users){
    let list = ``
    if(users){
        users.forEach((user, i) => {
            list += `<li>${user.name}</li>`
        })
    }
    return list
}
