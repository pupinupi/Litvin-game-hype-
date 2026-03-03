const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

const boardImg = new Image();
boardImg.src = "board.jpg";

const WIN_SCORE = 70;

const selectedColor = "blue";

const colors = {
  red: "#ff3b3b",
  blue: "#3b7bff",
  yellow: "#ffd93b",
  purple: "#a13bff"
};

let player = {
  pos: 0,
  hype: 0,
  skip: false
};

let moving = false;
let gainedThisTurn = 0;

/* КООРДИНАТЫ */
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
{ x:805,y:102,type:"block"},
{ x:925,y:129,type:"+3"},
{ x:923,y:238,type:"+3"},
{ x:940,y:353,type:"risk"},
{ x:927,y:466,type:"+3"},
{ x:913,y:586,type:"skip"},
{ x:783,y:605,type:"+2"},
{ x:641,y:604,type:"scandal"},
{ x:501,y:609,type:"+8"},
{ x:350,y:610,type:"block"},
{ x:228,y:600,type:"+4"}
];

/* СКАНДАЛЫ */
const scandals = [
{ text:"Перегрел аудиторию 🔥", effect:-1 },
{ text:"Громкий заголовок 🫣", effect:-2 },
{ text:"Это монтаж 😱", effect:-3 },
{ text:"Меня взломали #️⃣", effect:-3 },
{ text:"Подписчики в шоке 😮", effect:-4 },
{ text:"Удаляй пока не поздно 🤫", effect:-5 },
{ text:"Это контент, вы не понимаете 🙄", effect:"skip" }
];

/* ОТРИСОВКА */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,1024,1024);

  const p = path[player.pos];

  /* подсветка клетки */
  ctx.beginPath();
  ctx.arc(p.x, p.y, 30, 0, Math.PI*2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 4;
  ctx.stroke();

  /* фишка */
  ctx.beginPath();
  ctx.arc(p.x, p.y, 18, 0, Math.PI*2);
  ctx.fillStyle = colors[selectedColor];
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* ДВИЖЕНИЕ */
async function move(steps){

  if(moving) return;
  moving = true;
  gainedThisTurn = 0;

  for(let i=0;i<steps;i++){
    await new Promise(r=>setTimeout(r,250));
    player.pos++;
    if(player.pos >= path.length){
      player.pos = 0;
    }
    draw();
  }

  applyCell();
  moving = false;
}

/* ЛОГИКА */
function applyCell(){

  const cell = path[player.pos].type;

  if(cell.startsWith("+")){
    const val = Number(cell.replace("+",""));
    player.hype += val;
    gainedThisTurn += val;
    finalizeTurn();
  }

  else if(cell === "risk"){
    openRisk();
  }

  else if(cell === "block"){
    player.hype -= 5;
    finalizeTurn();
  }

  else if(cell === "skip"){
    player.skip = true;
    finalizeTurn();
  }

  else if(cell === "scandal"){
    openScandal();
  }
}

function finalizeTurn(){

  if(player.hype < 0) player.hype = 0;

  if(gainedThisTurn > 8){
    player.skip = true;
    alert("Перегрев! Пропуск хода 🔥");
  }

  if(player.hype >= WIN_SCORE){
    alert("ПОБЕДА! 70 хайпа 🎉");
    location.reload();
  }

  updateUI();
}

function updateUI(){
  document.getElementById("hypeDisplay").innerText =
      "Хайп: " + player.hype;
}

/* КУБИК */
const dice = document.getElementById("dice");
const diceBtn = document.getElementById("diceBtn");

diceBtn.onclick = () => {

  if(moving) return;

  if(player.skip){
    player.skip = false;
    alert("Вы пропускаете ход!");
    return;
  }

  dice.classList.add("spin");

  setTimeout(()=>{
    dice.classList.remove("spin");
    const roll = Math.floor(Math.random()*6)+1;
    dice.innerText = roll;
    move(roll);
  },600);
};

/* RISK */
const riskModal = document.getElementById("riskModal");
const closeRisk = document.getElementById("closeRisk");

function openRisk(){
  riskModal.style.display = "flex";
}

closeRisk.onclick = function(){

  const r = Math.floor(Math.random()*6)+1;

  if(r <= 3){
    player.hype += 10;
    gainedThisTurn += 10;
  } else {
    player.hype -= 4;
  }

  riskModal.style.display = "none";
  finalizeTurn();
};

/* СКАНДАЛ */
const scandalModal = document.getElementById("scandalModal");
const scandalText = document.getElementById("scandalText");
const closeScandal = document.getElementById("closeScandal");

function openScandal(){
  const random = scandals[Math.floor(Math.random()*scandals.length)];
  scandalText.innerText = random.text;
  scandalModal.style.display = "flex";

  closeScandal.onclick = function(){
    if(random.effect === "skip"){
      player.skip = true;
    } else {
      player.hype += random.effect;
    }
    scandalModal.style.display = "none";
    finalizeTurn();
  }
};

boardImg.onload = () => {
  draw();
  updateUI();
};
