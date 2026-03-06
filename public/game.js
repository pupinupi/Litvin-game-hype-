const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 600

const board = new Image()
board.src = "board.jpg"

let position = 0
let hype = 0

const color = localStorage.color || "red"

// координаты твоего поля
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

board.onload = draw


function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.drawImage(board,0,0,800,600)

// фишка
let p = path[position]

ctx.beginPath()
ctx.arc(p.x,p.y,12,0,Math.PI*2)
ctx.fillStyle=color
ctx.fill()

}


document.getElementById("diceBtn").onclick=()=>{

let roll = Math.floor(Math.random()*6)+1

position += roll

if(position>19)
position=19

cellEffect()

draw()

}


function cellEffect(){

switch(position){

case 1: hype+=3; message("+3 хайп"); break
case 2: hype+=2; message("+2 хайп"); break
case 5: hype+=2; message("+2 хайп"); break
case 7: hype+=3; message("+3 хайп"); break
case 8: hype+=5; message("+5 хайп"); break
case 11: hype+=3; message("+3 хайп"); break
case 13: hype+=3; message("+3 хайп"); break
case 15: hype+=2; message("+2 хайп"); break
case 17: hype+=8; message("+8 хайп"); break
case 19: hype+=4; message("+4 хайп"); break

case 9:
case 18:
hype=0
message("Весь хайп потерян")
break

case 10:
hype-=10
message("-10 хайп")
break

}

if(hype<0) hype=0

if(hype>=70){

alert("ПОБЕДА!")

}

updatePanel()

}


function message(text){

document.getElementById("messageBox").innerText=text

}


function updatePanel(){

document.getElementById("playersPanel").innerText="Хайп: "+hype

}
