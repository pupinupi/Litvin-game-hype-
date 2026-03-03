const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

const boardImg = new Image();
boardImg.src = "board.jpg";

/* ===== ВЫБОР ЦВЕТА (пока вручную для теста) ===== */
const selectedColor = "blue"; // red / yellow / blue / purple

const colors = {
  red: "#ff3b3b",
  blue: "#3b7bff",
  yellow: "#ffd93b",
  purple: "#a13bff"
};

/* ===== ИГРОК ===== */

let player = {
  pos: 0,
  hype: 0,
  skip: false
};

let moving = false;

/* ===== ТВОИ ТОЧНЫЕ КООРДИНАТЫ ===== */

const path = [
{ x:89,y:599,type:"start"},
{ x:88,y:459,type:"+3"},
{ x:80,y:366,type:"+2"},
{ x:86,y:244,type:"scandal"},
{ x:95,y:133,type:"risk"},
{ x:212,y:100,type:"+2"},
{ x:358,y:93,type:"scandal"},
{ x:498,y:92,type:"+3"},
{ x:638,y:106,type:"+5"},
{ x:805,y:102,type:"loseAll"},
{ x:925,y:129,type:"half"},
{ x:923,y:238,type:"+3"},
{ x:940,y:353,type:"risk"},
{ x:927,y:466,type:"+3"},
{ x:913,y:586,type:"skip"},
{ x:783,y:605,type:"+2"},
{ x:641,y:604,type:"scandal"},
{ x:501,y:609,type:"+8"},
{ x:350,y:610,type:"loseAll"},
{ x:228,y:600,type:"+4"}
];

/* ===== ОТРИСОВКА ===== */

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,1024,1024);

  const p = path[player.pos];

  ctx.beginPath();
  ctx.arc(p.x, p.y, 18, 0, Math.PI*2);
  ctx.fillStyle = colors[selectedColor];
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* ===== ДВИЖЕНИЕ ===== */

async function move(steps){

  if(moving) return;
  moving = true;

  for(let i=0;i<steps;i++){

    await new Promise(r=>setTimeout(r,300));

    player.pos++;

    if(player.pos >= path.length){
      player.pos = 0;
    }

    draw();
  }

  applyCell();
  moving = false;
}

/* ===== ЛОГИКА КЛЕТОК ===== */

function applyCell(){

  const cell = path[player.pos].type;

  if(cell.startsWith("+")){
    player.hype += Number(cell.replace("+",""));
  }

  if(cell === "risk"){
    const r = Math.floor(Math.random()*6)+1;
    player.hype += (r <= 3 ? -5 : 5);
  }

  if(cell === "loseAll"){
    player.hype = 0;
  }

  if(cell === "half"){
    player.hype = Math.floor(player.hype/2);
  }

  if(cell === "skip"){
    player.skip = true;
  }

  if(player.hype < 0){
    player.hype = 0;
  }

  document.getElementById("hypeDisplay").innerText =
      "Хайп: " + player.hype;
}

/* ===== КУБИК ===== */

const diceBtn = document.getElementById("diceBtn");
const diceValue = document.getElementById("diceValue");

diceBtn.onclick = async () => {

  if(moving) return;

  if(player.skip){
    player.skip = false;
    alert("Вы пропускаете ход!");
    return;
  }

  const roll = Math.floor(Math.random()*6)+1;

  diceValue.innerText = roll;

  move(roll);
};

/* ===== ЗАГРУЗКА ===== */

boardImg.onload = () => {
  draw();
};
