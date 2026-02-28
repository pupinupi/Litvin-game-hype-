let hype = 0;

function updateHype(value) {
    hype += value;
    document.getElementById("hype").innerText = hype;
}

function cellClick() {
    updateHype(1);
}

function rollDice() {

    const cube = document.getElementById("cube");

    const number = Math.floor(Math.random() * 6) + 1;

    let rotation = "";

    switch(number) {
        case 1:
            rotation = "rotateX(0deg) rotateY(0deg)";
            break;
        case 2:
            rotation = "rotateX(-90deg)";
            break;
        case 3:
            rotation = "rotateY(90deg)";
            break;
        case 4:
            rotation = "rotateY(-90deg)";
            break;
        case 5:
            rotation = "rotateX(90deg)";
            break;
        case 6:
            rotation = "rotateY(180deg)";
            break;
    }

    cube.style.transform =
        rotation +
        " rotateX(" + (Math.random()*720) + "deg)" +
        " rotateY(" + (Math.random()*720) + "deg)";

    updateHype(number);
}
