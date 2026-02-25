const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};
const MAX_PLAYERS = 4;

/* ================= CELLS ================= */

const CELLS=[
"start","+3","+2","scandal","risk","+2",
"scandal","+3","+5","zero",
"jail","+3","risk","+3",
"skip","+2","scandal","+8","zero","+4"
];

/* ================= CARDS ================= */

const scandalCards=[
{ text:"Скандал в СМИ",value:-3 },
{ text:"Поддержка фанатов",value:+4 },
{ text:"Это монтаж!",value:-5 },
{ text:"Вирусный клип",value:+6 }
];

/* ================= CONNECTION ================= */

io.on("connection",(socket)=>{

/* ===== JOIN ===== */

socket.on("joinRoom",({name,roomCode,color})=>{

if(!rooms[roomCode]){
rooms[roomCode]={
players:[],
turn:0,
started:false,
host:socket.id
};
}

const room=rooms[roomCode];

if(room.started) return;
if(room.players.length>=MAX_PLAYERS) return;

/* ✅ COLOR LOCK */
const taken=room.players.find(p=>p.color===color);
if(taken){
socket.emit("colorTaken");
return;
}

room.players.push({
id:socket.id,
name,
color,
position:0,
hype:0,
skip:false
});

socket.join(roomCode);

sendRoom(roomCode);
});


/* ===== START GAME ===== */

socket.on("startGame",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

if(socket.id!==room.host) return;
if(room.players.length<2) return;

room.started=true;

io.to(roomCode).emit("gameStarted");
sendRoom(roomCode);

});


/* ===== ROLL DICE ===== */

socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room || !room.started) return;

const player=room.players[room.turn];
if(!player || player.id!==socket.id) return;

/* SKIP TURN */
if(player.skip){
player.skip=false;
nextTurn(room);
sendRoom(roomCode);
return;
}

const dice=Math.floor(Math.random()*6)+1;

player.position+=dice;
if(player.position>=CELLS.length)
player.position%=CELLS.length;

/* ✅ FIX dice */
io.to(roomCode).emit("diceRolled",{dice});

handleCell(player,room,roomCode,dice);

sendRoom(roomCode);

});


/* ===== DISCONNECT ===== */

socket.on("disconnect",()=>{

for(const roomCode in rooms){

const room=rooms[roomCode];

const i=room.players.findIndex(
p=>p.id===socket.id
);

if(i===-1) continue;

room.players.splice(i,1);

if(room.host===socket.id && room.players.length)
room.host=room.players[0].id;

if(room.turn>=room.players.length)
room.turn=0;

if(room.players.length===0){
delete rooms[roomCode];
continue;
}

sendRoom(roomCode);
}
});

});

/* ================= GAME LOGIC ================= */

function handleCell(player,room,roomCode,dice){

const cell=CELLS[player.position];

if(cell==="+2")player.hype+=2;
if(cell==="+3")player.hype+=3;
if(cell==="+4")player.hype+=4;
if(cell==="+5")player.hype+=5;
if(cell==="+8")player.hype+=8;

if(cell==="zero")player.hype=0;
if(cell==="skip")player.skip=true;

if(cell==="jail"){
player.hype=Math.max(0,player.hype-5);
player.skip=true;
}

if(cell==="risk"){

if(dice<=3){
player.hype=Math.max(0,player.hype-2);
}else{
player.hype+=2;
}

}

if(cell==="scandal"){

const card=
scandalCards[
Math.floor(Math.random()*scandalCards.length)
];

player.hype=Math.max(
0,
player.hype+card.value
);

io.to(roomCode).emit("scandalCard",card);
}

/* WIN */

if(player.hype>=50){
io.to(roomCode).emit("gameOver",player);
room.started=false;
return;
}

nextTurn(room);
}

/* ================= HELPERS ================= */

function nextTurn(room){
room.turn++;
if(room.turn>=room.players.length)
room.turn=0;
}

/* ✅ ONE FORMAT FOR CLIENT */

function sendRoom(roomCode){

const room=rooms[roomCode];

io.to(roomCode).emit("updatePlayers",{
players:room.players,
turn:room.turn,
host:room.host
});
}

http.listen(3000,()=>{
console.log("SERVER RUNNING ✅");
});
