const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

    socket.on("joinRoom", ({ name, roomCode, color }) => {

        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                started: false
            };
        }

        const room = rooms[roomCode];

        if (room.players.find(p => p.color === color)) {
            socket.emit("colorTaken");
            return;
        }

        const player = {
            id: socket.id,
            name,
            color,
            position: 0
        };

        room.players.push(player);

        socket.join(roomCode);

        io.to(roomCode).emit("roomUpdate", room);
    });

    socket.on("startGame", (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        room.started = true;
        io.to(roomCode).emit("gameStarted", room);
    });

    socket.on("rollDice", (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        const dice = Math.floor(Math.random() * 6) + 1;

        const player = room.players.find(
            p => p.id === socket.id
        );

        if (!player) return;

        player.position += dice;

        io.to(roomCode).emit("diceRolled", {
            dice,
            players: room.players
        });
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

}); // ✅ ВОТ ЭТОГО НЕ ХВАТАЛО

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
