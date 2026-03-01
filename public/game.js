const socket=io();

const room=localStorage.getItem("room");
const color=localStorage.getItem("color");
const name=localStorage.getItem("name");

socket.emit("joinRoom",
{name,roomCode:room,color});

const board=document.getElementById("board");
const cube=document.getElementById("cube");
const rollBtn=document.getElementById("rollBtn");
const hypeText=document.getElementById("hype");
const info=document.getElementById("info");

/* ===== КООРДИНАТЫ ===== */

const CELLS=[
{x:108,y:599},
{x:110,y:456},
{x:116,y:359},
{x:105,y:238},
{x:110,y:127},
{x:235,y:97},
{x:354,y:105},
{x:500,y:99},
{x:641,y:97},
{x:793,y:91},
{x:912,y:127},
{x:909,y:246},
{x:912,y:345},
{x:903,y:456},
{x:909,y:575},
{x:798,y:608},
{x:638,y:591},
{x:489,y:605},
{x:340,y:588},
{x:210,y:608},
{x:124,y:633}
];

let players=[];
let turn=0;

/* ===== ОБНОВЛЕНИЕ ===== */

socket.on("roomUpdate",(room)=>{
players=room.players;
turn=room.turn;
render();
});

/* ===== РЕЗУЛЬТАТ КУБИКА ===== */

socket.on("diceResult",
async({dice,room})=>{

players=room.players;
turn=room.turn;

animateDice(dice);

await moveStep(
players.find(p=>p.color===color),
dice
);

render();

});

/* ===== 3D КУБИК ===== */

function animateDice(v){

cube.style.transform=
"rotateX(720deg) rotateY(720deg)";

setTimeout(()=>{

const map={
1:"rotateY(0deg)",
2:"rotateY(90deg)",
3:"rotateY(180deg)",
4:"rotateY(-90deg)",
5:"rotateX(90deg)",
6:"rotateX(-90deg)"
};

cube.style.transform=map[v];

},800);
}

/* ===== ПОШАГОВО ===== */

async function moveStep(player,steps){

for(let i=0;i<steps;i++){

player.position++;
player.position%=CELLS.length;

render();

await sleep(350);
}

}

function sleep(ms){
return new Promise(r=>setTimeout(r,ms));
}

/* ===== КНОПКА ===== */

rollBtn.onclick=()=>{
socket.emit("rollDice",room);
};

/* ===== RENDER ===== */

function render(){

board.querySelectorAll(".token")
.forEach(t=>t.remove());

players.forEach(p=>{

const pos=CELLS[p.position];

const t=document.createElement("div");
t.className="token";

t.style.left=pos.x+"px";
t.style.top=pos.y+"px";
t.style.background=p.color;

board.appendChild(t);

if(p.color===color)
hypeText.innerText=
"HYPE: "+p.hype;

});

}

/* ===== ПОБЕДА ===== */

socket.on("gameOver",(winner)=>{
alert("🏆 Победа "+winner.name);
});
