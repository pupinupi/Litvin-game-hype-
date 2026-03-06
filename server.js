// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let rooms = {}; // { roomId: { players: { playerName: { chipColor, pos, hype, ws } } } }

wss.on('connection', ws => {
  ws.on('message', message => {
    try{
      const data = JSON.parse(message);

      switch(data.type){

        case "joinRoom":
          let room = rooms[data.roomId] || { players: {} };
          room.players[data.playerName] = { chipColor: data.chipColor, pos:0, hype:0, ws };
          rooms[data.roomId] = room;
          broadcastRoom(data.roomId);
          break;

        case "diceRoll":
          const roomDice = rooms[data.roomId];
          if(!roomDice) return;
          const roll = Math.floor(Math.random()*6)+1;
          let player = roomDice.players[data.playerName];
          if(!player) return;
          player.pos = (player.pos + roll) %  pathLength;
          broadcastPlayerMoved(data.roomId, data.playerName, roll, player.pos);
          break;

        case "skipTurn":
          const roomSkip = rooms[data.roomId];
          if(roomSkip && roomSkip.players[data.playerName]){
            roomSkip.players[data.playerName].skipNext = true;
            broadcastRoom(data.roomId);
          }
          break;

      }
    }catch(e){ console.log(e) }
  });

  ws.on('close', () => {
    // Удаляем игрока из всех комнат
    for(let roomId in rooms){
      for(let name in rooms[roomId].players){
        if(rooms[roomId].players[name].ws === ws){
          delete rooms[roomId].players[name];
        }
      }
      broadcastRoom(roomId);
    }
  });
});

function broadcastRoom(roomId){
  const room = rooms[roomId];
  if(!room) return;
  const playersData = {};
  for(let name in room.players){
    const p = room.players[name];
    playersData[name] = { chipColor: p.chipColor, pos: p.pos, hype: p.hype };
  }
  for(let name in room.players){
    room.players[name].ws.send(JSON.stringify({ type:"updatePlayers", players: playersData }));
  }
}

function broadcastPlayerMoved(roomId, playerName, roll, pos){
  const room = rooms[roomId];
  if(!room) return;
  for(let name in room.players){
    room.players[name].ws.send(JSON.stringify({ type:"playerMoved", playerName, roll, pos }));
  }
}

const pathLength = 18; // количество клеток
console.log("Server started on ws://localhost:8080");
