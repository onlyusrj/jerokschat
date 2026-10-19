// OnlyUs motion layer (v41): entrance animations for every screen/tab/list, press feedback,
// message pop-in, reply-jump highlight, and a Save button in the photo/video viewer.
// All motion is disabled automatically when the phone has "reduce motion" turned on.
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const RISE=['#gameArea>*','.hub-content>*','#cl>*','#cpBody>*','#aiMsgs>*','.tool-hero','.sound-card>*'];
const POP=['.game-tabs>button','.tool-grid>*','.cpTabs>button','.sound-options>*'];
const SLIDE=['.hub-tabs>button'];
const gen=(sels,anim)=>sels.map(s=>`.fx-run ${s}{animation:${anim} both}`).join('')
  +sels.map(s=>{let o='';for(let i=1;i<=14;i++)o+=`.fx-run ${s}:nth-child(${i}){animation-delay:${i*45}ms}`;return o+`.fx-run ${s}:nth-child(n+15){animation-delay:630ms}`}).join('');
const PRESS='.ic,.btn,.tool-grid button,.game-tabs button,.hub-tabs button,.cpBtn,.cpTabs button,#gameArea button,.hub-card button,.aiChips button,.sound-option,.once,#vdl';
const css=`
@keyframes fxRise{from{opacity:0;transform:translateY(18px)}}
@keyframes fxPop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.07)}}
@keyframes fxSlide{from{opacity:0;transform:translateX(-16px)}}
@keyframes fxFade{from{opacity:0}}
@keyframes fxCard{from{opacity:0;transform:translateY(26px) scale(.94)}}
@keyframes fxZoom{from{opacity:0;transform:scale(.82)}}
@keyframes fxMsg{from{opacity:0;transform:translateY(10px) scale(.95)}}
@keyframes fxFloat{50%{translate:0 -4px}}
@keyframes fxGlow{50%{box-shadow:0 8px 22px #0004,0 0 0 9px #d65db133}}
@keyframes fxFlash{0%,100%{box-shadow:0 0 0 0 transparent;filter:none}18%,62%{box-shadow:0 0 0 3px var(--acc),0 0 26px var(--acc);filter:brightness(1.12)}}
#vdl{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;z-index:3;border:0;border-radius:22px;padding:10px 16px;background:#000a;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(8px)}
#viewer[data-once="1"] #vdl{display:none}
.m .q[data-jump]{cursor:pointer}
@media (prefers-reduced-motion:no-preference){
.ov.on,.hub-view.on{animation:fxFade .24s ease both}
.ov.on>.card,.ov.on>.games-card,.ov.on>.tools-card{animation:fxCard .36s cubic-bezier(.2,.9,.3,1.12) both}
/* v53: removed .view.on fxFade (it faded every screen up from transparent = visible blink). Slide transitions live in home-v52.js */
#viewer.on #vi,#viewer.on #vv{animation:fxZoom .32s cubic-bezier(.2,.9,.3,1.1) both}
#viewer.on #vdl{animation:fxRise .4s .15s both}
${gen(RISE,'fxRise .46s cubic-bezier(.2,.8,.2,1)')}${gen(POP,'fxPop .45s cubic-bezier(.2,.9,.3,1.2)')}${gen(SLIDE,'fxSlide .4s ease')}
#ms>.m:last-child{animation:fxMsg .28s ease both}
.rx{animation:fxPop .32s both}
#mic svg{animation:fxPop .26s both}
.m.flash{animation:fxFlash 1.7s ease both}
.ai-fab,.qr-fab{animation:fxFloat 3.4s ease-in-out infinite}.ai-fab{animation:fxFloat 3.4s ease-in-out infinite,fxGlow 3s ease-in-out infinite}
${PRESS}{transition:transform .16s ease,filter .16s ease}
${PRESS.split(',').map(s=>s+':active').join(',')}{transform:scale(.94)}
@media (hover:hover){${PRESS.split(',').map(s=>s+':hover').join(',')}{filter:brightness(1.07)}}
}`;
const st=document.createElement('style');st.id='v41fx';st.textContent=css;document.head.appendChild(st);

// replay entrance animations whenever a screen opens or a tab inside it is tapped
const run=(el,ms)=>{if(!el)return;el.classList.remove('fx-run');void el.offsetWidth;el.classList.add('fx-run');clearTimeout(el.__fxT);el.__fxT=setTimeout(()=>el.classList.remove('fx-run'),ms||1100)};
new MutationObserver(ms=>{for(const m of ms){const t=m.target;if(!t.classList||!t.matches('.ov,.hub-view,.view'))continue;const was=(m.oldValue||'').split(/\s+/).includes('on');if(!was&&t.classList.contains('on'))run(t)}})
  .observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.game-tabs button,.hub-tabs button,.cpTabs button');if(b)run(b.closest('.ov,.hub-view'),800)},true);

// photo / video viewer: Save button (hidden for view-once media)
const viewer=$('viewer');
if(viewer&&!$('vdl')){
  const b=document.createElement('button');b.id='vdl';b.type='button';b.setAttribute('aria-label','Save to device');b.textContent='⬇ Save';viewer.appendChild(b);
  const say=m=>{try{window.__us.toast(m)}catch(e){}};
  b.addEventListener('click',async e=>{
    e.stopPropagation();
    const vv=$('vv'),vi=$('vi'),isV=!!vv.src&&getComputedStyle(vv).display!=='none',src=isV?vv.src:vi.src;
    if(!src)return;
    const base='onlyus-'+Date.now();
    try{
      const blob=await (await fetch(src)).blob();
      const ext=((blob.type||'').split('/')[1]||(isV?'mp4':'jpg')).replace('jpeg','jpg').replace('quicktime','mov').split('+')[0];
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=base+'.'+ext;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000);say('Saved ⬇');
    }catch(err){
      const a=document.createElement('a');a.href=src;a.download=base+(isV?'.mp4':'.jpg');a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
      say('If it only opened, long-press the photo to save');
    }
  });
}
})();
