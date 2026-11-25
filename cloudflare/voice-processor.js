import {downloadWhatsAppAudio,transcribeElevenLabs,translateText,voiceConfiguration} from "./voice-providers.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const validId=x=>typeof x==="string"&&/^[0-9a-f-]{36}$/i.test(x);
export async function processVoice(req,env,fetcher=fetch){
 if(!env.VOICE_PROCESSOR_TOKEN||req.headers.get("authorization")!=="Bearer "+env.VOICE_PROCESSOR_TOKEN)return json({error:"Unauthorized"},401);
 if(!env.DB)return json({error:"D1 unavailable"},503);
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 if(!validId(body?.inbound_id))return json({error:"Invalid inbound ID"},400);
 const row=await env.DB.prepare("SELECT w.id,w.sender_wa_id,w.media_id,w.state,w.message_type,r.tenant_id,r.enabled AS route_enabled,s.enabled,s.transcription_enabled,s.translation_enabled,s.ai_reply_enabled,s.target_language,s.daily_audio_seconds_limit,c.voice_processing FROM whatsapp_inbound w JOIN whatsapp_tenant_routes r ON r.business_phone_id=w.business_phone_id JOIN whatsapp_voice_settings s ON s.tenant_id=r.tenant_id JOIN whatsapp_voice_consents c ON c.tenant_id=r.tenant_id AND c.sender_wa_id=w.sender_wa_id WHERE w.id=?").bind(body.inbound_id).first();
 if(!row)return json({error:"Voice processing not authorized or not configured"},403);
 if(row.message_type!=="audio"||!row.media_id||row.route_enabled!==1||row.enabled!==1||row.transcription_enabled!==1||row.voice_processing!==1)return json({error:"Voice processing disabled"},403);
 if(row.state==="processed")return json({processed:true,already_processed:true});
 if(row.state==="queued")return json({error:"Already processing"},409);
 const usage=await env.DB.prepare("SELECT COALESCE(SUM(duration_seconds),0) AS seconds FROM whatsapp_voice_usage WHERE tenant_id=? AND created_at>=date('now')").bind(row.tenant_id).first();
 if(Number(usage?.seconds||0)>=row.daily_audio_seconds_limit)return json({error:"Tenant audio quota exceeded"},429);
 const claimed=await env.DB.prepare("UPDATE whatsapp_inbound SET state='queued',processing_error=NULL WHERE id=? AND state IN ('received','failed')").bind(row.id).run();
 if(Number(claimed.meta?.changes||0)!==1)return json({error:"Voice processing unavailable"},409);
 try{
  const {audio,type}=await downloadWhatsAppAudio(row.media_id,env,fetcher);
  const result=await transcribeElevenLabs(audio,type,env,fetcher);
  let translation=null;
  if(row.translation_enabled===1&&row.target_language&&result.text)translation=await translateText(result.text,row.target_language,env,fetcher);
  // Until reliable provider duration is available, charge a conservative 60-second quota unit per voice note.
  await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_voice_usage(id,tenant_id,inbound_id,duration_seconds) VALUES(?,?,?,60)").bind(crypto.randomUUID(),row.tenant_id,row.id).run();
  await env.DB.prepare("UPDATE whatsapp_inbound SET transcription=?,translation=?,language_code=?,state='processed',processed_at=CURRENT_TIMESTAMP WHERE id=? AND state='queued'").bind(result.text,translation,result.language_code,row.id).run();
  // AI-generated responses and outbound WhatsApp sends are disabled until consent/window checks are implemented.
  return json({processed:true,language_code:result.language_code,translated:Boolean(translation)});
 }catch(e){
  await env.DB.prepare("UPDATE whatsapp_inbound SET state='failed',processing_error=? WHERE id=? AND state='queued'").bind(String(e?.message||"Processing error").slice(0,180),row.id).run();
  return json({error:"Voice processing failed"},502);
 }
}
export function voiceReadiness(env){return json({service:"domislink-voice",...voiceConfiguration(env),outbound_enabled:false,calling_enabled:false})}
