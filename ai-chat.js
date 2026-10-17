// OnlyUs AI chat (v34). Talks to the Firebase Cloud Function "aiChat".
// The Anthropic API key lives ONLY in Firebase secrets on the server, never in this file.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const MAX_KEEP=24, KEY='onlyus-ai-hist-';
  const SYSTEM='You are "OnlyUs AI", the friendly built-in assistant inside OnlyUs, a private chat app for couples. Reply in the same language and style the user writes in (Tamil written in English letters means reply in Tanglish; English means English). Be warm, short and practical: love messages, apology and surprise ideas, gift and date ideas, translation, planning, general questions. Use light emojis. Keep most answers under 150 words unless asked for more. You cannot see the user\'s private chats, partner or contacts and never claim to. Never ask for passwords or secret codes. For medical, legal or money questions give general info and suggest a professional when it matters.';
  let busy=false, hist=[], uid='', fn=null;

  function toast(m){try{if(window.__us&&window.__us.toast)return window.__us.toast(m)}catch(e){}
    const d=document.createElement('div');d.textContent=m;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:20px;z-index:2147483001;font:14px sans-serif';document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
  function myName(){try{const m=JSON.parse(localStorage.getItem('uc-me'));return (m&&m.name)||''}catch(e){return ''}}
  function load(){try{hist=JSON.parse(localStorage.getItem(KEY+uid))||[]}catch(e){hist=[]}if(!Array.isArray(hist))hist=[]}
  function save(){try{localStorage.setItem(KEY+uid,JSON.stringify(hist.slice(-MAX_KEEP)))}catch(e){}}
  function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  // tiny safe markdown: **bold**, `code`, - bullets, line breaks
  function fmt(t){
    let h=esc(t).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/`([^`\n]+)`/g,'<code>$1</code>');
    h=h.split('\n').map(l=>/^\s*[-•*]\s+/.test(l)?'<div class="aiLi">• '+l.replace(/^\s*[-•*]\s+/,'')+'</div>':l).join('\n');
    return h.replace(/\n/g,'<br>').replace(/<\/div><br>/g,'</div>');
  }
  function row(role,text,extra){
    const box=$('aiMsgs'),d=document.createElement('div');d.className='aiRow '+(role==='user'?'me':'bot')+(extra?' '+extra:'');
    const b=document.createElement('div');b.className='aiBub';b.innerHTML=fmt(text);d.appendChild(b);box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
  function welcome(){
    const n=myName();
    const w=row('assistant','Hi'+(n?' '+n:'')+'! 👋 Naan **OnlyUs AI** ✨\nUngalukku enna help venum? Love messages, date ideas, gift ideas, sorry/surprise ideas, translation… edhu venalum kelunga 💕');
    const chips=document.createElement('div');chips.className='aiChips';
    ['💌 Sweet message ezhudhu','🎁 Gift ideas','🌙 Date night plan','🥺 Sorry solla help pannu'].forEach(t=>{const c=document.createElement('button');c.type='button';c.textContent=t;c.onclick=()=>send(t.replace(/^\S+\s/,''));chips.appendChild(c)});
    w.appendChild(chips)}
  function render(){
    $('aiMsgs').innerHTML='';
    if(!hist.length)welcome();else hist.forEach(m=>row(m.role,m.content))}
  function openAi(){
    const u=firebase.auth().currentUser;
    if(!u)return toast('Sign in first');
    if(u.uid!==uid){uid=u.uid;load()}
    $('aiOv').classList.add('on');render();
    setTimeout(()=>{try{$('aiIn').focus()}catch(e){}},250)}
  function closeAi(){$('aiOv').classList.remove('on');$('aiIn').blur()}
  function autoGrow(){const t=$('aiIn');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px'}
  function setBusy(b){busy=b;$('aiSend').disabled=b;$('aiOv').classList.toggle('busy',b)}
  async function send(text){
    text=String(text||$('aiIn').value).trim();
    if(!text||busy)return;
    if(!navigator.onLine)return toast('You are offline');
    if(!hist.length)$('aiMsgs').innerHTML='';
    $('aiIn').value='';autoGrow();
    hist.push({role:'user',content:text.slice(0,4000)});save();row('user',text);
    const typing=row('assistant','','typing');typing.querySelector('.aiBub').innerHTML='<i></i><i></i><i></i>';
    setBusy(true);
    try{
      const GK=String(window.GEMINI_KEY||'').trim();
      let data;
      if(GK){                       // Mode 1: Gemini free tier, called straight from the browser (no backend)
        const turns=hist.slice(-MAX_KEEP).reduce((a,m)=>{const r=m.role==='assistant'?'model':'user',l=a[a.length-1];if(l&&l.role===r)l.parts[0].text+='\n'+m.content;else a.push({role:r,parts:[{text:m.content}]});return a},[]);
        while(turns.length&&turns[0].role!=='user')turns.shift();
        const nm=myName().replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,30);
        const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(window.GEMINI_MODEL||'gemini-flash-latest')+':generateContent',{method:'POST',
          headers:{'content-type':'application/json','x-goog-api-key':GK},
          body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM+(nm?"\nThe user's name is "+nm+'.':'')}]},contents:turns,generationConfig:{maxOutputTokens:900,temperature:0.8}})});
        let j={};try{j=await r.json()}catch(x){}
        if(!r.ok){const er=new Error((j.error&&j.error.message)||'AI error');er.code=r.status===429?'resource-exhausted':r.status===404?'bad-model':(r.status===400||r.status===403)?'bad-key':'internal';throw er}
        const cand=(j.candidates||[])[0];
        data={reply:((cand&&cand.content&&cand.content.parts)||[]).map(p=>p.text||'').join('').trim()};
      }else{                        // Mode 2: Firebase Cloud Function "aiChat" (needs Blaze plan, see README)
        if(!fn){if(!firebase.functions)throw new Error('Functions SDK not loaded');fn=firebase.functions().httpsCallable('aiChat',{timeout:70000})}
        data=(await fn({messages:hist.slice(-MAX_KEEP),name:myName()})).data;
      }
      const res={data};
      const reply=String((res&&res.data&&res.data.reply)||'').trim()||'Sorry, onnum solla theriyala 😅 Marubadiyum try pannunga.';
      typing.remove();hist.push({role:'assistant',content:reply});save();row('assistant',reply);
    }catch(e){
      typing.remove();
      const code=(e&&e.code)||'';
      let msg='AI ippo busy-a irukku. Konjam neram kazhichu try pannunga 🙏';
      if(/unauthenticated/.test(code))msg='Sign in pannitu try pannunga.';
      else if(/resource-exhausted/.test(code))msg=(e.message||'Innaiku limit mudinjiduchu. Naalaiku paakalam 💕');
      else if(/bad-key/.test(code))msg='Gemini key sari illa / restrict aagirukku. firebase-config.js-la GEMINI_KEY check pannunga.';
      else if(/bad-model/.test(code))msg='Gemini model name sari illa. firebase-config.js-la GEMINI_MODEL maathunga.';
      else if(/not-found|unavailable|internal|failed-precondition/.test(code))msg=window.GEMINI_KEY?'AI ippo busy-a irukku. Konjam neram kazhichu try pannunga 🙏':'AI innum set up aagala. firebase-config.js-la GEMINI_KEY podunga (README paarunga).';
      hist.pop();save();       // drop the unanswered question so history stays valid
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
    fab.onclick=openAi;$('aiClose').onclick=closeAi;$('aiClear').onclick=clearAi;
    $('aiSend').onclick=()=>send();
    $('aiIn').addEventListener('input',autoGrow);
    $('aiIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
