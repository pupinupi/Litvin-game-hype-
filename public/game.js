const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

let player = {
  pos: 0,
  hype: 0
};

/* УБРАЛИ ПОСЛЕДНЮЮ ТОЧКУ (ДВОЙНОЙ СТАРТ) */

const path = [
{x:89,y:599,type:"start"},
{x:88,y:459,type:"+3"},
{x:80,y:366,type:"+2"},
{x:86,y:244,type:"scandal"},
{x:95,y:133,type:"risk"},
{x:212,y:100,type:"+2"},
{x:358,y:93,type:"scandal"},
{x:498,y:92,type:"+3"},
{x:638,y:106,type:"+5"},
{x:805,y:102,type:"loseAll"},
{x:925,y:129,type:"halfSkip"},
{x:923,y:238,type:"+3"},
{x:940,y:353,type:"risk"},
{x:927,y:466,type:"+3"},
{x:913,y:586,type:"skip"},
{x:783,y:605,type:"+2"},
{x:641,y:604,type:"scandal"},
{x:501,y:609,type:"+8"},
{x:350,y:610,type:"loseAll"},
{x:228,y:600,type:"+4"}
];

/* ===== РИСОВКА ===== */

function draw(){
  ctx.clearRect(0,0,1024,1024);

  const p = path[player.pos];

  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(p.x,p.y,18,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="yellow";
  ctx.font="22px Arial";
  ctx.fillText("🔥 "+player.hype,p.x-30,p.y-30);
}

draw();

/* ===== КУБИК ===== */

const dice = document.getElementById("dice");

function roll(){

  if(moving) return;

  const value = Math.floor(Math.random()*6)+1;

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

  moving=true;

  for(let i=0;i<steps;i++){

    await new Promise(r=>setTimeout(r,300));

    player.pos++;

    if(player.pos >= path.length){
      player.pos = 0;
    }

    draw();
  }
applyCell();
  
  moving=false;
}

function applyCell(){

  const cell = path[player.pos].type;

  if(!cell) return;

  // +X хайп
  if(cell.startsWith("+")){
    player.hype += Number(cell.replace("+",""));
  }

  // риск
  if(cell === "risk"){
    const r = Math.floor(Math.random()*6)+1;
    player.hype += (r <= 3 ? -5 : 5);
  }

  // обнуление
  if(cell === "loseAll"){
    player.hype = 0;
  }

  // половина
  if(cell === "halfSkip"){
    player.hype = Math.floor(player.hype / 2);
  }

  // не ниже 0
  if(player.hype < 0){
    player.hype = 0;
  }

  draw();
}
