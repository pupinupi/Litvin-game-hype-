console.log("GAME LOADED");

/* ===== CANVAS ===== */

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=700;
canvas.height=700;

/* ===== КУБИК ===== */

function roll(){

const value=Math.floor(Math.random()*6)+1;

document.getElementById("dice").innerText=value;

move(value);
}

/* ===== ИГРОК ===== */

let player={
pos:0,
hype:0
};

/* ===== ПУТЬ ===== */

const path=[

{x:120,y:600},
{x:120,y:500},
{x:120,y:400},
{x:120,y:300},
{x:120,y:200},

{x:250,y:120},
{x:380,y:120},
{x:500,y:120},

{x:600,y:250},
{x:600,y:400},

{x:520,y:600},
{x:400,y:600},
{x:250,y:600}

];

/* ===== РИСОВКА ===== */

function draw(){

ctx.clearRect(0,0,700,700);

const p=path[player.pos];

ctx.fillStyle="red";

ctx.beginPath();
ctx.arc(p.x,p.y,15,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="yellow";
ctx.fillText("🔥 "+player.hype,p.x-20,p.y-20);
}

draw();

/* ===== ДВИЖЕНИЕ ===== */

async function move(steps){

for(let i=0;i<steps;i++){

await new Promise(r=>setTimeout(r,300));

player.pos++;

if(player.pos>=path.length)
player.pos=0;

player.hype+=1;

draw();
}
}
