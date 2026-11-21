// Deliberately fail-closed WhatsApp sender: only approved drafts within an active customer service window.
// Templates and AI-generated outbound voice remain disabled until provider/template approval is integrated.
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const validId=x=>typeof x==="string"&&/^[0-9a-f-]{36}$/i.test(x);
export async function sendApprovedReply(req,env,fetcher=fetch){
 if(!env.WHATSAPP_SEND_TOKEN||req.headers.get("authorization")!=="Bearer "+env.WHATSAPP_SEND_TOKEN)return json({error:"Unauthorized"},401);
 if(env.WHATSAPP_OUTBOUND_ENABLED!=="true"||!env.WHATSAPP_ACCESS_TOKEN)return json({error:"Outbound messaging disabled"},503);
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 if(!validId(body?.draft_id))return json({error:"Invalid draft ID"},400);
 const row=await env.DB.prepare(`SELECT d.id,d.tenant_id,d.recipient_wa_id,d.body,d.state,r.business_phone_id,
 p.outbound_opt_in,MAX(w.provider_timestamp) AS last_inbound
 FROM whatsapp_reply_drafts d
 JOIN whatsapp_inbound origin ON origin.id=d.inbound_id
 JOIN whatsapp_tenant_routes r ON r.business_phone_id=origin.business_phone_id AND r.tenant_id=d.tenant_id AND r.enabled=1
 JOIN whatsapp_contact_permissions p ON p.tenant_id=d.tenant_id AND p.recipient_wa_id=d.recipient_wa_id
 LEFT JOIN whatsapp_inbound w ON w.business_phone_id=r.business_phone_id AND w.sender_wa_id=d.recipient_wa_id
 WHERE d.id=? GROUP BY d.id`).bind(body.draft_id).first();
 if(!row||row.state!=="approved"||row.outbound_opt_in!==1)return json({error:"Approved opted-in draft required"},403);
 const now=Math.floor(Date.now()/1000);
 if(!Number.isSafeInteger(row.last_inbound)||row.last_inbound>now+60||now-row.last_inbound>=86400)return json({error:"WhatsApp customer service window expired"},403);
 const previous=await env.DB.prepare("SELECT state FROM whatsapp_send_requests WHERE draft_id=?").bind(row.id).first();
 if(previous)return json({error:"Send already reserved; manual reconciliation required",state:previous.state},409);
 const sendId=crypto.randomUUID();
 const reservation=await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_send_requests(id,draft_id,tenant_id,recipient_wa_id,state) VALUES(?,?,?,?,'reserved')").bind(sendId,row.id,row.tenant_id,row.recipient_wa_id).run();
 if(Number(reservation.meta?.changes||0)!==1)return json({error:"Duplicate send reservation"},409);
 // Reserve before calling Meta: ambiguous network outcomes never trigger automatic duplicate sends.
 await env.DB.prepare("UPDATE whatsapp_send_requests SET state='sending' WHERE id=? AND state='reserved'").bind(sendId).run();
 try{
  const response=await fetcher("https://graph.facebook.com/v23.0/"+encodeURIComponent(row.business_phone_id)+"/messages",{
   method:"POST",headers:{"authorization":"Bearer "+env.WHATSAPP_ACCESS_TOKEN,"content-type":"application/json"},
   body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",to:row.recipient_wa_id,type:"text",text:{preview_url:false,body:row.body}}),
   signal:AbortSignal.timeout(15000)
  });
  if(!response.ok){await env.DB.prepare("UPDATE whatsapp_send_requests SET state='unknown',error_code=? WHERE id=?").bind("meta_http_"+response.status,sendId).run();return json({error:"Provider rejected or did not confirm send; reconcile manually"},502)}
  const data=await response.json(),providerId=data.messages?.[0]?.id;
  if(typeof providerId!=="string"||!/^[A-Za-z0-9_.:-]{6,200}$/.test(providerId))throw Error("Missing Meta message ID");
  await env.DB.prepare("UPDATE whatsapp_send_requests SET state='sent',provider_message_id=? WHERE id=?").bind(providerId,sendId).run();
  await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_delivery_log(id,tenant_id,recipient_wa_id,message_type,provider_message_id,status) VALUES(?,?,?,'text',?,'sent')").bind(crypto.randomUUID(),row.tenant_id,row.recipient_wa_id,providerId).run();
  return json({sent:true,request_id:sendId});
 }catch{
  await env.DB.prepare("UPDATE whatsapp_send_requests SET state='unknown',error_code='network_or_persistence' WHERE id=? AND state='sending'").bind(sendId).run();
  return json({error:"Uncertain send outcome; manual reconciliation required"},502);
 }
}
