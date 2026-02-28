const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

const rooms={};

io.on("connection",(socket)=>{

socket.on("joinRoom",({name,roomCode,color})=>{

if(!rooms[roomCode]){
rooms[roomCode]={
players:[],
turn:0
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
hype:0
});

socket.join(roomCode);

io.to(roomCode).emit("roomUpdate",room);
});


/* ========= ROLL ========= */

socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

const currentPlayer=
room.players[room.turn];

if(!currentPlayer ||
currentPlayer.id!==socket.id)
return;

const dice=
Math.floor(Math.random()*6)+1;

currentPlayer.position+=dice;

if(currentPlayer.position>20)
currentPlayer.position%=21;

currentPlayer.hype+=dice;

/* NEXT TURN */
room.turn++;
if(room.turn>=room.players.length)
room.turn=0;

io.to(roomCode).emit("diceRolled",{
dice,
room
});

});


socket.on("disconnect",()=>{

for(const code in rooms){

const room=rooms[code];

room.players=
room.players.filter(
p=>p.id!==socket.id
);

if(room.turn>=room.players.length)
room.turn=0;

io.to(code).emit(
"roomUpdate",
room
);

}

});

});

server.listen(process.env.PORT||3000);
