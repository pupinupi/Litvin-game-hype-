const socket=io();

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=700;
canvas.height=700;

let players=[];
let moving=false;

/* ===== ПУТЬ ===== */
const path=[

{x:110,y:600},
{x:110,y:500},
{x:110,y:400},
{x:110,y:300},
{x:110,y:200},

{x:220,y:120},
{x:330,y:120},
{x:440,y:120},
{x:550,y:120},

{x:600,y:230},
{x:600,y:340},
{x:600,y:450},

{x:520,y:600},
{x:400,y:600},
{x:280,y:600}

];

function draw(){

ctx.clearRect(0,0,700,700);

players.forEach(p=>{

const c=path[p.pos];
if(!c)return;

ctx.fillStyle=p.color;

ctx.beginPath();
ctx.arc(c.x,c.y,14,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="yellow";
ctx.fillText("🔥"+p.hype,c.x-18,c.y-20);

});
}

/* ===== ДВИЖЕНИЕ ===== */

async function move(steps){

if(moving)return;
moving=true;

for(let i=0;i<steps;i++){

await new Promise(r=>setTimeout(r,300));

players[0].pos++;

if(players[0].pos>=path.length)
players[0].pos=0;

draw();
}

moving=false;
}

/* ===== КУБИК ===== */

function spin(value){

const d=document.getElementById("dice");

d.style.transform="rotate(720deg)";

setTimeout(()=>{
d.innerText=value;
d.style.transform="rotate(0)";
},400);
}

socket.on("players",p=>{
players=p;
draw();
});

socket.on("diceResult",v=>{
spin(v);
move(v);
});

function roll(){
socket.emit("rollDice");
}
