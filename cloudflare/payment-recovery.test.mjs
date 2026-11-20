import test from "node:test";
import assert from "node:assert/strict";
import {reconcilePayment,paymentStatus} from "./payments.js";
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
