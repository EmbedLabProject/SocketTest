export function getGroupMessageComponent(id, userId, name, text, time) {
  const li = document.createElement("li");
  if (id === userId) {
    li.innerHTML = `<div class="flex flex-row justify-end w-full">
            <span class="post__header--name text-sm text-gray-500 font-medium">You</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            <p class="w-fit max-w-48 bg-green-300 rounded-lg px-3 py-1 break-all">${text}</p>
            </div>
            `;
  } else {
    li.innerHTML = `<div class="flex flex-row justify-start w-full">
            <span class="post__header--name font-medium text-sm text-gray-500">${name}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
            <p class="w-fit max-w-48 bg-white rounded-lg px-3 py-1 break-all">${text}</p>
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            </div>
            `;
  }
  return li;
}

export function getDirectMessageComponent(id, userId, name, text, time) {
  const li = document.createElement("li");
  if (id === userId) {
    li.innerHTML = `<div class="flex flex-row justify-end w-full">
            <span class="post__header--name text-sm text-gray-500 font-medium">You</span>
            <span class="post__header--name text-sm text-red-400 font-medium">{private}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            <p class="w-fit max-w-48 bg-green-500 rounded-lg px-3 py-1 break-all">${text}</p>
            </div>
            `;
  } else {
    li.innerHTML = `<div class="flex flex-row justify-start w-full">
            <span class="post__header--name font-medium text-sm text-gray-500">${name}</span>
            <span class="post__header--name text-sm text-red-400 font-medium">{private}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
            <p class="w-fit max-w-48 bg-blue-400 rounded-lg px-3 py-1 break-all">${text}</p>
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            </div>
            `;
  }
  return li;
}

export function getGroupStickerComponent(id, userId, name, stickerId, time) {
  // console.log(stickerId);
  let imgsrc = "";
  switch (stickerId) {
    case "OIIA":
      imgsrc = "./OIIA.gif";
      break;
    case "Hamtaro":
      imgsrc = "./hamtaro.gif";
      break;

    case "Rickroll":
      imgsrc = "./rickroll.gif";
      break;

    default:
      imgsrc = "./OIIA.gif";
  }

  const li = document.createElement("li");
  if (id === userId) {
    li.innerHTML = `<div class="flex flex-row justify-end w-full">
            <span class="post__header--name text-sm text-gray-500 font-medium">You</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            <img src="${imgsrc}" alt="Animated GIF" class="w-56 h-56 object-cover" />
            </div>
            `;
  } else {
    li.innerHTML = `<div class="flex flex-row justify-start w-full">
            <span class="post__header--name font-medium text-sm text-gray-500">${name}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
            <img src="${imgsrc}" alt="Animated GIF" class="w-56 h-56 object-cover" />
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            </div>
            `;
  }
  return li;
}

export function getDirectStickerComponent(id, userId, name, stickerId, time) {
  // console.log(stickerId);
  let imgsrc = "";
  switch (stickerId) {
    case "OIIA":
      imgsrc = "./OIIA.gif";
      break;
    case "Hamtaro":
      imgsrc = "./hamtaro.gif";
      break;

    case "Rickroll":
      imgsrc = "./rickroll.gif";
      break;

    default:
      imgsrc = "./OIIA.gif";
  }

  const li = document.createElement("li");
  if (id === userId) {
    li.innerHTML = `<div class="flex flex-row justify-end w-full">
            <span class="post__header--name text-sm text-gray-500 font-medium">You</span>
            <span class="post__header--name text-sm text-red-400 font-medium">{private}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-end w-full">
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            <img src="${imgsrc}" alt="Animated GIF" class="w-56 h-56 object-cover" />
            </div>
            `;
  } else {
    li.innerHTML = `<div class="flex flex-row justify-start w-full">
            <span class="post__header--name font-medium text-sm text-gray-500">${name}</span>
            <span class="post__header--name text-sm text-red-400 font-medium">{private}</span>
            </div>
            <div class="post__text flex flex-row mt-1 my-3 gap-2 items-end justify-start w-full">
            <img src="${imgsrc}" alt="Animated GIF" class="w-56 h-56 object-cover" />
            <p class="post__header--time font-light text-xs text-gray-500">${time}</p>
            </div>
            `;
  }
  return li;
}

export function getSuperBoardcastComponent(text) {
  const box = document.createElement("div");
  box.className =
    "w-fit bg-blue-700 rounded-3xl px-3 py-1 break-all text-white mt-4 transition-all duration-500 transform -translate-y-full opacity-0 pointer-events-auto";
  box.innerHTML = text;
  return box;
}

export function getBroadcastComponent(text) {
  const li = document.createElement("li");
  li.innerHTML = `<div class="flex post__text w-full justify-center mt-3"><p class="w-fit bg-slate-500 px-3 py-1 rounded-full text-white">${text}</p></div>`;
  return li;
}

export function getRoomList(rooms) {
  let list = ``;
  if (rooms) {
    rooms.forEach((room, i) => {
      list += `<li>${room}</li>`;
    });
  }
  return list;
}

export function getUserList(users) {
  let list = ``;
  if (users) {
    users.forEach((user, i) => {
      list += `<li>${user.name}</li>`;
    });
  }
  return list;
}

export function getChatList(users, userId) {
  let list = `<option id="group">[Group Chat]</option>`;
  if (users) {
    users.forEach((user, i) => {
      if (user.id !== userId)
        list += `<option id=${user.id}>${user.name}</option>`;
    });
  }
  return list;
}


export function getAlertComponent(text) {
  const box = document.createElement("div");
  box.className =
    "w-fit max-w-[90%] bg-red-600 rounded-3xl px-4 py-2 break-words text-white mt-4 transition-all duration-500 transform -translate-y-4 opacity-0 pointer-events-auto shadow-md z-50";
  box.innerHTML = text;
  return box
}
