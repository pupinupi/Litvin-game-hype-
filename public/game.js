console.log("GAME OK");

/* ================= CANVAS ================= */

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=700;
canvas.height=700;

/* ================= КУБИК ================= */

const dice=document.getElementById("dice");

function roll(){

if(moving) return;

const value=Math.floor(Math.random()*6)+1;

dice.style.transform="rotate(720deg)";

setTimeout(()=>{
dice.innerText=value;
dice.style.transform="rotate(0deg)");
},400);

move(value);
}

/* ================= ПОЛЕ ================= */
/* СТАРТ → ВВЕРХ → ВПРАВО → ВНИЗ → ВЛЕВО */

const path=[

{x:110,y:600,type:"start"},

{x:110,y:520,type:"+3"},
{x:110,y:440,type:"+2"},
{x:110,y:360,type:"scandal"},
{x:110,y:280,type:"risk"},
{x:110,y:200,type:"+2"},

{x:230,y:120,type:"scandal"},
{x:350,y:120,type:"+3"},
{x:470,y:120,type:"+5"},
{x:590,y:120,type:"loseAll"},

{x:700,y:250,type:"halfSkip"},
{x:700,y:380,type:"+3"},
{x:700,y:500,type:"risk"},

{x:600,y:610,type:"+3"},
{x:480,y:610,type:"skip"},
{x:360,y:610,type:"+2"},
{x:240,y:610,type:"scandal"},
{x:120,y:610,type:"+8"},
{x:90,y:610,type:"loseAll"},
{x:90,y:600,type:"+4"}

];

/* ================= ИГРОК ================= */

let player={
pos:0,
hype:0,
skip:false
};

/* ================= РИСОВКА ================= */

function draw(){

ctx.clearRect(0,0,700,700);

const c=path[player.pos];

ctx.fillStyle="red";

ctx.beginPath();
ctx.arc(c.x,c.y,16,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="yellow";
ctx.font="18px Arial";
ctx.fillText("🔥 "+player.hype,c.x-25,c.y-25);
}

draw();

/* ================= ДВИЖЕНИЕ ================= */

let moving=false;

async function move(steps){

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

/* ================= ЛОГИКА ================= */

function applyCell(){

const cell=path[player.pos].type;

console.log("CELL:",cell);

/* + хайп */
if(cell.startsWith("+")){
player.hype+=Number(cell.replace("+",""));
}

/* риск */
if(cell==="risk"){

const r=Math.floor(Math.random()*6)+1;

if(r<=3) player.hype-=5;
else player.hype+=5;
}

/* минус весь */
if(cell==="loseAll"){
player.hype=0;
}

/* половина + пропуск */
if(cell==="halfSkip"){
player.hype=Math.floor(player.hype/2);
player.skip=true;
}

/* пропуск */
if(cell==="skip"){
player.skip=true;
}

/* нельзя ниже 0 */
if(player.hype<0)
player.hype=0;

draw();
}
