const socket=io();
const room=localStorage.room;

const canvas=document.getElementById("board");
const ctx=canvas.getContext("2d");

const diceBtn=document.getElementById("diceBtn");

const img=new Image();
img.src="board.jpg";

/*
СТАРТ
⬆
➡
⬇
⬅
*/

const cells=[

[140,820],

[140,700],
[140,580],
[140,460],
[140,340],
[140,220],

[260,140],
[400,140],
[540,140],
[680,140],
[820,140],

[900,260],
[900,400],
[900,540],
[900,680],
[900,820],

[760,900],
[620,900],
[480,900],
[340,900],
[200,900]

];

let state;

img.onload=draw;

function draw(){

ctx.clearRect(0,0,1024,1024);
ctx.drawImage(img,0,0);

if(!state)return;

state.players.forEach(p=>{

const c=cells[p.pos];

ctx.shadowColor=p.color;
ctx.shadowBlur=25;

ctx.beginPath();
ctx.arc(c[0],c[1],18,0,6.28);
ctx.fillStyle=p.color;
ctx.fill();

ctx.shadowBlur=0;

});
}

function roll(){
socket.emit("rollDice",room);
}

socket.on("gameStart",s=>{
state=s;
draw();
});

socket.on("state",s=>{

state=s;
draw();
updateUI();
});

socket.on("scandal",t=>{
popup.innerHTML=
`<div class="card">${t}</div>`;

setTimeout(()=>popup.innerHTML="",2500);
});

socket.on("winner",n=>{
alert("🏆 Победил "+n);
});

function updateUI(){

players.innerHTML="";

state.players.forEach((p,i)=>{

players.innerHTML+=
`<div>
${i===state.turn?"👉":""}
${p.name}: ${p.hype}
</div>`;
});

const me=state.players.find(
p=>p.id===socket.id
);

diceBtn.disabled=
state.players[state.turn].id
!==socket.id;

turnInfo.innerText=
"Ход: "+
state.players[state.turn].name;
}
