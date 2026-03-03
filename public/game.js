console.log("FINAL MAP OK");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 1024;

/* ===== ИГРОК ===== */

let player = {
  pos: 0,
  hype: 0
};

/* ===== ТВОИ ТОЧНЫЕ КООРДИНАТЫ ===== */

const path = [

{ x:89,  y:599, type:"start" },
{ x:88,  y:459, type:"+3" },
{ x:80,  y:366, type:"+2" },
{ x:86,  y:244, type:"scandal" },
{ x:95,  y:133, type:"risk" },

{ x:212, y:100, type:"+2" },
{ x:358, y:93,  type:"scandal" },
{ x:498, y:92,  type:"+3" },
{ x:638, y:106, type:"+5" },
{ x:805, y:102, type:"loseAll" },

{ x:925, y:129, type:"halfSkip" },
{ x:923, y:238, type:"+3
