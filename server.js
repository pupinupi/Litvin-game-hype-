const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

/* ------------------ SOCKET CONNECTION ------------------ */

io.on("connection", (socket) => {

    socket.on("joinRoom", ({ name, roomCode, color }) => {

        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                turn: 0
            };
        }

        const room = rooms[roomCode];

        if (room.players.length >= 4) {
            socket.emit("roomFull");
            return;
        }

        const player = {
            id: socket.id,
            name,
            color,
            position: 0,
            hype: 0,
            skipTurn: false,
            lastTurnGain: 0
        };

        room.players.push(player);
        socket.join(roomCode);

        io.to(roomCode).emit("updatePlayers", room.players);
        io.to(roomCode).emit("turnChanged", room.turn);
    });

    socket.on("rollDice", (roomCode) => {

        const room = rooms[roomCode];
        if (!room) return;

        const player = room.players[room.turn];
        if (!player) return;

        if (player.id !== socket.id) return;

        // Если пропуск хода
        if (player.skipTurn) {
            player.skipTurn = false;
            io.to(roomCode).emit("message", `${player.name} пропускает ход`);
            nextTurn(room, roomCode);
            return;
        }

        const dice = Math.floor(Math.random() * 6) + 1;

        player.lastTurnGain = 0;

        player.position = (player.position + dice) % 20;

        io.to(roomCode).emit("diceRolled", {
            dice,
            playerId: player.id
        });

        setTimeout(() => {
            handleCell(player, room, roomCode);
        }, 800);
    });

    socket.on("disconnect", () => {
        for (let code in rooms) {
            rooms[code].players =
                rooms[code].players.filter(p => p.id !== socket.id);
        }
    });

});

/* ------------------ GAME LOGIC ------------------ */

function handleCell(player, room, roomCode) {

    const cell = player.position + 1;

    const plusCells = {
        2: 3,
        3: 2,
        6: 2,
        8: 3,
        9: 5,
        12: 3,
        14: 3,
        16: 2,
        18: 8,
        20: 4
    };

    // + Хайп
    if (plusCells[cell]) {
        const gain = plusCells[cell];
        player.hype += gain;
        player.lastTurnGain += gain;
    }

    // Скандал
    if (cell === 4 || cell === 7 || cell === 17) {
        triggerScandal(player, room, roomCode);
        return;
    }

    // Риск
    if (cell === 5 || cell === 13) {
        triggerRisk(player, room, roomCode);
        return;
    }

    // - весь хайп
    if (cell === 10 || cell === 19) {
        player.hype = 0;
    }

    // -50% + пропуск
    if (cell === 11) {
        player.hype = Math.floor(player.hype / 2);
        player.skipTurn = true;
    }

    // Пропуск
    if (cell === 15) {
        player.skipTurn = true;
    }

    // Ограничение ниже 0
    if (player.hype < 0) player.hype = 0;

    // Перегрев
    if (player.lastTurnGain > 8) {
        player.skipTurn = true;
        io.to(roomCode).emit("message", `${player.name} перегрел аудиторию!`);
    }

    // Победа
    if (player.hype >= 100) {
        io.to(roomCode).emit("winner", player.name);
        return;
    }

    io.to(roomCode).emit("updatePlayers", room.players);
    nextTurn(room, roomCode);
}

/* ------------------ SCANDAL ------------------ */

function triggerScandal(player, room, roomCode) {

    const scandals = [
        { text: "Перегрел аудиторию🔥 -1", value: -1 },
        { text: "Громкий заголовок🫣 -2", value: -2 },
        { text: "Это монтаж 😱 -3", value: -3 },
        { text: "Меня взломали #️⃣ -3 всем", value: -3, all: true },
        { text: "Подписчики в шоке 😮 -4", value: -4 },
        { text: "Удаляй пока не поздно🤫 -5", value: -5 },
        { text: "Это контент🙄 -5 и пропуск", value: -5, skip: true }
    ];

    const card = scandals[Math.floor(Math.random() * scandals.length)];

    if (card.all) {
        room.players.forEach(p => {
            p.hype += card.value;
            if (p.hype < 0) p.hype = 0;
        });
    } else {
        player.hype += card.value;
        if (player.hype < 0) player.hype = 0;
    }

    if (card.skip) {
        player.skipTurn = true;
    }

    io.to(roomCode).emit("scandalCard", {
        text: card.text
    });

    io.to(roomCode).emit("updatePlayers", room.players);

    setTimeout(() => {
        nextTurn(room, roomCode);
    }, 1500);
}

/* ------------------ RISK ------------------ */

function triggerRisk(player, room, roomCode) {

    const dice = Math.floor(Math.random() * 6) + 1;

    let result = 0;

    if (dice <= 3) {
        result = -5;
    } else {
        result = 5;
    }

    player.hype += result;
    if (player.hype < 0) player.hype = 0;

    io.to(roomCode).emit("riskResult", {
        dice,
        result,
        playerId: player.id
    });

    io.to(roomCode).emit("updatePlayers", room.players);

    setTimeout(() => {
        nextTurn(room, roomCode);
    }, 1200);
}

/* ------------------ TURN SYSTEM ------------------ */

function nextTurn(room, roomCode) {
    room.turn = (room.turn + 1) % room.players.length;
    io.to(roomCode).emit("turnChanged", room.turn);
}

/* ------------------ SERVER START ------------------ */

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
