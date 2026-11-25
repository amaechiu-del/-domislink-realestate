// Conservative financial controls: a payment is not eligible for commission payout
// while a provider refund, chargeback or dispute is open or confirmed.
export function commissionPayoutEligibility(payment,adjustments=[]){
 if(!payment||payment.status!=="success"||!payment.fulfilled_at)return {eligible:false,reason:"Payment not fulfilled"};
 if(adjustments.some(a=>["refund","chargeback","dispute"].includes(a.kind)&&["pending","confirmed"].includes(a.state)))return {eligible:false,reason:"Financial adjustment requires review"};
 return {eligible:true,reason:"No recorded adjustment"};
}
export function adjustmentFromProviderEvent(event){
 const kind=event?.event==="refund.processed"?"refund":event?.event==="chargeback.create"?"chargeback":event?.event==="dispute.create"?"dispute":null;
 if(!kind)return null;
 const data=event.data||{};
 const reference=data.transaction?.reference||data.reference;
 if(typeof reference!=="string"||!/^dlk_[a-f0-9]{32}$/.test(reference))return null;
 const providerReference=String(data.id||"");
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(providerReference))return null;
 return {kind,reference,providerEvent:event.event,providerReference,amountKobo:Number.isSafeInteger(data.amount)&&data.amount>=0?data.amount:0};
}
