const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

/*
КЛЕТКИ СТРОГО ПО ТВОЕМУ СПИСКУ:

1. Старт
2. +3
3. +2
4. Скандал
5. Риск
6. +2
7. Скандал
8. +3
9. +5
10. -весь хайп
11. -50% + пропуск
12. +3
13. Риск
14. +3
15. Пропуск
16. +2
17. Скандал
18. +8
19. -весь хайп
20. +4
*/

const BOARD = [
  { type: "start" },                //1
  { type: "plus", value: 3 },       //2
  { type: "plus", value: 2 },       //3
  { type: "scandal" },              //4
  { type: "risk" },                 //5
  { type: "plus", value: 2 },       //6
  { type: "scandal" },              //7
  { type: "plus", value: 3 },       //8
  { type: "plus", value: 5 },       //9
  { type: "zero" },                 //10 - весь хайп
  { type: "half_skip" },            //11 -50% + пропуск
  { type: "plus", value: 3 },       //12
  { type: "risk" },                 //13
  { type: "plus", value: 3 },       //14
  { type: "skip" },                 //15
  { type: "plus", value: 2 },       //16
  { type: "scandal" },              //17
  { type: "plus", value: 8 },       //18
  { type: "zero" },                 //19 - весь хайп
  { type: "plus", value: 4 }        //20
];

const SCANDALS = [
  { text:"Перегрел аудиторию 🔥", value:-1 },
  { text:"Громкий заголовок 🫣", value:+5 },
  { text:"Это монтаж 😱", value:-2 },
  { text:"Меня взломали #️⃣", value:-3, all:true },
  { text:"Подписчики в шоке 😮", value:+8 },
  { text:"Удаляй пока не поздно 🤫", value:-5 },
  { text:"Это контент, вы не понимаете 🙄", value:+8, skip:true }
];

io.on("connection", (socket)=>{

  socket.on("joinRoom", ({name, roomCode, color})=>{

    socket.join(roomCode);

    if(!rooms[roomCode]){
      rooms[roomCode] = {
        players:[],
        turn:0
      };
    }

    rooms[roomCode].players.push({
      id:socket.id,
      name,
      color,
      position:0,
      hype:0,
      skip:false
    });

    emitUpdate(roomCode);
  });

  socket.on("rollDice", (roomCode)=>{

    const room = rooms[roomCode];
    if(!room) return;

    const player = room.players[room.turn];
    if(!player || player.id !== socket.id) return;

    // если пропуск
    if(player.skip){
      player.skip = false;
      room.turn = nextTurn(room);
      emitUpdate(roomCode);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    io.to(roomCode).emit("diceRolled",{dice});

    // движение
    player.position = (player.position + dice) % BOARD.length;

    const cell = BOARD[player.position];

    // ===== ЛОГИКА КЛЕТОК =====

    if(cell.type === "plus"){
      player.hype += cell.value;
    }

    if(cell.type === "risk"){
      const riskDice = Math.floor(Math.random()*6)+1;
      let result = riskDice <= 3 ? -5 : 5;
      player.hype += result;

      io.to(roomCode).emit("riskResult",{
        dice:riskDice,
        result
      });
    }

    if(cell.type === "scandal"){
      const scandal = SCANDALS[Math.floor(Math.random()*SCANDALS.length)];

      if(scandal.all){
        room.players.forEach(p=>{
          p.hype += scandal.value;
          if(p.hype < 0) p.hype = 0;
        });
      } else {
        player.hype += scandal.value;
      }

      if(scandal.skip){
        player.skip = true;
      }

      io.to(roomCode).emit("scandalCard", scandal);
    }

    if(cell.type === "zero"){
      player.hype = 0;
    }

    if(cell.type === "half_skip"){
      player.hype = Math.floor(player.hype / 2);
      player.skip = true;
    }

    if(cell.type === "skip"){
      player.skip = true;
    }

    if(player.hype < 0) player.hype = 0;

    if(player.hype >= 100){
      io.to(roomCode).emit("gameOver",{winner:player.name});
      return;
    }

    room.turn = nextTurn(room);
    emitUpdate(roomCode);
  });

});

function nextTurn(room){
  if(room.players.length <= 1) return 0;
  return (room.turn + 1) % room.players.length;
}

function emitUpdate(roomCode){
  const room = rooms[roomCode];
  io.to(roomCode).emit("updatePlayers",{
    players:room.players,
    turn:room.turn
  });
}

server.listen(process.env.PORT || 3000);
