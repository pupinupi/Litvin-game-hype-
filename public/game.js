const socket=io();

const room=localStorage.room;
const name=localStorage.name;
const color=localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const board=document.getElementById("boardImg");

let players=[];
let moving=false;

/* ТОЧНЫЙ ПУТЬ */
const path=[
[116,605],[116,520],[116,440],[116,350],
[116,260],[116,170],
[232,102],[348,97],[494,99],[644,102],[771,86],
[898,122],[912,238],[909,354],[917,450],[901,575],
[773,597],[641,605],[500,597],[345,608]
];

board.onload=()=>{
canvas.width=board.clientWidth;
canvas.height=board.clientHeight;
draw();
};

socket.on("updatePlayers",p=>{
players=p;
draw();
showPlayers();
});


socket.on("startMove",async data=>{

if(moving)return;
moving=true;

await animateMove(
data.player,
data.steps
);

socket.emit(
"finishMove",
room,
data.player
);

moving=false;
});


function roll(){
socket.emit("rollDice",room);
}


/* ===== АНИМАЦИЯ ===== */

async function animateMove(index,steps){

for(let i=0;i<steps;i++){

players[index].pos=
(players[index].pos+1)%path.length;

draw();

await sleep(350);
}
}

function sleep(ms){
return new Promise(r=>setTimeout(r,ms));
}


/* ===== DRAW ===== */

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

const sx=canvas.width/1024;
const sy=canvas.height/1024;

players.forEach((p,i)=>{

let pt=path[p.pos];

ctx.beginPath();
ctx.arc(
pt[0]*sx+i*18,
pt[1]*sy-i*18,
18,0,6.28
);

ctx.fillStyle=p.color;
ctx.fill();

});
}


/* ===== ХАЙП ===== */

function showPlayers(){

playersDiv.innerHTML=
players.map(p=>
`${p.name} 🔥 ${p.hype}`
).join("<br>");

}
