const socket = io();

const room = localStorage.room;
const name = localStorage.name;
const color = localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const board=document.getElementById("boardImg");

let players=[];
let moving=false;


/*
==============================
ПРАВИЛЬНЫЙ ОБХОД ПОЛЯ
СТАРТ → ВВЕРХ → ВПРАВО → ВНИЗ → ВЛЕВО
==============================
*/

const path=[

// START
[120,600],

// ⬆ ВВЕРХ
[120,520],
[120,440],
[120,360],
[120,280],
[120,200],

// ➡ ВПРАВО
[240,120],
[360,110],
[500,105],
[640,110],
[780,100],

// ⬇ ВНИЗ
[900,160],
[910,260],
[910,360],
[910,460],
[900,580],

// ⬅ ВЛЕВО
[780,600],
[640,610],
[500,610],
[360,610]
];


// ================= LOAD =================

board.onload=()=>{
canvas.width=board.clientWidth;
canvas.height=board.clientHeight;
draw();
};


// ================= SOCKET =================

socket.on("updatePlayers",p=>{
players=p;
draw();
updateUI();
});


socket.on("startMove",async data=>{

if(moving)return;
moving=true;

await animateMove(data.player,data.steps);

socket.emit("finishMove",room,data.player);

moving=false;
});


socket.on("scandalPopup",text=>{
showScandal(text);
});


// ================= MOVE =================

async function animateMove(index,steps){

for(let i=0;i<steps;i++){

players[index].pos=
(players[index].pos+1)%path.length;

draw();

await sleep(350);
}
}

function sleep(ms){
return new Promise(r=>setTimeout(r,ms));
}


// ================= DRAW =================

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

const sx=canvas.width/1024;
const sy=canvas.height/1024;

players.forEach((p,i)=>{

let pt=path[p.pos];

ctx.beginPath();
ctx.arc(
pt[0]*sx+i*18,
pt[1]*sy-i*18,
18,0,6.28
);

ctx.fillStyle=p.color;
ctx.fill();

});
}


// ================= UI =================

function updateUI(){

playersDiv.innerHTML=
players.map(p=>
`${p.name} 🔥 ${p.hype}`
).join("<br>");

}


// ================= SCANDAL WINDOW =================

function showScandal(text){

const bg=document.createElement("div");

bg.style.position="fixed";
bg.style.top=0;
bg.style.left=0;
bg.style.width="100%";
bg.style.height="100%";
bg.style.background="rgba(0,0,0,0.7)";
bg.style.display="flex";
bg.style.alignItems="center";
bg.style.justifyContent="center";
bg.style.zIndex=999;

const box=document.createElement("div");

box.style.background="#111";
box.style.padding="40px";
box.style.border="3px solid orange";
box.style.borderRadius="15px";
box.style.fontSize="24px";
box.innerHTML=`🔥 СКАНДАЛ<br><br>${text}`;

bg.appendChild(box);

document.body.appendChild(bg);

setTimeout(()=>bg.remove(),3000);
}


function roll(){
socket.emit("rollDice",room);
}
