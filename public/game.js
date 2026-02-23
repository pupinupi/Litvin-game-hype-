const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", { name, roomCode: room, color });

const board = document.getElementById("board");
const cube = document.getElementById("cube");
const diceResult = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");

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

let playersState = [];
let currentTurn = 0;

// ======================

function startGame(){
    document.getElementById("rulesModal").classList.remove("show");
}

function roll(){
    socket.emit("rollDice", room);
}

// ======================
// ПРАВИЛЬНЫЙ updatePlayers
// ======================

socket.on("updatePlayers", (data)=>{
    playersState = data.players;
    currentTurn = data.turn;

    renderPlayers();
    updateTurn();
});

// ======================

socket.on("diceRolled", ({dice})=>{
    showDice(dice);
    diceResult.innerText = "Выпало: " + dice;
});

socket.on("riskResult", ({dice,result})=>{
    showDice(dice);
    diceResult.innerText =
        `Риск! Выпало ${dice}. ${result > 0 ? "+" : ""}${result} хайпа`;
});

socket.on("scandalCard", (data)=>{

    let message = data.text;

    if (data.value) {
        message += ` (${data.value} хайпа)`;
    }

    if (data.all) {
        message += " — У ВСЕХ ИГРОКОВ!";
    }

    if (data.skip) {
        message += " Пропуск хода!";
    }

    document.getElementById("scandalText").innerText = message;
    document.getElementById("scandalModal").style.display = "flex";
});

function closeScandal(){
    document.getElementById("scandalModal").style.display = "none";
}

// ======================
// ФИШКИ
// ======================

function renderPlayers(){

    board.querySelectorAll(".token").forEach(t=>t.remove());

    playersState.forEach(p=>{
        const token = document.createElement("div");
        token.classList.add("token");
        token.style.background = p.color;

        const pos = CELL_POSITIONS[p.position];

        token.style.left = pos.x + "px";
        token.style.top = pos.y + "px";
        token.id = p.id;

        board.appendChild(token);
    });

    renderScore();
}

// ======================
// ХАЙП
// ======================

function renderScore(){
    const container=document.getElementById("players");
    container.innerHTML="";

    playersState.forEach(p=>{
        container.innerHTML+=`
        <div style="
            background:#111;
            padding:10px 20px;
            border-radius:10px;
            margin:5px;
            font-size:20px;
            font-weight:bold;
            color:${p.color};
        ">
            ${p.name}: ${p.hype} ХАЙП
        </div>`;
    });
}

// ======================
// ЧЕЙ ХОД
// ======================

function updateTurn(){

    const currentPlayer = playersState[currentTurn];

    if (!currentPlayer) return;

    if (currentPlayer.id === socket.id) {
        rollBtn.disabled = false;
        rollBtn.style.opacity = "1";
    } else {
        rollBtn.disabled = true;
        rollBtn.style.opacity = "0.5";
    }
}

// ======================
// КУБИК
// ======================

function showDice(value){

    const rotations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(0deg) rotateY(180deg)",
        3: "rotateX(0deg) rotateY(-90deg)",
        4: "rotateX(0deg) rotateY(90deg)",
        5: "rotateX(-90deg) rotateY(0deg)",
        6: "rotateX(90deg) rotateY(0deg)"
    };

    cube.style.transition = "transform 0.6s ease";
    cube.style.transform = rotations[value];
}
