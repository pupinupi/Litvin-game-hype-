const chip=document.getElementById("chip")
const diceBtn=document.getElementById("dice")
const hypeText=document.getElementById("hype")
const riskWindow=document.getElementById("riskWindow")

const playerName=localStorage.getItem("playerName")
const chipColor=localStorage.getItem("chipColor")
document.getElementById("player").innerText=playerName
chip.style.background=chipColor

let hype=10
let pos=0
let skipNext=false

const path=[
{ x:87,y:467,type:"start",hype:0},
{ x:63,y:354,type:"+",hype:3},
{ x:66,y:285,type:"+",hype:2},
{ x:67,y:187,type:"scandal",hype:0},
{ x:76,y:103,type:"risk",hype:0},
{ x:176,y:77,type:"+",hype:2},
{ x:287,y:77,type:"scandal",hype:0},
{ x:397,y:79,type:"+",hype:3},
{ x:515,y:76,type:"+",hype:5},
{ x:621,y:86,type:"minusAll",hype:-20},
{ x:721,y:102,type:"minus10skip",hype:-10},
{ x:713,y:181,type:"+",hype:3},
{ x:720,y:268,type:"risk",hype:0},
{ x:720,y:355,type:"+",hype:3},
{ x:711,y:454,type:"skip",hype:0},
{ x:619,y:484,type:"+",hype:2},
{ x:513,y:484,type:"scandal",hype:0},
{ x:398,y:471,type:"+",hype:8},
{ x:290,y:489,type:"minusAll",hype:-20},
{ x:158,y:486,type:"+",hype:4},
]

moveChip()

diceBtn.onclick=function(){
  if(skipNext){
    riskWindow.innerText="Вы пропускаете ход!"
    skipNext=false
    return
  }
  const roll=Math.floor(Math.random()*6)+1
  diceBtn.innerText="🎲 "+roll
  move(roll)
}

function move(steps){
  pos=(pos+steps)%path.length
  moveChip()
  checkCell(path[pos])
}

function moveChip(){
  const cell=path[pos]
  chip.style.left=cell.x+"px"
  chip.style.top=cell.y+"px"
}

function checkCell(cell){
  riskWindow.innerText=""
  switch(cell.type){
    case "+":
      addHype(cell.hype)
      break
    case "scandal":
      scandalCard()
      break
    case "risk":
      riskCard()
      break
    case "minusAll":
      hype=0
      updateHype()
      showPopup("Весь хайп потерян!")
      break
    case "minus10skip":
      addHype(-10)
      skipNext=true
      showPopup("-10 хайп и пропуск хода")
      break
    case "skip":
      skipNext=true
      showPopup("Пропуск хода")
      break
  }
}

function addHype(amount){
  hype+=amount
  if(hype<0) hype=0
  updateHype()
  showPopup((amount>0?"+":"")+amount+" хайп")
}

function updateHype(){
  hypeText.innerText="Хайп: "+hype
}

function showPopup(text){
  const pop=document.createElement("div")
  pop.innerText=text
  pop.style.position="absolute"
  pop.style.left=chip.style.left
  pop.style.top=chip.style.top
  pop.style.color="yellow"
  pop.style.fontSize="20px"
  document.getElementById("board").appendChild(pop)
  setTimeout(()=>pop.remove(),1000)
}

function scandalCard(){
  const cards=[
    {txt:"🔥 перегрел аудиторию",h:-1},
    {txt:"🫣 громкий заголовок",h:-2},
    {txt:"😱 это монтаж",h:-3},
    {txt:"#️⃣ меня взломали",h:-3},
    {txt:"😮 подписчики в шоке",h:-4},
    {txt:"🤫 удаляй пока не поздно",h:-5},
    {txt:"🙄 это контент вы не понимаете",h:-5,skip:true}
  ]
  const card=cards[Math.floor(Math.random()*cards.length)]
  addHype(card.h)
  if(card.skip) skipNext=true
  riskWindow.innerText=card.txt+" "+card.h+" хайп"
}

function riskCard(){
  const roll=Math.floor(Math.random()*6)+1
  if(roll<=3){
    addHype(6)
    riskWindow.innerText="Риск удался! +6 хайп"
  }else{
    addHype(-4)
    riskWindow.innerText="Риск не удался! -4 хайп"
  }
}
