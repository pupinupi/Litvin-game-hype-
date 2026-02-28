let hype = 0;
let position = 0;

/*
КООРДИНАТЫ КЛЕТОК
(можно потом идеально подогнать)
*/
const path = [
    {x:110,y:560},
    {x:200,y:560},
    {x:300,y:560},
    {x:400,y:560},
    {x:500,y:560},
    {x:600,y:560},
    {x:700,y:560},
    {x:800,y:560},

    {x:850,y:480},
    {x:850,y:380},
    {x:850,y:280},

    {x:780,y:200},
    {x:650,y:150},
    {x:500,y:120},
    {x:350,y:140},
    {x:220,y:170},

    {x:150,y:250},
    {x:130,y:350},
    {x:120,y:450}
];

const player = document.getElementById("player");

movePlayer();

function updateHype(value){
    hype += value;
    document.getElementById("hype").innerText = hype;
}

function movePlayer(){
    const cell = path[position];
    player.style.left = cell.x + "px";
    player.style.top = cell.y + "px";
}

function rollDice(){

    const cube = document.getElementById("cube");

    const number = Math.floor(Math.random()*6)+1;

    cube.style.transform =
        "rotateX("+Math.random()*720+"deg)" +
        " rotateY("+Math.random()*720+"deg)";

    updateHype(number);

    moveSteps(number);
}

function moveSteps(steps){

    let moves = 0;

    const interval = setInterval(()=>{

        position++;

        if(position >= path.length)
            position = 0;

        movePlayer();

        moves++;

        if(moves >= steps)
            clearInterval(interval);

    },400);
}
