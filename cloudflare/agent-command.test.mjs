import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {agentInbox,agentDraft,agentDecision} from "./agent-command.js";
import {recordDeliveryStatuses} from "./whatsapp-delivery.js";
function setup(){
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs","0011_whatsapp_agent_command"])db.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 db.exec("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant1',1),('9999999999','tenant2',1); INSERT INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type,text_body) VALUES('11111111-1111-1111-1111-111111111111','wamid.sample123','1234567890','2348012345678','text','Hello'); INSERT INTO whatsapp_delivery_log(id,tenant_id,recipient_wa_id,message_type,provider_message_id,status) VALUES('delivery1','tenant1','2348012345678','text','wamid.outbound123','sent')");
 const DB={prepare(sql){const stmt=db.prepare(sql);return {bind(...args){return {first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})}}}}};
 return {db,DB};
}
test("agent APIs require signed OneLink identity",async()=>{
 const {db,DB}=setup(),env={DB};
 assert.equal((await agentInbox(new Request("https://test/api/agents/inbox?tenant_id=tenant1"),env)).status,401);
 assert.equal((await agentDraft(new Request("https://test/api/agents/drafts",{method:"POST",body:JSON.stringify({tenant_id:"tenant1"})}),env)).status,401);
 assert.equal((await agentDecision(new Request("https://test/api/agents/reviews",{method:"POST",body:JSON.stringify({tenant_id:"tenant1"})}),env)).status,401);
 db.close();
});
test("Meta status receipt updates only matching tenant",async()=>{
 const {db,DB}=setup();
 const changed=await recordDeliveryStatuses({metadata:{phone_number_id:"9999999999"},statuses:[{id:"wamid.outbound123",status:"read"}]},{DB});
 assert.equal(changed,0);assert.equal(db.prepare("SELECT status FROM whatsapp_delivery_log WHERE id='delivery1'").get().status,"sent");
 const accepted=await recordDeliveryStatuses({metadata:{phone_number_id:"1234567890"},statuses:[{id:"wamid.outbound123",status:"delivered"}]},{DB});
 assert.equal(accepted,1);assert.equal(db.prepare("SELECT status FROM whatsapp_delivery_log WHERE id='delivery1'").get().status,"delivered");db.close();
});
