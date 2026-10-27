// OnlyUs (v48): SHARED chat wallpaper.
// One wallpaper per chat for BOTH of you (built-in design or a gallery photo + dim). Either of you can change it,
// the other sees the same one. Stored in Firestore chats/{cid}/coupleHub/wallpaper (members only, no rules change)
// and cached on each phone, so it is applied the moment the chat opens, also after the app was closed.
(()=>{
'use strict';
const $=id=>document.getElementById(id),U=()=>window.__us||{},ms=$('ms'),box=$('wallpaperBox');
if(!ms||!box||window.__wpg)return;
const toast=m=>{try{U().toast(m)}catch(e){}};
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
const KC=c=>'onlyus-wp2-'+c, MAXCH=700000, DEF=6, MAXP=15; // v71: DEF = design shown until one of you picks something (6 = Sakura), MAXP = number of built-in designs
const mem=new Map(), bases=new Map();
const cidNow=()=>{try{return U().cid()||''}catch(e){return ''}};
const uid=()=>{try{return U().uid()||''}catch(e){return ''}};

const st0=document.createElement('style');st0.id='v48wp';st0.textContent=`
#ms.chat-wallpaper-img{background-image:linear-gradient(rgba(0,0,0,var(--wp-dim,.25)),rgba(0,0,0,var(--wp-dim,.25))),var(--wp-img)!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;background-color:transparent!important}
.wpGal{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
.wpGal button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:10px 14px;cursor:pointer;font:600 14px system-ui,sans-serif}
.wpGal #wpPick{background:var(--acc);color:#fff;border-color:var(--acc)}
.wpGal label{display:none;flex:1 1 100%;font:13px system-ui,sans-serif;color:var(--dim)}.wpGal label input{width:100%;margin-top:4px;accent-color:var(--acc)}
.wpGal #wpDef{display:block}.wpGal #wpClear{display:none}.wpGal.has #wpClear,.wpGal.anyw #wpClear{display:block}.wpGal.has label{display:block}
.wpThumb{width:44px;height:44px;border-radius:12px;background-size:cover;background-position:center;border:2px solid var(--acc);display:none}.wpGal.has .wpThumb{display:block}
.wpShared{flex:1 1 100%;font:12.5px system-ui,sans-serif;color:var(--dim)}`;
document.head.appendChild(st0);
const g=document.createElement('div');g.className='wpGal';
g.innerHTML='<div class="wpThumb" id="wpThumb"></div><button id="wpPick" type="button">🖼 Choose from gallery</button><button id="wpDef" type="button">⭐ Default design</button><button id="wpClear" type="button">Remove wallpaper</button><label>Dim photo for easier reading<input id="wpDim" type="range" min="0" max="70" value="25" aria-label="Dim wallpaper"></label><div class="wpShared">💕 Same wallpaper for both of you. When one changes it, the other sees it too.</div><input id="wpFile" type="file" accept="image/*" hidden>';
box.appendChild(g);

/* ---- state per chat ---- */
function load(cid){
  if(mem.has(cid))return mem.get(cid);
  let s=null;try{s=JSON.parse(get(KC(cid)))}catch(e){}
  if(!s){ // wallpaper chosen before v48 (this phone only): keep it, it is shared once on first connect
    const p=+(get('onlyus-wall-'+cid)||0),img=get('onlyus-wallimg-'+cid)||'',d=get('onlyus-wallimgdim-'+cid);
    s={p:p||0,img,dim:d==null?25:+d,ts:0};
  }
  s.p=+s.p||0;s.img=s.img||'';s.dim=s.dim==null?25:+s.dim;s.ts=+s.ts||0;
  mem.set(cid,s);return s;
}
function save(cid,s){
  mem.set(cid,s);
  if(!set(KC(cid),JSON.stringify(s)))set(KC(cid),JSON.stringify(Object.assign({},s,{img:''}))); // photo too big for storage: Firestore cache still has it
}
// v71: a chat nobody has ever set (ts 0, nothing chosen) shows the default design. 'Remove wallpaper' sets ts, so plain stays plain.
function eff(s){return (!s.img&&!s.p&&!s.ts)?Object.assign({},s,{p:DEF}):s}
function paintUI(s){
  box.querySelectorAll('.wallpaper-picker button').forEach(b=>b.classList.toggle('on',!s.img&&+b.dataset.w===s.p));
  const has=!!s.img;g.classList.toggle('has',has);g.classList.toggle('anyw',has||!!s.p);
  if(has){$('wpThumb').style.backgroundImage='url("'+s.img+'")';$('wpDim').value=s.dim}
}
function apply(){
  const cid=cidNow();if(!cid)return;const s=eff(load(cid));
  for(let i=1;i<=MAXP+5;i++)ms.classList.remove('chat-wallpaper-'+i);
  ms.classList.remove('chat-wallpaper-img');ms.style.removeProperty('--wp-img');
  if(s.img){ms.classList.add('chat-wallpaper-img');ms.style.setProperty('--wp-img','url("'+s.img+'")');ms.style.setProperty('--wp-dim',String(s.dim/100))}
  else if(s.p)ms.classList.add('chat-wallpaper-'+s.p);
  paintUI(s);
}
/* ---- write (shared) ---- */
function push(cid,s){
  s.ts=Date.now();s.by=uid();save(cid,s);
  const base=bases.get(cid);
  if(base)base.collection('coupleHub').doc('wallpaper').set({p:s.p,img:s.img||'',dim:s.dim,ts:s.ts,by:s.by}).catch(()=>toast('Wallpaper could not be shared. Check internet.'));
  if(cid===cidNow())apply();
}
/* ---- read (from partner / other phone) ---- */
function onRemote(cid,snap){
  const d=snap.exists?snap.data():null,l=load(cid);
  if(!d){if(!l.ts&&(l.p||l.img)&&bases.has(cid))push(cid,Object.assign({},l));return}      // first time: share the old local wallpaper
  const rts=+d.ts||0;if(rts<=l.ts)return;
  const had=l.ts>0;
  save(cid,{p:+d.p||0,img:d.img||'',dim:d.dim==null?25:+d.dim,ts:rts,by:d.by||''});
  if(cid===cidNow()){apply();if(had&&d.by&&d.by!==uid())toast('Your partner changed the chat wallpaper 🖼')}
}
function watch(c,k,base,lun){
  try{
    bases.set(k,base);
    lun.push(base.collection('coupleHub').doc('wallpaper').onSnapshot(s=>onRemote(k,s),()=>{}));
  }catch(e){}
}

/* ---- controls ---- */
async function shrink(file,maxSide,q){
  let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){bmp=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=no;i.src=u})}
  const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,k=Math.min(1,maxSide/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);if(bmp.close)bmp.close();return c.toDataURL('image/jpeg',q)}
$('wpPick').onclick=()=>$('wpFile').click();
$('wpFile').onchange=async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  const cid=cidNow();if(!cid)return toast('Open a chat first');
  if(!/^image\//.test(f.type))return toast('Please choose a photo');
  try{
    let url=await shrink(f,1000,.72);
    if(url.length>MAXCH)url=await shrink(f,800,.6);
    if(url.length>MAXCH)url=await shrink(f,640,.5);
    if(url.length>MAXCH)return toast('That photo is too big. Choose another one.');
    push(cid,{p:0,img:url,dim:load(cid).dim,ts:0});
    toast('Wallpaper set for both of you 🖼');
  }catch(err){console.error(err);toast('Could not read that photo')}};
$('wpDef').onclick=()=>{const cid=cidNow();if(!cid)return toast('Open a chat first');push(cid,{p:DEF,img:'',dim:25,ts:0});toast('Default wallpaper set for both of you ⭐')};
$('wpClear').onclick=()=>{const cid=cidNow();if(!cid)return;push(cid,{p:0,img:'',dim:25,ts:0});toast('Wallpaper removed for both of you')};
let dt;$('wpDim').oninput=e=>{const cid=cidNow();if(!cid)return;const s=load(cid);s.dim=+e.target.value;ms.style.setProperty('--wp-dim',String(s.dim/100));clearTimeout(dt);dt=setTimeout(()=>push(cid,Object.assign({},load(cid))),800)};
// built-in designs
document.addEventListener('click',e=>{
  const b=e.target.closest('.wallpaper-picker [data-w]');if(!b)return;
  const cid=cidNow();if(!cid)return;
  push(cid,{p:+b.dataset.w,img:'',dim:load(cid).dim,ts:0});toast('Chat design updated for both of you 💕');
});
$('toolWallpaper')&&$('toolWallpaper').addEventListener('click',()=>setTimeout(apply,40));

window.__wpg={apply,watch};
// listeners that were requested before this file was loaded
(window.__wpq||[]).forEach(a=>watch.apply(null,a));window.__wpq=null;
apply();
})();
