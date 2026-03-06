const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")
const hypeText = document.getElementById("hypeValue")
const hypeFill = document.getElementById("hypeFill")
const riskWindow = document.getElementById("riskWindow")
const cardWindow = document.getElementById("cardWindow")
const hypeLog = document.getElementById("hypeLog")
const ruleWindow = document.getElementById("ruleWindow")
const diceResult = document.getElementById("diceResult")

const playerName = localStorage.getItem("playerName")
const chipColor = localStorage.getItem("chipColor")

document.getElementById("player").innerText = playerName

chip.style.background = chipColor
chip.style.boxShadow = "0 0 15px "+chipColor

let hype = 0
let pos = 0
let skipNext = false

const MAX_HYPE = 70

showRuleWindow()

const path=[

{x:87,y:467,type:"start",hype:5},
{x:63,y:354,type:"+",hype:3},
{x:66,y:285,type:"+",hype:2},
{x:67,y:187,type:"scandal"},
{x:76,y:103,type:"risk"},
{x:176,y:77,type:"+",hype:2},
{x:287,y:77,type:"scandal"},
{x:397,y:79,type:"+",hype:3},
{x:515,y:76,type:"+",hype:5},
{x:621,y:86,type:"minus15skip"},
{x:721,y:102,type:"minus10skip"},
{x:713,y:181,type:"+",hype:3},
{x:720,y:268,type:"risk"},
{x:720,y:355,type:"+",hype:3},
{x:711,y:454,type:"skip"},
{x:619,y:484,type:"+",hype:2},
{x:513,y:484,type:"scandal"},
{x:398,y:471,type:"+",hype:8},
{x:290,y:489,type:"minus15skip"},
{x:158,y:486,type:"+",hype:4},

]

moveChip()

diceBtn.onclick=function(){

if(skipNext){
document.getElementById("status").innerText="⛔ Пропуск хода"
showPopup(cardWindow,"Вы пропускаете ход","yellow")
skipNext=false
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

if(hype>=MAX_HYPE){
winGame()
}

}

function addHype(amount){

hype+=amount

updateHype()

hypeLog.innerText=playerName+" "+(amount>0?"+":"")+amount

chip.classList.remove("hypePop")
void chip.offsetWidth
chip.classList.add("hypePop")

}

function checkCell(cell){

switch(cell.type){

case "+":
addHype(cell.hype)
break

case "start":
addHype(cell.hype)
showPopup(cardWindow,"Старт! +5 хайп","green")
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
showPopup(cardWindow,"-10 хайп и пропуск","red")
break

case "minus15skip":
addHype(-15)
skipNext=true
showPopup(cardWindow,"-15 хайп и пропуск","red")
break

case "skip":
skipNext=true
showPopup(cardWindow,"Пропуск хода","yellow")
break

}

}

function scandalCard(){

const cards=[

{txt:"🔥 Перегрел аудиторию",h:-1},
{txt:"🫣 Громкий заголовок",h:-2},
{txt:"😱 Это монтаж!",h:-3},
{txt:"#️⃣ Меня взломали",h:-3},
{txt:"😮 Подписчики в шоке",h:-4},
{txt:"🤫 Удаляй пока не поздно",h:-5},
{txt:"🙄 Контент вы не понимаете",h:-5,skip:true}

]

const card=cards[Math.floor(Math.random()*cards.length)]

const cardBox=document.getElementById("scandalCard")
const text=document.getElementById("scandalText")

text.innerText=card.txt+"\n"+card.h+" хайп"

cardBox.style.display="block"

const board=document.getElementById("board")

const rect=board.getBoundingClientRect()

cardBox.style.left=(rect.left+rect.width/2-130)+"px"
cardBox.style.top=(rect.top+rect.height/2-80)+"px"

addHype(card.h)

if(card.skip) skipNext=true

setTimeout(()=>{

cardBox.style.display="none"

},3000)

}

const card=cards[Math.floor(Math.random()*cards.length)]

addHype(card.h)

showPopup(cardWindow,card.txt+" "+card.h+" хайп","red")

}

function riskCard(){

showPopup(riskWindow,"Риск! 1-3 → +6, 4-6 → -4","yellow")

setTimeout(()=>{

const roll=Math.floor(Math.random()*6)+1

if(roll<=3){

addHype(6)
showPopup(riskWindow,"Риск удался! +6","green")

}else{

addHype(-4)
showPopup(riskWindow,"Риск не удался! -4","red")

}

},2000)

}

function showPopup(container,text,color){

container.innerText=text

container.className="popup "+color

container.style.display="block"

const board=document.getElementById("board")

const rect=board.getBoundingClientRect()

container.style.left=(rect.left+rect.width/2-100)+"px"
container.style.top=(rect.top+rect.height/2-50)+"px"

setTimeout(()=>{

container.style.display="none"

},2500)

}

function winGame(){

document.getElementById("winnerText").innerText=playerName+" набрал 70 хайпа!"

document.getElementById("winScreen").style.display="flex"

diceBtn.disabled=true

}

function showRuleWindow(){

ruleWindow.innerText="🏆 Победа при 70 хайпа\n🎲 Риск: 1-3 +6, 4-6 -4\n⛔ пропуск = пропуск хода"

ruleWindow.className="popup yellow"

ruleWindow.style.display="block"

const board=document.getElementById("board")

const rect=board.getBoundingClientRect()

ruleWindow.style.left=(rect.left+rect.width/2-120)+"px"
ruleWindow.style.top=(rect.top+rect.height/2-80)+"px"

setTimeout(()=>ruleWindow.style.display="none",5000)

}
