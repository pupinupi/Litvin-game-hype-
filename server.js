const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: []
      };
    }

    rooms[roomCode].players.push({
      id: socket.id,
      name,
      color,
      position: 0
    });

    socket.join(roomCode);

    io.to(roomCode).emit("roomUpdate", rooms[roomCode]);
  });

  socket.on("startGame", (roomCode) => {
    io.to(roomCode).emit("gameStarted");
  });

  socket.on("disconnect", () => {

    for (const code in rooms) {
      rooms[code].players =
        rooms[code].players.filter(p => p.id !== socket.id);

      io.to(code).emit("roomUpdate", rooms[code]);
    }

  });

});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running");
});
