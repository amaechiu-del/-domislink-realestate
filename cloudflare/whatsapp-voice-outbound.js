import {reserveSend} from "./send-reservation.js";
import {synthesizeVoice} from "./elevenlabs-tts.js";
const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const uuid=x=>typeof x==="string"&&/^[0-9a-f-]{36}$/i.test(x);
// Deliberately restricted internal operation; never expose this token to a browser.
export async function sendApprovedVoice(req,env,fetcher=fetch){
 if(!env.WHATSAPP_VOICE_SEND_TOKEN||req.headers.get("authorization")!=="Bearer "+env.WHATSAPP_VOICE_SEND_TOKEN)return json({error:"Unauthorized"},401);
 if(env.WHATSAPP_VOICE_OUTBOUND_ENABLED!=="true"||!env.WHATSAPP_ACCESS_TOKEN||!env.ELEVENLABS_API_KEY)return json({error:"Voice sending disabled"},503);
 let input;try{input=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 if(!uuid(input?.draft_id))return json({error:"Invalid draft"},400);
 const row=await env.DB.prepare(`SELECT d.id,d.tenant_id,d.recipient_wa_id,d.body,d.state,r.business_phone_id,
 p.outbound_opt_in,p.voice_opt_in,MAX(w.provider_timestamp) AS last_inbound,b.billing_status,b.monthly_voice_seconds
 FROM whatsapp_reply_drafts d JOIN whatsapp_inbound origin ON origin.id=d.inbound_id
 JOIN whatsapp_tenant_routes r ON r.business_phone_id=origin.business_phone_id AND r.tenant_id=d.tenant_id AND r.enabled=1
 JOIN whatsapp_contact_permissions p ON p.tenant_id=d.tenant_id AND p.recipient_wa_id=d.recipient_wa_id
 JOIN whatsapp_billing_plans b ON b.tenant_id=d.tenant_id
 LEFT JOIN whatsapp_inbound w ON w.business_phone_id=r.business_phone_id AND w.sender_wa_id=d.recipient_wa_id
 WHERE d.id=? GROUP BY d.id`).bind(input.draft_id).first();
 if(!row||row.state!=="approved"||row.outbound_opt_in!==1||row.voice_opt_in!==1||row.billing_status!=="active")return json({error:"Approved opted-in active voice subscription required"},403);
 const now=Math.floor(Date.now()/1000);
 if(!Number.isSafeInteger(row.last_inbound)||row.last_inbound>now+60||now-row.last_inbound>=86400)return json({error:"Customer service window expired"},403);
 const usage=await env.DB.prepare("SELECT COALESCE(SUM(units),0) AS units FROM whatsapp_usage_events WHERE tenant_id=? AND operation='tts' AND created_at>=strftime('%Y-%m-01','now')").bind(row.tenant_id).first();
 const estimatedSeconds=Math.max(1,Math.ceil(row.body.length/12));
 if(Number(usage?.units||0)+estimatedSeconds>row.monthly_voice_seconds)return json({error:"Voice quota exceeded"},429);
 const textReservation=await env.DB.prepare("SELECT state FROM whatsapp_send_requests WHERE draft_id=?").bind(row.id).first();
 if(textReservation)return json({error:"Draft already reserved for text delivery"},409);
 const id=crypto.randomUUID();
 if(!await reserveSend(env,{draftId:row.id,tenantId:row.tenant_id,channel:"audio",reservationId:id}))return json({error:"Draft already reserved across channels"},409);
 const reserve=await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_voice_send_requests(id,draft_id,tenant_id) VALUES(?,?,?)").bind(id,row.id,row.tenant_id).run();
 if(Number(reserve.meta?.changes||0)!==1)return json({error:"Voice send already reserved; reconcile manually"},409);
 try{
  await env.DB.prepare("UPDATE whatsapp_voice_send_requests SET state='uploading' WHERE id=?").bind(id).run();
  const {audio}=await synthesizeVoice(row.body,env,fetcher);
  const form=new FormData();form.set("messaging_product","whatsapp");form.set("type","audio/mpeg");form.set("file",new Blob([audio],{type:"audio/mpeg"}),"reply.mp3");
  const base="https://graph.facebook.com/v23.0/"+encodeURIComponent(row.business_phone_id);
  const upload=await fetcher(base+"/media",{method:"POST",headers:{authorization:"Bearer "+env.WHATSAPP_ACCESS_TOKEN},body:form,signal:AbortSignal.timeout(20000)});
  if(!upload.ok)throw Error("Media upload failed");
  const mediaId=(await upload.json()).id;
  if(typeof mediaId!=="string"||!/^[A-Za-z0-9_-]{4,200}$/.test(mediaId))throw Error("Invalid Meta media ID");
  await env.DB.prepare("UPDATE whatsapp_voice_send_requests SET state='sending',media_id=? WHERE id=?").bind(mediaId,id).run();
  const response=await fetcher(base+"/messages",{method:"POST",headers:{authorization:"Bearer "+env.WHATSAPP_ACCESS_TOKEN,"content-type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",to:row.recipient_wa_id,type:"audio",audio:{id:mediaId}}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error("Meta audio send unconfirmed");
  const providerId=(await response.json()).messages?.[0]?.id;
  if(typeof providerId!=="string"||!/^[A-Za-z0-9_.:-]{6,200}$/.test(providerId))throw Error("Invalid provider message ID");
  await env.DB.prepare("UPDATE whatsapp_voice_send_requests SET state='sent',provider_message_id=? WHERE id=?").bind(providerId,id).run();
  await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_delivery_log(id,tenant_id,recipient_wa_id,message_type,provider_message_id,status) VALUES(?,?,?,'audio',?,'sent')").bind(crypto.randomUUID(),row.tenant_id,row.recipient_wa_id,providerId).run();
  await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_usage_events(id,tenant_id,operation,units,provider_reference,source_id) VALUES(?,?,'tts',?,?,?)").bind(crypto.randomUUID(),row.tenant_id,estimatedSeconds,providerId,row.id).run();
  return json({sent:true,request_id:id,estimated_voice_seconds:estimatedSeconds});
 }catch{
  await env.DB.prepare("UPDATE whatsapp_voice_send_requests SET state='unknown',error_code='provider_or_network_uncertain' WHERE id=? AND state!='sent'").bind(id).run();
  return json({error:"Voice send outcome uncertain; manual reconciliation required"},502);
 }
}
