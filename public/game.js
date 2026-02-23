const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom", { name, roomCode: room, color });

function startGame(){
    document.getElementById("rules").style.display="none";
    document.getElementById("game").style.display="block";
}

function roll(){
    socket.emit("rollDice", room);
}

socket.on("diceRolled", ({dice})=>{
    document.getElementById("dice").innerText="🎲 "+dice;
});

const CELL_POSITIONS = [
  {x:110, y:597},  // 1 старт
  {x:218, y:594},
  {x:331, y:586},
  {x:483, y:594},
  {x:641, y:588},
  {x:771, y:588},
  {x:901, y:580},
  {x:909, y:425},
  {x:912, y:337},
  {x:912, y:204},
  {x:895, y:130},
  {x:762, y:91},
  {x:624, y:102},
  {x:500, y:88},
  {x:348, y:91},
  {x:218, y:97},
  {x:99, y:133},
  {x:99, y:232},
  {x:80, y:345},
  {x:102, y:450}
];

socket.on("updatePlayers", (players)=>{
    const container=document.getElementById("players");
    container.innerHTML="";
    players.forEach(p=>{
        container.innerHTML+=`<p style="color:${p.color}">${p.name}: ${p.hype}</p>`;
    });
});
