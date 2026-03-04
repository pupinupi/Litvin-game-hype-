const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const params = new URLSearchParams(window.location.search);
const room = params.get("room");

let roomState = null;

function resizeCanvas() {
  const size = window.innerWidth * 0.95; // БЕЗ лимита 500
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const boardImg = new Image();
boardImg.src = "board.jpg";

const basePath = [
{ x:89,y:599},
{ x:88,y:459},
{ x:80,y:366},
{ x:86,y:244},
{ x:95,y:133},
{ x:212,y:100},
{ x:358,y:93},
{ x:498,y:92},
{ x:638,y:106},
{ x:805,y:102},
{ x:925,y:129},
{ x:923,y:238},
{ x:940,y:353},
{ x:927,y:466},
{ x:913,y:586},
{ x:783,y:605},
{ x:641,y:604},
{ x:501,y:609},
{ x:350,y:610},
{ x:228,y:600}
];

let path = [];

function scalePath() {
  const scale = canvas.width / 1024;
  path = basePath.map(p => ({
    x: p.x * scale,
    y: p.y * scale
  }));
}

boardImg.onload = () => {
  scalePath();
  draw();
};

function draw() {
  if (!roomState) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);

  const cellRadius = canvas.width * 0.035; 
  const tokenRadius = cellRadius * 0.3;   // 🔥 30% клетки

  roomState.players.forEach(player => {
    const p = path[player.position];

    ctx.beginPath();
    ctx.arc(p.x, p.y, tokenRadius, 0, Math.PI*2);
    ctx.fillStyle = player.color;
    ctx.fill();
  });
}

socket.on("updateGame", (roomData) => {
  roomState = roomData;
  updatePlayersPanel();
  draw();
});

socket.on("diceRolled", (roll) => {
  document.getElementById("messageBox").innerText =
    "Выпало: " + roll;
});

socket.on("message", (msg) => {
  document.getElementById("messageBox").innerText = msg;
});

function updatePlayersPanel() {
  const panel = document.getElementById("playersPanel");
  panel.innerHTML = "";

  roomState.players.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span style="color:${p.color}">●</span>
      ${p.name} (${p.hype})
    `;
    panel.appendChild(div);
  });
}

document.getElementById("diceBtn").onclick = () => {
  socket.emit("rollDice", room);
};
