const chip=document.getElementById("chip")
const diceBtn=document.getElementById("diceBtn")
const hypeText=document.getElementById("hypeValue")
const hypeFill=document.getElementById("hypeFill")
const riskWindow=document.getElementById("riskWindow")
const ruleWindow=document.getElementById("ruleWindow")
const diceResult=document.getElementById("diceResult")

const playerName=localStorage.getItem("playerName")
const chipColor=localStorage.getItem("chipColor")

document.getElementById("player").innerText=playerName

chip.style.background=chipColor
chip.style.boxShadow="0 0 15px "+chipColor

let hype=0
let pos=0
let skipNext=false

const MAX_HYPE=70

const path=[

{x:87,y:467,type:"start",hype:5},
{x:63,y:354,type:"+",hype:3},
{x:66,y:285,type:"+",hype:2},
{x:67,y:187,type:"scandal"},
{x:76,y:103,type:"risk"},
{x:176,y:77,type:"+",hype:2},
{x:287,y:77,type:"scandal"},
{x:397,y:79,type:"trend"},
{x:515,y:76,type:"+",hype:5},
{x:621,y:86,type:"virus"},
{x:721,y:102,type:"minus10skip"},
{x:713,y:181,type:"+",hype:3},
{x:720,y:268,type:"risk"},
{x:720,y:355,type:"+",hype:3},
{x:711,y:454,type:"skip"},
{x:619,y:484,type:"+",hype:2},
{x:513,y:484,type:"scandal"},
{x:398,y:471,type:"trend"},
{x:290,y:489,type:"minus15skip"},
{x:158,y:486,type:"+",hype:4},

]

moveChip()

diceBtn.onclick=function(){

if(skipNext){
skipNext=false
showPopup(riskWindow,"Пропуск хода","yellow")
return
}

rollDiceAnimation()

}

function rollDiceAnimation(){

let count=0

diceResult.style.display="block"

const interval=setInterval(()=>{

const fakeRoll=Math.floor(Math.random()*6)+1

diceBtn.innerText="🎲 "+fakeRoll
diceResult.innerText=fakeRoll

count++

if(count>=10){

clearInterval(interval)

const roll=Math.floor(Math.random()*6)+1

diceBtn.innerText="🎲 "+roll
diceResult.innerText=roll

setTimeout(()=>{

diceResult.style.display="none"
move(roll)

},600)

}

},80)

}

function move(steps){

let interval=setInterval(()=>{

if(steps<=0){
clearInterval(interval)
checkCell(path[pos])
return
}

pos=(pos+1)%path.length
moveChip()
steps--

},200)

}

function moveChip(){

const cell=path[pos]

chip.style.left=cell.x+"px"
chip.style.top=cell.y+"px"

}

function updateHype(){

if(hype<0) hype=0
if(hype>MAX_HYPE) hype=MAX_HYPE

hypeText.innerText="Хайп: "+hype
hypeFill.style.width=(hype/MAX_HYPE*100)+"%"

if(hype>=MAX_HYPE) winGame()

}

function addHype(amount){

hype+=amount

updateHype()

}

function checkCell(cell){

switch(cell.type){

case "+":
addHype(cell.hype)
break

case "start":
addHype(cell.hype)
break

case "scandal":
scandalCard()
break

case "risk":
riskCard()
break

case "trend":
trendCard()
break

case "virus":
virusCard()
break

case "minus10skip":
addHype(-10)
skipNext=true
break

case "minus15skip":
addHype(-15)
skipNext=true
break

case "skip":
skipNext=true
break

}

}

function trendCard(){

showPopup(riskWindow,"⚡ Тренд! +10 хайпа","green")

setTimeout(()=>{

addHype(10)

},1000)

}

function virusCard(){

showPopup(riskWindow,"🚀 Вирусное видео!","green")

setTimeout(()=>{

addHype(15)

showPopup(riskWindow,"+15 хайпа","green")

},1200)

}

function riskCard(){

showPopup(riskWindow,"Риск!","yellow")

setTimeout(()=>{

const roll=Math.floor(Math.random()*6)+1

if(roll<=3){

addHype(6)
showPopup(riskWindow,"+6 хайпа","green")

}else{

addHype(-4)
showPopup(riskWindow,"-4 хайпа","red")

}

},2000)

}

function scandalCard(){

const cards=[

"Перегрел аудиторию -1",
"Громкий заголовок -2",
"Это монтаж -3",
"Меня взломали -3",
"Подписчики в шоке -4",
"Удаляй пока не поздно -5",
"Контент вы не понимаете -5",
"Алгоритм не продвигает -4",
"Комментарии закрыты -2",
"Видео удалили -6",
"Теневой бан -5",
"Неудачная реклама -3",
"Срач в комментариях -4",
"Нарушение правил -5",
"Конфликт с блогером -3",
"Отписки -4",
"Видео не зашло -2",
"Стрим сорвался -3",
"Фанаты разочарованы -4",
"Жалобы на контент -5",
"Неловкий момент -2",
"Интернет отключился -1",
"Хейт в комментариях -3",
"Жалоба на канал -4",
"Блокировка стрима -6"

]

const card=cards[Math.floor(Math.random()*cards.length)]

const box=document.getElementById("scandalCard")
const text=document.getElementById("scandalText")

text.innerText=card

box.style.display="block"

const board=document.getElementById("board")
const rect=board.getBoundingClientRect()

box.style.left=(rect.left+rect.width/2-130)+"px"
box.style.top=(rect.top+rect.height/2-80)+"px"

setTimeout(()=>{

box.style.display="none"

},3000)

}

function showPopup(container,text,color){

container.innerText=text
container.className="popup "+color
container.style.display="block"

const board=document.getElementById("board")
const rect=board.getBoundingClientRect()

container.style.left=(rect.left+rect.width/2-100)+"px"
container.style.top=(rect.top+rect.height/2-50)+"px"

setTimeout(()=>container.style.display="none",2500)

}

function winGame(){

document.getElementById("winnerText").innerText=playerName+" набрал 70 хайпа!"

document.getElementById("winScreen").style.display="flex"

diceBtn.disabled=true

}
