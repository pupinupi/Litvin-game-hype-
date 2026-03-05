const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const diceBtn = document.getElementById("diceBtn");
const messageBox = document.getElementById("messageBox");
const playersPanel = document.getElementById("playersPanel");

canvas.width = window.innerWidth - 20;
canvas.height = canvas.width;

const board = new Image();
board.src = "board.jpg";

let roomState = null;

const params = new URLSearchParams(window.location.search);
const room = params.get("room");


// координаты клеток твоего поля
const path = [
{x:80,y:600},
{x:80,y:460},
{x:80,y:350},
{x:80,y:240},
{x:100,y:120},
{x:230,y:100},
{x:360,y:90},
{x:500,y:90},
{x:650,y:100},
{x:820,y:110},
{x:930,y:200},
{x:940,y:320},
{x:930,y:440},
{x:910,y:580},
{x:780,y:610},
{x:640,y:610},
{x:500,y:610},
{x:350,y:610},
{x:220,y:610},
{x:100,y:610}
];


// клетки поля
const cells = [
{type:"start"},
{type:"hype",value:3},
{type:"hype",value:2},
{type:"scandal"},
{type:"risk"},
{type:"hype",value:2},
{type:"scandal"},
{type:"hype",value:3},
{type:"hype",value:5},
{type:"loseAll"},
{type:"jail"},
{type:"hype",value:3},
{type:"risk"},
{type:"hype",value:3},
{type:"skip"},
{type:"hype",value:2},
{type:"scandal"},
{type:"hype",value:8},
{type:"loseAll"},
{type:"hype",value:4}
];


// карточки скандалов
const scandals = [

{t:"Перегрел аудиторию 🔥",v:-1},

{t:"Громкий заголовок 🫣",v:-2},

{t:"Это монтаж 😱",v:-3},

{t:"Меня взломали #️⃣ (все игроки -3)",all:-3},

{t:"Подписчики в шоке 😮",v:-4},

{t:"Удаляй пока не поздно 🤫",v:-5},

{t:"Это контент, вы не понимаете 🙄",v:-5,skip:true}

];


// масштаб поля
function scale(pos){
const s=canvas.width/1024;
return{
x:pos.x*s,
y:pos.y*s
};
}


// рисование
function draw(){

if(!roomState) return;

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.drawImage(board,0,0,canvas.width,canvas.height);

roomState.players.forEach(p=>{

const cell=path[p.position];

const pos=scale(cell);

ctx.beginPath();
ctx.arc(pos.x,pos.y,canvas.width*0.02,0,Math.PI*2);
ctx.fillStyle=p.color;
ctx.fill();

});

}


// панель игроков
function updatePlayers(){

playersPanel.innerHTML="";

roomState.players.forEach(p=>{

const d=document.createElement("div");

d.innerHTML=
`<span style="color:${p.color}">●</span>
${p.name} : ${p.hype}🔥`;

playersPanel.appendChild(d);

});

}


// бросок кубика
diceBtn.onclick=()=>{
socket.emit("rollDice",room);
};


// обновление игры
socket.on("updateGame",(data)=>{

roomState=data;

updatePlayers();

draw();

});


// выпал кубик
socket.on("diceRolled",(roll)=>{

messageBox.innerText="🎲 Выпало: "+roll;

});


// сообщения
socket.on("message",(msg)=>{

messageBox.innerText=msg;

});


// загрузка поля
board.onload=draw;
