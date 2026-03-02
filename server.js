const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

const rooms={};

io.on("connection",socket=>{

socket.on("joinRoom",data=>{

const {room,name,color}=data;

if(!rooms[room])
rooms[room]={players:[],turn:0};

rooms[room].players.push({
id:socket.id,
name,
color,
pos:0,
hype:0,
skip:false
});

socket.join(room);

io.to(room).emit(
"updatePlayers",
rooms[room].players
);

});


socket.on("rollDice",room=>{

const game=rooms[room];
if(!game)return;

let player=game.players[game.turn];

if(player.id!==socket.id)return;

if(player.skip){
player.skip=false;
nextTurn(game,room);
return;
}

const dice=Math.floor(Math.random()*6)+1;

io.to(room).emit("startMove",{
player:game.turn,
steps:dice
});

});


socket.on("finishMove",(room,index)=>{

const game=rooms[room];
const p=game.players[index];

function applyCell(p,room){

const scandalCards=[
"🔥 Перегрел аудиторию —1 хайп",
"🫣 Громкий заголовок —2 хайп",
"😱 Это монтаж —3 хайп",
"#️⃣ Меня взломали —3 хайп у всех",
"😮 Подписчики в шоке —2 хайп",
"🤫 Удаляй пока не поздно —1 хайп",
"🙄 Это контент —5 хайп и пропуск хода"
];

const cells=[
"start","+3","+2","scandal","risk","+2",
"scandal","+3","+5","zero",
"jail","+3","risk","+3","skip",
"+2","scandal","+8","zero","+4"
];

let cell=cells[p.pos];

if(cell.startsWith("+"))
p.hype+=Number(cell.replace("+",""));

if(cell==="skip")p.skip=true;

if(cell==="zero")p.hype=0;

if(cell==="jail"){
p.hype=Math.floor(p.hype/2);
p.skip=true;
}

if(cell==="risk"){
let r=Math.floor(Math.random()*6)+1;
p.hype+=r<=3?-5:5;
}

if(cell==="scandal"){

let text=
scandalCards[
Math.floor(Math.random()*scandalCards.length)
];

p.hype-=3;

io.to(room).emit(
"scandalPopup",
text
);
}

if(p.hype<0)p.hype=0;
}
