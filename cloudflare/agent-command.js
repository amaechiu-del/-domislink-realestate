import {verifyOneLinkToken} from "./one-link-identity.js";
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const tenantValid=x=>typeof x==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(x);
const uuid=x=>typeof x==="string"&&/^[0-9a-f-]{36}$/i.test(x);
async function access(req,env,tenant,roles){
 if(!tenantValid(tenant))return {error:json({error:"Invalid tenant"},400)};
 const bearer=(req.headers.get("authorization")||"").match(/^Bearer (.+)$/)?.[1];
 if(!bearer)return {error:json({error:"OneLink sign-in required"},401)};
 let subject;try{subject=(await verifyOneLinkToken(bearer,env)).subject}catch{return {error:json({error:"Invalid OneLink session"},401)}}
 try{
  const grant=await env.DB.prepare("SELECT role FROM whatsapp_agent_memberships WHERE tenant_id=? AND identity_subject=? AND active=1").bind(tenant,subject).first();
  if(!grant||!roles.includes(grant.role))return {error:json({error:"Tenant agent permission required"},403)};
  return {subject,role:grant.role};
 }catch{return {error:json({error:"Agent permissions unavailable"},503)}}
}
export async function agentInbox(req,env){
 const tenant=new URL(req.url).searchParams.get("tenant_id"),auth=await access(req,env,tenant,["viewer","agent","reviewer","admin"]);if(auth.error)return auth.error;
 try{
  const messages=await env.DB.prepare(`SELECT w.id,w.message_type,w.text_body,w.transcription,w.translation,w.state,w.created_at,w.sender_wa_id
  FROM whatsapp_inbound w JOIN whatsapp_tenant_routes r ON r.business_phone_id=w.business_phone_id
  WHERE r.tenant_id=? ORDER BY w.created_at DESC LIMIT 100`).bind(tenant).all();
  const drafts=await env.DB.prepare("SELECT id,inbound_id,body,state,reviewer_subject,reviewed_at,created_at FROM whatsapp_reply_drafts WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100").bind(tenant).all();
  return json({tenant_id:tenant,role:auth.role,messages:messages.results||[],drafts:drafts.results||[]});
 }catch{return json({error:"Agent inbox unavailable"},503)}
}
export async function agentDraft(req,env){
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const tenant=body?.tenant_id,auth=await access(req,env,tenant,["agent","reviewer","admin"]);if(auth.error)return auth.error;
 if(!uuid(body?.inbound_id)||typeof body?.text!=="string"||!body.text.trim()||body.text.length>4096)return json({error:"Invalid draft"},400);
 try{
  const inbound=await env.DB.prepare("SELECT w.id,w.sender_wa_id FROM whatsapp_inbound w JOIN whatsapp_tenant_routes r ON r.business_phone_id=w.business_phone_id WHERE w.id=? AND r.tenant_id=? AND r.enabled=1").bind(body.inbound_id,tenant).first();
  if(!inbound)return json({error:"Inbound message not in tenant"},404);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO whatsapp_reply_drafts(id,inbound_id,tenant_id,recipient_wa_id,body) VALUES(?,?,?,?,?)").bind(id,inbound.id,tenant,inbound.sender_wa_id,body.text.trim()).run();
  await env.DB.prepare("INSERT INTO whatsapp_review_audit(id,tenant_id,draft_id,actor_subject,action) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),tenant,id,auth.subject,"created").run();
  return json({id,state:"pending_review"},201);
 }catch{return json({error:"Draft already exists or unavailable"},409)}
}
export async function agentDecision(req,env){
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const tenant=body?.tenant_id,auth=await access(req,env,tenant,["reviewer","admin"]);if(auth.error)return auth.error;
 if(!uuid(body?.draft_id)||!["approved","rejected"].includes(body?.decision))return json({error:"Invalid review"},400);
 try{
  const r=await env.DB.prepare("UPDATE whatsapp_reply_drafts SET state=?,reviewer_subject=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=? AND tenant_id=? AND state='pending_review'").bind(body.decision,auth.subject,body.draft_id,tenant).run();
  if(Number(r.meta?.changes||0)!==1)return json({error:"Draft not pending review"},409);
  await env.DB.prepare("INSERT INTO whatsapp_review_audit(id,tenant_id,draft_id,actor_subject,action) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),tenant,body.draft_id,auth.subject,body.decision).run();
  return json({reviewed:true,state:body.decision,outbound_sent:false});
 }catch{return json({error:"Review unavailable"},503)}
}
