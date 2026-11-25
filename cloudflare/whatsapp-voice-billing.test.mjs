import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {sendApprovedVoice} from "./whatsapp-voice-outbound.js";
import {communicationsBilling} from "./communications-billing.js";
function fixture(){
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs","0011_whatsapp_agent_command","0012_whatsapp_outbound_controls","0013_whatsapp_voice_billing","0014_whatsapp_paystack_safeguards"])db.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 db.prepare("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant1',1)").run();
 db.prepare("INSERT INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type,provider_timestamp) VALUES('11111111-1111-1111-1111-111111111111','wamid.sample123','1234567890','2348012345678','text',?)").run(Math.floor(Date.now()/1000)-30);
 db.exec("INSERT INTO whatsapp_reply_drafts(id,inbound_id,tenant_id,recipient_wa_id,body,state) VALUES('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','tenant1','2348012345678','Hello there','approved'); INSERT INTO whatsapp_contact_permissions(tenant_id,recipient_wa_id,outbound_opt_in,voice_opt_in) VALUES('tenant1','2348012345678',1,1); INSERT INTO whatsapp_billing_plans(tenant_id,monthly_voice_seconds,billing_status) VALUES('tenant1',300,'active')");
 const DB={prepare(sql){const stmt=db.prepare(sql);return {bind(...args){return {first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})}}}}};
 const env={DB,WHATSAPP_VOICE_SEND_TOKEN:"internal",WHATSAPP_VOICE_OUTBOUND_ENABLED:"true",WHATSAPP_ACCESS_TOKEN:"meta",ELEVENLABS_API_KEY:"eleven",ELEVENLABS_VOICE_ID:"validvoice123"};
 const request=()=>new Request("https://example.com/api/whatsapp/send-approved-voice",{method:"POST",headers:{authorization:"Bearer internal"},body:JSON.stringify({draft_id:"22222222-2222-2222-2222-222222222222"})});
 return {db,env,request};
}
test("voice send disabled by default",async()=>{const {db,env,request}=fixture();delete env.WHATSAPP_VOICE_OUTBOUND_ENABLED;assert.equal((await sendApprovedVoice(request(),env)).status,503);db.close()});
test("voice opt-in revocation blocks any provider call",async()=>{const {db,env,request}=fixture();db.exec("UPDATE whatsapp_contact_permissions SET voice_opt_in=0");let calls=0;assert.equal((await sendApprovedVoice(request(),env,async()=>{calls++;throw Error("unexpected")})).status,403);assert.equal(calls,0);db.close()});
test("active subscription and voice quota required",async()=>{const {db,env,request}=fixture();db.exec("UPDATE whatsapp_billing_plans SET billing_status='inactive'");assert.equal((await sendApprovedVoice(request(),env)).status,403);db.exec("UPDATE whatsapp_billing_plans SET billing_status='active',monthly_voice_seconds=0");assert.equal((await sendApprovedVoice(request(),env)).status,429);db.close()});
test("voice send succeeds once, records delivery and metering",async()=>{
 const {db,env,request}=fixture();let calls=0;
 const fetcher=async(url)=>{calls++;if(url.includes("text-to-speech"))return new Response(new Uint8Array([1,2,3]),{headers:{"content-type":"audio/mpeg"}});if(url.endsWith("/media"))return new Response(JSON.stringify({id:"media123456"}));return new Response(JSON.stringify({messages:[{id:"wamid.voice123456"}]}))};
 const r=await sendApprovedVoice(request(),env,fetcher);assert.equal(r.status,200);assert.equal((await r.json()).sent,true);
 assert.equal((await sendApprovedVoice(request(),env,fetcher)).status,409);assert.equal(calls,3);
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM whatsapp_usage_events").get().n,1);db.close();
});
test("billing reporting requires internal authorization",async()=>{const {db,env}=fixture();env.COMMUNICATIONS_BILLING_TOKEN="billing";assert.equal((await communicationsBilling(new Request("https://example.com/api/communications/billing?tenant_id=tenant1"),env)).status,401);db.close()});
