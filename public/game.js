const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

document.getElementById("roomCode").innerText = room;

socket.emit("joinRoom", { name, roomCode: room, color });

let players = [];
let turn = 0;

const CELL_POSITIONS = [
{ x:110,y:597},{x:99,y:450},{x:80,y:345},{x:99,y:232},{x:99,y:133},
{x:218,y:97},{x:348,y:91},{x:500,y:88},{x:624,y:102},{x:762,y:91},
{x:895,y:130},{x:912,y:204},{x:912,y:337},{x:909,y:425},{x:901,y:580},
{x:771,y:588},{x:641,y:588},{x:483,y:594},{x:331,y:586},{x:218,y:594}
];

function getScale(){
  const board = document.getElementById("board");
  return board.clientWidth / 1024;
}

socket.on("roomUpdate", (roomData)=>{
  players = roomData.players;
  turn = roomData.turn;

  renderLobby();
  renderPlayers();
  controlStartButton();
});

socket.on("gameStarted", ()=>{
  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";
});

socket.on("diceRolled", (dice)=>{
  const cube = document.getElementById("cube");
  cube.style.transition = "transform .4s ease";
  cube.style.transform = "rotate(360deg)";
  setTimeout(()=>{
    cube.style.transform = "rotate(0deg)";
    cube.innerText = dice;
  },400);
});

function renderLobby(){
  const list = document.getElementById("playersList");
  list.innerHTML = "";
  players.forEach(p=>{
    list.innerHTML += `<div>${p.name}</div>`;
  });
}

function controlStartButton(){
  const btn = document.getElementById("startBtn");

  if(players.length === 0){
    btn.style.display = "none";
    return;
  }

  // кнопку видит только первый игрок
  if(players[0].id === socket.id){
    btn.style.display = "inline-block";
  } else {
    btn.style.display = "none";
  }
}

function renderPlayers(){
  const board = document.getElementById("board");
  board.querySelectorAll(".token").forEach(t=>t.remove());

  const scale = getScale();

  players.forEach((p,i)=>{
    const pos = CELL_POSITIONS[p.position];
    const token = document.createElement("div");
    token.className = "token";
    token.style.background = p.color;
    token.style.left = (pos.x * scale) + "px";
    token.style.top = (pos.y * scale + i*6) + "px";
    board.appendChild(token);
  });
}

function roll(){
  socket.emit("rollDice", room);
}

document.getElementById("startBtn").onclick = ()=>{
  socket.emit("startGame", room);
};
