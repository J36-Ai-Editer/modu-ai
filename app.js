(function (root) {
  'use strict';
  // Stable codes; display labels are Korean and contain no personal data.
  const LABELS = ['가볍게 움직이기', '식사 리듬 기록', '음료 선택 돌아보기'];
  const KEY = 'modu-ai-records-v1';
  function validDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0,10) === s; }
  function validate(input) {
    if (!input || input.version !== 1 || typeof input.days !== 'object' || !input.days || Array.isArray(input.days)) throw Error('지원하는 형식은 version:1, days 객체입니다.');
    if (Object.keys(input.days).length > 3660) throw Error('가져올 기록이 너무 많습니다.');
    const days = Object.create(null);
    for (const [day, values] of Object.entries(input.days)) {
      if (!validDate(day) || !Array.isArray(values) || values.length !== 3 || values.some(v => typeof v !== 'boolean')) throw Error('날짜와 3개 참/거짓 기록을 확인하세요.');
      days[day] = values.slice();
    }
    return {version:1, days};
  }
  function dayOffset(day,n) {const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function summarize(data,day) {
    const dates=Array.from({length:7},(_,i)=>dayOffset(day,i-6));
    const counts=dates.map(d=>(data.days[d]||[]).filter(Boolean).length);
    const today=(data.days[day]||[]).filter(Boolean).length;
    return {dates,counts,today:Math.round(today/3*100),week:Math.round(counts.reduce((a,b)=>a+b,0)/21*100),total:Object.values(data.days).reduce((a,v)=>a+v.filter(Boolean).length,0),weekCount:counts.reduce((a,b)=>a+b,0)};
  }
  const api={validate,summarize,validDate,dayOffset};
  if(typeof module!=='undefined')module.exports=api;
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id);let data={version:1,days:{}};
  try{const raw=localStorage.getItem(KEY);if(raw)data=validate(JSON.parse(raw));}catch{ $('status').textContent='저장된 기록을 읽지 못해 빈 기록으로 시작합니다.';}
  const now=new Date();$('day').value=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data));$('status').textContent='이 브라우저에 기록했습니다.';}catch{$('status').textContent='저장이 제한되어 현재 화면에만 반영합니다. JSON으로 내보낼 수 있습니다.';}}
  function render(){const day=$('day').value;if(!validDate(day))return;const s=summarize(data,day);$('tasks').replaceChildren();LABELS.forEach((label,i)=>{const el=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=!!data.days[day]?.[i];check.addEventListener('change',()=>{const v=(data.days[day]||[false,false,false]).slice();v[i]=check.checked;data.days[day]=v;save();render();});el.append(check,document.createTextNode(label));$('tasks').append(el);});$('today').textContent=s.today+'%';$('week').textContent=s.week+'%';$('points').textContent=s.total;$('bars').replaceChildren();s.dates.forEach((day,i)=>{const row=document.createElement('div');row.className='bar';const date=document.createElement('span');date.textContent=day.slice(5);const bar=document.createElement('i');const fill=document.createElement('b');fill.style.width=s.counts[i]/3*100+'%';bar.append(fill);const val=document.createElement('span');val.textContent=s.counts[i]+'/3';row.append(date,bar,val);$('bars').append(row);});const group=Math.min(30,s.weekCount+9);$('group').value=group;$('group-text').textContent=`내 최근 7일 ${s.weekCount}회 + 익명 합성 기록 9회 = ${group}/30회`;$('trees').textContent='🌱'.repeat(Math.min(5,Math.floor(s.total/3)+1));$('forest-text').textContent=`누적 ${s.total}회 기록 · 3회마다 새싹 하나, 최대 다섯 개`;} 
  $('day').addEventListener('change',render);
  $('reset').addEventListener('click',()=>{if(confirm('이 브라우저의 예제 기록을 초기화할까요?')){data={version:1,days:{}};save();render();}});
  $('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='modu-ai-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('import').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1024*1024)throw Error('1MB 이하 JSON만 가져옵니다.');data=validate(JSON.parse(await f.text()));save();render();}catch(err){$('status').textContent='가져오기 실패: '+err.message;}finally{e.target.value='';}});render();
})(typeof globalThis!=='undefined'?globalThis:this);
