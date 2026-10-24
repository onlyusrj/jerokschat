// OnlyUs AI chat (v35). Calls the Gemini API straight from the browser.
// The API key is NOT stored in the site code (a key in a public GitHub repo gets auto-revoked by Google).
// Each person pastes their own free key once with the 🔑 button; it is saved only on that device.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const MAX_KEEP=24, KEY='onlyus-ai-hist-', KKEY='onlyus-ai-key';
  const SYSTEM='You are "OnlyUs AI", the friendly built-in assistant inside OnlyUs, a private chat app for couples. Reply in the same language and style the user writes in (Tamil written in English letters means reply in Tanglish; English means English). Be warm, short and practical: love messages, apology and surprise ideas, gift and date ideas, translation, planning, general questions. Use light emojis. Keep most answers under 150 words unless asked for more. You cannot see the user\'s private chats, partner or contacts and never claim to. Never ask for passwords or secret codes. For medical, legal or money questions give general info and suggest a professional when it matters.';
  let busy=false, hist=[], uid='', fn=null;

  function toast(m){try{if(window.__us&&window.__us.toast)return window.__us.toast(m)}catch(e){}
    const d=document.createElement('div');d.textContent=m;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:20px;z-index:2147483001;font:14px sans-serif';document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
  function myName(){try{const m=JSON.parse(localStorage.getItem('uc-me'));return (m&&m.name)||''}catch(e){return ''}}
  function getKey(){let k='';try{k=localStorage.getItem(KKEY)||''}catch(e){}return (k||String(window.GEMINI_KEY||'')).trim()}
  function askKey(){
    const cur=getKey();
    const v=prompt('Paste your Gemini API key (free from aistudio.google.com/apikey).\nIt is saved only on this device, never in the app code.'+(cur?'\n\nLeave empty and press OK to remove the saved key.':''),'');
    if(v===null)return false;
    const k=v.trim().replace(/^["']|["']$/g,'');
    if(!k){try{localStorage.removeItem(KKEY)}catch(e){}toast('Key removed');render();return false}
    if(k.length<20||/\s/.test(k)){toast('That does not look like a key');return false}
    try{localStorage.setItem(KKEY,k)}catch(e){toast('Could not save key');return false}
    toast('Key saved ✓ Ippo message anuppunga');render();return true}
  function load(){try{hist=JSON.parse(localStorage.getItem(KEY+uid))||[]}catch(e){hist=[]}if(!Array.isArray(hist))hist=[]}
  function save(){try{localStorage.setItem(KEY+uid,JSON.stringify(hist.slice(-MAX_KEEP)))}catch(e){}}
  function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function fmt(t){
    let h=esc(t).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/`([^`\n]+)`/g,'<code>$1</code>');
    h=h.split('\n').map(l=>/^\s*[-•*]\s+/.test(l)?'<div class="aiLi">• '+l.replace(/^\s*[-•*]\s+/,'')+'</div>':l).join('\n');
    return h.replace(/\n/g,'<br>').replace(/<\/div><br>/g,'</div>')}
  function row(role,text,extra){
    const box=$('aiMsgs'),d=document.createElement('div');d.className='aiRow '+(role==='user'?'me':'bot')+(extra?' '+extra:'');
    const b=document.createElement('div');b.className='aiBub';b.innerHTML=fmt(text);d.appendChild(b);box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
  function chip(parent,label,fn){const c=document.createElement('button');c.type='button';c.textContent=label;c.onclick=fn;parent.appendChild(c)}
  function welcome(){
    const n=myName(),has=!!getKey();
    const w=row('assistant','Hi'+(n?' '+n:'')+'! 👋 Naan **OnlyUs AI** ✨\n'+(has?'Love messages, date ideas, gift ideas, sorry/surprise ideas, translation… edhu venalum kelunga 💕':'AI use panna oru free Gemini key venum:\n- aistudio.google.com/apikey-la "Create API key"\n- Key-a copy panni keezha 🔑 button-la paste pannunga\nKey indha device-la mattum save aagum.'));
    const chips=document.createElement('div');chips.className='aiChips';
    if(!has)chip(chips,'🔑 Add Gemini key',askKey);
    else ['💌 Sweet message ezhudhu','🎁 Gift ideas','🌙 Date night plan','🥺 Sorry solla help pannu'].forEach(t=>chip(chips,t,()=>send(t.replace(/^\S+\s/,''))));
    w.appendChild(chips)}
  function render(){$('aiMsgs').innerHTML='';if(!hist.length)welcome();else hist.forEach(m=>row(m.role,m.content))}
  function openAi(){
    const u=firebase.auth().currentUser;
    if(!u)return toast('Sign in first');
    if(u.uid!==uid){uid=u.uid;load()}
    $('aiOv').classList.add('on');render();
    setTimeout(()=>{try{$('aiIn').focus()}catch(e){}},250)}
  function closeAi(){$('aiOv').classList.remove('on');$('aiIn').blur()}
  function autoGrow(){const t=$('aiIn');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px'}
  function setBusy(b){busy=b;$('aiSend').disabled=b;$('aiOv').classList.toggle('busy',b)}

  async function callGemini(GK){
    const turns=hist.slice(-MAX_KEEP).reduce((a,m)=>{const r=m.role==='assistant'?'model':'user',l=a[a.length-1];if(l&&l.role===r)l.parts[0].text+='\n'+m.content;else a.push({role:r,parts:[{text:m.content}]});return a},[]);
    while(turns.length&&turns[0].role!=='user')turns.shift();
    const nm=myName().replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,30);
    const model=encodeURIComponent(window.GEMINI_MODEL||'gemini-flash-latest');
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',
      headers:{'content-type':'application/json','x-goog-api-key':GK},
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM+(nm?"\nThe user's name is "+nm+'.':'')}]},contents:turns,generationConfig:{maxOutputTokens:900,temperature:0.8}})});
    let j={};try{j=await r.json()}catch(x){}
    if(!r.ok){
      const er=new Error((j.error&&j.error.message)||'AI error');
      er.detail='HTTP '+r.status+': '+String((j.error&&j.error.message)||'').slice(0,160);
      er.code=r.status===429?'resource-exhausted':r.status===404?'bad-model':(r.status===400||r.status===401||r.status===403)?'bad-key':'internal';
      throw er}
    const cand=(j.candidates||[])[0];
    const reply=((cand&&cand.content&&cand.content.parts)||[]).map(p=>p.text||'').join('').trim();
    if(!reply&&j.promptFeedback&&j.promptFeedback.blockReason)return 'Indha question-ku naan badhil sola mudiyala. Vera maadhiri kelunga 🙏';
    return reply}

  async function send(text){
    text=String(text||$('aiIn').value).trim();
    if(!text||busy)return;
    const GK=getKey();
    if(!GK){askKey();return}
    if(!navigator.onLine)return toast('You are offline');
    if(!hist.length)$('aiMsgs').innerHTML='';
    $('aiIn').value='';autoGrow();
    hist.push({role:'user',content:text.slice(0,4000)});save();row('user',text);
    const typing=row('assistant','','typing');typing.querySelector('.aiBub').innerHTML='<i></i><i></i><i></i>';
    setBusy(true);
    try{
      let reply;
      if(window.AI_USE_FUNCTION===true){   // optional: Firebase Cloud Function (Blaze plan), see README
        if(!fn){if(!firebase.functions)throw new Error('Functions SDK not loaded');fn=firebase.functions().httpsCallable('aiChat',{timeout:70000})}
        reply=String(((await fn({messages:hist.slice(-MAX_KEEP),name:myName()})).data||{}).reply||'').trim();
      }else reply=await callGemini(GK);
      if(!reply)reply='Sorry, onnum solla theriyala 😅 Marubadiyum try pannunga.';
      typing.remove();hist.push({role:'assistant',content:reply});save();row('assistant',reply);
    }catch(e){
      typing.remove();
      const code=(e&&e.code)||'';
      let msg='AI ippo busy-a irukku. Konjam neram kazhichu try pannunga 🙏';
      if(/resource-exhausted/.test(code))msg='Free limit mudinjiduchu. Konjam neram kazhichu (or naalaiku) try pannunga 💕';
      else if(/bad-key/.test(code))msg='The Gemini key is invalid or was revoked. Add a new key using the key button at the top.';
      else if(/bad-model/.test(code))msg='The Gemini model name is invalid. Change window.GEMINI_MODEL in firebase-config.js.';
      const d=e&&(e.detail||(e.name==='TypeError'?'network/CORS: '+e.message:e.message));
      if(d)msg+='\n('+String(d).slice(0,200)+')';
      hist.pop();save();
      row('assistant',msg,'err');
      $('aiIn').value=text;autoGrow();
    }finally{setBusy(false)}
  }
  function clearAi(){
    if(!hist.length)return;
    if(!confirm('Clear this AI chat?'))return;
    hist=[];save();render()}
  function init(){
    const fab=$('aiFab');if(!fab)return;
    fab.onclick=openAi;$('aiClose').onclick=closeAi;$('aiClear').onclick=clearAi;$('aiKey').onclick=askKey;
    $('aiSend').onclick=()=>send();
    $('aiIn').addEventListener('input',autoGrow);
    $('aiIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
