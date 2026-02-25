const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

const playersDiv = document.getElementById("players");
const startBtn = document.getElementById("startBtn");

socket.emit("joinRoom", {
    name,
    roomCode: room,
    color
});

socket.on("roomUpdate", (roomData) => {

    playersDiv.innerHTML = "";

    roomData.players.forEach(player => {

        const div = document.createElement("div");
        div.innerText = player.name;
        div.style.background = player.color;
        div.style.padding = "10px";
        div.style.margin = "5px";
        div.style.borderRadius = "8px";

        playersDiv.appendChild(div);
    });

    if (roomData.players.length >= 2) {
        startBtn.disabled = false;
    }
});

function startGame() {
    socket.emit("startGame", room);
}

socket.on("gameStarted", () => {
    window.location.href = "game.html";
});
