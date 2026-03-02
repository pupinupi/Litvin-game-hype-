const socket = io();

const room = localStorage.room;
const name = localStorage.name;
const color = localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

let players = [];

/*
==============================
ТОЧНЫЕ КООРДИНАТЫ ПОЛЯ
СТАРТ → ВВЕРХ → ВПРАВО → ВНИЗ → ВЛЕВО
==============================
*/

const path = [

/* СТАРТ (низ слева) */
[116,605],

/* ВВЕРХ */
[120,520],
[120,440],
[120,350],
[120,260],
[120,170],

/* ВПРАВО */
[232,102],
[348,97],
[494,99],
[644,102],
[771,86],

/* ВНИЗ */
[898,122],
[912,238],
[909,354],
[917,450],
[901,575],

/* ВЛЕВО */
[773,597],
[641,605],
[500,597],
[345,608],
[232,610]

];


// =======================
// SOCKET EVENTS
// =======================

socket.on("updatePlayers", p=>{
players = p;
draw();
updateUI();
});

socket.on("diceResult", n=>{
showDice(n);
});

socket.on("turn", t=>{
highlightTurn(t);
});


// =======================
// БРОСОК
// =======================

function roll(){
socket.emit("rollDice",room);
}


// =======================
// РИСОВАНИЕ
// =======================

function draw(){

ctx.clearRect(0,0,1024,1024);

players.forEach((pl,index)=>{

let cell = path[pl.pos];

if(!cell) return;

let offset = index * 18;

/* подсветка */
ctx.beginPath();
ctx.arc(cell[0],cell[1],28,0,6.28);
ctx.fillStyle="rgba(255,255,255,0.2)";
ctx.fill();

/* фишка */
ctx.beginPath();
ctx.arc(
cell[0]+offset,
cell[1]-offset,
20,
0,
6.28
);

ctx.fillStyle = pl.color;
ctx.fill();

/* имя */
ctx.fillStyle="white";
ctx.font="16px Arial";
ctx.fillText(
pl.name,
cell[0]-30,
cell[1]-35
);

});

}


// =======================
// UI ИГРОКОВ
// =======================

function updateUI(){

const div=document.getElementById("players");

div.innerHTML="";

players.forEach(p=>{

div.innerHTML+=`
<div>
${p.name}
🔥 ${p.hype}
</div>
`;

});

}


// =======================
// КУБИК
// =======================

function showDice(n){

const dice=document.createElement("div");

dice.style.position="fixed";
dice.style.top="50%";
dice.style.left="50%";
dice.style.transform="translate(-50%,-50%)";
dice.style.fontSize="60px";
dice.style.background="#111";
dice.style.padding="40px";
dice.style.border="3px solid orange";
dice.style.borderRadius="15px";
dice.innerHTML="🎲 "+n;

document.body.appendChild(dice);

setTimeout(()=>dice.remove(),1500);
}


// =======================
// ПОДСВЕТКА ХОДА
// =======================

function highlightTurn(turn){

document.querySelectorAll("#players div")
.forEach((el,i)=>{

el.style.color =
i===turn ? "orange":"white";

});

}
