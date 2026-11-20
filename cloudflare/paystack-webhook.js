import {adjustmentFromProviderEvent} from "./financial-controls.js";
// Paystack's x-paystack-signature is an HMAC-SHA512 hex digest of raw request bytes.
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,"0")).join("");
export async function validPaystackSignature(raw,signature,secret){
 if(!secret||!signature||!/^[a-f0-9]{128}$/i.test(signature))return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-512"},false,["sign"]);
 const actual=hex(await crypto.subtle.sign("HMAC",key,raw));
 let mismatch=0;for(let i=0;i<128;i++)mismatch|=actual.charCodeAt(i)^signature.toLowerCase().charCodeAt(i);
 return mismatch===0;
}
export async function paystackWebhook(req,env){
 if(!env.PAYSTACK_SECRET_KEY)return new Response("Service unavailable",{status:503});
 const raw=await req.arrayBuffer();
 if(raw.byteLength>65536)return new Response("Payload too large",{status:413});
 if(!await validPaystackSignature(raw,req.headers.get("x-paystack-signature"),env.PAYSTACK_SECRET_KEY))return new Response("Unauthorized",{status:401});
 let event;try{event=JSON.parse(new TextDecoder().decode(raw))}catch{return new Response("Bad payload",{status:400})}
 const adjustment=adjustmentFromProviderEvent(event);
 if(adjustment){
  const payment=await env.DB.prepare("SELECT id,amount_kobo FROM payments WHERE reference=?").bind(adjustment.reference).first();
  if(!payment)return new Response("Acknowledged: unmatched adjustment",{status:200});
  // Signed events are evidence for a payout hold, not authority to issue a refund.
  // A zero/unknown amount is preserved for manual reconciliation.
  try{
   await env.DB.prepare("INSERT OR IGNORE INTO payment_adjustments(id,payment_id,provider_event,provider_reference,kind,state,amount_kobo) VALUES(?,?,?,?,?,'pending',?)").bind(crypto.randomUUID(),payment.id,adjustment.providerEvent,adjustment.providerReference,adjustment.kind,adjustment.amountKobo).run();
  }catch{return new Response("Adjustment persistence unavailable",{status:503})}
  return new Response("Adjustment recorded for financial review",{status:200});
 }
 if(event?.event!=="charge.success")return new Response("Acknowledged",{status:200});
 const reference=event?.data?.reference;
 if(typeof reference!=="string"||!/^dlk_[a-f0-9]{32}$/.test(reference))return new Response("Acknowledged",{status:200});
 // Never trust the webhook amount or status alone. Re-query Paystack.
 let verified;
 try{
  const r=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{authorization:"Bearer "+env.PAYSTACK_SECRET_KEY}});
  const result=await r.json();
  if(!r.ok||!result.status)throw Error("Provider unavailable");
  verified=result.data;
 }catch{return new Response("Retry later",{status:503})}
 const p=await env.DB.prepare("SELECT id,listing_id,reference,amount_kobo,duration_days,agent_id,fulfilled_at FROM payments WHERE reference=?").bind(reference).first();
 if(!p)return new Response("Acknowledged",{status:200});
 if(verified?.status!=="success"||verified.reference!==p.reference||verified.currency!=="NGN"||Number(verified.amount)!==p.amount_kobo)return new Response("Payment mismatch",{status:409});
 if(p.fulfilled_at)return new Response("Acknowledged",{status:200});
 try{
  await env.DB.batch([
   env.DB.prepare("UPDATE payments SET status='success' WHERE id=? AND status='pending'").bind(p.id),
   env.DB.prepare("UPDATE listings SET status='published',payment_reference=?,expires_at=datetime('now', '+' || ? || ' days') WHERE id=? AND status='draft' AND EXISTS(SELECT 1 FROM payments WHERE id=? AND status='success')").bind(p.reference,p.duration_days,p.listing_id,p.id),
   env.DB.prepare("UPDATE payments SET fulfilled_at=CURRENT_TIMESTAMP WHERE id=? AND fulfilled_at IS NULL AND EXISTS(SELECT 1 FROM listings WHERE id=? AND payment_reference=? AND status='published')").bind(p.id,p.listing_id,p.reference),
   env.DB.prepare("INSERT OR IGNORE INTO commission_ledger(id,payment_id,agent_id,amount_kobo) SELECT ?,p.id,p.agent_id,CAST(p.amount_kobo*30/100 AS INTEGER) FROM payments p JOIN listings l ON l.id=p.listing_id WHERE p.id=? AND p.status='success' AND p.fulfilled_at IS NOT NULL AND p.agent_id IS NOT NULL AND l.payment_reference=p.reference").bind(crypto.randomUUID(),p.id)
  ]);
 }catch{return new Response("Retry later",{status:503})}
 const after=await env.DB.prepare("SELECT fulfilled_at FROM payments WHERE id=?").bind(p.id).first();
 // If a second successful payment was made for the same listing, flag for reconciliation.
 if(!after?.fulfilled_at)return new Response("Acknowledged: manual reconciliation required",{status:200});
 return new Response("Acknowledged",{status:200});
}
