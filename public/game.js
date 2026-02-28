const socket=io();

const name=localStorage.getItem("name");
const room=localStorage.getItem("room");
const color=localStorage.getItem("color");

socket.emit("joinRoom",{name,roomCode:room,color});

const board=document.getElementById("board");
const cube=document.getElementById("cube");
const info=document.getElementById("info");

/* ======================
   ТВОИ КООРДИНАТЫ
====================== */

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

/* ======================
UPDATE
====================== */

socket.on("roomUpdate",(room)=>{
players=room.players;
render();
});

socket.on("diceRolled",({dice,players:p})=>{
players=p;
animateDice(dice);
render();
});

/* ======================
ROLL
====================== */

document
.getElementById("rollBtn")
.onclick=()=>{
socket.emit("rollDice",room);
};

/* ======================
DICE
====================== */

function animateDice(val){

cube.style.transform="rotate(360deg)";

setTimeout(()=>{
cube.style.transform="rotate(0)";
cube.innerText=val;
info.innerText="Выпало "+val;
},400);

}

/* ======================
TOKENS
====================== */

function render(){

board
.querySelectorAll(".token")
.forEach(t=>t.remove());

players.forEach(p=>{

const pos=
CELLS[p.position % CELLS.length];

const token=
document.createElement("div");

token.className="token";
token.style.left=pos.x+"px";
token.style.top=pos.y+"px";
token.style.background=p.color;

board.appendChild(token);

});

}
