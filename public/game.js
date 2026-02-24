const socket = io();

/* ====== ДАННЫЕ ИГРОКА ====== */

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", {
    name,
    roomCode: room,
    color
});

/* ====== DOM ====== */

const board = document.getElementById("board");
const cube = document.getElementById("cube");
const diceResult = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");

/* ====== КООРДИНАТЫ (ТВОИ) ====== */

const CELL_POSITIONS = [
  {x:110,y:597},
  {x:99,y:450},
  {x:80,y:345},
  {x:99,y:232},
  {x:99,y:133},
  {x:218,y:97},
  {x:348,y:91},
  {x:500,y:88},
  {x:624,y:102},
  {x:762,y:91},
  {x:895,y:130},
  {x:912,y:204},
  {x:912,y:337},
  {x:909,y:425},
  {x:901,y:580},
  {x:771,y:588},
  {x:641,y:588},
  {x:483,y:594},
  {x:331,y:586},
  {x:218,y:594}
];

let players = [];
let currentTurn = 0;

/* ====== БРОСОК ====== */

function roll(){
    if(!room) return;
    socket.emit("rollDice", room);
}

/* ====== ОБНОВЛЕНИЕ ИГРОКОВ ====== */

socket.on("updatePlayers", (data)=>{
    players = data.players;
    currentTurn = data.turn;
    renderPlayers();
});

/* ====== КУБИК ====== */

socket.on("diceRolled", ({dice})=>{
    cube.innerText = dice;
    diceResult.innerText = "Выпало: " + dice;
});

/* ====== РИСК ====== */

socket.on("riskResult", ({dice,result})=>{
    cube.innerText = dice;
    diceResult.innerText =
      `Риск! Выпало ${dice}. ${result > 0 ? "+" : ""}${result} хайпа`;
});

/* ====== СКАНДАЛ ====== */

socket.on("scandalCard", (card)=>{
    document.getElementById("scandalText").innerText =
        `${card.text} (${card.value})`;
    document.getElementById("scandalModal").style.display = "flex";
});

/* ====== ОТРИСОВКА ====== */

function renderPlayers(){

    board.querySelectorAll(".token").forEach(t=>t.remove());

    players.forEach((p)=>{

        const token = document.createElement("div");
        token.classList.add("token");
        token.style.background = p.color;

        const pos = CELL_POSITIONS[p.position];

        token.style.left = pos.x + "px";
        token.style.top = pos.y + "px";

        board.appendChild(token);
    });

    renderScore();
}

/* ====== СЧЁТ ====== */

function renderScore(){
    const container = document.getElementById("players");
    container.innerHTML = "";

    players.forEach((p,index)=>{
        container.innerHTML += `
          <div class="playerCard" 
               style="border:${index===currentTurn?"2px solid #ff2e88":"none"}">
            ${p.name}: ${p.hype} хайпа
          </div>
        `;
    });
}
