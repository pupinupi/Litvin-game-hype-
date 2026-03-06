const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const hypeText = document.getElementById("hypeValue")
const hypeFill = document.getElementById("hypeFill")
const riskWindow = document.getElementById("riskWindow")
const diceResult = document.getElementById("diceResult")
const scandalBox = document.getElementById("scandalCard")
const scandalText = document.getElementById("scandalText")
const playersList = document.getElementById("playersList")
const ruleWindow = document.getElementById("ruleWindow")

const playerName = localStorage.getItem("playerName") || "Игрок"
const chipColor = localStorage.getItem("chipColor") || "red"
const currentRoom = localStorage.getItem("roomId") || "123"

document.getElementById("player").innerText = playerName
chip.style.background = chipColor
chip.style.boxShadow = "0 0 15px "+chipColor

let hype = 0
let pos = 0
let skipNext = false
let otherPlayers = {}
const MAX_HYPE = 70

// Путь клеток
const path = [

{x:87,y:467,type:"start",hype:5}, //1

{x:63,y:354,type:"+",hype:3}, //2
{x:66,y:285,type:"+",hype:2}, //3

{x:67,y:187,type:"scandal"}, //4
{x:76,y:103,type:"risk"}, //5

{x:176,y:77,type:"+",hype:2}, //6
{x:287,y:77,type:"scandal"}, //7

{x:397,y:79,type:"+",hype:3}, //8
{x:515,y:76,type:"+",hype:5}, //9

{x:621,y:86,type:"minus15"}, //10

{x:721,y:102,type:"minus8skip"}, //11

{x:713,y:181,type:"+",hype:3}, //12
{x:720,y:268,type:"risk"}, //13
{x:720,y:355,type:"+",hype:3}, //14

{x:711,y:454,type:"skip"}, //15

{x:619,y:484,type:"+",hype:2}, //16

{x:513,y:484,type:"scandal"}, //17

{x:398,y:471,type:"+",hype:8}, //18

{x:290,y:489,type:"minus15"}, //19

{x:158,y:486,type:"+",hype:4} //20

]
moveChip()
showRuleWindow()

// ===== WebSocket через WSS =====
const socket = new WebSocket("wss://litvin-game-hype-5mce.onrender.com") // замените на URL Render

socket.onopen = ()=>{
  socket.send(JSON.stringify({ type:"joinRoom", roomId: currentRoom, playerName, chipColor }));
}

socket.onmessage = e=>{
  const data = JSON.parse(e.data);
  switch(data.type){
    case "updatePlayers":
      updateOtherPlayers(data.players)
      break
    case "playerMoved":

  if(data.playerName === playerName){
    move(data.roll)
  } 
  else {
    otherPlayers[data.playerName].pos = data.pos
    moveOtherPlayer(data.playerName, data.pos)
  }

break
  }
}

// ===== Кубик =====
diceBtn.onclick = function(){
  if(skipNext) return
  socket.send(JSON.stringify({type:"diceRoll", roomId: currentRoom, playerName}));
}

// ===== Движение фишки =====
function move(steps){
  if(steps<=0){ checkCell(path[pos]); return }
  pos = (pos+1)%path.length
  moveChip()
  setTimeout(()=>{ move(steps-1) },350)
}

function moveChip(){
  const cell = path[pos]
  chip.style.transition="left 0.3s ease, top 0.3s ease"
  chip.style.left = cell.x+"px"
  chip.style.top = cell.y+"px"

  chip.classList.remove("hypePop")
  void chip.offsetWidth
  chip.classList.add("hypePop")
}

// ===== Другие игроки =====
function updateOtherPlayers(players){
  otherPlayers = {}
  playersList.innerHTML = ""
  for(let name in players){
    const p = players[name]
    const span = document.createElement("div")
    span.innerText = name + " — Хайп: "+p.hype
    span.style.color = (name===playerName)?chipColor:p.chipColor
    playersList.appendChild(span)

    if(name!==playerName){
      if(!otherPlayers[name]){
        const el = document.createElement("div")
        el.className="chip"
        el.style.background=p.chipColor
        el.style.position="absolute"
        el.style.width="30px"
        el.style.height="30px"
        el.style.borderRadius="50%"
        el.style.left = path[p.pos].x+"px"
        el.style.top = path[p.pos].y+"px"
        document.getElementById("board").appendChild(el)
        otherPlayers[name]={...p, element:el}
      } else {
        otherPlayers[name].pos=p.pos
      }
    }
  }
}

function moveOtherPlayer(name,pos){
  const player = otherPlayers[name]
  if(player){
    const cell = path[pos]
    player.element.style.transition="left 0.3s ease, top 0.3s ease"
    player.element.style.left = cell.x+"px"
    player.element.style.top = cell.y+"px"
  }
}

// ===== Хайп, карточки и победа =====
// Используем старую локальную логику: addHype(), checkCell(), scandalCard(), riskCard(), showPopup(), winGame()
