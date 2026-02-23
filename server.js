const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// =====================
// НАСТОЯЩАЯ КАРТА ПОЛЯ
// Порядок строго по позициям 0–19
// =====================

const BOARD = [
  { type: "start", title: "Старт" },                 // 0
  { type: "plus", value: 2, title: "Гаражный пранк" },        // 1
  { type: "scandal", value: -5, title: "Сгорел красиво" },    // 2
  { type: "plus", value: 3, title: "Интеграция" },             // 3
  { type: "plus", value: 5, title: "Вирусный ролик" },         // 4
  { type: "block", title: "Блокировка канала" },               // 5
  { type: "jail", title: "Тюрьма" },                            // 6
  { type: "plus", value: 3, title: "Бренд одежды" },            // 7
  { type: "risk", title: "Риск" },                              // 8
  { type: "plus", value: 3, title: "IT Energy" },               // 9
  { type: "court", title: "Суд" },                              // 10
  { type: "plus", value: 2, title: "YouTube проект" },         // 11
  { type: "scandal", value: -5, title: "Скандал в СМИ" },      // 12
  { type: "plus", value: 8, title: "Золотая кнопка" },         // 13
  { type: "block", title: "Блокировка канала" },               // 14
  { type: "plus", value: 4, title: "Попал в топ" },            // 15
  { type: "plus", value: 3, title: "Коллаб" },                 // 16
  { type: "plus", value: 2, title: "Снял для друзей" },        // 17
  { type: "scandal", value: -5, title: "Плохое видео" },       // 18
  { type: "risk", title: "Риск" }                               // 19
];

// =====================
// ПОДКЛЮЧЕНИЕ ИГРОКА
// =====================

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

  // =====================
  // БРОСОК КУБИКА
  // =====================

  socket.on("rollDice", (roomCode) => {

    const room = rooms[roomCode];
    if (!room) return;

    const currentPlayer = room.players[room.turn];
    if (!currentPlayer) return;
    if (currentPlayer.id !== socket.id) return;

    // если пропуск хода
    if (currentPlayer.skipTurn) {
      currentPlayer.skipTurn = false;
      nextTurn(room);
      io.to(roomCode).emit("updatePlayers", room.players);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;

    io.to(roomCode).emit("diceRolled", { dice });

    // движение по кругу
    currentPlayer.position =
      (currentPlayer.position + dice) % BOARD.length;

    handleCell(roomCode, room, currentPlayer, dice);

    io.to(roomCode).emit("updatePlayers", room.players);

    // проверка победы
    if (currentPlayer.hype >= 100) {
      io.to(roomCode).emit("gameOver", {
        winner: currentPlayer.name
      });
      return;
    }

    nextTurn(room);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode].players =
        rooms[roomCode].players.filter(p => p.id !== socket.id);

      io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
    }
  });

});

// =====================
// ЛОГИКА КЛЕТОК
// =====================

function handleCell(roomCode, room, player, dice) {

  const cell = BOARD[player.position];

  switch (cell.type) {

    case "plus":
      player.hype += cell.value;
      io.to(roomCode).emit("cellMessage", {
        text: `${cell.title}: +${cell.value} хайпа`
      });
      break;

    case "scandal":
      player.hype += cell.value;
      io.to(roomCode).emit("cellMessage", {
        text: `${cell.title}: ${cell.value} хайпа`
      });
      break;

    case "risk":
      let result;
      if (dice <= 3) {
        result = -5;
      } else {
        result = 5;
      }
      player.hype += result;

      io.to(roomCode).emit("riskResult", {
        dice,
        result
      });
      break;

    case "block":
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Блокировка канала! Пропуск хода."
      });
      break;

    case "jail":
      player.hype = Math.floor(player.hype / 2);
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Тюрьма! Потеря половины хайпа и пропуск хода."
      });
      break;

    case "court":
      player.skipTurn = true;
      io.to(roomCode).emit("cellMessage", {
        text: "Суд! Пропуск хода."
      });
      break;

    case "start":
      io.to(roomCode).emit("cellMessage", {
        text: "Старт!"
      });
      break;
  }

  if (player.hype < 0) player.hype = 0;
}

// =====================
// СМЕНА ХОДА
// =====================

function nextTurn(room) {
  room.turn = (room.turn + 1) % room.players.length;
}

// =====================
// ЗАПУСК
// =====================

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
