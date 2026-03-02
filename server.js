const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

/* открываем игру сразу */
app.get("/",(req,res)=>{
res.sendFile(__dirname+"/public/game.html");
});

let players=[
{pos:0,hype:0,color:"red"}
];

io.on("connection",socket=>{

socket.emit("players",players);

socket.on("rollDice",()=>{

const dice=Math.floor(Math.random()*6)+1;

players[0].hype+=dice;

io.emit("diceResult",dice);
io.emit("players",players);

});

});

server.listen(process.env.PORT||3000,
()=>console.log("SERVER START"));
