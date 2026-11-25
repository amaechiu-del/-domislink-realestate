import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {verifyMetaSignature,verifyChallenge,receiveWhatsApp} from "./whatsapp-gateway.js";
const secret="test-secret";
async function signature(raw){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return "sha256="+Buffer.from(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw))).toString("hex")}
function env(){
 const db=new DatabaseSync(":memory:");db.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const file of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries","0008_whatsapp_voice_gateway","0009_whatsapp_voice_processing","0010_whatsapp_voice_jobs","0011_whatsapp_agent_command","0012_whatsapp_outbound_controls"])db.exec(readFileSync("cloudflare/migrations/"+file+".sql","utf8"));
 db.exec("INSERT INTO whatsapp_tenant_routes(business_phone_id,tenant_id,enabled) VALUES('1234567890','tenant-1',1)");
 const DB={prepare(sql){const statement=db.prepare(sql);return {bind(...args){return {first:async()=>statement.get(...args),run:async()=>({meta:{changes:statement.run(...args).changes}})}}}}};
 return {db,DB,WHATSAPP_APP_SECRET:secret,WHATSAPP_VERIFY_TOKEN:"verify-token"};
}
test("Meta webhook challenge verifies exact token",()=>{const e=env();assert.equal(verifyChallenge(new Request("https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=123"),e).status,200);assert.equal(verifyChallenge(new Request("https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=123"),e).status,403);e.db.close()});
test("HMAC rejects forged and missing signatures",async()=>{assert.equal(await verifyMetaSignature("payload",await signature("payload"),secret),true);assert.equal(await verifyMetaSignature("payload",await signature("different"),secret),false);assert.equal(await verifyMetaSignature("payload",null,secret),false)});
test("inbound text and voice notes are idempotent and tenant-routed",async()=>{
 const e=env(),payload=JSON.stringify({object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value:{metadata:{phone_number_id:"1234567890"},messages:[{id:"wamid.abcdef123456",from:"2348012345678",type:"text",text:{body:"Hello"}},{id:"wamid.audio123456",from:"2348012345678",type:"audio",audio:{id:"media-123"}}]}}]}]});
 const headers={"x-hub-signature-256":await signature(payload)};
 const request=()=>new Request("https://example.com/api/whatsapp/webhook",{method:"POST",headers,body:payload});
 const first=await receiveWhatsApp(request(),e);assert.equal(first.status,200);assert.equal((await first.json()).stored,2);
 const second=await receiveWhatsApp(request(),e);assert.equal((await second.json()).stored,0);
 assert.equal(e.db.prepare("SELECT COUNT(*) n FROM whatsapp_inbound").get().n,2);e.db.close();
});
test("unsigned webhook is denied before database access",async()=>{const e=env();const r=await receiveWhatsApp(new Request("https://example.com/api/whatsapp/webhook",{method:"POST",body:"{}"}),e);assert.equal(r.status,401);e.db.close()});
