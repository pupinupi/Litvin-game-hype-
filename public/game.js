const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom",{name,roomCode:room,color});

const board = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");

const CELL_POSITIONS = [
  {x:110,y:597},{x:99,y:450},{x:80,y:345},{x:99,y:232},{x:99,y:133},
  {x:218,y:97},{x:348,y:91},{x:500,y:88},{x:624,y:102},{x:762,y:91},
  {x:895,y:130},{x:912,y:204},{x:912,y:337},{x:909,y:425},{x:901,y:580},
  {x:771,y:588},{x:641,y:588},{x:483,y:594},{x:331,y:586},{x:218,y:594}
];

let players=[];
let currentTurn=0;

socket.on("lobbyUpdate",(data)=>{
  const div=document.getElementById("lobbyPlayers");
  div.innerHTML="";
  data.players.forEach((p,i)=>{
    div.innerHTML+=`<p>${p.name}</p>`;
    if(p.id===socket.id && i===0){
      document.getElementById("startBtn").style.display="inline-block";
    }
  });
});

function startGame(){
  socket.emit("startGame",room);
}

socket.on("gameStarted",()=>{
  document.getElementById("lobby").style.display="none";
  board.style.display="block";
});

socket.on("updatePlayers",(data)=>{
  players=data.players;
  currentTurn=data.turn;
  renderPlayers();
});

socket.on("diceRolled",({dice})=>{
  animateMove(dice);
});

function roll(){
  socket.emit("rollDice",room);
}

function renderPlayers(){
  board.querySelectorAll(".token").forEach(t=>t.remove());
  players.forEach(p=>{
    const token=document.createElement("div");
    token.classList.add("token");
    token.style.background=p.color;
    const pos=CELL_POSITIONS[p.position];
    token.style.left=pos.x+"px";
    token.style.top=pos.y+"px";
    board.appendChild(token);
  });
}

function animateMove(steps){
  const me=players.find(p=>p.id===socket.id);
  if(!me) return;

  let current=me.position-steps;
  if(current<0) current+=20;

  let step=0;

  const interval=setInterval(()=>{
    current=(current+1)%20;
    step++;

    const token=board.querySelector(".token");
    const pos=CELL_POSITIONS[current];
    token.style.left=pos.x+"px";
    token.style.top=pos.y+"px";

    if(step>=steps){
      clearInterval(interval);
    }
  },200);
}
