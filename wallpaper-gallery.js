// OnlyUs (v42): chat wallpaper from the phone gallery.
// Chat tools > 🎨 Wallpaper > "Choose from gallery". Saved per chat on this device only (not sent to your partner).
(()=>{
'use strict';
const $=id=>document.getElementById(id),U=()=>window.__us,ms=$('ms'),box=$('wallpaperBox');
if(!ms||!box||box.querySelector('#wpPick'))return;
const cid=()=>{try{return U().cid()||'global'}catch(e){return 'global'}};
const KI=()=>'onlyus-wallimg-'+cid(),KD=()=>'onlyus-wallimgdim-'+cid(),KP=()=>'onlyus-wall-'+cid();
const toast=m=>{try{U().toast(m)}catch(e){}};
const st=document.createElement('style');st.id='v42wp';st.textContent=`
#ms.chat-wallpaper-img{background-image:linear-gradient(rgba(0,0,0,var(--wp-dim,.25)),rgba(0,0,0,var(--wp-dim,.25))),var(--wp-img)!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;background-color:transparent!important}
.wpGal{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
.wpGal button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:10px 14px;cursor:pointer;font:600 14px system-ui,sans-serif}
.wpGal #wpPick{background:var(--acc);color:#fff;border-color:var(--acc)}
.wpGal label{display:none;flex:1 1 100%;font:13px system-ui,sans-serif;color:var(--dim)}.wpGal label input{width:100%;margin-top:4px;accent-color:var(--acc)}
.wpGal #wpClear{display:none}.wpGal.has label,.wpGal.has #wpClear{display:block}
.wpThumb{width:44px;height:44px;border-radius:12px;background-size:cover;background-position:center;border:2px solid var(--acc);display:none}.wpGal.has .wpThumb{display:block}`;
document.head.appendChild(st);
const g=document.createElement('div');g.className='wpGal';
g.innerHTML='<div class="wpThumb" id="wpThumb"></div><button id="wpPick" type="button">🖼 Choose from gallery</button><button id="wpClear" type="button">Remove photo</button><label>Dim photo for easier reading<input id="wpDim" type="range" min="0" max="70" value="25" aria-label="Dim wallpaper"></label><input id="wpFile" type="file" accept="image/*" hidden>';
box.appendChild(g);
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}},del=k=>{try{localStorage.removeItem(k)}catch(e){}};
const PRESETS=()=>{for(let i=1;i<=5;i++)ms.classList.remove('chat-wallpaper-'+i)};
function apply(){
  const img=get(KI());
  if(img){PRESETS();ms.classList.add('chat-wallpaper-img');ms.style.setProperty('--wp-img','url("'+img+'")');
    const d=get(KD());ms.style.setProperty('--wp-dim',String((d==null?25:+d)/100));$('wpDim').value=d==null?25:+d;
    $('wpThumb').style.backgroundImage='url("'+img+'")';g.classList.add('has');
    box.querySelectorAll('.wallpaper-picker button').forEach(b=>b.classList.remove('on'))}
  else{ms.classList.remove('chat-wallpaper-img');ms.style.removeProperty('--wp-img');g.classList.remove('has')}}
async function shrink(file,maxSide,q){
  let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){bmp=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=no;i.src=u})}
  const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,k=Math.min(1,maxSide/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);if(bmp.close)bmp.close();return c.toDataURL('image/jpeg',q)}
$('wpPick').onclick=()=>$('wpFile').click();
$('wpFile').onchange=async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  if(!/^image\//.test(f.type))return toast('Please choose a photo');
  try{
    let url=await shrink(f,1280,.82);
    if(url.length>1.6e6)url=await shrink(f,900,.68);
    if(!set(KI(),url)){url=await shrink(f,640,.6);if(!set(KI(),url))return toast('Not enough space to save this photo')}
    set(KP(),'0');apply();toast('Wallpaper updated 🖼')
  }catch(err){console.error(err);toast('Could not read that photo')}};
$('wpClear').onclick=()=>{del(KI());del(KD());apply();toast('Photo wallpaper removed')};
$('wpDim').oninput=e=>{ms.style.setProperty('--wp-dim',String(+e.target.value/100));set(KD(),e.target.value)};
// choosing one of the built-in designs replaces the photo
document.addEventListener('click',e=>{if(e.target.closest('.wallpaper-picker [data-w]')){del(KI());ms.classList.remove('chat-wallpaper-img');ms.style.removeProperty('--wp-img');g.classList.remove('has')}});
$('toolWallpaper')&&$('toolWallpaper').addEventListener('click',()=>setTimeout(apply,40));
// re-apply whenever the chat screen opens (the app's own wallpaper loader runs first)
const hook=()=>{const u=U();if(u&&u.show&&!u.__wpgShow){const o=u.show;u.show=id=>{const r=o(id);if(id==='vChat')setTimeout(apply,70);return r};u.__wpgShow=true}};
hook();setTimeout(hook,1500);
window.__wpg={apply};
})();
