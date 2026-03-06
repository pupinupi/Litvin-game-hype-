const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const hypeText = document.getElementById("hypeValue")
const hypeFill = document.getElementById("hypeFill")
const riskWindow = document.getElementById("riskWindow")
const cardWindow = document.getElementById("cardWindow")
const hypeLog = document.getElementById("hypeLog")
const ruleWindow = document.getElementById("ruleWindow")

const playerName = localStorage.getItem("playerName")
const chipColor = localStorage.getItem("chipColor")
document.getElementById("player").innerText = playerName
chip.style.background = chipColor

let hype = 0
let pos = 0
let skipNext = false
const MAX_HYPE = 70

// Показ краткого правила после лобби
showRuleWindow()

const path=[
{x:87,y:467,type:"start",hype:5},
{x:63,y:354,type:"+",hype:3},
{x:66,y:285,type:"+",hype:2},
{x:67,y:187,type:"scandal",hype:0},
{x:76,y:103,type:"risk",hype:0},
{x:176,y:77,type:"+",hype:2},
{x:287,y:77,type:"scandal",hype:0},
{x:397,y:79,type:"+",hype:3},
{x:515,y:76,type:"+",hype:5},
{x:621,y:86,type:"minus15skip",hype:-15},
{x:721,y:102,type:"minus10skip",hype:-10},
{x:713,y:181,type:"+",hype:3},
{x:720,y:268,type:"risk",hype:0},
{x:720,y:355,type:"+",hype:3},
{x:711,y:454,type:"skip",hype:0},
{x:619,y:484,type:"+",hype:2},
{x:513,y:484,type:"scandal",hype:0},
{x:398,y:471,type:"+",hype:8},
{x:290,y:489,type:"minus15skip",hype:-15},
{x:158,y:486,type:"+",hype:4},
]

moveChip()
highlightCell(pos)

diceBtn.onclick = function(){
  if(skipNext){
    showPopup(riskWindow,"Вы пропускаете ход!",chip,"yellow")
    skipNext=false
    return
  }
  rollDiceAnimation()
}

// ===== АНИМАЦИЯ КУБИКА =====
function rollDiceAnimation(){
  let count=0
  const interval = setInterval(()=>{
    const fakeRoll = Math.floor(Math.random()*6)+1
    diceBtn.innerText="🎲 "+fakeRoll
    count++
    if(count>=10){
      clearInterval(interval)
      const roll = Math.floor(Math.random()*6)+1
      diceBtn.innerText="🎲 "+roll
      move(roll)
    }
  },80)
}

// ===== ДВИЖЕНИЕ ФИШКИ =====
function move(steps){
  let interval = setInterval(()=>{
    if(steps<=0){
      clearInterval(interval)
      checkCell(path[pos])
      return
    }
    pos = (pos+1) % path.length
    moveChip()
    highlightCell(pos)
    steps--
  },200)
}

function moveChip(){
  const cell = path[pos]
  chip.style.left = cell.x+"px"
  chip.style.top = cell.y+"px"
}

function highlightCell(index){
  const boardImg = document.getElementById("boardImg")
  boardImg.style.boxShadow = `0 0 20px ${path[index].type=="scandal"?"red":path[index].type=="risk"?"yellow":"white"}`
}

// ===== ХАЙП =====
function updateHype(){
  if(hype<0) hype=0
  if(hype>MAX_HYPE) hype=MAX_HYPE
  hypeText.innerText = "Хайп: "+hype
  hypeFill.style.width=(hype/MAX_HYPE*100)+"%"
}

function showPopup(container,text,target,color){
  container.innerText=text
  container.className="popup "+color+" centerPopup"
  container.style.display="block"
  setTimeout(()=>container.style.display="none",2500)
}

function addHype(amount){
  hype+=amount
  updateHype()
  hypeLog.innerText=playerName+" "+(amount>0?"+":"")+amount
  showPopup(hypeLog,(amount>0?"+":"")+amount+" хайп",chip,"green")
}

// ===== ПРОВЕРКА КЛЕТКИ =====
function checkCell(cell){
  riskWindow.innerText=""
  cardWindow.innerText=""
  switch(cell.type){
    case "+":
      addHype(cell.hype)
      break
    case "start":
      addHype(cell.hype)
      showPopup(cardWindow,"Старт! +5 хайп",chip,"green")
      break
    case "scandal":
      scandalCard()
      break
    case "risk":
      riskCard()
      break
    case "minusAll":
      hype=0
      updateHype()
      showPopup(cardWindow,"Весь хайп потерян!",chip,"red")
      break
    case "minus10skip":
      addHype(-10)
      skipNext=true
      showPopup(cardWindow,"-10 хайп и пропуск хода",chip,"red")
      break
    case "minus15skip":
      addHype(-15)
      skipNext=true
      showPopup(cardWindow,"-15 хайп и пропуск хода (блокировка канала)",chip,"red")
      break
    case "skip":
      skipNext=true
      showPopup(cardWindow,"Пропуск хода",chip,"yellow")
      break
  }
}

// ===== СКАНДАЛ =====
function scandalCard(){
  const cards=[
    {txt:"🔥 перегрел аудиторию",h:-1},
    {txt:"🫣 громкий заголовок",h:-2},
    {txt:"😱 это монтаж",h:-3},
    {txt:"#️⃣ меня взломали",h:-3},
    {txt:"😮 подписчики в шоке",h:-4},
    {txt:"🤫 удаляй пока не поздно",h:-5},
    {txt:"🙄 это контент вы не понимаете",h:-5,skip:true}
  ]
  const card=cards[Math.floor(Math.random()*cards.length)]
  addHype(card.h)
  if(card.skip) skipNext=true
  showPopup(cardWindow,card.txt+" "+card.h+" хайп",chip,"red")
}

// ===== РИСК =====
function riskCard(){
  showPopup(riskWindow,"Риск! 1-3 → +6, 4-6 → -4",chip,"yellow")
  setTimeout(()=>{
    const roll=Math.floor(Math.random()*6)+1
    if(roll<=3){
      addHype(6)
      showPopup(riskWindow,"Риск удался! +6 хайп",chip,"green")
    } else {
      addHype(-4)
      showPopup(riskWindow,"Риск не удался! -4 хайп",chip,"red")
    }
  },2000)
}

// ===== КРАТКОЕ ПРАВИЛО ПОСЛЕ ЛОББИ =====
function showRuleWindow(){
  const txt="🏆 Победа при 70 хайпа\n🎲 Риск: 1-3 +6, 4-6 -4\n⛔ Тюрьма: пропуск хода\n⚖️ Суд: пропуск хода"
  ruleWindow.innerText=txt
  ruleWindow.className="popup yellow centerPopup"
  ruleWindow.style.display="block"
  setTimeout(()=>ruleWindow.style.display="none",5000)
}

// ===== ДОБАВЛЯЕМ ВСПЛЕСК НА ФИШКЕ =====
function addHype(amount){
  hype += amount
  if(hype<0) hype=0
  if(hype>MAX_HYPE) hype=MAX_HYPE
  hypeText.innerText = "Хайп: " + hype
  hypeFill.style.width = (hype/MAX_HYPE*100)+"%"

  // Лог
  hypeLog.innerText = playerName + " " + (amount>0?"+":"")+amount
  showPopup(hypeLog,(amount>0?"+":"")+amount+" хайп",chip,"green")

  // Всплеск на фишке
  chip.classList.remove("hypePop")
  void chip.offsetWidth  // триггер перезапуска анимации
  chip.classList.add("hypePop")
}

// ===== ЦЕНТР popup НА ПОЛЕ =====
function showPopup(container,text,target,color){
  container.innerText = text
  container.className = "popup "+color
  container.style.display = "block"

  // Получаем координаты поля
  const boardRect = document.getElementById("board").getBoundingClientRect()
  const popupRect = container.getBoundingClientRect()
  // Центрируем на поле
  container.style.left = (boardRect.left + boardRect.width/2 - popupRect.width/2) + "px"
  container.style.top = (boardRect.top + boardRect.height/2 - popupRect.height/2) + "px"

  setTimeout(()=>container.style.display="none",2500)
}
