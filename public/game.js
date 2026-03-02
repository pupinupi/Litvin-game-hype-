const socket = io();

const room = localStorage.room;
const name = localStorage.name;
const color = localStorage.color;

socket.emit("joinRoom",{room,name,color});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const board = document.getElementById("boardImg");

let players = [];
let moving = false;

const path=[
[116,605],[116,520],[116,440],[116,350],[116,260],
[116,170],[232,102],[348,97],[494,99],[644,102],
[771,86],[898,122],[912,238],[909,354],[917,450],
[901,575],[773,597],[641,605],[500,597],[345,608]
];

// canvas масштаб под изображение
board.onload = () => {
    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;
    draw();
};

// обновление игроков
socket.on("updatePlayers", p => {
    players = p;
    draw();
    updateUI();
});

// кубик + анимация
socket.on("startMove", async data => {
    if(moving) return;
    moving = true;
    await animateMove(data.player, data.steps);
    moving = false;
});

// popup scandal
socket.on("scandalPopup", text => {
    showScandal(text);
});

// ход фишки шаг за шагом
async function animateMove(index, steps){
    for(let i=0;i<steps;i++){
        players[index].pos = (players[index].pos+1) % path.length;
        draw();
        await sleep(350);
    }
    socket.emit("finishMove", room, index);
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// рисуем фишки
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const sx = canvas.width / 1024;
    const sy = canvas.height / 1024;

    players.forEach((p,i)=>{
        const pt = path[p.pos];
        const x = pt[0]*sx;
        const y = pt[1]*sy;

        ctx.beginPath();
        ctx.arc(x + i*18, y - i*18, 18, 0, 2*Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.fillStyle="white";
        ctx.font="14px Arial";
        ctx.fillText(p.name, x-15, y-25);
    });
}

// отображаем хайп
function updateUI(){
    document.getElementById("players").innerHTML =
        players.map(p=>`${p.name} 🔥${p.hype}`).join("<br>");
}

// бросок кубика
function roll(){
    if(moving) return;
    socket.emit("rollDice", room);
}

// popup scandal
function showScandal(text){
    const bg = document.createElement("div");
    bg.style.position = "fixed";
    bg.style.top = 0; bg.style.left = 0;
    bg.style.width = "100%"; bg.style.height = "100%";
    bg.style.background = "rgba(0,0,0,0.7)";
    bg.style.display = "flex"; bg.style.alignItems = "center"; bg.style.justifyContent = "center";
    bg.style.zIndex = 999;

    const box = document.createElement("div");
    box.style.background = "#111";
    box.style.padding = "40px";
    box.style.border = "3px solid orange";
    box.style.borderRadius = "15px";
    box.style.fontSize = "22px";
    box.style.textAlign = "center";
    box.innerHTML = `🔥 СКАНДАЛ<br><br>${text}`;

    bg.appendChild(box);
    document.body.appendChild(bg);
    setTimeout(()=>bg.remove(),3000);
}
