const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const diceResult = document.getElementById("diceResult")
const message = document.getElementById("message")
const hypeFill = document.getElementById("hypeFill")

let position = 0
let hype = 0
let skipTurn = false

const color = localStorage.color || "red"
chip.style.background = color

const path = [
{x:87,y:467},
{x:63,y:354},
{x:66,y:285},
{x:67,y:187},
{x:76,y:103},
{x:176,y:77},
{x:287,y:77},
{x:397,y:79},
{x:515,y:76},
{x:621,y:86},
{x:721,y:102},
{x:713,y:181},
{x:720,y:268},
{x:720,y:355},
{x:711,y:454},
{x:619,y:484},
{x:513,y:484},
{x:398,y:471},
{x:290,y:489},
{x:158,y:486}
]

chip.style.left = path[0].x+"px"
chip.style.top = path[0].y+"px"

function updateHypeBar(){

let percent = Math.max(0,Math.min(100,(hype/70)*100))
hypeFill.style.width = percent+"%"

if(hype>=70){
message.innerText="🏆 ПОБЕДА! 70 ХАЙПА!"
diceBtn.disabled=true
}

}

function moveChip(){

chip.style.left = path[position].x+"px"
chip.style.top = path[position].y+"px"

}

function scandal(){

const cards=[
{t:"Перегрел аудиторию 🔥",h:-1},
{t:"Громкий заголовок 🫣",h:-2},
{t:"Это монтаж 😱",h:-3},
{t:"Меня взломали #️⃣",all:-3},
{t:"Подписчики в шоке 😮",h:-4},
{t:"Удаляй пока не поздно 🤫",h:-5},
{t:"Это контент, вы не понимаете 🙄",h:-5,skip:true}
]

let c=cards[Math.floor(Math.random()*cards.length)]

message.innerText="СКАНДАЛ: "+c.t

if(c.h) hype+=c.h

if(c.skip) skipTurn=true

updateHypeBar()

}

function risk(){

let roll=Math.floor(Math.random()*6)+1

if(roll<=3){

hype+=6
message.innerText="Риск удался! +6 хайпа"

}else{

hype-=4
message.innerText="Риск не удался! -4 хайпа"

}

updateHypeBar()

}

function cellAction(){

switch(position){

case 1: hype+=3; break
case 2: hype+=2; break
case 3: scandal(); return
case 4: risk(); return
case 5: hype+=2; break
case 6: scandal(); return
case 7: hype+=3; break
case 8: hype+=5; break
case 9: hype=0; break
case 10: hype-=10; skipTurn=true; break
case 11: hype+=3; break
case 12: risk(); return
case 13: hype+=3; break
case 14: skipTurn=true; break
case 15: hype+=2; break
case 16: scandal(); return
case 17: hype+=8; break
case 18: hype=0; break
case 19: hype+=4; break

}

updateHypeBar()

}

diceBtn.onclick=()=>{

if(skipTurn){

message.innerText="⛔ Пропуск хода"
skipTurn=false
return

}

let roll=Math.floor(Math.random()*6)+1

diceResult.innerText="🎲 Выпало: "+roll

position+=roll

if(position>=path.length) position=path.length-1

moveChip()

setTimeout(cellAction,300)

}
