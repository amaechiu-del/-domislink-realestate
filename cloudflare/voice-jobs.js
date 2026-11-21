// Durable D1 jobs: claim one job per request, never expose secrets or automatically send WhatsApp messages.
import {processVoice} from "./voice-processor.js";
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const authorized=(req,env)=>Boolean(env.VOICE_PROCESSOR_TOKEN)&&req.headers.get("authorization")==="Bearer "+env.VOICE_PROCESSOR_TOKEN;
export async function enqueueVoiceJobs(req,env){
 if(!authorized(req,env))return json({error:"Unauthorized"},401);
 if(!env.DB)return json({error:"Database unavailable"},503);
 const r=await env.DB.prepare(`INSERT OR IGNORE INTO whatsapp_voice_jobs(inbound_id,tenant_id)
 SELECT w.id,r.tenant_id FROM whatsapp_inbound w
 JOIN whatsapp_tenant_routes r ON r.business_phone_id=w.business_phone_id
 JOIN whatsapp_voice_settings s ON s.tenant_id=r.tenant_id
 JOIN whatsapp_voice_consents c ON c.tenant_id=r.tenant_id AND c.sender_wa_id=w.sender_wa_id
 WHERE w.message_type='audio' AND w.state='received' AND r.enabled=1
 AND s.enabled=1 AND s.transcription_enabled=1 AND c.voice_processing=1
 AND NOT EXISTS(SELECT 1 FROM whatsapp_voice_jobs j WHERE j.inbound_id=w.id)
 LIMIT 100`).run();
 return json({queued:Number(r.meta?.changes||0)});
}
export async function drainVoiceJobs(req,env){
 if(!authorized(req,env))return json({error:"Unauthorized"},401);
 if(!env.DB)return json({error:"Database unavailable"},503);
 const row=await env.DB.prepare(`SELECT inbound_id FROM whatsapp_voice_jobs
 WHERE (state='pending' AND available_at<=CURRENT_TIMESTAMP)
 OR (state='leased' AND leased_until<CURRENT_TIMESTAMP)
 ORDER BY available_at,inbound_id LIMIT 1`).first();
 if(!row)return json({processed:0});
 const lease=await env.DB.prepare(`UPDATE whatsapp_voice_jobs SET state='leased',attempts=attempts+1,leased_until=datetime('now','+3 minutes')
 WHERE inbound_id=? AND ((state='pending' AND available_at<=CURRENT_TIMESTAMP) OR (state='leased' AND leased_until<CURRENT_TIMESTAMP))`).bind(row.inbound_id).run();
 if(Number(lease.meta?.changes||0)!==1)return json({processed:0,contended:true});
 const inbound=await env.DB.prepare("SELECT state FROM whatsapp_inbound WHERE id=?").bind(row.inbound_id).first();
 if(inbound?.state==="queued"){
  // A previous worker may have crashed while processing. Never race the previous lease.
  await env.DB.prepare("UPDATE whatsapp_inbound SET state='failed',processing_error='Expired job lease' WHERE id=? AND state='queued'").bind(row.inbound_id).run();
 }
 const internal=new Request(new URL("/api/voice/process",req.url),{method:"POST",headers:{authorization:"Bearer "+env.VOICE_PROCESSOR_TOKEN,"content-type":"application/json"},body:JSON.stringify({inbound_id:row.inbound_id})});
 const result=await processVoice(internal,env);
 if(result.ok){
  await env.DB.prepare("UPDATE whatsapp_voice_jobs SET state='done',leased_until=NULL,last_error=NULL WHERE inbound_id=?").bind(row.inbound_id).run();
  return json({processed:1,success:true});
 }
 const current=await env.DB.prepare("SELECT attempts FROM whatsapp_voice_jobs WHERE inbound_id=?").bind(row.inbound_id).first();
 const attempts=Number(current?.attempts||1),dead=attempts>=3;
 await env.DB.prepare("UPDATE whatsapp_voice_jobs SET state=?,leased_until=NULL,available_at=datetime('now',? || ' minutes'),last_error=? WHERE inbound_id=?").bind(dead?"dead":"pending",String(Math.min(60,attempts*5)),String(result.status),row.inbound_id).run();
 return json({processed:1,success:false,retry:!dead});
}
