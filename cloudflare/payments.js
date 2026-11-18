import {quote} from "./pricing.js";
import {verifyOneLinkToken} from "./one-link-identity.js";
const respond=(body,status=200,origin="")=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","access-control-allow-origin":origin,"vary":"Origin","cache-control":"no-store"}});
const auth=async(req,env)=>{const h=req.headers.get("authorization")||"";if(!h.startsWith("Bearer "))throw Error("Authentication required");return verifyOneLinkToken(h.slice(7),env)};
const paystack=async(path,env,init={})=>{if(!env.PAYSTACK_SECRET_KEY)throw Error("Paystack is not configured");const r=await fetch("https://api.paystack.co"+path,{...init,headers:{"authorization":"Bearer "+env.PAYSTACK_SECRET_KEY,"content-type":"application/json",...(init.headers||{})}});const data=await r.json();if(!r.ok||!data.status)throw Error("Payment provider error");return data.data};
export async function initializeCheckout(req,env,origin){
 let identity;try{identity=await auth(req,env)}catch{return respond({error:"Valid OneLink sign-in required"},401,origin)}
 let b;try{b=await req.json()}catch{return respond({error:"Invalid JSON"},400,origin)}
 if(!b||typeof b.listing_id!=="string"||typeof b.email!=="string"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return respond({error:"Listing ID and email required"},400,origin);
 const listing=await env.DB.prepare("SELECT id,owner_id,type,status FROM listings WHERE id=?").bind(b.listing_id).first();
 if(!listing||listing.owner_id!==identity.subject)return respond({error:"Listing not found"},404,origin);
 if(listing.status!=="draft")return respond({error:"Listing not eligible for checkout"},409,origin);
 let price;try{price=quote({type:listing.type,days:b.days??45,featured:b.featured??false})}catch(e){return respond({error:e.message},400,origin)}
 const reference="dlk_"+crypto.randomUUID().replace(/-/g,"");
 const agent=b.referral_code?await env.DB.prepare("SELECT id FROM agents WHERE referral_code=?").bind(b.referral_code).first():null;
 // Persist pending state before invoking provider, so no client-controlled amount is accepted.
 const insert=await env.DB.prepare("INSERT INTO payments(id,reference,listing_id,agent_id,amount_kobo,status,duration_days,featured) VALUES(?,?,?,?,?,'pending',?,?)").bind(crypto.randomUUID(),reference,listing.id,agent?.id||null,price.total_kobo,price.days,price.featured?1:0).run();
 if(!insert.success)return respond({error:"Payment initialization failed"},503,origin);
 try{const data=await paystack("/transaction/initialize",env,{method:"POST",body:JSON.stringify({email:b.email,amount:price.total_kobo,currency:"NGN",reference,metadata:{listing_id:listing.id}})});
 return respond({reference,authorization_url:data.authorization_url,amount_kobo:price.total_kobo},200,origin)}
 catch{return respond({error:"Payment gateway unavailable; no charge confirmed"},502,origin)}
}
export async function verifyCheckout(req,env,origin){
 let identity;try{identity=await auth(req,env)}catch{return respond({error:"Authentication required"},401,origin)}
 let b;try{b=await req.json()}catch{return respond({error:"Invalid JSON"},400,origin)}
 if(typeof b?.reference!=="string"||!/^dlk_[a-f0-9]{32}$/.test(b.reference))return respond({error:"Invalid reference"},400,origin);
 const p=await env.DB.prepare("SELECT p.*,l.owner_id,l.type,l.status AS listing_status FROM payments p JOIN listings l ON l.id=p.listing_id WHERE p.reference=?").bind(b.reference).first();
 if(!p||p.owner_id!==identity.subject)return respond({error:"Payment not found"},404,origin);
 if(p.status==="success"&&p.fulfilled_at)return respond({verified:true,published:true,already_processed:true},200,origin);
 let remote;try{remote=await paystack("/transaction/verify/"+encodeURIComponent(b.reference),env)}catch{return respond({error:"Verification temporarily unavailable"},502,origin)}
 if(remote.status!=="success"||remote.reference!==p.reference||remote.currency!=="NGN"||Number(remote.amount)!==p.amount_kobo)return respond({verified:false,error:"Payment not confirmed"},409,origin);
 // D1 batch executes atomically. A successful payment is published only when its
 // listing remains draft. Commission is derived from the verified payment record.
 const commands=[
  env.DB.prepare("UPDATE payments SET status='success' WHERE id=? AND status='pending'").bind(p.id),
  env.DB.prepare("UPDATE listings SET status='published',payment_reference=?,expires_at=datetime('now', '+' || ? || ' days') WHERE id=? AND status='draft' AND EXISTS (SELECT 1 FROM payments WHERE id=? AND status='success')").bind(p.reference,p.duration_days,p.listing_id,p.id),
  env.DB.prepare("UPDATE payments SET fulfilled_at=CURRENT_TIMESTAMP WHERE id=? AND fulfilled_at IS NULL AND EXISTS (SELECT 1 FROM listings WHERE id=? AND payment_reference=? AND status='published')").bind(p.id,p.listing_id,p.reference),
  env.DB.prepare("INSERT OR IGNORE INTO commission_ledger(id,payment_id,agent_id,amount_kobo) SELECT ?,p.id,p.agent_id,CAST(p.amount_kobo*30/100 AS INTEGER) FROM payments p JOIN listings l ON l.id=p.listing_id WHERE p.id=? AND p.status='success' AND p.fulfilled_at IS NOT NULL AND p.agent_id IS NOT NULL AND l.payment_reference=p.reference").bind(crypto.randomUUID(),p.id)
 ];
 try{await env.DB.batch(commands)}catch{return respond({verified:true,publication_pending_review:true,error:"Fulfillment requires reconciliation"},503,origin)}
 const after=await env.DB.prepare("SELECT p.fulfilled_at,l.status,l.payment_reference FROM payments p JOIN listings l ON l.id=p.listing_id WHERE p.id=?").bind(p.id).first();
 const published=!!after?.fulfilled_at&&after.status==="published"&&after.payment_reference===p.reference;
 return respond({verified:true,published,publication_pending_review:!published},200,origin);
}
