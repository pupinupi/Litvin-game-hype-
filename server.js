const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const BOARD = [
  { type: "start" },
  { type: "plus", value: 3 },
  { type: "plus", value: 2 },
  { type: "scandal" },
  { type: "risk" },
  { type: "plus", value: 2 },
  { type: "scandal" },
  { type: "plus", value: 3 },
  { type: "plus", value: 5 },
  { type: "zero" },
  { type: "half_skip" },
  { type: "plus", value: 3 },
  { type: "risk" },
  { type: "plus", value: 3 },
  { type: "skip" },
  { type: "plus", value: 2 },
  { type: "scandal" },
  { type: "plus", value: 8 },
  { type: "zero" },
  { type: "plus", value: 4 }
];

const SCANDALS = [
  { text:"Перегрел аудиторию 🔥", value:-1 },
  { text:"Громкий заголовок 🫣", value:-2 },
  { text:"Это монтаж 😱", value:-3 },
  { text:"Меня взломали #️⃣", value:-3, all:true },
  { text:"Подписчики в шоке 😮", value:-4 },
  { text:"Удаляй пока не поздно 🤫", value:-5 },
  { text:"Это контент 🙄", value:-5, skip:true }
];

io.on("connection", (socket)=>{

  socket.on("joinRoom", ({name, roomCode, color})=>{
    socket.join(roomCode);

    if(!rooms[roomCode]){
      rooms[roomCode] = {
        players:[],
        turn:0,
        started:false
      };
    }

    const room = rooms[roomCode];

    if(room.players.length >= 4) return;

    room.players.push({
      id:socket.id,
      name,
      color,
      position:0,
      hype:0,
      skip:false
    });

    emitRoom(roomCode);
  });

  socket.on("startGame",(roomCode)=>{
    const room = rooms[roomCode];
    if(!room) return;

    if(room.players[0].id === socket.id){
      room.started = true;
      io.to(roomCode).emit("gameStarted");
    }
  });

  socket.on("rollDice",(roomCode)=>{
    const room = rooms[roomCode];
    if(!room || !room.started) return;

    const player = room.players[room.turn];
    if(player.id !== socket.id) return;

    if(player.skip){
      player.skip = false;
      room.turn = nextTurn(room);
      emitRoom(roomCode);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    io.to(roomCode).emit("diceRolled",dice);

    player.position = (player.position + dice) % BOARD.length;
    const cell = BOARD[player.position];

    if(cell.type==="plus") player.hype += cell.value;
    if(cell.type==="zero") player.hype = 0;
    if(cell.type==="half_skip"){
      player.hype = Math.floor(player.hype/2);
      player.skip = true;
    }
    if(cell.type==="skip") player.skip = true;

    if(cell.type==="risk"){
      const riskDice = Math.floor(Math.random()*6)+1;
      const result = riskDice<=3 ? -5 : 5;
      player.hype += result;
      io.to(roomCode).emit("riskResult",{riskDice,result});
    }

    if(cell.type==="scandal"){
      const scandal = SCANDALS[Math.floor(Math.random()*SCANDALS.length)];
      if(scandal.all){
        room.players.forEach(p=>{
          p.hype += scandal.value;
          if(p.hype<0)p.hype=0;
        });
      }else{
        player.hype += scandal.value;
      }
      if(scandal.skip) player.skip=true;
      io.to(roomCode).emit("scandalCard",scandal);
    }

    if(player.hype<0) player.hype=0;

    if(player.hype>=100){
      io.to(roomCode).emit("gameOver",player.name);
      return;
    }

    room.turn = nextTurn(room);
    emitRoom(roomCode);
  });

  socket.on("disconnect",()=>{
    for(const code in rooms){
      rooms[code].players = rooms[code].players.filter(p=>p.id!==socket.id);
      emitRoom(code);
    }
  });

});

function nextTurn(room){
  return (room.turn+1)%room.players.length;
}

function emitRoom(code){
  const room = rooms[code];
  io.to(code).emit("roomUpdate",room);
}

server.listen(process.env.PORT||3000);
