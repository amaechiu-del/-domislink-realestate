import test from "node:test";
import assert from "node:assert/strict";
import {paystackWebhook} from "./paystack-webhook.js";
const key="test-webhook-secret",reference="dlk_"+"b".repeat(32);
async function signed(event){
 const body=JSON.stringify(event),cryptoKey=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),{name:"HMAC",hash:"SHA-512"},false,["sign"]);
 const signature=Buffer.from(await crypto.subtle.sign("HMAC",cryptoKey,new TextEncoder().encode(body))).toString("hex");
 return new Request("https://api.example.test/api/payments/webhook",{method:"POST",headers:{"x-paystack-signature":signature},body});
}
test("invalid webhook signature is rejected",async()=>{
 const response=await paystackWebhook(new Request("https://api.example.test",{method:"POST",body:"{}"}),{PAYSTACK_SECRET_KEY:key});
 assert.equal(response.status,401);
});
test("signed refund notification is recorded as pending review",async()=>{
 const statements=[];
 const db={prepare(sql){const s={sql,args:[],bind(...args){this.args=args;return this},async first(){return {id:"payment-1",amount_kobo:10000}},async run(){statements.push({sql:this.sql,args:this.args});return {success:true}}};return s}};
 const response=await paystackWebhook(await signed({event:"refund.processed",data:{id:25,reference,amount:5000}}),{PAYSTACK_SECRET_KEY:key,DB:db});
 assert.equal(response.status,200);
 assert.equal(statements.length,1);
 assert.match(statements[0].sql,/INSERT OR IGNORE INTO payment_adjustments/);
 assert.equal(statements[0].args[5],5000);
});
test("unrecognized signed event makes no database writes",async()=>{
 const response=await paystackWebhook(await signed({event:"customer.create",data:{}}),{PAYSTACK_SECRET_KEY:key,DB:{prepare(){throw Error("Unexpected DB access")}}});
 assert.equal(response.status,200);
});
