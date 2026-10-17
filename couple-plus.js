// OnlyUs "Us+" (v40): Days tracker, Sleep share, PIN Love Diary, Wordle, Word Search.
// Data lives in chats/{cid}/coupleHub/cp_* (already allowed for the two chat members by firestore.rules).
// Optional art: put bubu.png / dudu.png next to index.html. Without them, emoji are shown.
(()=>{
'use strict';
const U=()=>window.__us,$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),today=()=>ymd(new Date());
const D0=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)},T0=()=>{const t=new Date();t.setHours(0,0,0,0);return t};
const toast=m=>{try{U().toast(m)}catch(e){}};
const meId=()=>U().uid()||'local',myName=()=>(U().me()&&U().me().name)||'Me',herName=()=>U().cname()||'Partner',herId=()=>U().cuid()||'';
const ref=n=>U().fs().collection('chats').doc(U().cid()).collection('coupleHub').doc(n);
const DOC={days:'cp_days',sleep:'cp_sleep',diary:'cp_diary',wordle:'cp_wordle',words:'cp_words'};
let tab='days',unsub=null,data={},unlocked=false,sel=null,cm=new Date();
const av=w=>w==='me'?'<img class="cpAv" src="bubu.png" alt="" onerror="this.outerHTML=\'<span class=cpAvB>🐼</span>\'">':'<img class="cpAv" src="dudu.png" alt="" onerror="this.outerHTML=\'<span class=cpAvB>🐻</span>\'">';
async function upd(name,fn){try{await U().fs().runTransaction(async t=>{const r=ref(name),s=await t.get(r),d=s.exists?s.data():{};t.set(r,fn(d)||d)});return true}catch(e){console.error(e);toast('Save failed'+(e&&e.code?': '+e.code:'')+'. Publish the updated firestore.rules.');return false}}
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const pinKey=()=>'cp-pin:'+U().cid();
const V=id=>{const e=$(id);return e?e.value.trim():''};

// ---------- styles + overlay ----------
const css=document.createElement('style');css.textContent=`
#cpOv{z-index:90;flex-direction:column;background:var(--bg);color:var(--ink);padding-top:env(safe-area-inset-top,0)}
#cpOv .cpTop{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--hd,#8657d9);color:#fff}
#cpOv .cpTop b{flex:1;font-size:18px}#cpOv .cpTop button{all:unset;cursor:pointer;width:40px;height:40px;display:grid;place-items:center;font-size:22px}
.cpTabs{display:flex;gap:8px;overflow:auto;padding:10px 12px;border-bottom:1px solid var(--line)}
.cpTabs button{white-space:nowrap;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:12px;padding:8px 12px;cursor:pointer;font:600 14px system-ui}
.cpTabs button.on{background:var(--acc);color:#fff;border-color:var(--acc)}
#cpBody{flex:1;overflow:auto;padding:14px 12px calc(20px + env(safe-area-inset-bottom,0));font:15px/1.4 system-ui}
.cpCard{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px;margin-bottom:12px}
.cpCard h3{margin:0 0 8px;font-size:16px}.cpDim{color:var(--dim);font-size:13px}
.cpIn{width:100%;box-sizing:border-box;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px 12px;font:16px system-ui;margin:4px 0}
.cpBtn{border:0;background:var(--acc);color:#fff;border-radius:12px;padding:10px 16px;font:700 15px system-ui;cursor:pointer;margin:4px 4px 0 0}.cpBtn.g{background:var(--line);color:var(--ink)}
.cpAv{width:44px;height:44px;border-radius:50%;object-fit:cover}.cpAvB{font-size:40px;line-height:44px}
.cpHero{text-align:center;padding:18px 10px;border-radius:20px;background:linear-gradient(135deg,#8657d955,#d65db155);margin-bottom:12px}
.cpHero .n{font-size:56px;font-weight:800;line-height:1}.cpRow{display:flex;align-items:center;gap:10px;justify-content:space-between}
.cpItem{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:var(--panel);border:1px solid var(--line);margin-bottom:8px}.cpItem .t{flex:1}.cpItem .big{font-size:26px;font-weight:800;text-align:right}.cpItem .x{all:unset;cursor:pointer;opacity:.5;padding:4px 8px}
.cpTwo{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cpPer{text-align:center}
.cpRing{width:104px;height:104px;border-radius:50%;margin:0 auto 6px;background:conic-gradient(var(--c) var(--p),var(--line) 0);display:grid;place-items:center}
.cpRing>span{width:84px;height:84px;border-radius:50%;background:var(--bg);display:grid;place-items:center;font-size:40px}
.cpBars{display:flex;align-items:flex-end;gap:6px;height:64px;margin-top:6px}.cpBars i{flex:1;border-radius:5px 5px 0 0;min-height:3px}
.cpCal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.cpCal span{padding:7px 0;border-radius:50%;font-size:14px}.cpCal .h{color:var(--dim);font-size:12px}.cpCal .d{cursor:pointer}.cpCal .e{background:#f6b73c;color:#fff;font-weight:700}.cpCal .t{outline:2px solid var(--acc)}
.cpWg{display:grid;grid-template-columns:repeat(5,46px);gap:5px;justify-content:center;margin:10px 0}.cpWg b{height:46px;display:grid;place-items:center;border:2px solid var(--line);border-radius:8px;font-size:22px;text-transform:uppercase}
.cpWg b.g{background:#22a559;color:#fff;border-color:#22a559}.cpWg b.y{background:#d9a61e;color:#fff;border-color:#d9a61e}.cpWg b.x{background:#6b6b78;color:#fff;border-color:#6b6b78}
.cpWs{display:grid;gap:3px;justify-content:center;margin:10px 0;touch-action:manipulation}.cpWs b{width:34px;height:34px;display:grid;place-items:center;border-radius:8px;background:var(--panel);border:1px solid var(--line);font-size:17px;cursor:pointer;user-select:none}
.cpWs b.s{background:#f6b73c;color:#fff}.cpWs b.m{background:#22a559;color:#fff}.cpWs b.h{background:#8657d9;color:#fff}
.cpWl{display:flex;flex-wrap:wrap;gap:6px}.cpWl span{padding:5px 10px;border-radius:14px;border:1px solid var(--line);font-weight:700;font-size:13px}.cpWl .m{background:#22a559;color:#fff;border-color:#22a559;text-decoration:line-through}.cpWl .h{background:#8657d9;color:#fff;border-color:#8657d9;text-decoration:line-through}
`;document.head.appendChild(css);
const ov=document.createElement('div');ov.className='ov';ov.id='cpOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Us plus');
ov.innerHTML='<div class="cpTop"><button id="cpClose" type="button" aria-label="Close Us plus">←</button><b>✨ Us+ <span style="font-weight:400;font-size:13px;opacity:.85">for the two of you</span></b></div><div class="cpTabs" id="cpTabs"></div><div id="cpBody"></div>';
document.body.appendChild(ov);
const TABS=[['days','💑 Days'],['sleep','😴 Sleep'],['diary','📔 Diary'],['wordle','🔤 Wordle'],['words','🔎 Word Search']];
$('cpTabs').innerHTML=TABS.map(t=>`<button data-t="${t[0]}">${t[1]}</button>`).join('');
$('cpTabs').onclick=e=>{const b=e.target.closest('button');if(b)show(b.dataset.t)};
$('cpClose').onclick=close;

function close(){ov.classList.remove('on');unsub&&unsub();unsub=null;unlocked=false;sel=null}
function open(){const u=U();if(!u||u.demo())return toast('Us+ needs a connected private chat');if(!u.cid())return toast('Open your chat first');ov.classList.add('on');show('days')}
function show(t){tab=t;sel=null;unsub&&unsub();unsub=null;data={};document.querySelectorAll('#cpTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('cpBody').innerHTML='<div class="cpDim" style="text-align:center;padding:30px">Loading…</div>';
  try{unsub=ref(DOC[t]).onSnapshot(s=>{data=s.exists?s.data():{};render(true)},()=>toast('Needs the updated firestore.rules'))}catch(e){}}
function render(fromSnap){const b=$('cpBody'),a=document.activeElement;if(fromSnap&&a&&b.contains(a)&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;b.innerHTML=R[tab]()}
$('cpBody').onclick=e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b)};

// ---------- Days ----------
const typeLbl={together:'Been together 💑',anniv:'Anniversary ❤️',birthday:'Birthday 🎂',countdown:'Countdown ⏳'};
function dayInfo(i){const t=T0(),d=D0(i.date);
  if(i.type==='together')return{n:Math.round((t-d)/864e5),u:'Day',k:0};
  if(i.type==='countdown'){const n=Math.round((d-t)/864e5);return n>=0?{n,u:n===0?'Today 🎉':'Later',k:n}:{n:-n,u:'ago',k:9e5-n}}
  let nx=new Date(t.getFullYear(),d.getMonth(),d.getDate());if(nx<t)nx=new Date(t.getFullYear()+1,d.getMonth(),d.getDate());const n=Math.round((nx-t)/864e5),y=nx.getFullYear()-d.getFullYear();
  return{n,u:n===0?'Today 🎉':'Later',k:n,y:i.type==='anniv'&&y>0?y+' yr':''}}
const R={};
R.days=()=>{const items=(data.items||[]).slice(),tg=items.find(i=>i.type==='together');
  const hero=tg?`<div class="cpHero"><div class="cpRow" style="justify-content:center;gap:18px">${av('me')}<div><div class="cpDim">${esc(tg.title)}</div><div class="n">${dayInfo(tg).n}</div><div class="cpDim">days · since ${esc(tg.date)}</div></div>${av('her')}</div></div>`:`<div class="cpHero"><div class="cpRow" style="justify-content:center">${av('me')}<b>Set the day you got together</b>${av('her')}</div></div>`;
  const list=items.filter(i=>i.type!=='together').map(i=>({i,x:dayInfo(i)})).sort((a,b)=>a.x.k-b.x.k).map(({i,x})=>`<div class="cpItem"><div class="t"><b>${esc(i.title)}</b><div class="cpDim">${typeLbl[i.type]||''} · ${esc(i.date)}${x.y?' · '+x.y:''}</div></div><div class="big">${x.n}<div class="cpDim" style="font-size:12px;font-weight:400">${esc(x.u)}</div></div><button class="x" data-a="dayDel" data-id="${esc(i.id)}" aria-label="Delete">✕</button></div>`).join('');
  return hero+list+`<div class="cpCard"><h3>Add a date</h3><input class="cpIn" id="dTitle" maxlength="40" placeholder="Title (e.g. 1st anniversary)"><input class="cpIn" id="dDate" type="date" value="${today()}"><select class="cpIn" id="dType"><option value="together">${typeLbl.together} (start date)</option><option value="anniv">${typeLbl.anniv}</option><option value="birthday">${typeLbl.birthday}</option><option value="countdown">${typeLbl.countdown}</option></select><button class="cpBtn" data-a="dayAdd">Save</button></div>`};
const A={};
A.dayAdd=async()=>{const title=V('dTitle'),date=V('dDate'),type=V('dType');if(!title||!date)return toast('Add a title and a date');
  await upd(DOC.days,d=>{let items=(d.items||[]).slice();if(type==='together')items=items.filter(i=>i.type!=='together');items.push({id:Date.now().toString(36),title:title.slice(0,40),date,type,by:meId()});return{items}})};
A.dayDel=async b=>{await upd(DOC.days,d=>({items:(d.items||[]).filter(i=>i.id!==b.dataset.id)}))};

// ---------- Sleep ----------
const rate=h=>h>=7?['Excellent','#22c55e']:h>=6?['Good','#84cc16']:h>=5?['Fair','#f59e0b']:['Poor','#ef4444'];
const fmtH=h=>Math.floor(h)+'h '+pad(Math.round((h%1)*60))+'min';
function lastN(days,n){const o=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=ymd(d);o.push([k,(days||{})[k]])}return o}
function sleepCard(w,uid,name){const u=data[uid]||{},days=u.days||{},ks=Object.keys(days).sort(),lk=ks[ks.length-1],h=lk!=null?days[lk]:null;
  const r=h!=null?rate(h):['No data','#9ca3af'],bars=lastN(days,7).map(([k,v])=>`<i title="${k}" style="height:${v?Math.min(100,v/10*100):4}%;background:${v?rate(v)[1]:'var(--line)'}"></i>`).join('');
  return`<div class="cpCard cpPer"><div class="cpDim">${esc(name)}</div><div class="cpRing" style="--p:${h!=null?Math.min(h/9,1)*360:0}deg;--c:${r[1]}"><span>${av(w)}</span></div><b style="color:${r[1]}">${r[0]}</b><div class="cpDim">${h!=null?esc(lk)+' · '+fmtH(h):'—'}</div><div class="cpBars">${bars}</div></div>`}
R.sleep=()=>`<div class="cpTwo">${sleepCard('me',meId(),myName())}${sleepCard('her',herId(),herName())}</div><div class="cpCard"><h3>Log last night's sleep</h3><div class="cpRow"><input class="cpIn" id="slH" type="number" min="0" max="16" step="0.25" placeholder="Hours, e.g. 7.5"><button class="cpBtn" data-a="slSave" style="white-space:nowrap">Save</button></div><button class="cpBtn g" data-a="slNudge">💤 Get some sleep, babe</button></div>`;
A.slSave=async()=>{const h=parseFloat(V('slH'));if(!(h>=0&&h<=16))return toast('Enter hours between 0 and 16');
  await upd(DOC.sleep,d=>{const u=d[meId()]||{},days=Object.assign({},u.days);days[today()]=h;Object.keys(days).sort().slice(0,-21).forEach(k=>delete days[k]);d[meId()]={name:myName(),days};return d})};
A.slNudge=async()=>{try{const ok=await U().send({text:'💤 Get some sleep, babe!'});toast(ok===false?'Not sent':'Sent 💤')}catch(e){toast('Not sent')}};

// ---------- Diary (PIN lock is on this device; entries are shared with your partner) ----------
const MOODS=['😊','😍','🥰','😢','😡','😴'];
R.diary=()=>{const has=!!localStorage.getItem(pinKey());
  if(!unlocked)return`<div class="cpCard" style="text-align:center"><div style="font-size:44px">🔒</div><h3>${has?'Enter your PIN':'Set a PIN for the Love Diary'}</h3><input class="cpIn" id="pin" type="password" inputmode="numeric" maxlength="8" placeholder="${has?'PIN':'New PIN (4–8 digits)'}" style="text-align:center;letter-spacing:6px"><button class="cpBtn" data-a="pinGo">${has?'Unlock':'Save PIN'}</button><p class="cpDim">The PIN only locks this screen on this device. Entries are visible to both of you.</p></div>`;
  const items=(data.items||[]).slice(),y=cm.getFullYear(),m=cm.getMonth(),first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),mk={};
  items.forEach(i=>{mk[i.date]=1});let cells='';for(let i=0;i<first;i++)cells+='<span></span>';
  for(let d=1;d<=dim;d++){const k=y+'-'+pad(m+1)+'-'+pad(d);cells+=`<span class="d${mk[k]?' e':''}${k===today()?' t':''}" data-a="dyPick" data-d="${k}">${d}</span>`}
  const list=items.sort((a,b)=>b.date<a.date?-1:b.date>a.date?1:b.id<a.id?-1:1).map(i=>`<div class="cpCard"><div class="cpRow"><b>${esc(i.mood||'')} ${esc(i.date)}</b><span class="cpDim">${esc(i.name||'')}${i.by===meId()?` <button class="cpBtn g" style="padding:2px 8px;margin:0" data-a="dyDel" data-id="${esc(i.id)}">✕</button>`:''}</span></div><div style="white-space:pre-wrap;margin-top:6px">${esc(i.text)}</div></div>`).join('');
  return`<div class="cpCard"><div class="cpRow"><button class="cpBtn g" data-a="dyPrev">‹</button><b>${cm.toLocaleString('en',{month:'long',year:'numeric'})}</b><button class="cpBtn g" data-a="dyNext">›</button></div><div class="cpCal" style="margin-top:8px">${'SMTWTFS'.split('').map(c=>`<span class="h">${c}</span>`).join('')}${cells}</div></div>
  <div class="cpCard"><h3>New entry</h3><input class="cpIn" id="dyDate" type="date" value="${today()}"><select class="cpIn" id="dyMood">${MOODS.map(x=>`<option>${x}</option>`).join('')}</select><textarea class="cpIn" id="dyText" rows="4" maxlength="2000" placeholder="Write something sweet…"></textarea><button class="cpBtn" data-a="dyAdd">Save entry</button><button class="cpBtn g" data-a="pinOff">Lock now</button></div>${list}`};
A.pinGo=async()=>{const p=V('pin');if(!/^\d{4,8}$/.test(p))return toast('PIN must be 4–8 digits');const k=pinKey(),h=await sha('onlyus-diary:'+U().cid()+':'+p),s=localStorage.getItem(k);
  if(!s){localStorage.setItem(k,h);unlocked=true;toast('PIN saved 🔒')}else if(s===h)unlocked=true;else return toast('Wrong PIN');render()};
A.pinOff=()=>{unlocked=false;render()};
A.dyPrev=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()-1,1);render()};A.dyNext=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()+1,1);render()};
A.dyPick=b=>{const e=$('dyDate');if(e){e.value=b.dataset.d;e.scrollIntoView({block:'center'})}};
A.dyAdd=async()=>{const text=V('dyText'),date=V('dyDate');if(!text||!date)return toast('Write something first');
  if(await upd(DOC.diary,d=>({items:[...(d.items||[]),{id:Date.now().toString(36),date,mood:V('dyMood'),text:text.slice(0,2000),by:meId(),name:myName()}].slice(-300)})))toast('Saved 📔')};
A.dyDel=async b=>{if(confirm('Delete this entry for both of you?'))await upd(DOC.diary,d=>({items:(d.items||[]).filter(i=>i.id!==b.dataset.id)}))};

// ---------- Wordle (one sets a secret word, the other guesses) ----------
function score(g,w){const r=Array(5).fill('x'),c={};for(let i=0;i<5;i++)if(g[i]===w[i])r[i]='g';else c[w[i]]=(c[w[i]]||0)+1;for(let i=0;i<5;i++)if(r[i]==='x'&&c[g[i]]>0){r[i]='y';c[g[i]]--}return r}
R.wordle=()=>{const w=data.word,gs=data.guesses||[],mine=data.setter===meId();
  const setForm=`<div class="cpCard"><h3>Set a secret word for ${esc(herName())}</h3><input class="cpIn" id="wSet" maxlength="5" placeholder="5 letters" style="text-transform:uppercase"><button class="cpBtn" data-a="wSet">Set word</button></div>`;
  if(!w)return`<div class="cpHero"><b>Wordle for two 🐼🐻</b><div class="cpDim">One of you sets a secret word, the other has 6 tries.</div></div>`+setForm;
  const won=gs.includes(w),over=won||gs.length>=6;let rows='';
  for(let i=0;i<6;i++){const g=gs[i];const sc=g?score(g,w):null;rows+=[...Array(5)].map((_,j)=>`<b class="${sc?sc[j]:''}">${g?esc(g[j]):''}</b>`).join('')}
  const st=won?`<h3>🎉 Solved in ${gs.length}!</h3>`:over?`<h3>The word was <u>${esc(w.toUpperCase())}</u></h3>`:mine?`<div class="cpDim">Your word: <b>${esc(w.toUpperCase())}</b> · ${esc(herName())} guessed ${gs.length}/6</div>`:`<div class="cpDim">Guess ${gs.length+1} of 6</div>`;
  const guessForm=!over&&!mine?`<input class="cpIn" id="wGuess" maxlength="5" placeholder="Your guess" style="text-transform:uppercase"><button class="cpBtn" data-a="wGuess">Guess</button>`:'';
  return`<div class="cpCard" style="text-align:center">${st}<div class="cpWg">${rows}</div>${guessForm}</div>${over?setForm:''}`};
A.wSet=async()=>{const w=V('wSet').toLowerCase();if(!/^[a-z]{5}$/.test(w))return toast('Use exactly 5 letters (a–z)');await upd(DOC.wordle,()=>({word:w,guesses:[],setter:meId(),n:Date.now()}))};
A.wGuess=async()=>{const g=V('wGuess').toLowerCase();if(!/^[a-z]{5}$/.test(g))return toast('Use exactly 5 letters (a–z)');
  await upd(DOC.wordle,d=>{const gs=d.guesses||[];if(!d.word||d.setter===meId()||gs.length>=6||gs.includes(d.word))return d;d.guesses=[...gs,g];return d})};

// ---------- Word Search (same puzzle on both phones, found words are shared) ----------
const BANK=['LOVE','HEART','KISS','HUG','DATE','CUTE','SWEET','BABE','MINE','HOME','SMILE','DREAM','STAR','ROSE','PANDA','BEAR','MOON','HAPPY','TRUST','CUDDLE'],N=9;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function build(seed){const r=rng(seed),words=BANK.map(w=>[r(),w]).sort((a,b)=>a[0]-b[0]).slice(0,6).map(x=>x[1]),g=Array.from({length:N},()=>Array(N).fill('')),pos={},DR=[[0,1],[1,0],[1,1],[-1,1]];
  for(const w of words){for(let k=0;k<300;k++){const [dr,dc]=DR[Math.floor(r()*4)],r0=Math.floor(r()*N),c0=Math.floor(r()*N),er=r0+dr*(w.length-1),ec=c0+dc*(w.length-1);if(er<0||er>=N||ec<0||ec>=N)continue;
    let ok=true;for(let i=0;i<w.length;i++){const ch=g[r0+dr*i][c0+dc*i];if(ch&&ch!==w[i]){ok=false;break}}if(!ok)continue;pos[w]=[];for(let i=0;i<w.length;i++){g[r0+dr*i][c0+dc*i]=w[i];pos[w].push([r0+dr*i,c0+dc*i])}break}}
  const L='ABCDEFGHIJKLMNOPRSTUVWY';for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(!g[i][j])g[i][j]=L[Math.floor(r()*L.length)];
  return{g,words:words.filter(w=>pos[w]),pos}}
R.words=()=>{if(!data.seed)return`<div class="cpHero"><b>Word Search 🔎</b><div class="cpDim">Find the hidden words together.</div></div><button class="cpBtn" data-a="wsNew">Start a puzzle</button>`;
  const p=build(data.seed),f=data.found||{},cl={};let me=0,her=0;
  p.words.forEach(w=>{if(f[w]){f[w]===meId()?me++:her++;p.pos[w].forEach(([r,c])=>{cl[r+','+c]=f[w]===meId()?'m':'h'})}});
  let grid='';for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k=i+','+j,s=sel&&sel[0]===i&&sel[1]===j?' s':'';grid+=`<b class="${(cl[k]||'')+s}" data-a="wsTap" data-r="${i}" data-c="${j}">${p.g[i][j]}</b>`}
  const done=p.words.every(w=>f[w]);
  return`<div class="cpCard" style="text-align:center"><div class="cpRow" style="justify-content:center;gap:16px">${av('me')}<b>${me}</b><span class="cpDim">vs</span><b>${her}</b>${av('her')}</div>${done?'<h3>🎉 All found, team!</h3>':'<div class="cpDim">Tap the first letter, then the last letter</div>'}<div class="cpWs" style="grid-template-columns:repeat(${N},34px)">${grid}</div><div class="cpWl">${p.words.map(w=>`<span class="${f[w]?(f[w]===meId()?'m':'h'):''}">${w}</span>`).join('')}</div></div><button class="cpBtn g" data-a="wsNew">New puzzle</button>`};
A.wsNew=async()=>{await upd(DOC.words,()=>({seed:1+Math.floor(Math.random()*2e9),found:{},n:Date.now()}))};
A.wsTap=async b=>{const r=+b.dataset.r,c=+b.dataset.c;if(!data.seed)return;
  if(!sel){sel=[r,c];return render()}
  const [r0,c0]=sel;sel=null;const dr=r-r0,dc=c-c0;
  if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))||(dr===0&&dc===0)){toast('Pick a straight line');return render()}
  const p=build(data.seed),n=Math.max(Math.abs(dr),Math.abs(dc))+1,sr=Math.sign(dr),sc=Math.sign(dc);let s='';for(let i=0;i<n;i++)s+=p.g[r0+sr*i][c0+sc*i];
  const w=p.words.find(x=>x===s||x===[...s].reverse().join(''));if(!w||(data.found||{})[w]){toast(w?'Already found':'Not a hidden word');return render()}
  await upd(DOC.words,d=>{const f=Object.assign({},d.found);if(!f[w])f[w]=meId();d.found=f;return d})};

// ---------- entry point: a tab inside Our Space ----------
function mount(){const tabs=$('hubTabs');if(!tabs||$('cpEnter'))return;const b=document.createElement('button');b.id='cpEnter';b.type='button';b.textContent='✨ Us+';b.style.fontWeight='700';tabs.insertBefore(b,tabs.children[1]||null);b.addEventListener('click',e=>{e.stopPropagation();open()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.__openUsPlus=open;window.__cpTest={score,build};
})();
