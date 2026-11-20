import test from "node:test";
import assert from "node:assert/strict";
import {reconcilePayment,paymentStatus} from "./payments.js";
import {paystackWebhook,validPaystackSignature} from "./paystack-webhook.js";
const origin="https://propertymarketplace.domislinker.com";
const env={};
test("reconciliation rejects missing authentication",async()=>{
 const req=new Request("https://api.example.test/api/payments/reconcile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({reference:"dlk_"+"a".repeat(32)})});
 const r=await reconcilePayment(req,env,origin);
 assert.equal(r.status,401);
 assert.equal((await r.json()).error,"Authentication required");
});
test("payment status requires authenticated owner",async()=>{
 const req=new Request("https://api.example.test/api/payments/status?reference=dlk_"+"a".repeat(32));
 const r=await paymentStatus(req,env,origin);
 assert.equal(r.status,401);
});

test("rejects forged Paystack webhook signature",async()=>{
 const raw=new TextEncoder().encode(JSON.stringify({event:"charge.success",data:{reference:"dlk_"+"a".repeat(32)}}));
 assert.equal(await validPaystackSignature(raw.buffer,"0".repeat(128),"test_secret"),false);
 const req=new Request("https://api.example.test/api/payments/webhook",{method:"POST",headers:{"x-paystack-signature":"0".repeat(128)},body:raw});
 const response=await paystackWebhook(req,{PAYSTACK_SECRET_KEY:"test_secret"});
 assert.equal(response.status,401);
});
test("accepts valid Paystack HMAC-SHA512 signatures and rejects tampering",async()=>{
 const raw=new TextEncoder().encode('{"event":"ignored"}');
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode("test_secret"),{name:"HMAC",hash:"SHA-512"},false,["sign"]);
 const signature=Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,raw)),b=>b.toString(16).padStart(2,"0")).join("");
 assert.equal(await validPaystackSignature(raw.buffer,signature,"test_secret"),true);
 assert.equal(await validPaystackSignature(new TextEncoder().encode('{"event":"changed"}').buffer,signature,"test_secret"),false);
});
test("rejects oversized webhook payloads before parsing",async()=>{
 const req=new Request("https://api.example.test/api/payments/webhook",{method:"POST",body:"x".repeat(65537)});
 const response=await paystackWebhook(req,{PAYSTACK_SECRET_KEY:"test_secret"});
 assert.equal(response.status,413);
});
test("requires Paystack secret before processing webhook",async()=>{
 const req=new Request("https://api.example.test/api/payments/webhook",{method:"POST",body:"{}"});
 const response=await paystackWebhook(req,{});
 assert.equal(response.status,503);
});
