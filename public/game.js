console.log("TEST RUN");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

/* твои реальные координаты */
const path = [
  {x:89,y:599},
  {x:88,y:459},
  {x:80,y:366},
  {x:86,y:244},
  {x:95,y:133},
  {x:212,y:100},
  {x:358,y:93},
  {x:498,y:92},
  {x:638,y:106},
  {x:805,y:102},
  {x:925,y:129},
  {x:923,y:238},
  {x:940,y:353},
  {x:927,y:466},
  {x:913,y:586},
  {x:783,y:605},
  {x:641,y:604},
  {x:501,y:609},
  {x:350,y:610},
  {x:228,y:600},
  {x:101,y:589}
];

let pos = 0;

function draw(){
  ctx.clearRect(0,0,1024,1024);

  const p = path[pos];

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 18, 0, Math.PI*2);
  ctx.fill();
}

draw();

/* просто тестовое движение */
setInterval(()=>{
  pos++;
  if(pos >= path.length) pos = 0;
  draw();
}, 1000);
