const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const name = localStorage.name;
const room = localStorage.room;
const color = localStorage.color;

let roomState = null;

function resizeCanvas(){
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerWidth * 0.95;
}
resizeCanvas();
window.addEventListener("resize", () => { resizeCanvas(); draw(); });

// поле с 20 клетками
const boardCells = [
  { type:"start" },
  { type:"hype", value:3 },
  { type:"hype", value:2 },
  { type:"scandal" },
  { type:"risk" },
  { type:"hype", value:2 },
  { type:"scandal" },
  { type:"hype", value:3 },
  { type:"hype", value:5 },
  { type:"hype", value:-Infinity },
  { type:"hype", value:-10, skip:true },
  { type:"hype", value:3 },
  { type:"risk" },
  { type:"hype", value:3 },
  { type:"skip", skip:true },
  { type:"hype", value:2 },
  { type:"scandal" },
  { type:"hype", value:8 },
  { type:"hype", value:-Infinity },
  { type:"hype", value:4 }
];

const scandalCards = [
  { text:"Перегрел аудиторию 🔥", value:-1 },
  { text:"Громкий заголовок 🫣", value:-2 },
  { text:"Это монтаж 😱", value:-3 },
  { text:"Меня взломали #️⃣", value:-3, all:true },
  { text:"Подписчики в шоке 😮", value:-4 },
  { text:"Удаляй пока не поздно 🤫", value:-5 },
  { text:"Это контент, вы не понимаете 🙄", value:-5, skip:true }
];

// координаты клеток
const basePath = [
{ x:89,y:599},{ x:88,y:459},{ x:80,y:366},{ x:86,y:244},{ x:95,y:133},
{ x:212,y:100},{ x:358,y:93},{ x:498,y:92},{ x:638,y:106},{ x:805,y:102},
{ x:925,y:129},{ x:923,y:238},{ x:940,y:353},{ x:927,y:466},{ x:913,y:586},
{ x:783,y:605},{ x:641,y:604},{ x:501,y:609},{ x:350,y:610},{ x:228,y:600}
];

let path = basePath.map(p => ({ x:p.x * canvas.width/1024, y:p.y * canvas.width/1024 }));

const boardImg = new Image();
boardImg.src = "./board.jpg";
boardImg.onload = draw;

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);
  if(!roomState) return;
  const tokenRadius = canvas.width*0.015;
  roomState.players.forEach(player=>{
    const pos = path[player.position];
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,tokenRadius,0,Math.PI*2);
    ctx.fillStyle = player.color;
    ctx.fill();
  });
}

// обновление панели игроков
function updatePlayersPanel(){
  const panel = document.getElementById("playersPanel");
  panel.innerHTML = "";
  if(!roomState) return;
  roomState.players.forEach(p=>{
    const div = document.createElement("div");
    div.innerHTML = `<span style="color:${p.color}">●</span> ${p.name} (${p.hype})`;
    panel.appendChild(div);
  });
}

socket.on("updateGame",(roomData)=>{
  roomState = roomData;
  updatePlayersPanel();
  draw();
});

socket.on("diceRolled",(roll)=>{
  document.getElementById("messageBox").innerText = "Выпало: "+roll;
});

document.getElementById("diceBtn").onclick = ()=>{
  if(!roomState) return;
  const player = roomState.players.find(p=>p.id===socket.id);
  if(player.skip){ player.skip=false; socket.emit("rollDice",room); return; }
  socket.emit("rollDice",room);
};

// подключение игрока
socket.emit("joinRoom",{ name, roomCode:room, color });

// обработка попадания на клетки
socket.on("updateGame",(roomData)=>{
  roomState = roomData;
  updatePlayersPanel();
  draw();
  const player = roomState.players.find(p=>p.id===socket.id);
  if(!player) return;
  const cell = boardCells[player.position];

  // пропуск хода
  if(cell.skip){ player.skip=true; showMessage("Пропускаешь ход!"); return; }

  // хип+
  if(cell.type==="hype"){
    if(cell.value===-Infinity) player.hype=0;
    else player.hype+=cell.value;
    showMessage((cell.value>0?"+":"")+cell.value+" хайп!");
  }

  // скандал
  if(cell.type==="scandal"){
    const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];
    if(card.all){
      roomState.players.forEach(p=>p.hype+=card.value);
    }else{
      player.hype+=card.value;
    }
    if(card.skip) player.skip=true;
    alert(card.text+" ("+(card.value>0?"+":"")+card.value+" хайп)");
  }

  // риск
  if(cell.type==="risk"){
    const riskRoll = Math.floor(Math.random()*6)+1;
    if(riskRoll<=3){ player.hype+=6; alert("Риск: +6 хайп"); }
    else { player.hype-=4; alert("Риск: -4 хайп"); }
  }

  // победа
  if(player.hype>=70) alert(player.name+" победил! 🔥");

});

function showMessage(msg){ document.getElementById("messageBox").innerText = msg; }
