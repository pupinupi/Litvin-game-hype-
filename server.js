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
                turn: 0
            };
        }

        const room = rooms[roomCode];

        if (room.players.length >= 4) return;

        const player = {
            id: socket.id,
            name,
            color,
            position: 0,
            hype: 0,
            skip: false,
            lastGain: 0
        };

        room.players.push(player);
        socket.join(roomCode);

        io.to(roomCode).emit("updatePlayers", room.players);
    });

    socket.on("rollDice", (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        const player = room.players[room.turn];
        if (!player || player.id !== socket.id) return;

        if (player.skip) {
            player.skip = false;
            nextTurn(room, roomCode);
            return;
        }

        const dice = Math.floor(Math.random() * 6) + 1;

        player.position = (player.position + dice) % 20;

        io.to(roomCode).emit("diceRolled", { dice, playerId: player.id });

        handleCell(player, room, roomCode);
    });

    socket.on("disconnect", () => {
        for (let code in rooms) {
            rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);
        }
    });

});

function handleCell(player, room, roomCode) {
    const cell = player.position + 1;

    let gain = 0;

    const plusCells = {
        2:3,3:2,6:2,8:3,9:5,12:3,14:3,16:2,18:8,20:4
    };

    if (plusCells[cell]) {
        gain = plusCells[cell];
        player.hype += gain;
    }

    if (cell === 4 || cell === 7 || cell === 17) {
        triggerScandal(player, roomCode);
        return;
    }

    if (cell === 5 || cell === 13) {
        triggerRisk(player, roomCode);
        return;
    }

    if (cell === 10 || cell === 19) {
        player.hype = 0;
    }

    if (cell === 11) {
        player.hype = Math.floor(player.hype / 2);
        player.skip = true;
    }

    if (cell === 15) {
        player.skip = true;
    }

    if (player.hype < 0) player.hype = 0;

    if (gain > 8) {
        player.skip = true;
    }

    if (player.hype >= 100) {
        io.to(roomCode).emit("winner", player.name);
        return;
    }

    io.to(roomCode).emit("updatePlayers", room.players);
    nextTurn(room, roomCode);
}

function triggerScandal(player, roomCode) {
    const scandals = [
        { text:"Перегрел аудиторию🔥 -1", value:-1 },
        { text:"Громкий заголовок🫣 -2", value:-2 },
        { text:"Это монтаж 😱 -3", value:-3 },
        { text:"Меня взломали #️⃣ -3 всем", value:-3, all:true },
        { text:"Подписчики в шоке 😮 -4", value:-4 },
        { text:"Удаляй пока не поздно🤫 -5", value:-5 },
        { text:"Это контент🙄 -5 и пропуск", value:-5, skip:true }
    ];

    const card = scandals[Math.floor(Math.random() * scandals.length)];

    io.to(roomCode).emit("scandalCard", card);
}

function triggerRisk(player, roomCode) {
    const dice = Math.floor(Math.random() * 6) + 1;
    let result = 0;

    if (dice <= 3) result = -5;
    else result = +5;

    player.hype += result;
    if (player.hype < 0) player.hype = 0;

    io.to(roomCode).emit("riskResult", { dice, result, playerId: player.id });
}

function nextTurn(room, roomCode) {
    room.turn = (room.turn + 1) % room.players.length;
    io.to(roomCode).emit("turnChanged", room.turn);
}

server.listen(3000, () => console.log("Server running"));
