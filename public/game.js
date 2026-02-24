const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", { name, roomCode: room, color });

const board = document.getElementById("board");
const cube = document.getElementById("cube");
const diceResult = document.getElementById("diceResult");

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

/* ============================= */

function roll(){
    socket.emit("rollDice", room);
}

/* ============================= */

socket.on("updatePlayers", (data)=>{
    playersState = data.players;
    currentTurn = data.turn;
    renderPlayers();
});

function startGame(){
    const modal = document.getElementById("rulesModal");
    modal.classList.remove("show");
});

/* ===== КУБИК ===== */

socket.on("diceRolled", ({dice})=>{
    animateDice(dice);
    diceResult.innerText = "Выпало: " + dice;
});

/* ===== РИСК ===== */

socket.on("riskResult", ({dice,result})=>{
    animateDice(dice);
    diceResult.innerText =
      `Риск! Выпало ${dice}. ${result > 0 ? "+" : ""}${result} хайпа`;
});

/* ===== СКАНДАЛ ===== */

socket.on("scandalCard", (card)=>{
    document.getElementById("scandalText").innerText =
      `${card.text} (${card.value})`;
    document.getElementById("scandalModal").style.display = "flex";
});

function closeScandal(){
    document.getElementById("scandalModal").style.display = "none";
}

/* ============================= */
/* ОТРИСОВКА ФИШЕК */
/* ============================= */

function renderPlayers(){

    board.querySelectorAll(".token").forEach(t=>t.remove());

    playersState.forEach((p,index)=>{

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

/* ============================= */
/* СЧЁТ */
/* ============================= */

function renderScore(){
    const container = document.getElementById("players");
    container.innerHTML = "";

    playersState.forEach((p,index)=>{
        container.innerHTML += `
          <p style="color:${p.color}; font-size:${index===currentTurn?"22px":"16px"}">
            ${p.name}: ${p.hype} хайпа
          </p>
        `;
    });
}

/* ============================= */
/* ПРАВИЛЬНАЯ АНИМАЦИЯ КУБИКА */
/* ============================= */

function animateDice(value){

    const rotations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(0deg) rotateY(180deg)",
        3: "rotateX(0deg) rotateY(-90deg)",
        4: "rotateX(0deg) rotateY(90deg)",
        5: "rotateX(-90deg) rotateY(0deg)",
        6: "rotateX(90deg) rotateY(0deg)"
    };

    // СБРОС
    cube.style.transition = "none";
    cube.style.transform = "rotateX(0deg) rotateY(0deg)";

    // форс перерисовка
    cube.offsetHeight;

    // АНИМАЦИЯ
    cube.style.transition = "transform 0.6s ease";
    cube.style.transform = rotations[value];
}
