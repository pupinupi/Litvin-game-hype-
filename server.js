const express = require("express");
const app = express();
const http = require("http").createServer(app);

const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: "*"
  }
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        started: false
      };
    }

    const room = rooms[roomCode];

    room.players.push({
      id: socket.id,
      name,
      color,
      position: 0
    });

    socket.join(roomCode);

    io.to(roomCode).emit("roomUpdate", room);
  });

  socket.on("startGame", (roomCode) => {

    if (!rooms[roomCode]) return;

    rooms[roomCode].started = true;

    io.to(roomCode).emit("gameStarted");

  });

  socket.on("disconnect", () => {

    for (const code in rooms) {

      rooms[code].players =
        rooms[code].players.filter(
          p => p.id !== socket.id
        );

      io.to(code).emit(
        "roomUpdate",
        rooms[code]
      );
    }

  });

});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on", PORT);
});
