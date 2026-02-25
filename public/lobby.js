const socket = io();

document.body.insertAdjacentHTML(
"beforeend",
`<div id="debug"
style="
position:fixed;
bottom:0;
left:0;
background:black;
color:#00ff88;
font-size:12px;
padding:10px;
z-index:9999;
width:100%;
max-height:200px;
overflow:auto;">
DEBUG START
</div>`
);

function log(msg){
document.getElementById("debug")
.innerHTML += "<br>"+msg;
}

log("Lobby JS loaded");

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

log("NAME: "+name);
log("ROOM: "+room);
log("COLOR: "+color);

const playersDiv = document.getElementById("players");
const startBtn = document.getElementById("startBtn");

socket.on("connect",()=>{
log("CONNECTED ✅");
});

log("sending joinRoom");

socket.emit("joinRoom",{
name,
roomCode:room,
color
});

socket.on("roomUpdate",(roomData)=>{
log("ROOM UPDATE RECEIVED players:"+roomData.players.length);

playersDiv.innerHTML="";

roomData.players.forEach(player=>{
const div=document.createElement("div");
div.innerText=player.name;
div.style.background=player.color;
div.style.padding="10px";
div.style.margin="5px";
playersDiv.appendChild(div);
});

if(roomData.players.length>=2){
startBtn.disabled=false;
}
});

function startGame(){
log("START CLICK");
socket.emit("startGame",room);
}

socket.on("gameStarted",()=>{
log("GAME STARTED");
window.location.href="game.html";
});
