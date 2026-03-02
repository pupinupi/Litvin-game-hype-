console.log("GAME RUNNING");

/* ===== CANVAS ===== */

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=700;
canvas.height=700;

/* ===== ИГРОК ===== */

let player={
pos:0,
hype:0
};

/* ===== ПУТЬ ===== */

const path=[

{x:120,y:600,type:"start"},
{x:120,y:520,type:"+3"},
{x:120,y:440,type:"+2"},
{x:120,y:360,type:"scandal"},
{x:120,y:280,type:"risk"},
{x:120,y:200,type:"+2"},

{x:250,y:120,type:"scandal"},
{x:380,y:120,type:"+3"},
{x:500,y:120,type:"+5"},
{x:600,y:120,type:"loseAll"},

{x:620,y:250,type:"halfSkip"},
{x:620,y:380,type:"+3"},
{x:620,y:500,type:"risk"},

{x:520,y:620,type:"+3"},
{x:400,y:620,type:"skip"},
{x:260,y:620,type:"+2"},
{x:150,y:620,type:"scandal"},
{x:80,y:620,type:"+8"},
{x:80,y:600,type:"loseAll"},
{x:100,y:600,type:"+4"}

];

/* ===== РИСОВКА ===== */

function draw(){

ctx.clearRect(0,0,700,700);

const c=path[player.pos];

ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(c.x,c.y,15,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="yellow";
ctx.font="18px Arial";
ctx.fillText("🔥 "+player.hype,c.x-25,c.y-20);
}

draw();

/* ===== КУБИК ===== */

function roll(){

const value=Math.floor(Math.random()*6)+1;

const dice=document.getElementById("dice");

dice.style.transform="rotate(720deg)";

setTimeout(()=>{
dice.innerText=value;
dice.style.transform="rotate(0deg)";
},400);

move(value);
}

/* ===== ДВИЖЕНИЕ ===== */

let moving=false;

async function move(steps){

if(moving)return;
moving=true;

for(let i=0;i<steps;i++){

await wait(300);

player.pos++;

if(player.pos>=path.length)
player.pos=0;

draw();
}

applyCell();

moving=false;
}

function wait(ms){
return new Promise(r=>setTimeout(r,ms));
}

/* ===== КЛЕТКА ===== */

function applyCell(){

const cell=path[player.pos].type;

/* + хайп */
if(cell.startsWith("+")){
player.hype+=Number(cell.replace("+",""));
}

/* риск */
if(cell==="risk"){
const r=Math.floor(Math.random()*6)+1;
player.hype+= r<=3 ? -5 : 5;
}

/* весь */
if(cell==="loseAll")
player.hype=0;

/* половина */
if(cell==="halfSkip")
player.hype=Math.floor(player.hype/2);

if(player.hype<0)
player.hype=0;

draw();
}
