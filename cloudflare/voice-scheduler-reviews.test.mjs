import test from "node:test";
import assert from "node:assert/strict";
import {runVoiceSchedule} from "./voice-scheduler.js";
import {listReplyDrafts,createReplyDraft,reviewReplyDraft} from "./voice-reviews.js";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
test("Cron disabled by default and never accesses providers",async()=>{
 assert.deepEqual(await runVoiceSchedule({},{}),{enabled:false});
 assert.equal((await runVoiceSchedule({VOICE_CRON_ENABLED:"true"}, {warn(){}})).enabled,false);
});
test("review APIs reject missing or incorrect internal credentials",async()=>{
 const env={VOICE_REVIEW_TOKEN:"review-secret"};
 const r=new Request("https://example.com/api/voice/reviews?tenant_id=tenant1");
 assert.equal((await listReplyDrafts(r,env)).status,401);
 assert.equal((await createReplyDraft(new Request(r.url,{method:"POST",body:"{}"}),env)).status,401);
 assert.equal((await reviewReplyDraft(new Request(r.url,{method:"POST",body:"{}"}),env)).status,401);
});
test("drafts remain tenant-scoped and approval does not send outbound",async()=>{
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs"])db.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 db.exec("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant1',1); INSERT INTO whatsapp_inbound(id,provider_message_id,business_phone_id,sender_wa_id,message_type) VALUES('11111111-1111-1111-1111-111111111111','wamid.sample123','1234567890','2348012345678','text')");
 const DB={prepare(sql){const stmt=db.prepare(sql);return {bind(...args){return {first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})}}}}};
 const env={DB,VOICE_REVIEW_TOKEN:"review-secret"},headers={authorization:"Bearer review-secret","content-type":"application/json"};
 const post=(body)=>new Request("https://example.com/api/voice/reviews",{method:"POST",headers,body:JSON.stringify(body)});
 const bad=await createReplyDraft(post({tenant_id:"tenant2",inbound_id:"11111111-1111-1111-1111-111111111111",text:"Hello"}),env);assert.equal(bad.status,404);
 const ok=await createReplyDraft(post({tenant_id:"tenant1",inbound_id:"11111111-1111-1111-1111-111111111111",text:"Hello"}),env);assert.equal(ok.status,201);const {id}=await ok.json();
 const list=await listReplyDrafts(new Request("https://example.com/api/voice/reviews?tenant_id=tenant2",{headers}),env);assert.deepEqual((await list.json()).items,[]);
 const review=await reviewReplyDraft(new Request("https://example.com/api/voice/reviews/decision",{method:"POST",headers,body:JSON.stringify({tenant_id:"tenant1",draft_id:id,decision:"approved",reviewer_subject:"internal-operator"})}),env);
 assert.equal(review.status,200);assert.equal((await review.json()).outbound_sent,false);
 db.close();
});
