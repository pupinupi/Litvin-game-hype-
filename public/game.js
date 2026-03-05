const board = document.getElementById("board");
const diceBtn = document.getElementById("diceBtn");
const diceResult = document.getElementById("diceResult");
const hypeBoard = document.getElementById("hypeBoard");
const popup = document.getElementById("popup");

let players = [];
let currentPlayer = 0;

const boardCells = [
{type:"start"},
{type:"hype",value:3},
{type:"hype",value:2},
{type:"scandal"},
{type:"risk"},
{type:"hype",value:2},
{type:"scandal"},
{type:"hype",value:3},
{type:"hype",value:5},
{type:"zerohype"},
{type:"jail"},
{type:"hype",value:3},
{type:"risk"},
{type:"hype",value:3},
{type:"skip"},
{type:"hype",value:2},
{type:"scandal"},
{type:"hype",value:8},
{type:"zerohype"},
{type:"hype",value:4}
];

const scandals = [
{ text:"Перегрел аудиторию 🔥", value:-1 },
{ text:"Громкий заголовок 🫣", value:-2 },
{ text:"Это монтаж 😱", value:-3 },
{ text:"Меня взломали #️⃣", value:-3, all:true },
{ text:"Подписчики в шоке 😮", value:-4 },
{ text:"Удаляй пока не поздно 🤫", value:-5 },
{ text:"Это контент, вы не понимаете 🙄", value:-5, skip:true }
];

function initPlayers(){

const name = localStorage.name || "Игрок";
const color = localStorage.color || "red";

players.push({
name,
color,
pos:0,
hype:0,
skip:false
});

createTokens();
updateHype();
}

function createTokens(){

players.forEach((p,i)=>{

const token=document.createElement("div");
token.className="token";
token.style.background=p.color;
token.id="token"+i;

board.appendChild(token);

moveToken(i,0);

});

}

function moveToken(i,pos){

const cell=document.getElementById("cell"+pos);
const token=document.getElementById("token"+i);

token.style.left=cell.offsetLeft+10+"px";
token.style.top=cell.offsetTop+10+"px";

}

function rollDice(){

const value=Math.floor(Math.random()*6)+1;

diceResult.innerText="🎲 "+value;

let p=players[currentPlayer];

if(p.skip){
p.skip=false;
nextPlayer();
return;
}

p.pos+=value;

if(p.pos>=boardCells.length)
p.pos=boardCells.length-1;

moveToken(currentPlayer,p.pos);

applyCell(p);

updateHype();

checkWin();

}

diceBtn.onclick=rollDice;

function applyCell(player){

const cell=boardCells[player.pos];

if(cell.type==="hype"){

addHype(player,cell.value);

showPopup("+"+cell.value+" хайп");

}

if(cell.type==="zerohype"){

player.hype=0;

showPopup("Весь хайп потерян!");

}

if(cell.type==="skip"){

player.skip=true;

showPopup("Пропуск хода");

}

if(cell.type==="jail"){

player.hype-=10;

player.skip=true;

showPopup("-10 хайп и пропуск хода");

}

if(cell.type==="risk"){

riskEvent(player);

}

if(cell.type==="scandal"){

scandalEvent(player);

}

}

function scandalEvent(player){

const card=scandals[Math.floor(Math.random()*scandals.length)];

if(card.all){

players.forEach(p=>p.hype+=card.value);

}

else{

player.hype+=card.value;

}

if(card.skip)
player.skip=true;

showPopup(card.text+" ("+card.value+")");

updateHype();

}

function riskEvent(player){

const roll=Math.floor(Math.random()*6)+1;

if(roll<=3){

player.hype+=6;

showPopup("Риск удался! +6 хайп");

}

else{

player.hype-=4;

showPopup("Риск провалился! -4 хайп");

}

updateHype();

}

function addHype(player,val){

player.hype+=val;

if(player.hype<0)
player.hype=0;

}

function updateHype(){

hypeBoard.innerHTML="";

players.forEach(p=>{

const div=document.createElement("div");

div.innerText=p.name+" : "+p.hype+"🔥";

hypeBoard.appendChild(div);

});

}

function nextPlayer(){

currentPlayer++;

if(currentPlayer>=players.length)
currentPlayer=0;

}

function checkWin(){

const p=players[currentPlayer];

if(p.hype>=70){

alert(p.name+" победил! 🔥");

location.reload();

}

nextPlayer();

}

function showPopup(text){

popup.innerText=text;

popup.style.display="block";

setTimeout(()=>{

popup.style.display="none";

},2000);

}

initPlayers();
