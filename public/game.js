const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const messageBox = document.getElementById("messageBox");
const playersPanel = document.getElementById("playersPanel");
const diceBtn = document.getElementById("diceBtn");

canvas.width = window.innerWidth - 20;
canvas.height = canvas.width;

const board = new Image();
board.src = "/board.jpg";

let roomState = null;

const params = new URLSearchParams(window.location.search);
const room = params.get("room");


// координаты клеток
const path = [
{x:90,y:600},
{x:90,y:470},
{x:90,y:360},
{x:90,y:250},
{x:110,y:140},
{x:230,y:110},
{x:360,y:100},
{x:500,y:100},
{x:640,y:110},
{x:820,y:120},
{x:920,y:210},
{x:930,y:330},
{x:920,y:450},
{x:900,y:590},
{x:780,y:610},
{x:640,y:610},
{x:500,y:610},
{x:350,y:610},
{x:230,y:610},
{x:110,y:610}
];

function scale(p){

const s = canvas.width / 1024;

return {
x:p.x*s,
y:p.y*s
};

}


// рисуем игру
function draw(){

if(!roomState) return;

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.drawImage(board,0,0,canvas.width,canvas.height);

roomState.players.forEach(player=>{

const cell = path[player.position];

if(!cell) return;

const pos = scale(cell);

ctx.beginPath();
ctx.arc(pos.x,pos.y,canvas.width*0.025,0,Math.PI*2);
ctx.fillStyle = player.color;
ctx.fill();

});

}


// обновление игроков
function updatePlayers(){

playersPanel.innerHTML="";

roomState.players.forEach(p=>{

const div=document.createElement("div");

div.innerHTML=
`<span style="color:${p.color}">●</span> ${p.name} : ${p.hype}🔥`;

playersPanel.appendChild(div);

});

}


// кнопка кубика
diceBtn.onclick=()=>{

socket.emit("rollDice",room);

};


// сервер обновил игру
socket.on("updateGame",(data)=>{

roomState=data;

updatePlayers();

draw();

});


// выпал кубик
socket.on("diceRolled",(roll)=>{

messageBox.innerText="🎲 Выпало: "+roll;

});


// сообщение
socket.on("message",(msg)=>{

messageBox.innerText=msg;

});


// загрузка поля
board.onload=draw;
