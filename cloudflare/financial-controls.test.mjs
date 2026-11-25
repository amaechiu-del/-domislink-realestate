import test from "node:test";
import assert from "node:assert/strict";
import {commissionPayoutEligibility,adjustmentFromProviderEvent} from "./financial-controls.js";
const reference="dlk_"+"a".repeat(32);
test("commissions are held until fulfillment",()=>{
 assert.equal(commissionPayoutEligibility({status:"pending",fulfilled_at:null}).eligible,false);
 assert.equal(commissionPayoutEligibility({status:"success",fulfilled_at:"2026-11-20"}).eligible,true);
});
test("refunds, disputes and chargebacks hold commission payout",()=>{
 for(const kind of ["refund","dispute","chargeback"]){
  assert.equal(commissionPayoutEligibility({status:"success",fulfilled_at:"now"},[{kind,state:"pending"}]).eligible,false);
  assert.equal(commissionPayoutEligibility({status:"success",fulfilled_at:"now"},[{kind,state:"confirmed"}]).eligible,false);
 }
});
test("unrecognized and malformed provider events are ignored",()=>{
 assert.equal(adjustmentFromProviderEvent({event:"charge.success",data:{reference,id:1}}),null);
 assert.equal(adjustmentFromProviderEvent({event:"refund.processed",data:{reference:"wrong",id:1}}),null);
 assert.deepEqual(adjustmentFromProviderEvent({event:"refund.processed",data:{reference,id:42,amount:1000}}),{kind:"refund",reference,providerEvent:"refund.processed",providerReference:"42",amountKobo:1000});
});
