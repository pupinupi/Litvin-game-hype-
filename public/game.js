console.log("GAME START");

/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 700;

/* ===== ИГРОК ===== */
let player = {
  pos:0,
  hype:0
};

/* ===== ПУТЬ (координаты с твоего image-map) ===== */
const path=[
  {x:102,y:580,type:"start"},
  {x:91,y:448,type:"+3"},
  {x:99,y:329,type:"+2"},
  {x:99,y:229,type:"scandal"},
  {x:105,y:135,type:"risk"},
  {x:232,y:102,type:"+2"},
  {x:348,y:97,type:"scandal"},
  {x:494,y:99,type:"+3"},
  {x:644,y:102,type:"+5"},
  {x:771,y:86,type:"loseAll"},
  {x:898,y:122,type:"halfSkip"},
  {x:912,y:238,type:"+3"},
  {x:909,y:354,type:"risk"},
  {x:917,y:450,type:"+3"},
  {x:901,y:575,type:"skip"},
  {x:773,y:597,type:"+2"},
  {x:641,y:605,type:"scandal"},
  {x:500,y:597,type:"+8"},
  {x:345,y:608,type:"loseAll"},
  {x:232,y:610,type:"+4"}
];

/* ===== РИСОВКА ===== */
function draw(){
  ctx.clearRect(0,0,700,700);
  const c = path[player.pos];
  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(c.x,c.y,16,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="yellow";
  ctx.font="16px Arial";
  ctx.fillText("🔥 "+player.hype,c.x-20,c.y-20);
}

draw();

/* ===== КУБИК ===== */
const diceEl = document.getElementById("dice");

function roll(){
  if(moving) return;

  const value = Math.floor(Math.random()*6)+1;
  diceEl.style.transform="rotate(720deg)";

  setTimeout(()=>{
    diceEl.innerText = value;
    diceEl.style.transform="rotate(0deg)";
  },400);

  move(value);
}

/* ===== ДВИЖЕНИЕ ===== */
let moving=false;

async function move(steps){
  if(moving) return;
  moving=true;

  for(let i=0;i<steps;i++){
    await new Promise(r=>setTimeout(r,300));
    player.pos++;
    if(player.pos >= path.length) player.pos = 0;
    draw();
  }

  applyCell();
  moving=false;
}

/* ===== ЛОГИКА КЛЕТОК ===== */
function applyCell(){
  const cell = path[player.pos].type;

  // + хайп
  if(cell.startsWith("+")) player.hype += Number(cell.replace("+",""));

  // риск
  if(cell==="risk"){
    const r = Math.floor(Math.random()*6)+1;
    player.hype += r<=3 ? -5 : 5;
  }

  // весь хайп
  if(cell==="loseAll") player.hype = 0;

  // половина
  if(cell==="halfSkip") player.hype = Math.floor(player.hype/2);

  // пропуск хода (можно использовать в будущем)
  if(cell==="skip") player.skip = true;

  if(player.hype<0) player.hype=0;

  draw();
}
