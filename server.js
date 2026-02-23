const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const scandalCards = [
  "Ты попал в скандал! -5 хайпа.",
  "Неудачное интервью! -3 хайпа.",
  "Хайп на провокации! -2 хайпа."
];

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], turn: 0 };
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

    const currentPlayer = room.players[room.turn];
    if (!currentPlayer || currentPlayer.id !== socket.id) return;

    if (currentPlayer.skipTurn) {
      currentPlayer.skipTurn = false;
      nextTurn(room);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;

    // отправляем бросок
    io.to(roomCode).emit("diceRolled", { dice });

    // двигаем игрока
    currentPlayer.position =
      (currentPlayer.position + dice) % 20;

    handleCell(room, roomCode, currentPlayer, dice);

    io.to(roomCode).emit("updatePlayers", room.players);

    nextTurn(room);
  });

});

function handleCell(room, roomCode, player, dice) {

  const CELL_TYPES = [
    "start",      // 0
    "normal",     // 1
    "normal",     // 2
    "scandal",    // 3
    "normal",     // 4
    "risk",       // 5
    "normal",     // 6
    "jail",       // 7
    "normal",     // 8
    "scandal",    // 9
    "normal",     // 10
    "normal",     // 11
    "court",      // 12
    "normal",     // 13
    "risk",       // 14
    "normal",     // 15
    "normal",     // 16
    "normal",     // 17
    "normal",     // 18
    "normal"      // 19
  ];

  const cellType = CELL_TYPES[player.position];

  switch(cellType){

    case "scandal":
      const card =
        scandalCards[Math.floor(Math.random() * scandalCards.length)];
      player.hype -= 5;
      io.to(roomCode).emit("scandalCard", { text: card });
      break;

    case "risk":
      if (dice <= 3) {
        player.hype -= 5;
      } else {
        player.hype += 5;
      }
      io.to(roomCode).emit("riskResult", {
        dice,
        result: dice <= 3 ? -5 : 5
      });
      break;

    case "jail":
      player.hype = Math.floor(player.hype / 2);
      player.skipTurn = true;
      break;

    case "court":
      player.skipTurn = true;
      break;

    case "normal":
      player.hype += 2;
      break;

    default:
      break;
  }

  if (player.hype < 0) player.hype = 0;
}

  // Скандал
  if (cell === 3 || cell === 9) {
    const card =
      scandalCards[Math.floor(Math.random() * scandalCards.length)];

    player.hype -= 5;

    io.to(roomCode).emit("scandalCard", { text: card });
  }

  // Риск (используем тот же dice!)
  if (cell === 5 || cell === 14) {

    if (dice <= 3) {
      player.hype -= 5;
    } else {
      player.hype += 5;
    }

    io.to(roomCode).emit("riskResult", {
      dice,
      result: dice <= 3 ? -5 : 5
    });
  }

  // Тюрьма
  if (cell === 7) {
    player.hype = Math.floor(player.hype / 2);
    player.skipTurn = true;
  }

  // Суд
  if (cell === 12) {
    player.skipTurn = true;
  }

  // Обычные клетки
  if (cell !== 3 && cell !== 5 && cell !== 7 &&
      cell !== 9 && cell !== 12 && cell !== 14) {
    player.hype += 2;
  }

  if (player.hype < 0) player.hype = 0;
}

function nextTurn(room) {
  room.turn = (room.turn + 1) % room.players.length;
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
