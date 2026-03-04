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
const colors = { cyan:"#00cfff", red:"#ff2b2b", orange:"#ff8c00", purple:"#a020f0"};

let player = { pos:0, hype:0, skip:false };
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
let floatingTexts = [];

function scalePath() {
  const scale = canvas.width / 1024;
  path = basePath.map(p=>({...p, x:p.x*scale, y:p.y*scale}));
}

boardImg.onload = ()=>{ scalePath(); draw(); animateFloating(); };

function addFloatingText(text,x,y,color){ floatingTexts.push({text,x,y,alpha:1,color}); }

function animateFloating(){
  floatingTexts.forEach(t=>{ t.y-=1; t.alpha-=0.02; });
  floatingTexts = floatingTexts.filter(t=>t.alpha>0);
  draw();
  requestAnimationFrame(animateFloating);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);

  const p = path[player.pos];

  // пульсация клетки
  ctx.beginPath();
  ctx.arc(p.x,p.y,28,0,Math.PI*2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3 + 2*Math.sin(Date.now()/200);
  ctx.stroke();

  const gradient = ctx.createRadialGradient(p.x-5,p.y-5,5,p.x,p.y,20);
  gradient.addColorStop(0,"#fff");
  gradient.addColorStop(0.4,colors[selectedColor]);
  gradient.addColorStop(1,"#000");

  ctx.beginPath();
  ctx.arc(p.x,p.y,20,0,Math.PI*2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // всплывающий текст
  floatingTexts.forEach(t=>{
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = t.color;
    ctx.font = "bold 22px Arial";
    ctx.fillText(t.text,t.x,t.y);
    ctx.globalAlpha=1;
  });
}

// === модалка, move, applyCell, updateUI остаются такими же как в прошлой версии ===
// === Только добавим эффект кубика CSS3D ниже ===

const dice3d = document.getElementById("dice3d");
const diceBtn = document.getElementById("diceBtn");

diceBtn.onclick = ()=>{
  if(moving) return;
  if(player.skip){ player.skip=false; return; }

  const rotX = 360*Math.floor(Math.random()*4 +1);
  const rotY = 360*Math.floor(Math.random()*4 +1);
  dice3d.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  const roll = Math.floor(Math.random()*6)+1;
  setTimeout(()=> move(roll), 1000);
};
