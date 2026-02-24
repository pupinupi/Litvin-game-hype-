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
  {x:110,y:597},{x:99,y:450},{x:80,y:345},{x:99,y:232},{x:99,y:133},
  {x:218,y:97},{x:348,y:91},{x:500,y:88},{x:624,y:102},{x:762,y:91},
  {x:895,y:130},{x:912,y:204},{x:912,y:337},{x:909,y:425},{x:901,y:580},
  {x:771,y:588},{x:641,y:588},{x:483,y:594},{x:331,y:586},{x:218,y:594}
];

let playersState = [];
let currentTurn = 0;

function startGame(){
    document.getElementById("rulesModal").style.display="none";
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
    diceResult.innerText="Выпало: "+dice;
});

socket.on("riskResult", ({dice,result})=>{
    showDice(dice);
    diceResult.innerText=
        `Риск! Выпало ${dice}. ${result>0?"+":""}${result} хайпа`;
});

socket.on("scandalCard", (data)=>{
    document.getElementById("scandalText").innerText=data.text;
    document.getElementById("scandalModal").style.display="flex";
});

socket.on("gameOver", ({winner})=>{
    alert("ПОБЕДИЛ: "+winner);
    location.reload();
});

function closeScandal(){
    document.getElementById("scandalModal").style.display="none";
}

function renderPlayers(){
    board.querySelectorAll(".token").forEach(t=>t.remove());

    playersState.forEach(p=>{
        const safePosition = p.position % CELL_POSITIONS.length;
        const pos = CELL_POSITIONS[safePosition];

        const token=document.createElement("div");
        token.classList.add("token");
        token.style.background=p.color;
        token.style.left=pos.x+"px";
        token.style.top=pos.y+"px";

        board.appendChild(token);
    });

    renderScore();
}

function renderScore(){
    const container=document.getElementById("players");
    container.innerHTML="";
    playersState.forEach(p=>{
        container.innerHTML+=
        `<div class="playerCard" style="color:${p.color}">
        ${p.name}: ${p.hype} ХАЙП
        </div>`;
    });
}

function updateTurn(){
    const currentPlayer=playersState[currentTurn];
    if(!currentPlayer) return;
    rollBtn.disabled=currentPlayer.id!==socket.id;
}

function showDice(n){
    const dice=["⚀","⚁","⚂","⚃","⚄","⚅"];
    cube.innerText=dice[n-1];
    cube.style.transform="scale(1.2)";
    setTimeout(()=>cube.style.transform="scale(1)",200);
}
