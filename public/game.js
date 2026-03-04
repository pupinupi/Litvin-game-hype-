// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

const boardImg = new Image();
boardImg.src = "board.jpg";

// ===== НАСТРОЙКИ =====
const WIN_SCORE = 70;

// Цвет можно менять: cyan, red, orange, purple
const selectedColor = "cyan";

const colors = {
  cyan: "#00cfff",
  red: "#ff2b2b",
  orange: "#ff8c00",
  purple: "#a020f0"
};

let player = {
  pos: 0,
  hype: 0,
  skip: false
};

let moving = false;
let gainedThisTurn = 0;
let floatingTexts = [];

// ===== КООРДИНАТЫ =====
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

// ===== ВСПЛЫВАЮЩИЕ ЧИСЛА =====
function addFloatingText(text, x, y, color){
  floatingTexts.push({ text, x, y, alpha:1, color });
}

function animateFloating(){
  floatingTexts.forEach(t=>{
    t.y -= 1;
    t.alpha -= 0.02;
  });
  floatingTexts = floatingTexts.filter(t=>t.alpha > 0);
  draw();
  requestAnimationFrame(animateFloating);
}
animateFloating();

// ===== ОТРИСОВКА =====
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,1024,1024);

  const p = path[player.pos];

  // подсветка клетки
  ctx.beginPath();
  ctx.arc(p.x, p.y, 30, 0, Math.PI*2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 4;
  ctx.stroke();

  // фишка (объёмная)
  const gradient = ctx.createRadialGradient(
    p.x-5, p.y-5, 5,
    p.x, p.y, 20
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, colors[selectedColor]);
  gradient.addColorStop(1, "#000000");

  ctx.beginPath();
  ctx.arc(p.x, p.y, 20, 0, Math.PI*2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();

  // всплывающий хайп
  floatingTexts.forEach(t=>{
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = t.color;
    ctx.font = "bold 28px Arial";
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  });
}

// ===== ДВИЖЕНИЕ =====
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

// ===== ЛОГИКА КЛЕТОК =====
function applyCell(){

  const cell = path[player.pos].type;
  const p = path[player.pos];

  if(cell.startsWith("+")){
    const val = Number(cell.replace("+",""));
    player.hype += val;
    gainedThisTurn += val;
    addFloatingText("+"+val, p.x, p.y-30, "#00ff88");
    finalizeTurn();
  }

  else if(cell === "block"){
    player.hype -= 5;
    addFloatingText("-5", p.x, p.y-30, "#ff4444");
    finalizeTurn();
  }

  else if(cell === "skip"){
    player.skip = true;
    alert("Пропуск следующего хода!");
    finalizeTurn();
  }

  else if(cell === "scandal"){
    openScandal();
  }

  else if(cell === "risk"){
    openRiskEvent();
  }

  else {
    finalizeTurn();
  }
}

function finalizeTurn(){

  if(player.hype < 0) player.hype = 0;

  if(player.hype >= WIN_SCORE){
    alert("ПОБЕДА! 70 хайпа 🎉");
    location.reload();
  }

  document.getElementById("hypeDisplay").innerText =
      "Хайп: " + player.hype;
}

// ===== RISK =====
function openRiskEvent(){

  const result = confirm(
    "Риск!\n\n1–3 → +10 хайпа\n4–6 → −4 хайпа\n\nБросить кубик риска?"
  );

  if(!result){
    finalizeTurn();
    return;
  }

  const p = path[player.pos];
  const roll = Math.floor(Math.random()*6)+1;

  setTimeout(()=>{

    if(roll <= 3){
      player.hype += 10;
      addFloatingText("+10", p.x, p.y-30, "#00ff88");
      alert("Выпало " + roll + " → +10 хайпа!");
    } else {
      player.hype -= 4;
      addFloatingText("-4", p.x, p.y-30, "#ff4444");
      alert("Выпало " + roll + " → -4 хайпа!");
    }

    finalizeTurn();

  },300);
}

// ===== СКАНДАЛ =====
function openScandal(){

  const scandals = [
    { text:"Перегрел аудиторию 🔥", effect:-1 },
    { text:"Громкий заголовок 🫣", effect:-2 },
    { text:"Это монтаж 😱", effect:-3 },
    { text:"Меня взломали #️⃣", effect:-3 },
    { text:"Подписчики в шоке 😮", effect:-4 },
    { text:"Удаляй пока не поздно 🤫", effect:-5 },
    { text:"Это контент, вы не понимаете 🙄", effect:"skip" }
  ];

  const random = scandals[Math.floor(Math.random()*scandals.length)];
  const p = path[player.pos];

  if(random.effect === "skip"){
    alert(random.text + "\nПропуск хода!");
    player.skip = true;
  } else {
    alert(random.text + "\nХайп: " + random.effect);
    player.hype += random.effect;
    addFloatingText(random.effect, p.x, p.y-30, "#ff4444");
  }

  finalizeTurn();
}

// ===== КУБИК =====
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

// ===== ЗАГРУЗКА =====
boardImg.onload = () => {
  draw();
};
