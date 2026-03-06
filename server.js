const express = require("express")
const WebSocket = require("ws")
const http = require("http")
const app = express()

app.use(express.static("public"))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Структура комнат
const rooms = {} // {roomId: {players: {playerName: {pos, hype, skipNext, chipColor, ws}}}}

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg)

    switch(data.type){
      case "joinRoom":
        if(!rooms[data.roomId]) rooms[data.roomId] = {players:{}}
        rooms[data.roomId].players[data.playerName] = {
          pos:0,
          hype:0,
          skipNext:false,
          chipColor:data.chipColor,
          ws: ws
        }
        broadcastRoom(data.roomId, {type:"updatePlayers", players:rooms[data.roomId].players})
        break

      case "diceRoll":
        handleDiceRoll(data)
        break
    }
  })
})

// Обновляем всех игроков в комнате
function broadcastRoom(roomId, message){
  Object.values(rooms[roomId].players).forEach(p=>{
    p.ws.send(JSON.stringify(message))
  })
}

// Обработка броска кубика
function handleDiceRoll(data){
  const room = rooms[data.roomId]
  const player = room.players[data.playerName]
  if(player.skipNext){
    player.skipNext = false
    broadcastRoom(data.roomId, {type:"skipTurn", playerName:data.playerName})
    return
  }

  const roll = Math.floor(Math.random()*6)+1
  player.pos = (player.pos + roll) % 17 // длина пути
  broadcastRoom(data.roomId, {
    type:"playerMoved",
    playerName: data.playerName,
    pos: player.pos,
    roll: roll
  })
}

const PORT = process.env.PORT || 8080
server.listen(PORT, ()=>console.log("Server running on port", PORT))
