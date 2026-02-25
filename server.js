const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};
const MAX_PLAYERS = 4;

const CELLS = [
"start","+3","+2","scandal","risk","+2","scandal","+3","+5","zero",
"jail","+3","risk","+3","skip","+2","scandal","+8","zero","+4"
];

const scandalCards=[
{ text:"Скандал в СМИ",value:-3 },
{ text:"Поддержка фанатов",value:4 },
{ text:"Это монтаааж!",value:-5 },
{ text:"Вирусный клип",value:6 }
];

io.on("connection",(socket)=>{

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

if(room.players.find(p=>p.color===color)){
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

io.to(roomCode).emit("roomUpdate",room);
});

socket.on("startGame",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

if(socket.id!==room.host) return;
if(room.players.length<2) return;

room.started=true;

io.to(roomCode).emit("gameStarted");
io.to(roomCode).emit("roomUpdate",room);
});

socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room||!room.started) return;

const player=room.players[room.turn];
if(!player||player.id!==socket.id) return;

if(player.skip){
player.skip=false;
nextTurn(room);
io.to(roomCode).emit("roomUpdate",room);
return;
}

const dice=Math.floor(Math.random()*6)+1;

player.position+=dice;
player.position%=CELLS.length;

io.to(roomCode).emit("diceRolled",dice);

handleCell(player,room,roomCode,dice);

io.to(roomCode).emit("roomUpdate",room);
});

socket.on("disconnect",()=>{

for(const code in rooms){

const room=rooms[code];
const i=room.players.findIndex(p=>p.id===socket.id);
if(i===-1) continue;

room.players.splice(i,1);

if(room.host===socket.id && room.players.length){
room.host=room.players[0].id;
}

if(room.turn>=room.players.length){
room.turn=0;
}

if(room.players.length===0){
delete rooms[code];
}else{
io.to(code).emit("roomUpdate",room);
}
}
});

});

function handleCell(player,room,roomCode,dice){

const cell=CELLS[player.position];

if(cell==="+2") player.hype+=2;
if(cell==="+3") player.hype+=3;
if(cell==="+4") player.hype+=4;
if(cell==="+5") player.hype+=5;
if(cell==="+8") player.hype+=8;

if(cell==="zero") player.hype=0;
if(cell==="skip") player.skip=true;

if(cell==="jail"){
player.hype=Math.max(0,player.hype-5);
player.skip=true;
}

if(cell==="risk"){
player.hype+=dice<=3?-2:2;
}

if(cell==="scandal"){
const card=scandalCards[
Math.floor(Math.random()*scandalCards.length)
];
player.hype=Math.max(0,player.hype+card.value);
}

nextTurn(room);
}

function nextTurn(room){
room.turn++;
if(room.turn>=room.players.length)
room.turn=0;
}

http.listen(3000,()=>{
console.log("SERVER RUNNING");
});
