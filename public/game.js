const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const hypeText = document.getElementById("hypeValue")
const hypeFill = document.getElementById("hypeFill")
const riskWindow = document.getElementById("riskWindow")
const diceResult = document.getElementById("diceResult")

const playerName = localStorage.getItem("playerName")
const chipColor = localStorage.getItem("chipColor")

document.getElementById("player").innerText = playerName || "Игрок"

chip.style.background = chipColor || "red"
chip.style.boxShadow = "0 0 15px " + (chipColor || "red")

let hype = 0
let pos = 0
let skipNext = false
let rolling = false // чтобы кубик не кликался дважды

const MAX_HYPE = 70

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

// стартовая позиция фишки
moveChip()

diceBtn.onclick = function() {
  if(skipNext){
    skipNext = false
    showPopup(riskWindow,"⛔ Пропуск хода","yellow")
    return
  }
  if(rolling) return
  rollDiceAnimation()
}

// ===== АНИМАЦИЯ КУБИКА =====
function rollDiceAnimation(){
  rolling = true
  let count = 0
  diceResult.style.display = "block"
  let fakeRoll = 1
  const interval = setInterval(()=>{
    fakeRoll = Math.floor(Math.random()*6)+1
    diceBtn.innerText = "🎲 "+fakeRoll
    diceResult.innerText = fakeRoll
    count++
    highlightDestination(fakeRoll) // подсветка клетки
    if(count>=12){
      clearInterval(interval)
      setTimeout(()=>{
        diceResult.style.display="none"
        move(fakeRoll)
        rolling = false
      },300)
    }
  },70)
}

// ===== ПОДСВЕТКА КЛЕТКИ =====
function highlightDestination(roll){
  const targetPos = (pos + roll) % path.length
  const boardImg = document.getElementById("boardImg")
  boardImg.style.boxShadow = `0 0 25px ${
    path[targetPos].type=="scandal"?"red":
    path[targetPos].type=="risk"?"yellow":
    path[targetPos].type=="minus10skip"||path[targetPos].type=="minus15skip"?"red":"white"}`
}

// ===== ДВИЖЕНИЕ ФИШКИ =====
function move(steps){
  let interval = setInterval(()=>{
    if(steps<=0){
      clearInterval(interval)
      checkCell(path[pos])
      boardImgReset()
      return
    }
    pos = (pos+1) % path.length
    moveChip()
    steps--
  },220)
}

function moveChip(){
  const cell = path[pos]
  chip.style.left = cell.x + "px"
  chip.style.top = cell.y + "px"
}

// Сбрасываем подсветку после хода
function boardImgReset(){
  const boardImg = document.getElementById("boardImg")
  boardImg.style.boxShadow="0 0 20px white"
}

// ===== ХАЙП =====
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

// Всплывающий + / − хайп
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

// ===== ПРОВЕРКА КЛЕТКИ =====
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

// ===== РИСК =====
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

// ===== СКАНДАЛ =====
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
  const box = document.getElementById("scandalCard")
  const text = document.getElementById("scandalText")
  text.innerText = card
  highlightPopup(box)
  box.style.display="block"
  const board = document.getElementById("board")
  const rect = board.getBoundingClientRect()
  box.style.left = (rect.left + rect.width/2 - 130) + "px"
  box.style.top = (rect.top + rect.height/2 - 80) + "px"
  setTimeout(()=>{ box.style.display="none" },3000)
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

// ===== ПОБЕДА =====
function winGame(){
  document.getElementById("winnerText").innerText = playerName+" набрал 70 хайпа!"
  document.getElementById("winScreen").style.display="flex"
  diceBtn.disabled=true
}
