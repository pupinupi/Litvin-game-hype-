const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* =========================
   FIX RENDER NOT FOUND
========================= */
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

/* =========================
   ROOMS
========================= */
const rooms = {};
const MAX_PLAYERS = 4;

/* =========================
   SOCKET
========================= */
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    /* ========= JOIN ROOM ========= */
    socket.on("joinRoom", ({ name, roomCode, color }) => {

        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                host: socket.id,
                started: false,
                turn: 0
            };
        }

        const room = rooms[roomCode];

        // цвет занят
        if (room.players.find(p => p.color === color)) {
            socket.emit("colorTaken");
            return;
        }

        // лимит игроков
        if (room.players.length >= MAX_PLAYERS) {
            socket.emit("roomFull");
            return;
        }

        const player = {
            id: socket.id,
            name,
            color,
            position: 0,
            hype: 0
        };

        room.players.push(player);

        socket.join(roomCode);

        console.log("JOIN:", name, roomCode);

        io.to(roomCode).emit("roomUpdate", room);
    });

    /* ========= START GAME ========= */
    socket.on("startGame", (roomCode) => {

        const room = rooms[roomCode];
        if (!room) return;

        // только host
        if (socket.id !== room.host) return;

        if (room.players.length < 2) {
            socket.emit("notEnoughPlayers");
            return;
        }

        room.started = true;

        io.to(roomCode).emit("gameStarted", room);
    });

    /* ========= ROLL DICE ========= */
    socket.on("rollDice", (roomCode) => {

        const room = rooms[roomCode];
        if (!room || !room.started) return;

        const currentPlayer =
            room.players[room.turn];

        if (!currentPlayer ||
            currentPlayer.id !== socket.id)
            return;

        const dice =
            Math.floor(Math.random() * 6) + 1;

        currentPlayer.position += dice;

        if (currentPlayer.position >= 20)
            currentPlayer.position %= 20;

        /* отправляем ВСЁ */
        io.to(roomCode).emit("diceRolled", {
            dice,
            players: room.players,
            turn: room.turn
        });

        /* следующий ход */
        room.turn++;

        if (room.turn >= room.players.length)
            room.turn = 0;

        io.to(roomCode).emit("roomUpdate", room);
    });

    /* ========= DISCONNECT ========= */
    socket.on("disconnect", () => {

        for (const code in rooms) {

            const room = rooms[code];

            room.players =
                room.players.filter(
                    p => p.id !== socket.id
                );

            if (room.players.length === 0) {
                delete rooms[code];
                continue;
            }

            if (room.turn >= room.players.length)
                room.turn = 0;

            io.to(code).emit(
                "roomUpdate",
                room
            );
        }

        console.log("Disconnected:", socket.id);
    });

});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on", PORT);
});
