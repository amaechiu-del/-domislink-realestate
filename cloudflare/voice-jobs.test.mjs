import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {enqueueVoiceJobs,drainVoiceJobs} from "./voice-jobs.js";
function fixture(){
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs"])db.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 db.exec("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant1',1); INSERT INTO whatsapp_voice_settings(tenant_id,enabled,transcription_enabled) VALUES('tenant1',1,1); INSERT INTO whatsapp_voice_consents(tenant_id,sender_wa_id,voice_processing) VALUES('tenant1','2348012345678',1); INSERT INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type,media_id) VALUES('11111111-1111-1111-1111-111111111111','wamid.sample123','1234567890','2348012345678','audio','media123')");
 const DB={prepare(sql){const statement=db.prepare(sql);return {first:async()=>statement.get(),run:async()=>({meta:{changes:statement.run().changes}}),bind(...args){return {first:async()=>statement.get(...args),run:async()=>({meta:{changes:statement.run(...args).changes}})}}}}};
 return {db,env:{DB,VOICE_PROCESSOR_TOKEN:"token"}};
}
function request(token="token"){return new Request("https://example.com/api/voice/jobs/enqueue",{method:"POST",headers:{authorization:"Bearer "+token}})}
test("voice queue rejects unauthenticated callers",async()=>{const {db,env}=fixture();assert.equal((await enqueueVoiceJobs(request("wrong"),env)).status,401);assert.equal((await drainVoiceJobs(request("wrong"),env)).status,401);db.close()});
test("consented voice notes enqueue exactly once",async()=>{const {db,env}=fixture();assert.equal((await (await enqueueVoiceJobs(request(),env)).json()).queued,1);assert.equal((await (await enqueueVoiceJobs(request(),env)).json()).queued,0);assert.equal(db.prepare("SELECT COUNT(*) n FROM whatsapp_voice_jobs").get().n,1);db.close()});
test("revoked consent prevents queue creation",async()=>{const {db,env}=fixture();db.exec("UPDATE whatsapp_voice_consents SET voice_processing=0");assert.equal((await (await enqueueVoiceJobs(request(),env)).json()).queued,0);db.close()});
test("empty queue drains without invoking voice providers",async()=>{const {db,env}=fixture();assert.deepEqual(await (await drainVoiceJobs(request(),env)).json(),{processed:0});db.close()});
