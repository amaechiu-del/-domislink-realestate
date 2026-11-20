// Signed Meta status webhooks: update only already-known outgoing message IDs.
export async function recordDeliveryStatuses(value,env){
 const phone=String(value?.metadata?.phone_number_id||"");
 if(!/^[0-9]{5,30}$/.test(phone))return 0;
 const route=await env.DB.prepare("SELECT tenant_id,enabled FROM whatsapp_tenant_routes WHERE business_phone_id=?").bind(phone).first();
 if(!route||route.enabled!==1)return 0;
 let updated=0;
 for(const item of (value.statuses||[]).slice(0,100)){
  const id=String(item.id||""),status=String(item.status||"");
  if(!/^[A-Za-z0-9_.:-]{6,200}$/.test(id)||!["sent","delivered","read","failed"].includes(status))continue;
  const r=await env.DB.prepare("UPDATE whatsapp_delivery_log SET status=? WHERE tenant_id=? AND provider_message_id=?").bind(status,route.tenant_id,id).run();
  updated+=Number(r.meta?.changes||0);
 }
 return updated;
}
