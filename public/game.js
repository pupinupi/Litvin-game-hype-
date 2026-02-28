let hype = 0;
let position = 0;

const player = document.getElementById("player");

/*
ТВОЙ МАРШРУТ
движение:
⬆ вверх
➡ вправо
⬇ вниз
⬅ влево
*/

const path = [

{ x:110, y:590 },
{ x:110, y:500 },
{ x:110, y:410 },
{ x:110, y:320 },
{ x:110, y:230 },

{ x:200, y:200 },
{ x:320, y:190 },
{ x:450, y:185 },
{ x:580, y:190 },
{ x:720, y:200 },

{ x:820, y:260 },
{ x:820, y:360 },
{ x:820, y:460 },
{ x:820, y:560 },

{ x:700, y:590 },
{ x:560, y:600 },
{ x:420, y:600 },
{ x:280, y:600 }
];

movePlayer();

/* ===== движение ===== */

function movePlayer(){
    const cell = path[position];

    player.style.left = cell.x + "px";
    player.style.top = cell.y + "px";
}

/* ===== hype ===== */

function updateHype(value){
    hype += value;
    document.getElementById("hype").innerText = hype;
}

/* ===== кубик ===== */

function rollDice(){

    const dice =
        Math.floor(Math.random()*6)+1;

    updateHype(dice);

    moveSteps(dice);
}

/* ===== пошаговое движение ===== */

function moveSteps(steps){

    let moved = 0;

    const walk = setInterval(()=>{

        position++;

        if(position >= path.length)
            position = 0;

        movePlayer();

        moved++;

        if(moved === steps)
            clearInterval(walk);

    },350);
}

document.getElementById("board").onclick = function(e){

    const rect = this.getBoundingClientRect();

    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    console.log(`{ x:${x}, y:${y} },`);
};

