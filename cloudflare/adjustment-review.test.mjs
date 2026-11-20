import test from "node:test";
import assert from "node:assert/strict";
import {reviewFinancialAdjustment} from "./adjustment-review.js";
function fakeDb(row,reversed=0){
 const calls=[],db={
  prepare(sql){return {bind(...args){return {async first(){if(sql.includes("COALESCE(SUM"))return {reversed};return row},sql,args}}}},
  async batch(statements){calls.push(...statements);return statements.map(()=>({success:true}))}
 };
 return {db,calls};
}
test("rejects missing authorization evidence",async()=>{
 const {db}=fakeDb(null);
 await assert.rejects(()=>reviewFinancialAdjustment(db,{adjustmentId:"a",reviewerSubject:"user",decision:"confirm"}),/Invalid verified review evidence/);
});
test("rejects a refund greater than the payment",async()=>{
 const {db}=fakeDb({id:"a",payment_id:"p",state:"pending",kind:"refund",amount_kobo:12000,payment_amount:10000,payment_status:"success",fulfilled_at:"today",agent_id:"agent",commission_amount:3000});
 await assert.rejects(()=>reviewFinancialAdjustment(db,{adjustmentId:"a",reviewerSubject:"finance:1",providerEvidenceReference:"ps-1",providerVerifiedAt:"2026-11-20T00:00:00Z",decision:"confirm"}),/requires reconciliation/);
});
test("caps commission reversal at remaining original commission",async()=>{
 const row={id:"a",payment_id:"p",state:"pending",kind:"refund",amount_kobo:5000,payment_amount:10000,payment_status:"success",fulfilled_at:"today",agent_id:"agent",commission_amount:3000};
 const {db,calls}=fakeDb(row,2800);
 const result=await reviewFinancialAdjustment(db,{adjustmentId:"a",reviewerSubject:"finance:1",providerEvidenceReference:"ps-1",providerVerifiedAt:"2026-11-20T00:00:00Z",decision:"confirm"});
 assert.equal(result.reversal_kobo,200);
 assert.equal(calls.length,3);
});
