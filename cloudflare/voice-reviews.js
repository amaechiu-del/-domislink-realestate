// Human-supervised outbound reply drafts. No WhatsApp sends or automated approvals.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
function authorize(req,env){
 const token=req.headers.get("authorization");
 return Boolean(env.VOICE_REVIEW_TOKEN)&&token==="Bearer "+env.VOICE_REVIEW_TOKEN;
}
function validTenant(value){return typeof value==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(value)}
export async function listReplyDrafts(req,env){
 if(!authorize(req,env))return json({error:"Unauthorized"},401);
 const tenant=new URL(req.url).searchParams.get("tenant_id");
 if(!validTenant(tenant))return json({error:"Valid tenant required"},400);
 try{
  const rows=await env.DB.prepare("SELECT id,inbound_id,recipient_wa_id,body,state,created_at FROM whatsapp_reply_drafts WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100").bind(tenant).all();
  return json({items:rows.results||[]});
 }catch{return json({error:"Review inbox unavailable"},503)}
}
export async function createReplyDraft(req,env){
 if(!authorize(req,env))return json({error:"Unauthorized"},401);
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 if(!validTenant(body?.tenant_id)||typeof body?.inbound_id!=="string"||!/^[0-9a-f-]{36}$/i.test(body.inbound_id)||typeof body?.text!=="string"||body.text.trim().length<1||body.text.length>4096)return json({error:"Invalid draft"},400);
 try{
  const inbound=await env.DB.prepare("SELECT w.id,w.sender_wa_id FROM whatsapp_inbound w JOIN whatsapp_tenant_routes r ON r.business_phone_id=w.business_phone_id WHERE w.id=? AND r.tenant_id=? AND r.enabled=1").bind(body.inbound_id,body.tenant_id).first();
  if(!inbound)return json({error:"Message not in tenant"},404);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO whatsapp_reply_drafts(id,inbound_id,tenant_id,recipient_wa_id,body) VALUES(?,?,?,?,?)").bind(id,inbound.id,body.tenant_id,inbound.sender_wa_id,body.text.trim()).run();
  return json({id,state:"pending_review"},201);
 }catch{return json({error:"Draft unavailable or already exists"},409)}
}
export async function reviewReplyDraft(req,env){
 if(!authorize(req,env))return json({error:"Unauthorized"},401);
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 if(!validTenant(body?.tenant_id)||!/^[0-9a-f-]{36}$/i.test(body?.draft_id||"")||!["approved","rejected"].includes(body?.decision)||typeof body?.reviewer_subject!=="string"||body.reviewer_subject.length<3||body.reviewer_subject.length>200)return json({error:"Invalid review"},400);
 try{
  const r=await env.DB.prepare("UPDATE whatsapp_reply_drafts SET state=?,reviewer_subject=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=? AND tenant_id=? AND state='pending_review'").bind(body.decision,body.reviewer_subject,body.draft_id,body.tenant_id).run();
  if(Number(r.meta?.changes||0)!==1)return json({error:"Draft not pending review"},409);
  return json({reviewed:true,state:body.decision,outbound_sent:false});
 }catch{return json({error:"Review unavailable"},503)}
}
