// Read-only usage and template registry; authentication is an internal operator secret.
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export async function communicationsBilling(req,env){
 if(!env.COMMUNICATIONS_BILLING_TOKEN||req.headers.get("authorization")!=="Bearer "+env.COMMUNICATIONS_BILLING_TOKEN)return json({error:"Unauthorized"},401);
 const tenant=new URL(req.url).searchParams.get("tenant_id");
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(tenant||""))return json({error:"Invalid tenant"},400);
 try{
  const plan=await env.DB.prepare("SELECT monthly_voice_seconds,monthly_text_messages,billing_status,updated_at FROM whatsapp_billing_plans WHERE tenant_id=?").bind(tenant).first();
  const usage=await env.DB.prepare("SELECT operation,COALESCE(SUM(units),0) AS units FROM whatsapp_usage_events WHERE tenant_id=? AND created_at>=strftime('%Y-%m-01','now') GROUP BY operation").bind(tenant).all();
  const templates=await env.DB.prepare("SELECT template_name,language_code,category,approval_status,verified_at FROM whatsapp_approved_templates WHERE tenant_id=? ORDER BY template_name LIMIT 100").bind(tenant).all();
  return json({tenant_id:tenant,plan:plan||null,usage:usage.results||[],templates:templates.results||[],paystack_live_billing_enabled:false,template_send_enabled:false});
 }catch{return json({error:"Billing data unavailable"},503)}
}
