console.log("GAME 1024 START");

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=1024;
canvas.height=1024;

/* ===== ИГРОК ===== */

let player={
  pos:0,
  hype:0
};

/* ===== ТВОИ НОВЫЕ КООРДИНАТЫ ===== */
/* СТАРТ ВНИЗУ → ВВЕРХ → ВПРАВО → ВНИЗ → ВЛЕВО */

const path=[

{x:150,y:790,type:"start"},
{x:139,y:652,type:"+3"},
{x:128,y:506,type:"+2"},
{x:143,y:377,type:"scandal"},
{x:150,y:246,type:"risk"},

{x:267,y:203,type:"+2"},
{x:470,y:192,type:"scandal"},
{x:652,y:210,type:"+3"},
{x:809,y:217,type:"+5"},
{x:991,y:196,type:"loseAll"},
{x:1180,y:224,type:"halfSkip"},

{x:1172,y:370,type:"+3"},
{x:1162,y:509,type:"risk"},
{x:1162,y:630,type:"+3"},
{x:1158,y:794,type:"skip"},

{x:987,y:819,type:"+2"},
{x:805,y:815,type:"scandal"},
{x:649,y:812,type:"+8"},
{x:470,y:822,type:"loseAll"},
{x:285,y:805,type:"+4"},
{x:189,y:808,type:"+2"}

];

/* ===== РИСОВКА ===== */

function draw(){

  ctx.clearRect(0,0,1024,1024);

  const c=path[player.pos];

  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(c.x,c.y,18,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="yellow";
  ctx.font="20px Arial";
  ctx.fillText("🔥 "+player.hype,c.x-30,c.y-30);
}

draw();

/* ===== КУБИК ===== */

const dice=document.getElementById("dice");

function roll(){

  if(moving) return;

  const value=Math.floor(Math.random()*6)+1;

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

    if(player.pos>=path.length)
      player.pos=0;

    draw();
  }

  applyCell();

  moving=false;
}

/* ===== ЛОГИКА ===== */

function applyCell(){

  const cell=path[player.pos].type;

  if(cell.startsWith("+"))
    player.hype+=Number(cell.replace("+",""));

  if(cell==="risk"){
    const r=Math.floor(Math.random()*6)+1;
    player.hype+= r<=3 ? -5 : 5;
  }

  if(cell==="loseAll")
    player.hype=0;

  if(cell==="halfSkip")
    player.hype=Math.floor(player.hype/2);

  if(player.hype<0)
    player.hype=0;

  draw();
}
