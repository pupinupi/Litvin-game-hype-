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
let currentRotation = { x:0, y:0 };

function startGame(){
    document.getElementById("rulesModal").classList.remove("show");
}

function roll(){
    socket.emit("rollDice", room);
}

socket.on("updatePlayers", (players)=>{
    playersState = players;
    renderPlayers();
});

/* ---------- ГЛАВНЫЙ БРОСОК ---------- */

socket.on("diceRolled", ({dice})=>{
    showDice(dice);
    diceResult.innerText = "Выпало: " + dice;
});

/* ---------- РИСК ---------- */

socket.on("riskResult", ({dice,result})=>{
    showDice(dice);
    diceResult.innerText =
        `Риск! Выпало ${dice}. ${result > 0 ? "+" : ""}${result} хайпа`;
});

/* ---------- СКАНДАЛ ---------- */

socket.on("scandalCard", ({text})=>{
    document.getElementById("scandalText").innerText = text;
    document.getElementById("scandalModal").style.display = "flex";
});

function closeScandal(){
    document.getElementById("scandalModal").style.display = "none";
}

/* ---------- ОТРИСОВКА ---------- */

function renderPlayers(){
    board.querySelectorAll(".token").forEach(t=>t.remove());

    playersState.forEach(p=>{
        const token = document.createElement("div");
        token.classList.add("token", p.color);

        const pos = CELL_POSITIONS[p.position];
        token.style.left = pos.x + "px";
        token.style.top = pos.y + "px";
        token.id = p.id;

        board.appendChild(token);
    });

    renderScore();
}

function renderScore(){
    const container=document.getElementById("players");
    container.innerHTML="";
    playersState.forEach(p=>{
        container.innerHTML+=`<p style="color:${p.color}">
        ${p.name}: ${p.hype} хайпа
        </p>`;
    });
}

/* ---------- СИНХРОНИЗИРОВАННЫЙ КУБИК ---------- */

function showDice(value){

    const rotations = {
        1: {x:0, y:0},
        2: {x:-90, y:0},
        3: {x:0, y:90},
        4: {x:0, y:-90},
        5: {x:90, y:0},
        6: {x:180, y:0}
    };

    const target = rotations[value];

    // Сначала делаем быструю анимацию вращения
    cube.style.transition = "transform 0.7s ease";
    cube.style.transform =
        `rotateX(${target.x + 720}deg) rotateY(${target.y + 720}deg)`;

    // Потом фиксируем точный угол
    setTimeout(()=>{
        cube.style.transition = "transform 0.2s ease";
        cube.style.transform =
            `rotateX(${target.x}deg) rotateY(${target.y}deg)`;
    },700);
}
