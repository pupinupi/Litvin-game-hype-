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
  { type: "plus", value: 2 },
  { type: "plus", value: 3 },
  { type: "plus", value: 4 },
  { type: "block" },

  { type: "plus", value: 8 },
  { type: "scandal" },
  { type: "plus", value: 2 },
  { type: "court" },
  { type: "plus", value: 3 },
  { type: "risk" },

  { type: "plus", value: 3 },
  { type: "jail" },
  { type: "block" },
  { type: "plus", value: 5 },

  { type: "plus", value: 3 },
  { type: "scandal" },
  { type: "plus", value: 2 },
  { type: "risk" },
  { type: "scandal" }
];

const SCANDALS = [
  { text: "Перегрел аудиторию 🔥", value: -1 },
  { text: "Громкий заголовок 🫣", value: -2 },
  { text: "Это монтаж 😱", value: -3 },
  { text: "Меня взломали #️⃣", value: -3, all: true },
  { text: "Подписчики в шоке 😮", value: -4 },
  { text: "Удаляй пока не поздно 🤫", value: -5 },
  { text: "Это контент, вы не понимаете 🙄", value: -5, skip: true }
];

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], turn: 0 };
    }

    rooms[roomCode].players.push({
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0,
      skipTurn: false
    });

    emitUpdate(roomCode);
  });

  socket.on("rollDice", (roomCode) => {

    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players[room.turn];
    if (!player || player.id !== socket.id) return;

    if (player.skipTurn) {
      player.skipTurn = false;
      room.turn = getNextTurn(room);
      emitUpdate(roomCode);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    io.to(roomCode).emit("diceRolled", { dice });

    player.position = (player.position + dice) % BOARD.length;

    applyCell(roomCode, room, player);

    if (player.hype >= 100) {
      io.to(roomCode).emit("gameOver", { winner: player.name });
      return;
    }

    room.turn = getNextTurn(room);
    emitUpdate(roomCode);
  });

});

function applyCell(roomCode, room, player) {

  const cell = BOARD[player.position];

  switch(cell.type){

    case "plus":
      player.hype += cell.value;
      break;

    case "risk":
      const riskDice = Math.floor(Math.random() * 6) + 1;
      const result = riskDice >= 4 ? 5 : -5;
      player.hype += result;
      io.to(roomCode).emit("riskResult", { dice: riskDice, result });
      break;

    case "scandal":
      const scandal = SCANDALS[Math.floor(Math.random()*SCANDALS.length)];

      if (scandal.all) {
        room.players.forEach(p=>{
          p.hype += scandal.value;
          if (p.hype < 0) p.hype = 0;
        });
      } else {
        player.hype += scandal.value;
      }

      if (scandal.skip) player.skipTurn = true;

      io.to(roomCode).emit("scandalCard", scandal);
      break;

    case "block":
    case "court":
      player.skipTurn = true;
      break;

    case "jail":
      player.hype = Math.floor(player.hype / 2);
      player.skipTurn = true;
      break;
  }

  if (player.hype < 0) player.hype = 0;
}

function getNextTurn(room){
  if (room.players.length <= 1) return 0;
  return (room.turn + 1) % room.players.length;
}

function emitUpdate(roomCode){
  const room = rooms[roomCode];
  io.to(roomCode).emit("updatePlayers", {
    players: room.players,
    turn: room.turn
  });
}

server.listen(process.env.PORT || 3000);
