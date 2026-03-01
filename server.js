const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

const players={};

io.on("connection",(socket)=>{

players[socket.id]={
id:socket.id,
position:0,
hype:0
};

socket.emit("init",players[socket.id]);

socket.on("rollDice",()=>{

const player=players[socket.id];
if(!player)return;

const dice=Math.floor(Math.random()*6)+1;

player.position+=dice;
player.hype+=dice*5;

if(player.hype>100)
player.hype=100;

io.emit("diceRolled",{
id:player.id,
dice,
position:player.position,
hype:player.hype
});

if(player.hype>=100){
io.emit("winner",player.id);
}
});

socket.on("disconnect",()=>{
delete players[socket.id];
});

});

const PORT=process.env.PORT||3000;

server.listen(PORT,()=>{
console.log("Server running");
});
