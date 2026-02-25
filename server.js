const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

app.use(express.static("public"));

/*
========================
ROOM STORAGE
========================
*/

const rooms = {};

/*
========================
JOIN ROOM
========================
*/

io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  socket.on("joinRoom", ({ name, roomCode, color }) => {

    if (!roomCode) return;

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        started: false
      };
    }

    const room = rooms[roomCode];

    const player = {
      id: socket.id,
      name,
      color
    };

    room.players.push(player);

    socket.join(roomCode);

    console.log(name, "joined room", roomCode);

    io.to(roomCode).emit("roomUpdate", room);
  });

/*
========================
START GAME
========================
*/

  socket.on("startGame", (roomCode) => {

    const room = rooms[roomCode];
    if (!room) return;

    room.started = true;

    io.to(roomCode).emit("gameStarted");
  });

/*
========================
DISCONNECT
========================
*/

  socket.on("disconnect", () => {

    console.log("Disconnected:", socket.id);

    for (const code in rooms) {

      rooms[code].players =
        rooms[code].players.filter(
          p => p.id !== socket.id
        );

      io.to(code).emit("roomUpdate", rooms[code]);
    }
  });

});

/*
========================
RAILWAY / RENDER PORT FIX
========================
*/

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
