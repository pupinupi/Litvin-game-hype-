const socket=io();

const room=localStorage.room;
const name=localStorage.name;
const color=localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=1024;
canvas.height=1024;

let players=[];

const path=[
[120,880],[120,720],[120,560],[120,400],
[120,240],[240,120],[400,120],[560,120],
[720,120],[880,240],[880,400],[880,560],
[880,720],[720,880],[560,880],[400,880],
[240,880],[120,880],[120,720],[120,560]
];

socket.on("updatePlayers",p=>{
players=p;
draw();
showPlayers();
});

socket.on("diceResult",n=>{
alert("🎲 "+n);
});

function roll(){
socket.emit("rollDice",room);
}

function draw(){

ctx.clearRect(0,0,1024,1024);

players.forEach(pl=>{

let pos=path[pl.pos];

ctx.beginPath();
ctx.arc(pos[0],pos[1],20,0,6.28);
ctx.fillStyle=pl.color;
ctx.fill();

ctx.fillStyle="white";
ctx.fillText(pl.name,pos[0]-20,pos[1]-25);

});
}

function showPlayers(){
playersDiv.innerHTML=
players.map(p=>
`${p.name} — 🔥${p.hype}`
).join("<br>");
}
