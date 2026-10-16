const {onDocumentCreated,onDocumentWritten}=require("firebase-functions/v2/firestore");
const {onSchedule}=require("firebase-functions/v2/scheduler");
const {initializeApp}=require("firebase-admin/app");
const {getFirestore}=require("firebase-admin/firestore");
const {getMessaging}=require("firebase-admin/messaging");
initializeApp();
const db=getFirestore();
async function sendToUser(uid,title,body,data={}){
  const snap=await db.collection("users").doc(uid).collection("devices").get();
  const tokens=snap.docs.map(d=>d.data().token).filter(Boolean);
  if(!tokens.length)return;
  const res=await getMessaging().sendEachForMulticast({tokens,notification:{title,body},data:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v)]))});
  const bad=[];res.responses.forEach((x,i)=>{if(!x.success&&(x.error?.code||"").includes("registration-token-not-registered"))bad.push(tokens[i])});
  await Promise.all(bad.map(t=>db.collection("users").doc(uid).collection("devices").where("token","==",t).get().then(q=>Promise.all(q.docs.map(d=>d.ref.delete())))));
}
exports.chatMessageNotification=onDocumentCreated("chats/{cid}/messages/{mid}",async e=>{const m=e.data?.data();if(!m||!m.fromUid)return;const room=await db.doc(`chats/${e.params.cid}`).get();const members=room.data()?.members||[];const to=members.find(x=>x!==m.fromUid);if(!to)return;await sendToUser(to,"OnlyUs · New message",m.text||"You have a new message ❤️",{url:"./index.html",tag:`chat-${e.params.cid}`});});
exports.coupleHubNotification=onDocumentWritten("chats/{cid}/coupleHub/main",async e=>{const after=e.data?.after?.data();const before=e.data?.before?.data();if(!after||!before)return;const room=await db.doc(`chats/${e.params.cid}`).get();const members=room.data()?.members||[];const actor=after._actorUid;if(!actor)return;const to=members.find(x=>x!==actor);if(!to)return;if(after.gesture&&after.gesture.ts!==before.gesture?.ts)await sendToUser(to,after.gesture.kind==="hug"?"💕 You got a hug":"💋 You got a kiss",after.gesture.kind==="hug"?"Your partner sent you a hug!":"Your partner sent you a kiss!",{url:"./index.html",tag:`gesture-${e.params.cid}`});if(after._notify?.ts!==before._notify?.ts)await sendToUser(to,after._notify.title||"OnlyUs",after._notify.body||"You have a new couple update ❤️",{url:"./index.html",tag:`hub-${e.params.cid}`});});
exports.periodReminder=onSchedule("every hour",async()=>{const users=await db.collection("users").get();for(const u of users.docs){const p=await u.ref.collection("period").doc("config").get();if(!p.exists)continue;const d=p.data();if(!d.start||d.remind===false)continue;const tz=d.timeZone||"UTC";const todayKey=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());const s=new Date(`${d.start}T00:00:00Z`);if(isNaN(s))continue;const cycle=Math.max(15,Math.min(60,Number(d.cycle)||28));let next=new Date(s);let guard=0;while(next.toISOString().slice(0,10)<=todayKey&&guard++<120)next.setUTCDate(next.getUTCDate()+cycle);const rem=new Date(next);rem.setUTCDate(rem.getUTCDate()-2);const remKey=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(rem);const hr=Number(new Intl.DateTimeFormat("en-GB",{timeZone:tz,hour:"2-digit",hourCycle:"h23"}).format(new Date()));if(remKey===todayKey&&hr>=9&&d.lastReminded!==remKey){await sendToUser(u.id,"Rok💕Jeru · Period reminder","Your next estimated period is in 2 days.",{url:"./index.html",tag:`period-${u.id}`});await p.ref.set({lastReminded:remKey},{merge:true});}}});
