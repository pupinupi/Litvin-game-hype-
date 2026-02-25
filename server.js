const socket = io(window.location.origin,{
transports:["websocket","polling"]
});

const name=localStorage.getItem("name");
const room=localStorage.getItem("room");
const color=localStorage.getItem("color");

document.getElementById("roomCode").innerText=room;

socket.emit("joinRoom",{name,roomCode:room,color});

const lobby=document.getElementById("lobby");
const game=document.getElementById("game");
const board=document.getElementById("board");

const playersList=document.getElementById("playersList");
const playersDiv=document.getElementById("players");

const startBtn=document.getElementById("startBtn");
const rollBtn=document.getElementById("rollBtn");
const cube=document.getElementById("cube");

let players=[];
let turn=0;
let myId=null;
let hostId=null;

socket.on("connect",()=>{
myId=socket.id;
});

startBtn.onclick=()=>{
socket.emit("startGame",room);
};

rollBtn.onclick=()=>{
socket.emit("rollDice",room);
};

socket.on("gameStarted",()=>{
lobby.style.display="none";
game.style.display="block";
});

socket.on("roomUpdate",(roomData)=>{

players=roomData.players;
turn=roomData.turn;
hostId=roomData.host;

renderLobby();
renderPlayers();
updateHostUI();
});

socket.on("diceRolled",(dice)=>{
cube.innerText=dice;
});

/* ================= LOBBY ================= */

function renderLobby(){

playersList.innerHTML="";

players.forEach(p=>{
playersList.innerHTML+=`
<div class="playerCard">
${p.name}
</div>`;
});
}

/* ================= HOST ================= */

function updateHostUI(){

if(myId===hostId){
startBtn.disabled=false;
startBtn.innerText="👑 Начать игру";
}else{
startBtn.disabled=true;
startBtn.innerText="Ожидание хоста...";
}
}

/* ================= BOARD ================= */

const CELL_POSITIONS=[
{x:110,y:597},{x:99,y:450},{x:80,y:345},{x:99,y:232},
{x:99,y:133},{x:218,y:97},{x:348,y:91},{x:500,y:88},
{x:624,y:102},{x:762,y:91},{x:895,y:130},{x:912,y:204},
{x:912,y:337},{x:909,y:425},{x:901,y:580},{x:771,y:588},
{x:641,y:588},{x:483,y:594},{x:331,y:586},{x:218,y:594}
];

function renderPlayers(){

board.querySelectorAll(".token")
.forEach(t=>t.remove());

players.forEach(p=>{

const pos=CELL_POSITIONS[p.position];
if(!pos) return;

const token=document.createElement("div");
token.className="token";

token.style.background=p.color;
token.style.left=pos.x+"px";
token.style.top=pos.y+"px";

board.appendChild(token);
});

renderScore();
}

function renderScore(){

playersDiv.innerHTML="";

players.forEach((p,i)=>{
playersDiv.innerHTML+=`
<div class="playerCard"
style="border:${i===turn?'2px solid #ff2e88':'none'}">
${p.name}: ${p.hype}
</div>`;
});
}
