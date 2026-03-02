const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const scandalCards=[
{text:"🔥 перегрел аудиторию",hype:-1},
{text:"🫣 громкий заголовок",hype:-2},
{text:"😱 это монтаж",hype:-3},
{text:"#️⃣ меня взломали",hype:-3,all:true},
{text:"😮 подписчики в шоке",hype:-4},
{text:"🤫 удаляй пока не поздно",hype:-5},
{text:"🙄 это контент",hype:-5,skip:true}
];

const cells=[
"start","+2","scandal","+3","+5","jail",
"+3","risk","+3","court",
"+2","scandal","+8","scandal","+2",
"+3","+2","scandal","risk","+4"
];

io.on("connection",(socket)=>{

socket.on("joinRoom",(data)=>{

const {room,name,color}=data;

if(!rooms[room])
rooms[room]={players:[],turn:0};

rooms[room].players.push({
id:socket.id,
name,
color,
pos:0,
hype:0,
skip:false,
gainTurn:0
});

socket.join(room);
io.to(room).emit("updateLobby",rooms[room]);
});

socket.on("startGame",(room)=>{
const r=rooms[room];
r.players.sort(()=>Math.random()-0.5);
io.to(room).emit("gameStart",r);
});

socket.on("rollDice",(room)=>{

const r=rooms[room];
const p=r.players[r.turn];

if(p.skip){
p.skip=false;
nextTurn(room);
return;
}

const dice=Math.floor(Math.random()*6)+1;

p.pos=(p.pos+dice)%20;

applyCell(room,p);

io.to(room).emit("state",r,dice);
nextTurn(room);
});

function applyCell(room,p){

p.gainTurn=0;

const cell=cells[p.pos];

if(cell.startsWith("+")){
let val=parseInt(cell.replace("+",""));
p.hype+=val;
p.gainTurn+=val;
}

if(cell==="court") p.skip=true;

if(cell==="jail"){
p.hype=Math.floor(p.hype/2);
p.skip=true;
}

if(cell==="risk"){
let r=Math.floor(Math.random()*6)+1;
if(r<=3)p.hype=Math.max(0,p.hype-5);
else{
p.hype+=5;
p.gainTurn+=5;
}
}

if(cell==="scandal"){
let card=scandalCards[
Math.floor(Math.random()*scandalCards.length)
];

if(card.all){
rooms[room].players.forEach(pl=>{
pl.hype=Math.max(0,pl.hype+card.hype);
});
}else{
p.hype=Math.max(0,p.hype+card.hype);
}

if(card.skip)p.skip=true;

io.to(room).emit("scandal",card.text);
}

if(p.gainTurn>=8)p.skip=true;

if(p.hype>=100)
io.to(room).emit("winner",p.name);
}

function nextTurn(room){
const r=rooms[room];
r.turn=(r.turn+1)%r.players.length;
}

});

server.listen(process.env.PORT||3000);
