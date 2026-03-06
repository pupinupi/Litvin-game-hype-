const chip = document.getElementById("chip")
const dice = document.getElementById("dice")

const effect = document.getElementById("effect")

const hypeFill = document.getElementById("hypeFill")
const hypeText = document.getElementById("hypeText")

const winScreen = document.getElementById("win")

let position = 0
let hype = 0

// цвет из лобби
chip.style.background = localStorage.color || "red"


// координаты клеток
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


moveChip()


dice.onclick = ()=>{

let roll = Math.floor(Math.random()*6)+1

position += roll

if(position >= path.length)
position = path.length-1

moveChip()

cellEffect()

}


function moveChip(){

chip.style.left = path[position].x+"px"
chip.style.top = path[position].y+"px"

}


function cellEffect(){

let change = 0

switch(position){

case 1: change=3; break
case 2: change=2; break
case 5: change=2; break
case 7: change=3; break
case 8: change=5; break
case 11: change=3; break
case 13: change=3; break
case 15: change=2; break
case 17: change=8; break
case 19: change=4; break

case 9:
case 18:
hype=0
showEffect("ВСЁ -0")
updateHype()
return

case 10:
hype-=10
showEffect("-10")
updateHype()
return

}


if(change!==0){

hype += change
showEffect("+"+change)

updateHype()

}

}


function updateHype(){

if(hype<0) hype=0

hypeFill.style.width = (hype/70*100)+"%"

hypeText.innerText = "Хайп: "+hype+" / 70"


if(hype>=70){

winScreen.style.display="flex"

}

}


function showEffect(text){

effect.innerText=text

effect.style.left = chip.style.left
effect.style.top = chip.style.top

effect.style.opacity=1
effect.style.transform="translate(-50%,-50%)"

setTimeout(()=>{

effect.style.opacity=0

},900)

}
