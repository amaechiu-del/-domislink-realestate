import {recordDeliveryStatuses} from "./whatsapp-delivery.js";
// Meta webhook verification and signed inbound ingestion. No automatic outbound messaging.
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const hex=bytes=>Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,"0")).join("");
const equal=(a,b)=>{if(a.length!==b.length)return false;let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);return mismatch===0};
export async function verifyMetaSignature(raw,header,secret){
 if(!secret||!/^sha256=[a-f0-9]{64}$/i.test(header||""))return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const digest=hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw)));
 return equal(header.slice(7).toLowerCase(),digest);
}
export function verifyChallenge(req,env){
 const u=new URL(req.url),mode=u.searchParams.get("hub.mode"),token=u.searchParams.get("hub.verify_token"),challenge=u.searchParams.get("hub.challenge");
 if(!env.WHATSAPP_VERIFY_TOKEN)return json({error:"WhatsApp webhook not configured"},503);
 if(mode!=="subscribe"||!token||token!==env.WHATSAPP_VERIFY_TOKEN||!challenge)return json({error:"Invalid webhook challenge"},403);
 return new Response(challenge,{headers:{"content-type":"text/plain","cache-control":"no-store"}});
}
export async function receiveWhatsApp(req,env){
 if(!env.WHATSAPP_APP_SECRET||!env.DB)return json({error:"WhatsApp gateway not configured"},503);
 const length=Number(req.headers.get("content-length")||0);if(length>256000)return json({error:"Payload too large"},413);
 const raw=await req.text();if(raw.length>256000)return json({error:"Payload too large"},413);
 if(!await verifyMetaSignature(raw,req.headers.get("x-hub-signature-256"),env.WHATSAPP_APP_SECRET))return json({error:"Invalid webhook signature"},401);
 let event;try{event=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 if(event?.object!=="whatsapp_business_account"||!Array.isArray(event.entry))return json({error:"Unexpected event"},400);
 let stored=0,ignored=0;
 try{
  for(const entry of event.entry.slice(0,20))for(const change of (entry.changes||[]).slice(0,20)){
   if(change.field!=="messages")continue;
   const value=change.value||{},phone=String(value.metadata?.phone_number_id||"");
   await recordDeliveryStatuses(value,env);
   if(!/^[0-9]{5,30}$/.test(phone))continue;
   const route=await env.DB.prepare("SELECT tenant_id,enabled FROM whatsapp_tenant_routes WHERE business_phone_id=?").bind(phone).first();
   if(!route||route.enabled!==1){ignored++;continue}
   for(const m of (value.messages||[]).slice(0,100)){
    const id=String(m.id||""),sender=String(m.from||""),kind=["text","audio","image","document","interactive"].includes(m.type)?m.type:"other";
    if(!/^[A-Za-z0-9_.:-]{6,200}$/.test(id)||!/^[0-9]{5,30}$/.test(sender)){ignored++;continue}
    const text=kind==="text"?String(m.text?.body||"").slice(0,4096):null;
    const media=kind==="audio"?m.audio?.id:kind==="image"?m.image?.id:kind==="document"?m.document?.id:null;
    const result=await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type,text_body,media_id,language_code,provider_timestamp) VALUES(?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,phone,sender,kind,text,media?String(media).slice(0,200):null,null,Number.isFinite(Number(m.timestamp))&&Number(m.timestamp)>0?Number(m.timestamp):null).run();
    stored+=Number(result.meta?.changes||0);
   }
  }
  return json({received:true,stored,ignored});
 }catch{return json({error:"Inbound persistence failed"},503)}
}
