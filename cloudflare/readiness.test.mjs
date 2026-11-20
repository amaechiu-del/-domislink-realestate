import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.js";
const request=()=>new Request("https://worker.example/api/ready");
const response=(results)=>({all:async()=>({results})});
function env({tables=true,renewal=true,paymentColumns=true,index=true}={}){
 return {DB:{prepare(sql){
  if(sql.includes("sqlite_master"))return response(tables?["communities","listings","payments","commission_ledger","payment_adjustments","commission_adjustments","adjustment_reviews"].map(name=>({name})):[]);
  if(sql.includes("table_info(listings)"))return response(renewal?[{name:"renewal_of_id"}]:[]);
  if(sql.includes("table_info(payments)"))return response(paymentColumns?["duration_days","featured","fulfilled_at"].map(name=>({name})):[]);
  if(sql.includes("index_list(payments)"))return response(index?[{name:"uq_listing_outstanding_payment"}]:[]);
  throw Error("Unexpected SQL: "+sql);
 }},APP_ORIGIN:"https://propertymarketplace.domislinker.com"};
}
test("readiness returns 503 when D1 is missing",async()=>{const r=await worker.fetch(request(),{});assert.equal(r.status,503)});
test("readiness rejects missing marketplace tables",async()=>{const r=await worker.fetch(request(),env({tables:false}));assert.equal(r.status,503)});
test("readiness rejects missing renewal migration",async()=>{const r=await worker.fetch(request(),env({renewal:false}));assert.equal(r.status,503)});
test("readiness rejects missing payment fulfillment columns",async()=>{const r=await worker.fetch(request(),env({paymentColumns:false}));assert.equal(r.status,503)});
test("readiness rejects missing payment uniqueness index",async()=>{const r=await worker.fetch(request(),env({index:false}));assert.equal(r.status,503)});
test("readiness reports ready for complete schema",async()=>{const r=await worker.fetch(request(),env());assert.equal(r.status,200);assert.equal((await r.json()).ready,true)});
