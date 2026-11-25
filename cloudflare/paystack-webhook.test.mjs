import test from "node:test";
import assert from "node:assert/strict";
import {createHmac,webcrypto} from "node:crypto";
import {validPaystackSignature} from "./paystack-webhook.js";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
test("valid Paystack HMAC SHA512 signature",async()=>{
 const payload=new TextEncoder().encode(JSON.stringify({event:"charge.success",data:{reference:"dlk_test"}}));
 const secret="test-only-secret";
 const signature=createHmac("sha512",secret).update(payload).digest("hex");
 assert.equal(await validPaystackSignature(payload,signature,secret),true);
 assert.equal(await validPaystackSignature(payload,signature,"wrong"),false);
 assert.equal(await validPaystackSignature(payload,"abc",secret),false);
 const tampered=new TextEncoder().encode('{"event":"charge.failed"}');
 assert.equal(await validPaystackSignature(tampered,signature,secret),false);
});
