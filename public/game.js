const dice=document.getElementById("dice");

const socket=io();

const name=localStorage.getItem("name");
const room=localStorage.getItem("room");
const color=localStorage.getItem("color");

socket.emit("joinRoom",{name,roomCode:room,color});

const board=document.getElementById("board");
const cube=document.getElementById("cube");
const info=document.getElementById("info");
const rollBtn=document.getElementById("rollBtn");

/* ===== IDEAL CELLS ===== */

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

/* ========= UPDATE ========= */

socket.on("roomUpdate",(room)=>{
players=room.players;
turn=room.turn;
render();
});

/* ========= STEP MOVE ========= */

socket.on("startMove",async({playerId,dice})=>{

const player=
players.find(p=>p.id===playerId);

for(let i=0;i<dice;i++){

player.position++;
player.position%=CELLS.length;

render();

await sleep(350);
}

});

/* ========= DICE ========= */

rollBtn.onclick=()=>{
socket.emit("rollDice",room);
};

function sleep(ms){
return new Promise(r=>setTimeout(r,ms));
}

/* ========= RENDER ========= */

function render(){

board.querySelectorAll(".token")
.forEach(t=>t.remove());

players.forEach(p=>{

const pos=CELLS[p.position];

const token=document.createElement("div");
token.className="token";

token.style.left=pos.x+"px";
token.style.top=pos.y+"px";
token.style.background=p.color;

board.appendChild(token);

});

/* TURN */

const me=
players.findIndex(
p=>p.color===color
);

if(me===turn){
rollBtn.disabled=false;
info.innerText="🔥 ТВОЙ ХОД";
}else{
rollBtn.disabled=true;
info.innerText=
"Ход: "+(players[turn]?.name||"");
}

}

/* ========= WIN ========= */

socket.on("gameOver",(winner)=>{
alert("🏆 Победил "+winner.name+
" с hype "+winner.hype);
});
