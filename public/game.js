const chip = document.getElementById("chip")
const diceBtn = document.getElementById("diceBtn")

let position = 0

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

// поставить фишку на старт
moveChip()

diceBtn.onclick = function(){

const roll = Math.floor(Math.random()*6)+1

position = (position + roll) % path.length
}

moveChip()

}

function moveChip(){

const cell = path[position]

chip.style.left = cell.x + "px"
chip.style.top = cell.y + "px"

}
