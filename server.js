const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

const DB = path.join(__dirname, 'db.json');
function readDB(){
  try{
    const txt = fs.readFileSync(DB,'utf8');
    return JSON.parse(txt || '{}');
  }catch(e){
    return { match: { teamA:'Ekta Cricket Club', teamB:'Opponent XI', runs:0, wickets:0, overs:'0.0', status:'not_started', lastBalls:[], players:[] } };
  }
}
function writeDB(data){
  try{
    fs.writeFileSync(DB, JSON.stringify(data, null, 2),'utf8');
    return true;
  }catch(e){
    return false;
  }
}

let clients = [];
function sendAll(payload){
  const s = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(res=>{ try{ res.write(s);}catch(e){} });
}

app.get('/api/public', (req,res)=>{
  const db = readDB();
  res.json(db);
});

app.post('/api/admin/updateScore', (req,res)=>{
  const { teamA, teamB, runs, wickets, overs } = req.body;
  const db = readDB();
  db.match.teamA = teamA || db.match.teamA;
  db.match.teamB = teamB || db.match.teamB;
  db.match.runs = Number(runs||db.match.runs);
  db.match.wickets = Number(wickets||db.match.wickets);
  db.match.overs = overs || db.match.overs;
  db.match.status = 'live';
  writeDB(db);
  sendAll({ type:'score_update', match: db.match });
  res.json({ ok:true, match: db.match });
});

app.post('/api/admin/addBall', (req,res)=>{
  const { runs, isWicket, extra } = req.body;
  const db = readDB();
  const ball = { id: nanoid(6), runs: Number(runs||0), isWicket: !!isWicket, extra: extra||'', time: Date.now() };
  db.match.lastBalls = db.match.lastBalls || [];
  db.match.lastBalls.push(ball);
  db.match.runs += ball.runs + (ball.extra?1:0);
  if(ball.isWicket) db.match.wickets += 1;
  writeDB(db);
  sendAll({ type:'ball', ball });
  res.json({ ok:true, ball, match: db.match });
});

app.get('/api/stream', (req,res)=>{
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();
  res.write('retry: 2000\n\n');
  clients.push(res);
  req.on('close', ()=>{ clients = clients.filter(c=>c!==res); });
});

app.get('/', (req,res)=>{ res.redirect('/public/index.html'); });

app.listen(PORT, ()=>console.log('✅ Server running on port', PORT));
