import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {sendApprovedReply} from "./whatsapp-outbound.js";
import {synthesizeVoice} from "./elevenlabs-tts.js";
function fixture(){
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs","0011_whatsapp_agent_command","0012_whatsapp_outbound_controls","0013_whatsapp_voice_billing","0014_whatsapp_paystack_safeguards"])db.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 const timestamp=Math.floor(Date.now()/1000)-100;
 db.prepare("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant1',1)").run();
 db.prepare("INSERT INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type,provider_timestamp) VALUES('11111111-1111-1111-1111-111111111111','wamid.sample123','1234567890','2348012345678','text',?)").run(timestamp);
 db.exec("INSERT INTO whatsapp_reply_drafts(id,inbound_id,tenant_id,recipient_wa_id,body,state) VALUES('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','tenant1','2348012345678','Approved reply','approved'); INSERT INTO whatsapp_contact_permissions(tenant_id,recipient_wa_id,outbound_opt_in) VALUES('tenant1','2348012345678',1)");
 const DB={prepare(sql){const s=db.prepare(sql);return {bind(...args){return {first:async()=>s.get(...args),run:async()=>({meta:{changes:s.run(...args).changes}})}}}}};
 const env={DB,WHATSAPP_SEND_TOKEN:"internal",WHATSAPP_OUTBOUND_ENABLED:"true",WHATSAPP_ACCESS_TOKEN:"meta-token"};
 const request=()=>new Request("https://example.com/api/whatsapp/send-approved",{method:"POST",headers:{authorization:"Bearer internal","content-type":"application/json"},body:JSON.stringify({draft_id:"22222222-2222-2222-2222-222222222222"})});
 return {db,env,request};
}
test("outbound sender is disabled by default",async()=>{const {db,env,request}=fixture();delete env.WHATSAPP_OUTBOUND_ENABLED;assert.equal((await sendApprovedReply(request(),env)).status,503);db.close()});
test("opt-in revocation blocks Meta calls",async()=>{const {db,env,request}=fixture();db.exec("UPDATE whatsapp_contact_permissions SET outbound_opt_in=0");let calls=0;assert.equal((await sendApprovedReply(request(),env,async()=>{calls++;throw Error("should not call") })).status,403);assert.equal(calls,0);db.close()});
test("expired customer-service window blocks Meta calls",async()=>{const {db,env,request}=fixture();db.exec("UPDATE whatsapp_inbound SET provider_timestamp=100");assert.equal((await sendApprovedReply(request(),env)).status,403);db.close()});
test("approved opted-in reply sends once, duplicate is rejected",async()=>{const {db,env,request}=fixture();let calls=0;const fake=async()=>{calls++;return new Response(JSON.stringify({messages:[{id:"wamid.sent123456"}]}),{headers:{"content-type":"application/json"}})};
 const first=await sendApprovedReply(request(),env,fake);assert.equal(first.status,200);assert.equal((await first.json()).sent,true);
 assert.equal((await sendApprovedReply(request(),env,fake)).status,409);assert.equal(calls,1);
 assert.equal(db.prepare("SELECT status FROM whatsapp_delivery_log WHERE provider_message_id='wamid.sent123456'").get().status,"sent");db.close()});
test("ElevenLabs TTS validates input and returns audio",async()=>{
 await assert.rejects(()=>synthesizeVoice("",{ELEVENLABS_API_KEY:"key",ELEVENLABS_VOICE_ID:"validvoice123"}),/Invalid voice text/);
 const result=await synthesizeVoice("Hello",{ELEVENLABS_API_KEY:"key",ELEVENLABS_VOICE_ID:"validvoice123"},async()=>new Response(new Uint8Array([1,2,3]),{headers:{"content-type":"audio/mpeg"}}));
 assert.equal(result.audio.byteLength,3);
});
