let position = 0;
let hype = 0;

const player = document.getElementById("player");
const hypeText = document.getElementById("hype");

/* координаты клеток */
const cells = [
    {x:20,y:520},
    {x:80,y:520},
    {x:140,y:520},
    {x:200,y:520},
    {x:260,y:520},
    {x:320,y:520},
    {x:380,y:520},
    {x:440,y:520},
    {x:500,y:520},
    {x:560,y:520}
];

function movePlayer() {
    const cell = cells[position];

    player.style.left = cell.x + "px";
    player.style.top = cell.y + "px";
}

function rollDice() {

    const dice = Math.floor(Math.random()*6)+1;

    alert("Выпало: " + dice);

    position += dice;

    if(position >= cells.length){
        alert("🏆 Победа!");
        position = 0;
        hype = 0;
    }

    hype += dice * 10;

    hypeText.innerText = "Хайп: " + hype;

    movePlayer();
}

movePlayer();
