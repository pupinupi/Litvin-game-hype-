const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
cors:{origin:"*"}
});

app.use(express.static("public"));

/* ================= ROOMS ================= */

const rooms={};

io.on("connection",(socket)=>{

console.log("USER CONNECTED",socket.id);

/* ===== JOIN ROOM ===== */

socket.on("joinRoom",({name,roomCode,color})=>{

if(!rooms[roomCode]){
rooms[roomCode]={
host:socket.id,
players:[],
turn:0
};
}

const room=rooms[roomCode];

if(room.players.find(p=>p.color===color)){
socket.emit("colorTaken");
return;
}

const player={
id:socket.id,
name,
color,
position:0,
hype:0
};

room.players.push(player);

socket.join(roomCode);

io.to(roomCode).emit("roomUpdate",room);
});

/* ===== START GAME ===== */

socket.on("startGame",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

if(socket.id!==room.host) return;

io.to(roomCode).emit("gameStarted");
});

/* ===== ROLL DICE ===== */

socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

const dice=Math.floor(Math.random()*6)+1;

const player=room.players[room.turn];
player.position=
(player.position+dice)%20;

room.turn=
(room.turn+1)%room.players.length;

io.to(roomCode).emit("diceRolled",dice);
io.to(roomCode).emit("roomUpdate",room);
});

/* ===== DISCONNECT ===== */

socket.on("disconnect",()=>{

for(const code in rooms){

rooms[code].players=
rooms[code].players.filter(
p=>p.id!==socket.id
);

io.to(code).emit(
"roomUpdate",
rooms[code]
);
}

console.log("DISCONNECTED",socket.id);
});

});

/* ===== PORT ===== */

const PORT=process.env.PORT||3000;

server.listen(PORT,()=>{
console.log("SERVER STARTED",PORT);
});
