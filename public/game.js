const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIN_SCORE = 70;

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.95, 500);
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const boardImg = new Image();
boardImg.src = "board.jpg";

const selectedColor = "cyan";
const colors = {
  cyan: "#00cfff",
  red: "#ff2b2b",
  orange: "#ff8c00",
  purple: "#a020f0"
};

let player = { pos: 0, hype: 0, skip: false };
let moving = false;

const basePath = [
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

let path = [];

function scalePath() {
  const scale = canvas.width / 1024;
  path = basePath.map(p => ({
    ...p,
    x: p.x * scale,
    y: p.y * scale
  }));
}

boardImg.onload = () => {
  scalePath();
  draw();
};

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);

  const p = path[player.pos];

  ctx.beginPath();
  ctx.arc(p.x, p.y, 28, 0, Math.PI*2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.stroke();

  const gradient = ctx.createRadialGradient(p.x-5,p.y-5,5,p.x,p.y,20);
  gradient.addColorStop(0,"#fff");
  gradient.addColorStop(0.4,colors[selectedColor]);
  gradient.addColorStop(1,"#000");

  ctx.beginPath();
  ctx.arc(p.x,p.y,20,0,Math.PI*2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function showModal(title,text,buttons){
  const overlay = document.getElementById("modalOverlay");
  const t = document.getElementById("modalTitle");
  const txt = document.getElementById("modalText");
  const btns = document.getElementById("modalButtons");

  t.innerText = title;
  txt.innerText = text;
  btns.innerHTML = "";

  buttons.forEach(b=>{
    const button = document.createElement("button");
    button.innerText = b.text;
    button.className = b.class;
    button.onclick = ()=>{
      overlay.classList.add("hidden");
      b.onClick();
    };
    btns.appendChild(button);
  });

  overlay.classList.remove("hidden");
}

async function move(steps){
  if(moving) return;
  moving = true;

  for(let i=0;i<steps;i++){
    await new Promise(r=>setTimeout(r,250));
    player.pos++;
    if(player.pos >= path.length) player.pos = 0;
    draw();
  }

  applyCell();
  moving = false;
}

function applyCell(){
  const cell = path[player.pos].type;

  if(cell.startsWith("+")){
    player.hype += Number(cell.replace("+",""));
    updateUI();
  }
  else if(cell === "block"){
    player.hype -= 5;
    updateUI();
  }
  else if(cell === "skip"){
    player.skip = true;
    showModal("Пропуск хода","Вы пропустите следующий ход!",[
      {text:"Ок",class:"modalPrimary",onClick:updateUI}
    ]);
  }
  else if(cell === "risk"){
    showModal("Риск!","1–3 → +10\n4–6 → −4",[{
      text:"Бросить",
      class:"modalPrimary",
      onClick:()=>{
        const roll = Math.floor(Math.random()*6)+1;
        if(roll<=3) player.hype+=10;
        else player.hype-=4;
        updateUI();
      }
    }]);
    return;
  }
  else if(cell === "scandal"){
    player.hype -= 3;
    showModal("Скандал!","−3 хайпа",[
      {text:"Понятно",class:"modalDanger",onClick:updateUI}
    ]);
    return;
  }

  if(player.hype < 0) player.hype = 0;

  if(player.hype >= WIN_SCORE){
    showModal("ПОБЕДА 🎉","Ты набрал 70 хайпа!",[
      {text:"Играть снова",class:"modalPrimary",onClick:()=>location.reload()}
    ]);
  }
}

function updateUI(){
  document.getElementById("hypeDisplay").innerText =
    "Хайп: " + player.hype;

  const percent = (player.hype / WIN_SCORE) * 100;
  document.getElementById("progressFill").style.width =
    percent + "%";
}

const dice = document.getElementById("dice");
const diceBtn = document.getElementById("diceBtn");

diceBtn.onclick = () => {

  if(moving) return;

  if(player.skip){
    player.skip = false;
    showModal("Пропуск","Вы пропускаете ход!",[
      {text:"Ок",class:"modalPrimary",onClick:()=>{}}
    ]);
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
