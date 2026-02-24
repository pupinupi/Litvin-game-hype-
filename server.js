const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const BOARD = new Array(20).fill(null);

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

    room.players.push({
      id:socket.id,
      name,
      color,
      position:0,
      hype:0,
      skip:false
    });

    io.to(roomCode).emit("lobbyUpdate", {
      players: room.players
    });
  });

  socket.on("startGame",(roomCode)=>{
    const room = rooms[roomCode];
    if(!room) return;
    room.started = true;

    io.to(roomCode).emit("gameStarted");
    emitUpdate(roomCode);
  });

  socket.on("rollDice",(roomCode)=>{
    const room = rooms[roomCode];
    if(!room || !room.started) return;

    const player = room.players[room.turn];
    if(player.id !== socket.id) return;

    if(player.skip){
      player.skip = false;
      room.turn = nextTurn(room);
      emitUpdate(roomCode);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    io.to(roomCode).emit("diceRolled",{dice});

    player.position = (player.position + dice) % BOARD.length;

    player.hype += Math.floor(Math.random()*6);

    if(player.hype < 0) player.hype = 0;

    if(player.hype >= 100){
      io.to(roomCode).emit("gameOver",{winner:player.name});
      return;
    }

    room.turn = nextTurn(room);
    emitUpdate(roomCode);
  });

});

function nextTurn(room){
  return (room.turn + 1) % room.players.length;
}

function emitUpdate(roomCode){
  const room = rooms[roomCode];
  io.to(roomCode).emit("updatePlayers",{
    players:room.players,
    turn:room.turn
  });
}

server.listen(process.env.PORT || 3000);
