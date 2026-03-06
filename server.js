const express = require("express")
const WebSocket = require("ws")
const http = require("http")
const app = express()

app.use(express.static("public"))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const rooms = {} // {roomId: {players:{playerName:{pos,hype,chipColor,skipNext,ws}}}}

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg)
    switch(data.type){
      case "joinRoom":
        if(!rooms[data.roomId]) rooms[data.roomId]={players:{}}
        rooms[data.roomId].players[data.playerName]={pos:0,hype:0,skipNext:false,chipColor:data.chipColor,ws:ws}
        broadcastRoom(data.roomId,{type:"updatePlayers",players:rooms[data.roomId].players})
        break
      case "diceRoll":
        handleDiceRoll(data)
        break
    }
  })
})

function broadcastRoom(roomId,message){
  Object.values(rooms[roomId].players).forEach(p=>{
    if(p.ws.readyState===WebSocket.OPEN) p.ws.send(JSON.stringify(message))
  })
}

function handleDiceRoll(data){
  const room = rooms[data.roomId]
  const player = room.players[data.playerName]
  if(player.skipNext){
    player.skipNext=false
    broadcastRoom(data.roomId,{type:"skipTurn",playerName:data.playerName})
    return
  }
  const roll = Math.floor(Math.random()*6)+1
  player.pos = (player.pos+roll)%17
  broadcastRoom(data.roomId,{type:"playerMoved",playerName:data.playerName,pos:player.pos,roll:roll})
  broadcastRoom(data.roomId,{type:"updatePlayers",players:room.players})
}

const PORT = process.env.PORT || 8080
server.listen(PORT,()=>console.log("Server running on port",PORT))
