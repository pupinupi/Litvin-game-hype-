const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const hypeText = document.getElementById("hypeValue")
const hypeFill = document.getElementById("hypeFill")
const riskWindow = document.getElementById("riskWindow")
const diceResult = document.getElementById("diceResult")
const ruleWindow = document.getElementById("ruleWindow")
const scandalBox = document.getElementById("scandalCard")
const scandalText = document.getElementById("scandalText")
const playersList = document.getElementById("playersList")

const playerName = localStorage.getItem("playerName") || "Игрок"
const chipColor = localStorage.getItem("chipColor") || "red"
let currentRoom = localStorage.getItem("roomId") || "123"

document.getElementById("player").innerText = playerName
chip.style.background = chipColor
chip.style.boxShadow = "0 0 15px "+chipColor

let hype = 0
let pos = 0
let skipNext = false
let rolling = false
const MAX_HYPE = 70
let otherPlayers = {}

// Путь клеток
const path = [
  {x:87,y:467,type:"start",hype:5},
  {x:63,y:354,type:"+",hype:3},
  {x:66,y:285,type:"+",hype:2},
  {x:67,y:187,type:"scandal"},
  {x:76,y:103,type:"risk"},
  {x:176,y:77,type:"+",hype:2},
  {x:287,y:77,type:"scandal"},
  {x:515,y:76,type:"+",hype:5},
  {x:721,y:102,type:"minus10skip"},
  {x:713,y:181,type:"+",hype:3},
  {x:720,y:268,type:"risk"},
  {x:720,y:355,type:"+",hype:3},
  {x:711,y:454,type:"skip"},
  {x:619,y:484,type:"+",hype:2},
  {x:513,y:484,type:"scandal"},
  {x:290,y:489,type:"minus15skip"},
  {x:158,y:486,type:"+",hype:4}
]

moveChip()
showRuleWindow()

// ===== WebSocket =====
const socket = new WebSocket("wss://YOUR_RENDER_URL_HERE") // <-- замените на ваш URL Render

socket.onopen = ()=>{
  socket.send(JSON.stringify({type:"joinRoom", roomId: currentRoom, playerName, chipColor}))
}

socket.onmessage = e=>{
  const data = JSON.parse(e.data)
  switch(data.type){
    case "updatePlayers":
      updateOtherPlayers(data.players)
      break
    case "playerMoved":
      if(data.playerName === playerName){
        move(data.roll)
      } else {
        moveOtherPlayer(data.playerName, data.pos)
      }
      break
    case "skipTurn":
      if(data.playerName===playerName){
        showPopup(riskWindow,"⛔ Пропуск хода","yellow")
      }
      break
  }
}

// ===== Кнопка кубика =====
diceBtn.onclick = function() {
  if(rolling) return
  socket.send(JSON.stringify({type:"diceRoll", roomId: currentRoom, playerName}))
}

// ===== Движение фишки =====
function move(steps){
  if(steps<=0){
    checkCell(path[pos])
    return
  }
  pos = (pos + 1) % path.length
  moveChip()
  setTimeout(()=>{ move(steps-1) },350)
}

function moveChip(){
  const cell = path[pos]
  chip.style.transition = "left 0.3s ease, top 0.3s ease"
  chip.style.left = cell.x+"px"
  chip.style.top = cell.y+"px"

  chip.classList.remove("hypePop")
  void chip.offsetWidth
  chip.classList.add("hypePop")
}

// ===== Обновление других игроков =====
function updateOtherPlayers(players){
  otherPlayers = {}
  playersList.innerHTML = ""

  for(let name in players){
    const p = players[name]

    // Список участников
    const span = document.createElement("div")
    span.innerText = name + " — Хайп: " + p.hype
    span.style.color = (name === playerName) ? chipColor : p.chipColor
    playersList.appendChild(span)

    // Фишки на поле
    if(name !== playerName){
      if(!otherPlayers[name]){
        const el = document.createElement("div")
        el.className="chip"
        el.style.background = p.chipColor
        el.style.position="absolute"
        el.style.width="30px"
        el.style.height="30px"
        el.style.borderRadius="50%"
        el.style.left = path[p.pos].x+"px"
        el.style.top = path[p.pos].y+"px"
        document.getElementById("board").appendChild(el)
        otherPlayers[name]={...p, element:el}
      } else {
        otherPlayers[name].pos = p.pos
      }
    }
  }
}

function moveOtherPlayer(name,pos){
  const player = otherPlayers[name]
  if(player){
    const cell = path[pos]
    player.element.style.transition = "left 0.3s ease, top 0.3s ease"
    player.element.style.left = cell.x+"px"
    player.element.style.top = cell.y+"px"
  }
}

// ===== Хайп =====
function updateHype(){
  if(hype<0) hype=0
  if(hype>MAX_HYPE) hype=MAX_HYPE
  hypeText.innerText = "Хайп: " + hype
  hypeFill.style.width = (hype/MAX_HYPE*100)+"%"
  if(hype>=MAX_HYPE) winGame()
}

function addHype(amount){
  hype += amount
  showHypeFloat(amount)
  updateHype()
}

function showHypeFloat(value){
  const float = document.createElement("div")
  float.className = "hypeFloat"
  float.innerText = (value>0?"+":"")+value
  document.body.appendChild(float)
  const board = document.getElementById("board")
  const rect = board.getBoundingClientRect()
  float.style.left = (rect.left + rect.width/2) + "px"
  float.style.top = (rect.top + rect.height/2) + "px"
  setTimeout(()=>{ float.remove() },1200)
}

// ===== Проверка клеток =====
function checkCell(cell){
  switch(cell.type){
    case "+":
      addHype(cell.hype)
      break
    case "start":
      addHype(cell.hype)
      showPopup(riskWindow,"🚀 Старт +5 хайпа","green")
      break
    case "scandal":
      scandalCard()
      break
    case "risk":
      riskCard()
      break
    case "minus10skip":
      addHype(-10)
      skipNext=true
      showPopup(riskWindow,"⚠️ −10 хайпа и пропуск хода","red")
      break
    case "minus15skip":
      addHype(-15)
      skipNext=true
      showPopup(riskWindow,"🚫 Блокировка канала! −15 хайпа","red")
      break
    case "skip":
      skipNext=true
      showPopup(riskWindow,"⛔ Пропуск хода","yellow")
      break
  }
}

// ===== Риск =====
function riskCard(){
  highlightPopup(riskWindow)
  showPopup(riskWindow,"🎲 Риск!","yellow")
  setTimeout(()=>{
    const roll = Math.floor(Math.random()*6)+1
    if(roll<=3){
      addHype(6)
      showPopup(riskWindow,"+6 хайпа","green")
    } else {
      addHype(-4)
      showPopup(riskWindow,"-4 хайпа","red")
    }
  },2000)
}

// ===== Скандал =====
function scandalCard(){
  const cards=[
    "Перегрел аудиторию -1","Громкий заголовок -2","Это монтаж -3",
    "Меня взломали -3","Подписчики в шоке -4","Удаляй пока не поздно -5",
    "Контент вы не понимаете -5","Алгоритм не продвигает -4","Комментарии закрыты -2",
    "Видео удалили -6","Теневой бан -5","Неудачная реклама -3",
    "Срач в комментариях -4","Нарушение правил -5","Конфликт с блогером -3",
    "Отписки -4","Видео не зашло -2","Стрим сорвался -3",
    "Фанаты разочарованы -4","Жалобы на контент -5","Неловкий момент -2",
    "Интернет отключился -1","Хейт в комментариях -3","Жалоба на канал -4",
    "Блокировка стрима -6"
  ]
  const card = cards[Math.floor(Math.random()*cards.length)]
  scandalText.innerText = card
  highlightPopup(scandalBox)
  scandalBox.style.display="block"
  setTimeout(()=>{ scandalBox.style.display="none" },3000)
}

// Подсветка popup
function highlightPopup(container){
  container.style.boxShadow = "0 0 25px gold"
  setTimeout(()=>{ container.style.boxShadow = "" },2500)
}

// ===== POPUP =====
function showPopup(container,text,color){
  highlightPopup(container)
  container.innerText = text
  container.className = "popup "+color
  container.style.display="block"
  const board = document.getElementById("board")
  const rect = board.getBoundingClientRect()
  container.style.left = (rect.left + rect.width/2 - 100)+"px"
  container.style.top = (rect.top + rect.height/2 - 50)+"px"
  setTimeout(()=>container.style.display="none",2500)
}

// ===== Победа =====
function winGame(){
  document.getElementById("winnerText").innerText = playerName+" набрал 70 хайпа!"
  document.getElementById("winScreen").style.display="flex"
  diceBtn.disabled=true
}

// ===== Лобби — краткие правила =====
function showRuleWindow(){
  const txt = "🏆 Победа при 70 хайпа\n🎲 Риск: 1-3 +6, 4-6 -4"
  ruleWindow.innerText = txt
  ruleWindow.className="popup yellow centerPopup"
  ruleWindow.style.display="block"
  setTimeout(()=>ruleWindow.style.display="none",5000)
}
