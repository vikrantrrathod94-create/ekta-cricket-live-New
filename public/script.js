async function fetchPublic(){
  try{
    const res = await fetch('/api/public');
    const j = await res.json();
    render(j);
  }catch(e){
    console.error(e);
  }
}

function render(data){
  const m = data.match || {};
  const players = m.players || [];
  document.getElementById('playersList').innerHTML = players.map(p=>`<li>${p.name} (${p.role||''}) #${p.jersey||''}</li>`).join('')||'<li>No players</li>';
  if(!m || m.status==='not_started'){
    document.getElementById('teams').innerText = 'No live match';
    document.getElementById('scoreline').innerText = '-- / -- (0.0)';
    document.getElementById('info').innerText = '';
    document.getElementById('ballsList').innerHTML = '';
    return;
  }
  document.getElementById('teams').innerText = m.teamA + ' vs ' + m.teamB;
  document.getElementById('scoreline').innerText = `${m.runs} / ${m.wickets} (${m.overs})`;
  document.getElementById('info').innerText = `Status: ${m.status}`;
  const last = (m.lastBalls||[]).slice().reverse().slice(0,12);
  const ul = document.getElementById('ballsList');
  ul.innerHTML = '';
  last.forEach(b=>{
    const li = document.createElement('li');
    li.innerText = (b.isWicket ? 'W' : (b.runs||0)) + (b.extra ? ' ('+b.extra+')' : '');
    ul.appendChild(li);
  });
}

let evt;
try{
  evt = new EventSource('/api/stream');
  evt.onmessage = function(e){
    try{
      const d = JSON.parse(e.data);
      fetchPublic();
    }catch(err){}
  };
}catch(e){
  setInterval(fetchPublic, 5000);
}

fetchPublic();

// particles
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
const parts = [];
for(let i=0;i<80;i++){ parts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+0.5,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,alpha:Math.random()*0.6+0.2}); }
function frame(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const p of parts){
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(108,92,231,'+p.alpha+')';
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(frame);
}
frame();
