const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 300;

const diceBtn = document.getElementById("diceBtn");
const messageBox = document.getElementById("messageBox");
const playersPanel = document.getElementById("playersPanel");

const socket = io();

let players = [];
let currentPlayer = 0;

const cellSize = 45;

const board = [
"start",
"hype3",
"hype2",
"scandal",
"risk",
"hype2",
"scandal",
"hype3",
"hype5",
"zerohype",
"jail",
"hype3",
"risk",
"hype3",
"skip",
"hype2",
"scandal",
"hype8",
"zerohype",
"hype4"
];

const scandals = [
{ text:"Перегрел аудиторию 🔥", hype:-1 },
{ text:"Громкий заголовок 🫣", hype:-2 },
{ text:"Это монтаж 😱", hype:-3 },
{ text:"Меня взломали #️⃣", hype:-3, all:true },
{ text:"Подписчики в шоке 😮", hype:-4 },
{ text:"Удаляй пока не поздно 🤫", hype:-5 },
{ text:"Это контент, вы не понимаете 🙄", hype:-5, skip:true }
];

function initPlayer(){

const name = localStorage.name || "Игрок";
const color = localStorage.color || "red";

players.push({
name,
color,
pos:0,
hype:0,
skip:false
});

draw();
updatePanel();
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

for(let i=0;i<board.length;i++){

ctx.strokeRect(i*cellSize+20,120,cellSize,cellSize);

ctx.fillText(i+1,i*cellSize+30,150);

}

players.forEach(p=>{

ctx.beginPath();

ctx.arc(
p.pos*cellSize+42,
142,
10,
0,
Math.PI*2
);

ctx.fillStyle=p.color;
ctx.fill();

});

}

function updatePanel(){

playersPanel.innerHTML="";

players.forEach(p=>{

const div=document.createElement("div");
div.innerText=p.name+" : "+p.hype+"🔥";

playersPanel.appendChild(div);

});

}

diceBtn.onclick=()=>{

let p=players[currentPlayer];

if(p.skip){

message("Пропуск хода");
p.skip=false;
nextPlayer();
return;

}

const dice=Math.floor(Math.random()*6)+1;

message("🎲 Выпало "+dice);

p.pos+=dice;

if(p.pos>=board.length)
p.pos=board.length-1;

applyCell(p);

draw();

updatePanel();

checkWin();

};

function applyCell(p){

const cell=board[p.pos];

if(cell==="hype3") addHype(p,3);
if(cell==="hype2") addHype(p,2);
if(cell==="hype4") addHype(p,4);
if(cell==="hype5") addHype(p,5);
if(cell==="hype8") addHype(p,8);

if(cell==="zerohype"){

p.hype=0;
message("Весь хайп потерян");

}

if(cell==="skip"){

p.skip=true;
message("Пропуск хода");

}

if(cell==="jail"){

p.hype-=10;
p.skip=true;
message("Тюрьма -10 хайпа");

}

if(cell==="scandal") scandal(p);
if(cell==="risk") risk(p);

}

function scandal(p){

const card=scandals[Math.floor(Math.random()*scandals.length)];

if(card.all){

players.forEach(pl=>pl.hype+=card.hype);

}else{

p.hype+=card.hype;

}

if(card.skip) p.skip=true;

message(card.text+" "+card.hype+"🔥");

}

function risk(p){

const roll=Math.floor(Math.random()*6)+1;

if(roll<=3){

p.hype+=6;
message("Риск удался +6🔥");

}else{

p.hype-=4;
message("Риск провалился -4🔥");

}

}

function addHype(p,val){

p.hype+=val;

message("+"+val+" хайп");

}

function message(text){

messageBox.innerText=text;

}

function nextPlayer(){

currentPlayer++;

if(currentPlayer>=players.length)
currentPlayer=0;

}

function checkWin(){

let p=players[currentPlayer];

if(p.hype>=70){

alert(p.name+" победил 🔥");

location.reload();

}

nextPlayer();

}

initPlayer();
