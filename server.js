const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// ===================
// КАРТА ПОЛЯ
// ===================

const BOARD = [
  { type: "start" },           // 0
  { type: "plus", value: 2 },  // 1
  { type: "plus", value: 3 },  // 2
  { type: "plus", value: 4 },  // 3
  { type: "block" },           // 4

  { type: "plus", value: 8 },  // 5
  { type: "scandal" },         // 6
  { type: "plus", value: 2 },  // 7
  { type: "court" },           // 8
  { type: "plus", value: 3 },  // 9
  { type: "risk" },            // 10

  { type: "plus", value: 3 },  // 11
  { type: "jail" },            // 12
  { type: "block" },           // 13
  { type: "plus", value: 5 },  // 14

  { type: "plus", value: 3 },  // 15
  { type: "scandal" },         // 16
  { type: "plus", value: 2 },  // 17
  { type: "risk" },            // 18
  { type: "scandal" }          // 19
];

// ===================

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        turn: 0
      };
    }

    const player = {
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0,
      skipTurn: false
    };

    rooms[roomCode].players.push(player);
    io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
  });

  socket.on("rollDice", (roomCode) => {

    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players[room.turn];
    if (!player) return;
    if (player.id !== socket.id) return;

    if (player.skipTurn) {
      player.skipTurn = false;
      nextTurn(room);
      io.to(roomCode).emit("updatePlayers", room.players);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    io.to(roomCode).emit("diceRolled", { dice });

    player.position = (player.position + dice) % BOARD.length;

    applyCellEffect(roomCode, player, dice);

    io.to(roomCode).emit("updatePlayers", room.players);

    nextTurn(room);
  });

});

// ===================
// ЛОГИКА КЛЕТОК
// ===================

function applyCellEffect(roomCode, player, dice) {

  const cell = BOARD[player.position];

  switch(cell.type) {

    case "plus":
      player.hype += cell.value;
      break;

    case "scandal":
      player.hype -= 5;
      io.to(roomCode).emit("scandalCard", {
        text: "Скандал! -5 хайпа"
      });
      break;

    case "risk":
      const result = dice <= 3 ? -5 : 5;
      player.hype += result;
      io.to(roomCode).emit("riskResult", {
        dice,
        result
      });
      break;

    case "block":
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Блокировка канала! Пропуск хода"
      });
      break;

    case "jail":
      player.hype = Math.floor(player.hype / 2);
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Тюрьма! Потеря половины хайпа"
      });
      break;

    case "court":
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Суд! Пропуск хода"
      });
      break;
  }

  if (player.hype < 0) player.hype = 0;
}

function nextTurn(room) {
  room.turn = (room.turn + 1) % room.players.length;
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
