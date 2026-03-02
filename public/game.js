const socket = io();

const room = localStorage.room;
const name = localStorage.name;
const color = localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const boardImg = document.getElementById("boardImg");

let players=[];

/*
КООРДИНАТЫ ТВОЕГО ПОЛЯ
1024x1024
*/
const path=[
[116,605],
[120,520],
[120,440],
[120,350],
[120,260],
[120,170],
[232,102],
[348,97],
[494,99],
[644,102],
[771,86],
[898,122],
[912,238],
[909,354],
[917,450],
[901,575],
[773,597],
[641,605],
[500,597],
[345,608]
];


// ✅ ЖДЁМ ЗАГРУЗКУ ПОЛЯ
boardImg.onload=()=>{

canvas.width=boardImg.clientWidth;
canvas.height=boardImg.clientHeight;

draw();
};


socket.on("updatePlayers",p=>{
players=p;
draw();
});

socket.on("diceResult",n=>{
showDice(n);
});

function roll(){
socket.emit("rollDice",room);
}


// ================= DRAW =================

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

const scaleX=canvas.width/1024;
const scaleY=canvas.height/1024;

players.forEach((pl,i)=>{

let pos=path[pl.pos];
if(!pos)return;

let x=pos[0]*scaleX;
let y=pos[1]*scaleY;

ctx.beginPath();
ctx.arc(x+i*15,y-i*15,15,0,6.28);
ctx.fillStyle=pl.color;
ctx.fill();

ctx.fillStyle="white";
ctx.fillText(pl.name,x-20,y-25);

});

updateUI();
}


// ================= UI =================

function updateUI(){

playersDiv.innerHTML=
players.map(p=>
`${p.name} 🔥${p.hype}`
).join("<br>");

}


// ================= DICE =================

function showDice(n){

const d=document.createElement("div");

d.style.position="fixed";
d.style.top="50%";
d.style.left="50%";
d.style.transform="translate(-50%,-50%)";
d.style.fontSize="60px";
d.style.background="#111";
d.style.padding="30px";
d.style.border="3px solid orange";
d.style.borderRadius="12px";

d.innerHTML="🎲 "+n;

document.body.appendChild(d);

setTimeout(()=>d.remove(),1500);
}
