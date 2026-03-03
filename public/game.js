const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

let points = [];

function drawPoints(){
  ctx.clearRect(0,0,1024,1024);

  ctx.fillStyle="red";
  points.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,10,0,Math.PI*2);
    ctx.fill();
  });
}

canvas.addEventListener("click",function(e){

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX - rect.left));
  const y = Math.round((e.clientY - rect.top));

  points.push({x,y});

  drawPoints();

  document.getElementById("coords").innerText =
    JSON.stringify(points,null,2);
});
