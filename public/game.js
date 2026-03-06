const chip=document.getElementById("chip")

const playerName=localStorage.getItem("playerName")
const chipColor=localStorage.getItem("chipColor")

document.getElementById("player").innerText=playerName

chip.style.background=chipColor

let hype=10
let pos=0


const path=[

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


function moveChip(){

chip.style.left=path[pos].x+"px"
chip.style.top=path[pos].y+"px"

}



function rollDice(){

const dice=Math.floor(Math.random()*6)+1

document.getElementById("dice").innerText="🎲 "+dice

pos+=dice

if(pos>=path.length){
pos=pos-path.length
}

moveChip()

checkScandal()

}



function checkScandal(){

const chance=Math.random()

if(chance<0.4){

const scandals=[

{txt:"🔥 перегрел аудиторию",h:-1},
{txt:"🫣 громкий заголовок",h:-2},
{txt:"😱 это монтаж",h:-3},
{txt:"#️⃣ меня взломали",h:-3},
{txt:"😮 подписчики в шоке",h:-4},
{txt:"🤫 удаляй пока не поздно",h:-5},
{txt:"🙄 это контент вы не понимаете",h:-5}

]

const s=scandals[Math.floor(Math.random()*scandals.length)]

hype+=s.h

document.getElementById("riskWindow").innerText=s.txt+" "+s.h+" хайп"

showHype(s.h)

updateHype()

}

}



function updateHype(){

document.getElementById("hype").innerText="Хайп: "+hype

}



function showHype(value){

const pop=document.createElement("div")

pop.innerText=value

pop.style.position="absolute"
pop.style.left=chip.style.left
pop.style.top=chip.style.top
pop.style.color="yellow"
pop.style.fontSize="20px"

document.getElementById("board").appendChild(pop)

setTimeout(()=>{
pop.remove()
},1000)

}
