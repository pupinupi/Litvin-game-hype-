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

socket.on("updatePlayers", (players)=>{
    const container=document.getElementById("players");
    container.innerHTML="";
    players.forEach(p=>{
        container.innerHTML+=`<p style="color:${p.color}">${p.name}: ${p.hype}</p>`;
    });
});
