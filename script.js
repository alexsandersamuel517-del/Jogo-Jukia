const intro = document.getElementById('intro');
const gameScreen = document.getElementById('game');
const ending = document.getElementById('ending');
const heartCount = document.getElementById('heartCount');
const hint = document.getElementById('hint');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player, hearts, collected, keys, soundOn = false, audioCtx;
const W = 800, H = 500;
const heartSpots = [{x:125,y:115},{x:340,y:85},{x:650,y:130},{x:230,y:365},{x:625,y:365}];
const obstacles = [
  {x:0,y:0,w:800,h:18},{x:0,y:482,w:800,h:18},{x:0,y:0,w:18,h:500},{x:782,y:0,w:18,h:500},
  {x:250,y:165,w:92,h:45},{x:470,y:280,w:110,h:42},{x:95,y:275,w:70,h:38}
];
const flowers = Array.from({length:55},(_,i)=>({x:30+(i*137)%735,y:28+(i*83)%440,c:i%3}));
const trees = [{x:65,y:75},{x:730,y:70},{x:710,y:430},{x:70,y:430},{x:405,y:430}];

function startGame(){
  intro.classList.add('hidden'); ending.classList.add('hidden'); gameScreen.classList.remove('hidden');
  player={x:400,y:245,r:15,speed:3.1}; collected=[]; keys={}; heartCount.textContent='0';
  hint.textContent='Explore o jardim e encontre os 5 corações.';
  draw(); requestAnimationFrame(loop);
}
function loop(){
  if(gameScreen.classList.contains('hidden')) return;
  update(); draw(); requestAnimationFrame(loop);
}
function update(){
  let dx=0,dy=0;
  if(keys.left||keys.ArrowLeft)dx--; if(keys.right||keys.ArrowRight)dx++;
  if(keys.up||keys.ArrowUp)dy--; if(keys.down||keys.ArrowDown)dy++;
  if(dx&&dy){dx*=.707;dy*=.707}
  const nx=player.x+dx*player.speed, ny=player.y+dy*player.speed;
  if(!blocked(nx,player.y))player.x=nx;
  if(!blocked(player.x,ny))player.y=ny;
  heartSpots.forEach((h,i)=>{
    if(!collected.includes(i)&&Math.hypot(player.x-h.x,player.y-h.y)<27){
      collected.push(i);heartCount.textContent=collected.length;playTone(520+i*90);
      const left=5-collected.length;
      hint.textContent=left?`Que lindo! Ainda faltam ${left} coração${left===1?'':'ões'}.`:'Você encontrou todos! ♡';
      if(collected.length===5)setTimeout(()=>{gameScreen.classList.add('hidden');ending.classList.remove('hidden');playTone(880)},650);
    }
  });
}
function blocked(x,y){
  if(x<34||x>766||y<35||y>465)return true;
  return obstacles.slice(4).some(o=>x+11>o.x&&x-11<o.x+o.w&&y+11>o.y&&y-11<o.y+o.h);
}
function draw(){
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#dff0dc');bg.addColorStop(1,'#c9e4c8');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  // soft garden patches
  for(let i=0;i<9;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.12)':'rgba(137,190,137,.13)';ctx.beginPath();ctx.ellipse((i*113+70)%790,(i*71+50)%490,70,36,.4,0,Math.PI*2);ctx.fill()}
  // stepping path
  ctx.fillStyle='#f2e4d3';ctx.beginPath();ctx.moveTo(360,500);ctx.bezierCurveTo(330,390,470,340,395,250);ctx.bezierCurveTo(330,170,420,100,390,0);ctx.lineTo(455,0);ctx.bezierCurveTo(485,120,405,175,465,245);ctx.bezierCurveTo(540,340,400,410,430,500);ctx.fill();
  flowers.forEach((f,i)=>{ctx.fillStyle=['#fff7fa','#f5b8c9','#fff0b7'][f.c];ctx.beginPath();ctx.arc(f.x,f.y,2.7,0,Math.PI*2);ctx.fill()});
  trees.forEach(t=>drawTree(t.x,t.y));
  // bushes/obstacles
  obstacles.slice(4).forEach(o=>{ctx.fillStyle='#9bc49a';roundRect(o.x,o.y,o.w,o.h,13);ctx.fill();ctx.strokeStyle='#80b185';ctx.lineWidth=2;ctx.stroke()});
  // small pond
  ctx.fillStyle='#a9d9df';ctx.beginPath();ctx.ellipse(545,100,52,24,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8bc6d0';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.65)';ctx.beginPath();ctx.ellipse(535,94,18,5,-.2,0,Math.PI*2);ctx.fill();
  heartSpots.forEach((h,i)=>{if(!collected.includes(i)){const bob=Math.sin(Date.now()/250+i)*3;drawHeart(h.x,h.y+bob,14,'#e8799b');ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(h.x,h.y+bob,22,0,Math.PI*2);ctx.fill()}});
  drawPlayer(player.x,player.y);
}
function drawTree(x,y){
  ctx.fillStyle='rgba(72,119,77,.16)';ctx.beginPath();ctx.ellipse(x,y+19,26,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#a8755f';ctx.fillRect(x-5,y+2,10,22);
  ctx.fillStyle='#78ae7c';ctx.beginPath();ctx.arc(x,y-5,23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#91c18d';ctx.beginPath();ctx.arc(x-8,y-12,13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5b7c8';ctx.beginPath();ctx.arc(x+8,y-6,4,0,Math.PI*2);ctx.fill();
}
function drawPlayer(x,y){
  ctx.fillStyle='rgba(66,95,70,.18)';ctx.beginPath();ctx.ellipse(x,y+15,14,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b97891';ctx.beginPath();ctx.arc(x,y+3,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5c5d4';ctx.beginPath();ctx.arc(x,y-8,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#624958';ctx.beginPath();ctx.arc(x-4,y-9,1.5,0,Math.PI*2);ctx.arc(x+4,y-9,1.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#b76e87';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y-5,3,0.2,Math.PI-.2);ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-4,y-13,3,0,Math.PI*2);ctx.fill();
}
function drawHeart(x,y,s,color){
  ctx.save();ctx.translate(x,y);ctx.scale(s/16,s/16);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,13);ctx.bezierCurveTo(-22,-1,-13,-15,0,-6);ctx.bezierCurveTo(13,-15,22,-1,0,13);ctx.fill();ctx.restore();
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function playTone(freq){
  if(!soundOn)return;
  try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.22);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.23)}catch(e){}
}
document.getElementById('startBtn').addEventListener('click',startGame);
document.getElementById('againBtn').addEventListener('click',startGame);
document.getElementById('soundBtn').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♫':'♪';if(soundOn)playTone(660)});
window.addEventListener('keydown',e=>{const k=e.key.replace('Arrow','').toLowerCase();if(['up','down','left','right'].includes(k)){keys[k]=true;e.preventDefault()}});
window.addEventListener('keyup',e=>{const k=e.key.replace('Arrow','').toLowerCase();keys[k]=false});
document.querySelectorAll('.pad').forEach(btn=>{
  const dir=btn.dataset.dir;
  const on=e=>{e.preventDefault();keys[dir]=true};
  const off=e=>{e.preventDefault();keys[dir]=false};
  btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointerleave',off);btn.addEventListener('pointercancel',off);
});
draw();