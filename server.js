const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function createRoom(code, hostId) {
  rooms[code] = {
    host: hostId,
    players: [],
    turnIndex: 0,
    started: false
  };
}

function nextTurn(room) {
  room.turnIndex++;
  if (room.turnIndex >= room.players.length) room.turnIndex = 0;
}

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, roomCode, color }) => {
    if (!rooms[roomCode]) createRoom(roomCode, socket.id);
    const room = rooms[roomCode];
    if (room.players.length >= 4) { socket.emit("roomFull"); return; }
    if (room.started) { socket.emit("alreadyStarted"); return; }

    const player = { id: socket.id, name, color, hype: 0, position: 0, skip: false };
    room.players.push(player);
    socket.join(roomCode);

    io.to(roomCode).emit("updateLobby", { players: room.players, host: room.host });
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (socket.id !== room.host) return;
    if (room.players.length < 2) return;

    room.started = true;
    room.players.sort(() => Math.random() - 0.5);
    room.turnIndex = 0;

    io.to(roomCode).emit("gameStarted", { players: room.players, currentTurn: room.players[0].id });
    io.to(roomCode).emit("updateGame", room);
  });

  socket.on("rollDice", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players[room.turnIndex];
    if (socket.id !== player.id) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    player.position += roll;
    if (player.position >= 20) player.position = player.position % 20;

    io.to(roomCode).emit("diceRolled", roll);

    nextTurn(room);
    io.to(roomCode).emit("updateGame", room);
  });

  socket.on("requestGameState", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    socket.emit("updateGame", room);
  });

  socket.on("disconnect", () => {
    for (let code in rooms) {
      const room = rooms[code];
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) delete rooms[code];
      else io.to(code).emit("updateLobby", { players: room.players, host: room.host });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
