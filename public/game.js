const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const messageBox = document.getElementById("messageBox");
const playersPanel = document.getElementById("playersPanel");
const diceBtn = document.getElementById("diceBtn");

// размер поля
function resizeCanvas() {
  const size = window.innerWidth * 0.95;
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// загрузка поля
const boardImg = new Image();
boardImg.src = "board.jpg";

boardImg.onload = () => {
  drawBoard();
};

boardImg.onerror = () => {
  messageBox.innerText = "❌ Не найден файл board.jpg";
};

// рисуем поле
function drawBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);
}

// тестовая фишка чтобы проверить работу
function drawTestToken(){
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, canvas.width*0.03, 0, Math.PI*2);
  ctx.fillStyle = "red";
  ctx.fill();
}

// кнопка кубика (пока тест)
diceBtn.onclick = () => {
  const roll = Math.floor(Math.random()*6)+1;
  messageBox.innerText = "🎲 Выпало: " + roll;
};

// нарисовать фишку через секунду
setTimeout(drawTestToken,1000);
