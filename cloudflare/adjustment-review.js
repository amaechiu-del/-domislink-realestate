// Internal accounting operation only. Do not expose directly as a public API.
// Caller must separately authenticate an authorized finance reviewer and verify
// the adjustment's state/amount with Paystack through a trusted server channel.
export async function reviewFinancialAdjustment(db,input){
 const {adjustmentId,reviewerSubject,providerEvidenceReference,decision,providerVerifiedAt}=input||{};
 if(!/^[\w-]{1,128}$/.test(adjustmentId||"")||!/^[\w:.-]{1,255}$/.test(reviewerSubject||"")||!/^[\w:.-]{1,255}$/.test(providerEvidenceReference||"")||!["confirm","reject"].includes(decision)||!Number.isFinite(Date.parse(providerVerifiedAt)))throw Error("Invalid verified review evidence");
 const row=await db.prepare("SELECT a.*,p.amount_kobo AS payment_amount,p.status AS payment_status,p.fulfilled_at,c.agent_id,c.amount_kobo AS commission_amount FROM payment_adjustments a JOIN payments p ON p.id=a.payment_id LEFT JOIN commission_ledger c ON c.payment_id=p.id WHERE a.id=?").bind(adjustmentId).first();
 if(!row)throw Error("Adjustment not found");
 if(row.state!=="pending")throw Error("Adjustment already reviewed");
 if(decision==="confirm"&&(row.payment_status!=="success"||!row.fulfilled_at||row.amount_kobo>row.payment_amount||row.amount_kobo<=0))throw Error("Payment or adjustment amount requires reconciliation");
 const existing=await db.prepare("SELECT COALESCE(SUM(-amount_kobo),0) AS reversed FROM commission_adjustments WHERE payment_id=?").bind(row.payment_id).first();\n const remaining=Math.max(0,(row.commission_amount||0)-Number(existing?.reversed||0));\n const reversal=decision==="confirm"&&["refund","chargeback"].includes(row.kind)&&row.agent_id&&row.commission_amount?Math.min(remaining,Math.floor(row.commission_amount*row.amount_kobo/row.payment_amount)):0;
 const statements=[
  db.prepare("INSERT INTO adjustment_reviews(id,payment_adjustment_id,reviewer_subject,provider_verified_at,provider_evidence_reference,decision) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM payment_adjustments WHERE id=? AND state='pending')").bind(crypto.randomUUID(),adjustmentId,reviewerSubject,providerVerifiedAt,providerEvidenceReference,decision,adjustmentId),
  db.prepare("UPDATE payment_adjustments SET state=? WHERE id=? AND state='pending' AND EXISTS(SELECT 1 FROM adjustment_reviews WHERE payment_adjustment_id=?)").bind(decision==="confirm"?"confirmed":"rejected",adjustmentId,adjustmentId)
 ];
 if(reversal)statements.push(db.prepare("INSERT OR IGNORE INTO commission_adjustments(id,payment_adjustment_id,payment_id,agent_id,amount_kobo,reason) SELECT ?,a.id,a.payment_id,?, ?,a.kind FROM payment_adjustments a WHERE a.id=? AND a.state='confirmed'").bind(crypto.randomUUID(),row.agent_id,-reversal,adjustmentId));
 await db.batch(statements);
 return {adjustmentId,decision,reversal_kobo:reversal};
}
