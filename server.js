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
players:[]
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


socket.on("rollDice",(roomCode)=>{

const room=rooms[roomCode];
if(!room) return;

const player=
room.players.find(p=>p.id===socket.id);

if(!player) return;

const dice=Math.floor(Math.random()*6)+1;

player.position+=dice;

if(player.position>20)
player.position%=21;

/* ===== HYPE ===== */

player.hype+=dice;

io.to(roomCode).emit("diceRolled",{
dice,
players:room.players
});

});


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

});

});

server.listen(process.env.PORT||3000);
