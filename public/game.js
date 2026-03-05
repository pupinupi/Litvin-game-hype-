const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = canvas.width;

const board = new Image();

board.onload = () => {
  console.log("Поле загружено");
  draw();
};

board.onerror = () => {
  document.getElementById("messageBox").innerText =
  "❌ board.jpg не найден";
};

board.src = "/board.jpg";

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.drawImage(board,0,0,canvas.width,canvas.height);
}
