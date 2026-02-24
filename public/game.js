const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom",{name,roomCode:room,color});

let players = [];
let turn = 0;

const CELL_POSITIONS = [
{ x:110,y:597 },
{ x:91,y:583 },
{ x:102,y:450 },
{ x:80,y:345 },
{ x:99,y:232 },
{ x:99,y:133 },
{ x:218,y:97 },
{ x:348,y:91 },
{ x:500,y:88 },
{ x:624,y:102 },
{ x:762,y:91 },
{ x:895,y:130 },
{ x:912,y:204 },
{ x:912,y:337 },
{ x:909,y:425 },
{ x:901,y:580 },
{ x:771,y:588 },
{ x:641,y:588 },
{ x:483,y:594 },
{ x:331,y:586 }
];

socket.on("roomUpdate",(roomData)=>{
  players = roomData.players;
  turn = roomData.turn;
  renderPlayers();
  renderScore();
});

socket.on("gameStarted",()=>{
  document.getElementById("lobby").style.display="none";
  document.getElementById("game").style.display="block";
});

socket.on("diceRolled",(dice)=>{
  const cube = document.getElementById("cube");
  cube.style.transform="rotate(360deg)";
  setTimeout(()=>{
    cube.style.transform="rotate(0deg)";
    cube.innerText=dice;
  },400);
});

socket.on("riskResult",({result})=>{
  document.getElementById("diceResult").innerText =
  `Риск: ${result>0?"+":""}${result} хайпа`;
});

socket.on("scandalCard",(card)=>{
  document.getElementById("scandalText").innerText =
  `${card.text} (${card.value})`;
  document.getElementById("scandalModal").style.display="flex";
});

function renderPlayers(){
  const board = document.getElementById("board");
  board.querySelectorAll(".token").forEach(t=>t.remove());

  players.forEach((p,i)=>{
    const pos = CELL_POSITIONS[p.position];
    const token = document.createElement("div");
    token.className="token";
    token.style.background=p.color;
    token.style.left=pos.x+"px";
    token.style.top=(pos.y + i*6)+"px";
    board.appendChild(token);
  });
}

function renderScore(){
  const container = document.getElementById("players");
  container.innerHTML="";
  players.forEach((p,index)=>{
    container.innerHTML+=`
      <div class="playerCard" style="
      border:${index===turn?"2px solid #ff2e88":"none"}">
      ${p.name}: ${p.hype} хайпа
      </div>`;
  });
}

function roll(){
  socket.emit("rollDice",room);
}

function closeScandal(){
  document.getElementById("scandalModal").style.display="none";
}
