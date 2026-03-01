const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {

socket.on("joinRoom", ({name,roomCode,color})=>{

if(!rooms[roomCode]){
rooms[roomCode]={
players:[],
turn:0
};
}

const room=rooms[roomCode];

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

/* ===== DICE ===== */

socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

const dice=Math.floor(Math.random()*6)+1;

const player=
room.players[room.turn];

if(!player) return;

/* движение */
player.position+=dice;
player.position%=21;

/* HYPE */
player.hype+=dice*5;

/* победа */
if(player.hype>=100){
io.to(roomCode)
.emit("gameOver",player);
return;
}

/* следующий ход */
room.turn++;
room.turn%=room.players.length;

io.to(roomCode).emit(
"diceResult",
{
dice,
room
}
);

});

});

const PORT=process.env.PORT||3000;

server.listen(PORT,()=>{
console.log("Server running");
});
