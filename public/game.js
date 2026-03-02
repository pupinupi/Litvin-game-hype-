const socket=io();
const room=localStorage.room;

const canvas=document.getElementById("board");
const ctx=canvas.getContext("2d");

const img=new Image();
img.src="board.jpg";

/*
ДВИЖЕНИЕ:
СТАРТ
⬆ вверх
➡ вправо
⬇ вниз
⬅ влево
*/

const cells=[

// СТАРТ
[140,820],

// ВВЕРХ
[140,700],
[140,580],
[140,460],
[140,340],
[140,220],

// ВПРАВО
[260,140],
[400,140],
[540,140],
[680,140],
[820,140],

// ВНИЗ
[900,260],
[900,400],
[900,540],
[900,680],
[900,820],

// ВЛЕВО
[760,900],
[620,900],
[480,900],
[340,900],
[200,900]
];

let state=null;

img.onload=draw;

function draw(){

ctx.clearRect(0,0,1024,1024);
ctx.drawImage(img,0,0);

if(!state)return;

state.players.forEach(p=>{
let c=cells[p.pos];

ctx.shadowColor=p.color;
ctx.shadowBlur=25;

ctx.beginPath();
ctx.arc(c[0],c[1],18,0,6.28);
ctx.fillStyle=p.color;
ctx.fill();

ctx.shadowBlur=0;
});
}

function roll(){
socket.emit("rollDice",room);
}

socket.on("state",(s)=>{
state=s;
draw();
update();
});

socket.on("scandal",(t)=>{
popup.innerHTML=
`<div class="card">${t}</div>`;
});

socket.on("winner",(n)=>{
alert("🏆 Победил "+n);
});

function update(){

players.innerHTML="";

state.players.forEach(p=>{
players.innerHTML+=
`<div>${p.name}: ${p.hype} хайпа</div>`;
});
}

function start(){
rules.style.display="none";
socket.emit("startGame",room);
}
