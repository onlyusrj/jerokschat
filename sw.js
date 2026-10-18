self.window=self; // firebase-config.js uses window.*, which does not exist in a service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js','firebase-config.js');
try{firebase.initializeApp(self.FIREBASE_CONFIG);const messaging=firebase.messaging();messaging.onBackgroundMessage(payload=>{const n=payload.notification||{},d=payload.data||{};
  const jobs=[self.registration.showNotification(n.title||'OnlyUs',Object.assign({body:n.body||'You have a new update ❤️',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'onlyus',renotify:true,data:{url:d.url||'./index.html'}},n))];
  // delivery receipt: the phone got the push while the app was closed -> tell the server so the sender sees the double tick
  if(d.ack&&d.cid&&d.mid){const base=self.FUNCTIONS_BASE||('https://'+(self.FUNCTIONS_REGION||'us-central1')+'-'+self.FIREBASE_CONFIG.projectId+'.cloudfunctions.net');
   jobs.push(fetch(base+'/ackDelivered',{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({cid:d.cid,mid:d.mid,ack:d.ack})}).catch(()=>{}))}
  return Promise.all(jobs)})}catch(e){}
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./index.html';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus' in c){return c.focus().then(()=>('navigate' in c?c.navigate(url):c))}}return clients.openWindow(url)}))});


// ---- temporary media cache (v50): photos, stickers, GIFs, voice notes and videos stay on the phone for 7 days, at most 200 MB.
// Opening a chat again shows them at once and uses no data. Old files are removed automatically (nothing is deleted in the cloud).
const MEDIA='onlyus-media-v1',MEDIA_MAX=200*1024*1024,MEDIA_TTL=7*864e5,MEDIA_ONE=25*1024*1024;
const isMedia=u=>u.hostname==='res.cloudinary.com'||/(^|\.)giphy\.com$/.test(u.hostname);
let lastTrim=0;
async function mediaTrim(c){
  const now=Date.now();if(now-lastTrim<60000)return;lastTrim=now;
  const ks=await c.keys(),items=[];
  for(const k of ks){const r=await c.match(k);if(!r)continue;items.push({k,at:+r.headers.get('x-cached-at')||0,sz:+r.headers.get('x-size')||0})}
  items.sort((a,b)=>a.at-b.at);let total=0;const keep=[];
  for(const it of items){if(now-it.at>MEDIA_TTL)await c.delete(it.k);else{keep.push(it);total+=it.sz}}
  while(total>MEDIA_MAX&&keep.length){const it=keep.shift();await c.delete(it.k);total-=it.sz}
}
async function mediaStore(c,key,url){
  try{
    const res=await fetch(url,{mode:'cors',credentials:'omit'});
    if(!res.ok||res.status!==200)return null;
    const blob=await res.blob();if(blob.size>MEDIA_ONE)return blob;
    const h=new Headers(res.headers);h.set('x-cached-at',String(Date.now()));h.set('x-size',String(blob.size));
    await c.put(key,new Response(blob,{status:200,headers:h}));
    mediaTrim(c).catch(()=>{});
    return blob;
  }catch(err){return null}
}
function mediaRange(blob,type,range){
  const m=/bytes=(\d*)-(\d*)/.exec(range)||[];let s,e;
  if(m[1]===''&&m[2]){s=Math.max(0,blob.size-(+m[2]));e=blob.size-1}else{s=m[1]?+m[1]:0;e=m[2]?+m[2]:blob.size-1}
  if(e>=blob.size)e=blob.size-1;
  if(s>e||s>=blob.size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+blob.size}});
  return new Response(blob.slice(s,e+1),{status:206,headers:{'Content-Type':type||'application/octet-stream','Content-Range':'bytes '+s+'-'+e+'/'+blob.size,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}});
}
async function mediaFetch(e){
  const r=e.request,url=r.url.split('#')[0],key=new Request(url),range=r.headers.get('range');
  try{
    const c=await caches.open(MEDIA),hit=await c.match(key);
    if(hit){
      if(Date.now()-(+hit.headers.get('x-cached-at')||0)<MEDIA_TTL){
        if(!range)return hit;
        return mediaRange(await hit.blob(),hit.headers.get('content-type'),range);
      }
      await c.delete(key);
    }
    if(range){ // audio / video being streamed: play from the network now, keep a full copy for next time
      e.waitUntil(mediaStore(c,key,url));
      return fetch(r);
    }
    const blob=await mediaStore(c,key,url);
    if(blob)return new Response(blob,{status:200,headers:{'Content-Type':blob.type||'application/octet-stream'}});
  }catch(err){}
  return fetch(r);
}
// ---- offline app shell (network first for our files, cache first for SDK/CDN files)
const SHELL='onlyus-shell-v16';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(SHELL).then(c=>c.addAll(['./','./index.html','./nacl-fast.min.js','./jszip.min.js','./qr-gen.js','./ai-chat.js','./couple-plus.js','./fx-anim.js','./wallpaper-gallery.js','./stickers-pack.js','./notify-privacy.js','./voice-fix.js','./emoji-names.js','./liquid-glass.js','./chat-speed.js','./profile-ui.js','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./firebase-config.js']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([clients.claim(),caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('onlyus-shell-')&&k!==SHELL).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url),own=u.origin===location.origin,cdn=['www.gstatic.com','fonts.gstatic.com','fonts.googleapis.com','cdnjs.cloudflare.com'].includes(u.hostname);if(!own&&isMedia(u)){e.respondWith(mediaFetch(e));return}if(!own&&!cdn)return;
 e.respondWith(caches.open(SHELL).then(async c=>{const hit=await c.match(r,{ignoreSearch:own});const net=()=>fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});if(cdn&&hit)return hit;try{return await net()}catch(err){if(hit)return hit;if(r.mode==='navigate'){const idx=await c.match('./index.html');if(idx)return idx}throw err}}))});
