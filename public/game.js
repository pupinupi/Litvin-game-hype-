const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

document.getElementById("roomCode").innerText = room;

socket.emit("joinRoom",{name,roomCode:room,color});

/* ========= DOM ========= */

const lobby=document.getElementById("lobby");
const game=document.getElementById("game");
const board=document.getElementById("board");
const cube=document.getElementById("cube");
const playersDiv=document.getElementById("players");
const startBtn=document.getElementById("startBtn");
const rollBtn=document.getElementById("rollBtn");
const playersList=document.getElementById("playersList");
const turnInfo=document.getElementById("turnInfo");

/* ========= BOARD CELLS ========= */

const CELL_POSITIONS=[
{x:110,y:597},{x:99,y:450},{x:80,y:345},{x:99,y:232},
{x:99,y:133},{x:218,y:97},{x:348,y:91},{x:500,y:88},
{x:624,y:102},{x:762,y:91},{x:895,y:130},{x:912,y:204},
{x:912,y:337},{x:909,y:425},{x:901,y:580},{x:771,y:588},
{x:641,y:588},{x:483,y:594},{x:331,y:586},{x:218,y:594}
];

let roomState=null;

/* ========= START ========= */

startBtn.onclick=()=>{
socket.emit("startGame",room);
};

rollBtn.onclick=()=>{
socket.emit("rollDice",room);
};

/* ========= ROOM UPDATE ========= */

socket.on("roomUpdate",(room)=>{

roomState=room;

renderLobby(room);
renderBoard(room);
renderScores(room);
updateTurn(room);

});

/* ========= GAME START ========= */

socket.on("gameStarted",()=>{
lobby.style.display="none";
game.style.display="block";
});

/* ========= DICE ========= */

socket.on("diceRolled",(data)=>{
animateDice(data.dice);
});

function animateDice(value){

let r=0;

const spin=setInterval(()=>{
r+=40;
cube.style.transform=`rotate(${r}deg)`;
},20);

setTimeout(()=>{
clearInterval(spin);
cube.style.transform="rotate(0deg)";
cube.innerText=value;
},700);
}

/* ========= LOBBY UI ========= */

function renderLobby(room){

playersList.innerHTML="";

room.players.forEach((p,i)=>{

const div=document.createElement("div");
div.className="playerCard";

let text=p.name;

if(p.id===room.host)
text+=" 👑";

if(i===room.turn && room.started)
text+=" 🎲";

div.innerText=text;
div.style.color=p.color;

playersList.appendChild(div);

});

}

/* ========= BOARD ========= */

function renderBoard(room){

board.querySelectorAll(".token")
.forEach(t=>t.remove());

room.players.forEach(p=>{

const pos=CELL_POSITIONS[p.position];
if(!pos) return;

const token=document.createElement("div");
token.className="token";

token.style.background=p.color;
token.style.left=pos.x+"px";
token.style.top=pos.y+"px";

board.appendChild(token);

});

}

/* ========= SCORES ========= */

function renderScores(room){

playersDiv.innerHTML="";

room.players.forEach((p,i)=>{

playersDiv.innerHTML+=`
<div class="playerCard"
style="border:${i===room.turn?'2px solid yellow':'none'}">
${p.name}: ${p.hype} hype
</div>`;

});

}

/* ========= TURN ========= */

function updateTurn(room){

const current=room.players[room.turn];

if(!current) return;

turnInfo.innerText=
"Ход игрока: "+current.name;

const myTurn=current.name===name;

rollBtn.disabled=!myTurn;

}

/* ========= ERRORS ========= */

socket.on("roomFull",()=>alert("Комната заполнена"));
socket.on("colorTaken",()=>alert("Фишка занята"));
socket.on("notEnoughPlayers",()=>alert("Нужно минимум 2 игрока"));
