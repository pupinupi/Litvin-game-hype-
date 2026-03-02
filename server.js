const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};

io.on("connection", socket => {

socket.on("joinRoom", data => {

if(!rooms[data.room])
    rooms[data.room] = [];

rooms[data.room].push({
    id: socket.id,
    name:data.name,
    color:data.color,
    pos:0,
    hype:0
});

socket.join(data.room);

io.to(data.room).emit(
    "updatePlayers",
    rooms[data.room]
);
});


socket.on("rollDice", room => {

const players = rooms[room];
if(!players) return;

const dice = Math.floor(Math.random()*6)+1;
const index =
players.findIndex(p=>p.id===socket.id);

io.to(room).emit("startMove",{
    player:index,
    steps:dice
});
});


socket.on("finishMove",(room,index)=>{

const player = rooms[room][index];

player.hype += 10;

// случайный скандал
if(Math.random()<0.3){
io.to(room).emit(
"scandalPopup",
`${player.name} попал в скандал 😱`
);
player.hype -= 5;
}

io.to(room).emit(
"updatePlayers",
rooms[room]
);
});


socket.on("disconnect",()=>{

for(const room in rooms){
rooms[room]=rooms[room]
.filter(p=>p.id!==socket.id);

io.to(room).emit(
"updatePlayers",
rooms[room]
);
}

});

});

const PORT = process.env.PORT || 3000;

http.listen(PORT,()=>{
console.log("Server started "+PORT);
});
