const socket = io();

let selectedColor = null;
let currentRoom = null;

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const startBtn = document.getElementById("startBtn");
const lobbyPlayers = document.getElementById("lobbyPlayers");

document.querySelectorAll(".colorOption").forEach(el => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".colorOption")
      .forEach(c => c.classList.remove("selected"));

    el.classList.add("selected");
    selectedColor = el.dataset.color;
  });
});

joinBtn.addEventListener("click", () => {

  const name = nameInput.value.trim();
  const room = roomInput.value.trim();

  if (!name || !room || !selectedColor) {
    alert("Заполните имя, комнату и выберите цвет");
    return;
  }

  currentRoom = room;

  socket.emit("joinRoom", {
    name,
    roomCode: room,
    color: selectedColor
  });

});

socket.on("updateLobby", (data) => {

  lobbyPlayers.innerHTML = "";

  data.players.forEach(p => {
    const div = document.createElement("div");
    div.className = "playerItem";
    div.innerHTML = `
      <span style="color:${p.color}">●</span>
      ${p.name}
    `;
    lobbyPlayers.appendChild(div);
  });

  if (socket.id === data.host && data.players.length >= 2) {
    startBtn.classList.remove("hidden");
  } else {
    startBtn.classList.add("hidden");
  }

});

startBtn.addEventListener("click", () => {
  socket.emit("startGame", currentRoom);
});

socket.on("gameStarted", () => {
  window.location.href = "/game.html?room=" + currentRoom;
});

socket.on("roomFull", () => alert("Комната заполнена"));
socket.on("alreadyStarted", () => alert("Игра уже началась"));
