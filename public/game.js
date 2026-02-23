const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", { name, roomCode: room, color });

const board = document.getElementById("board");
const cube = document.getElementById("cube");
const diceResult = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");

let playersState = [];
let currentTurn = 0;

function startGame(){
    document.getElementById("rulesModal").style.display = "none";
}

function roll(){
    socket.emit("rollDice", room);
}

socket.on("updatePlayers", (data)=>{
    playersState = data.players;
    currentTurn = data.turn;
    renderPlayers();
    updateTurn();
});

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
    let message = data.text + ` (${data.value} хайпа)`;
    if (data.all) message += " — У ВСЕХ!";
    if (data.skip) message += " Пропуск хода!";
    alert(message);
});

function renderPlayers(){
    board.querySelectorAll(".token").forEach(t=>t.remove());

    playersState.forEach(p=>{
        const token = document.createElement("div");
        token.classList.add("token");
        token.style.background = p.color;
        token.style.left = CELL_POSITIONS[p.position].x + "px";
        token.style.top = CELL_POSITIONS[p.position].y + "px";
        board.appendChild(token);
    });

    renderScore();
}

function renderScore(){
    const container=document.getElementById("players");
    container.innerHTML="";
    playersState.forEach(p=>{
        container.innerHTML+=`
        <div style="font-size:22px;color:${p.color}">
        ${p.name}: ${p.hype} ХАЙП
        </div>`;
    });
}

function updateTurn(){
    const currentPlayer = playersState[currentTurn];
    if (!currentPlayer) return;

    rollBtn.disabled = currentPlayer.id !== socket.id;
}

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
