async function api(path, method='GET', body){
  const res = await fetch('/api'+path, { method, headers:{'Content-Type':'application/json'}, body: body?JSON.stringify(body):undefined });
  return res.json();
}

async function updateScore(){
  const teamA = document.getElementById('teamA').value;
  const teamB = document.getElementById('teamB').value;
  const runs = document.getElementById('runs').value;
  const wickets = document.getElementById('wickets').value;
  const overs = document.getElementById('overs').value;
  const j = await api('/admin/updateScore','POST',{teamA,teamB,runs,wickets,overs});
  document.getElementById('resp').innerText = j.ok ? 'Updated' : JSON.stringify(j);
}

async function addBall(){
  const runs = document.getElementById('bruns').value;
  const isWicket = document.getElementById('bwicket').checked;
  const extra = document.getElementById('bextra').value;
  const j = await api('/admin/addBall','POST',{runs,isWicket,extra});
  document.getElementById('ballResp').innerText = j.ok ? 'Ball added' : JSON.stringify(j);
}
