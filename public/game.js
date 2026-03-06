let chip = document.getElementById("chip")

let color = localStorage.getItem("chip") || "red"

chip.style.background = color

let position = 0

const path = [

{ x:20, y:520 },
{ x:80, y:520 },
{ x:140, y:520 },
{ x:200, y:520 },
{ x:260, y:520 },
{ x:320, y:520 },
{ x:380, y:520 },
{ x:440, y:520 },
{ x:500, y:520 },

{ x:500, y:460 },
{ x:500, y:400 },
{ x:500, y:340 },
{ x:500, y:280 },

{ x:440, y:280 },
{ x:380, y:280 },
{ x:320, y:280 },
{ x:260, y:280 }

]

function moveChip(steps){

let moveInterval = setInterval(()=>{

if(steps <= 0){

clearInterval(moveInterval)
eventSquare()

return
}

position++

if(position >= path.length){
position = path.length - 1
}

chip.style.left = path[position].x + "px"
chip.style.top = path[position].y + "px"

steps--

},300)

}

document.getElementById("dice").onclick = function(){

let roll = Math.floor(Math.random()*6)+1

document.getElementById("diceResult").innerText = "Выпало: " + roll

moveChip(roll)

}

function eventSquare(){

let rand = Math.random()

if(rand < 0.3){

showCard()

}else if(rand < 0.6){

showRisk()

}

}

function showCard(){

let cards = [
"Вы нашли клад 💰",
"Потеряли 10 монет 💸",
"Получили бонус ⭐"
]

let text = cards[Math.floor(Math.random()*cards.length)]

alert(text)

}

function showRisk(){

let risks = [
"Вы пропускаете ход",
"Вернитесь на 2 клетки",
"Получите +1 ход"
]

let text = risks[Math.floor(Math.random()*risks.length)]

alert("Риск! " + text)

}
