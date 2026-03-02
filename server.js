const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req,res)=>{
res.sendFile(__dirname+"/public/index.html");
});

app.get("/game",(req,res)=>{
res.sendFile(__dirname+"/public/game.html");
});

const rooms = {};

const scandalCards = [
{ text:"🔥 перегрел аудиторию", hype:-1 },
{ text:"🫣 громкий заголовок", hype:-2 },
{ text:"😱 это монтаж", hype:-3 },
{ text:"#️⃣ меня взломали", hype:-3, all:true },
{ text:"😮 подписчики в шоке", hype:-4 },
{ text:"🤫 удаляй пока не поздно", hype:-5 },
{ text:"🙄 это контент", hype:-5, skip:true }
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
rooms[room]={players:[],turn:0,started:false};

if(rooms[room].players.length>=4) return;

rooms[room].players.push({
id:socket.id,
name,
color,
pos:0,
hype:0,
skip:false
});

socket.join(room);

io.to(room).emit("lobby",rooms[room]);
});

socket.on("startGame",(room)=>{

const r=rooms[room];
if(!r) return;

r.started=true;
r.players.sort(()=>Math.random()-0.5);

io.to(room).emit("gameStart",r);
});

socket.on("rollDice",(room)=>{

const r=rooms[room];
if(!r) return;

const player=r.players[r.turn];

if(player.id!==socket.id) return;

if(player.skip){
player.skip=false;
nextTurn(room);
return;
}

const dice=Math.floor(Math.random()*6)+1;

movePlayer(room,player,dice);
});

function movePlayer(room,p,steps){

const r=rooms[room];
let i=0;

const interval=setInterval(()=>{

p.pos=(p.pos+1)%20;

io.to(room).emit("state",r);

i++;

if(i>=steps){
clearInterval(interval);
applyCell(room,p);
nextTurn(room);
}

},350);
}

function applyCell(room,p){

const r=rooms[room];
const cell=cells[p.pos];

if(cell.startsWith("+")){
p.hype+=parseInt(cell.replace("+",""));
}

if(cell==="court") p.skip=true;

if(cell==="jail"){
p.hype=Math.floor(p.hype/2);
p.skip=true;
}

if(cell==="risk"){
const roll=Math.floor(Math.random()*6)+1;
p.hype=Math.max(0,p.hype+(roll<=3?-5:5));
}

if(cell==="scandal"){

const card=
scandalCards[Math.floor(
Math.random()*scandalCards.length
)];

if(card.all){
r.players.forEach(pl=>{
pl.hype=Math.max(0,pl.hype+card.hype);
});
}else{
p.hype=Math.max(0,p.hype+card.hype);
}

if(card.skip) p.skip=true;

io.to(room).emit("scandal",card.text);
}

if(p.hype>=100)
io.to(room).emit("winner",p.name);
}

function nextTurn(room){

const r=rooms[room];
r.turn=(r.turn+1)%r.players.length;

io.to(room).emit("state",r);
}

});

server.listen(process.env.PORT || 3000,()=>{
console.log("Server started");
});
