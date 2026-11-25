// Atomic D1 PRIMARY KEY claim shared by text and audio sends.
export async function reserveSend(env,{draftId,tenantId,channel,reservationId}){
 const r=await env.DB.prepare("INSERT OR IGNORE INTO whatsapp_unified_send_reservations(draft_id,tenant_id,channel,reservation_id) VALUES(?,?,?,?)").bind(draftId,tenantId,channel,reservationId).run();
 return Number(r.meta?.changes||0)===1;
}
