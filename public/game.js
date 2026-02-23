const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", { name, roomCode: room, color });

const board = document.getElementById("board");

const CELL_POSITIONS = [
  {x:110,y:597}, // 1 Старт

  // ВВЕРХ
  {x:99,y:450},
  {x:80,y:345},
  {x:99,y:232},
  {x:99,y:133},

  // ВПРАВО (верхняя линия)
  {x:218,y:97},
  {x:348,y:91},
  {x:500,y:88},
  {x:624,y:102},
  {x:762,y:91},
  {x:895,y:130},

  // ВНИЗ (правая сторона)
  {x:912,y:204},
  {x:912,y:337},
  {x:909,y:425},
  {x:901,y:580},

  // ВЛЕВО (нижняя линия)
  {x:771,y:588},
  {x:641,y:588},
  {x:483,y:594},
  {x:331,y:586},
  {x:218,y:594}
];

let playersState = [];

function startGame(){
    document.getElementById("rules").style.display="none";
    document.getElementById("game").style.display="block";
}

function roll(){
    socket.emit("rollDice", room);
}

socket.on("updatePlayers", (players)=>{
    playersState = players;
    renderPlayers();
});

socket.on("turnChanged", (turn)=>{
    highlightActive(turn);
});

socket.on("diceRolled", ({dice})=>{
    animateDice(dice);
});

socket.on("scandalCard", ({text})=>{
    document.getElementById("scandalText").innerText = text;
    document.getElementById("scandalModal").style.display = "flex";
});

function closeScandal(){
    document.getElementById("scandalModal").style.display = "none";
}

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

function highlightActive(turn){
    document.querySelectorAll(".token").forEach(t=>t.classList.remove("active"));
    const activePlayer = playersState[turn];
    if(activePlayer){
        const el = document.getElementById(activePlayer.id);
        if(el) el.classList.add("active");
    }
}

/* ----------- 3D Dice ----------- */

function animateDice(value){
    const cube = document.getElementById("cube");

    const rotations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(-90deg) rotateY(0deg)",
        3: "rotateX(0deg) rotateY(90deg)",
        4: "rotateX(0deg) rotateY(-90deg)",
        5: "rotateX(90deg) rotateY(0deg)",
        6: "rotateX(180deg) rotateY(0deg)"
    };

    cube.style.transform = "rotateX(720deg) rotateY(720deg)";

    setTimeout(()=>{
        cube.style.transform = rotations[value];
    },800);
}
