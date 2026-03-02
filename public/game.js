const socket = io();

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let players=[];
let moving=false;

function resize(){
canvas.width=canvas.offsetWidth;
canvas.height=canvas.offsetHeight;
draw();
}
window.onresize=resize;
resize();

/* ✅ ПУТЬ ПО ПОЛЮ (проценты) */
const path=[

{ x:11,y:92 },
{ x:11,y:75 },
{ x:11,y:60 },
{ x:11,y:45 },
{ x:12,y:30 },

{ x:25,y:20 },
{ x:40,y:18 },
{ x:55,y:18 },
{ x:70,y:18 },
{ x:85,y:22 },

{ x:90,y:38 },
{ x:90,y:55 },
{ x:88,y:72 },

{ x:75,y:92 },
{ x:60,y:94 },
{ x:45,y:94 },
{ x:30,y:94 },
{ x:15,y:94 }

];

/* ===== DRAW ===== */

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

players.forEach(p=>{

const pos=path[p.pos];
if(!pos)return;

const x=canvas.width*pos.x/100;
const y=canvas.height*pos.y/100;

/* фишка */
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(x,y,12,0,Math.PI*2);
ctx.fill();

/* хайп */
ctx.fillStyle="yellow";
ctx.font="14px Arial";
ctx.fillText(
"🔥"+p.hype,
x-15,
y-20
);

});

}

/* ===== ПЛАВНОЕ ДВИЖЕНИЕ ===== */

async function animateMove(index,steps){

if(moving) return;
moving=true;

for(let i=0;i<steps;i++){

await new Promise(r=>setTimeout(r,350));

players[index].pos++;

if(players[index].pos>=path.length)
players[index].pos=0;

draw();
}

moving=false;

socket.emit(
"finishMove",
room,
index
);
}

/* ===== SOCKET ===== */

socket.on("updatePlayers",p=>{
players=p;
draw();
});

socket.on("startMove",data=>{
animateMove(
data.player,
data.steps
);
});

/* ===== SCANDAL ===== */

socket.on("scandalPopup",text=>{

const box=document.getElementById("scandal");

box.innerText=text;
box.classList.add("show");

setTimeout(()=>{
box.classList.remove("show");
},2500);

});

/* ===== DICE ===== */

function roll(){
socket.emit("rollDice",room);
}
