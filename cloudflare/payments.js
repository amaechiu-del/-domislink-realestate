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
 const insert=await env.DB.prepare("INSERT INTO payments(id,reference,listing_id,agent_id,amount_kobo,status) VALUES(?,?,?,?,?,'pending')").bind(crypto.randomUUID(),reference,listing.id,agent?.id||null,price.total_kobo).run();
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
 if(p.status==="success")return respond({verified:true,already_processed:true},200,origin);
 let remote;try{remote=await paystack("/transaction/verify/"+encodeURIComponent(b.reference),env)}catch{return respond({error:"Verification temporarily unavailable"},502,origin)}
 if(remote.status!=="success"||remote.reference!==p.reference||remote.currency!=="NGN"||Number(remote.amount)!==p.amount_kobo)return respond({verified:false,error:"Payment not confirmed"},409,origin);
 // Payment verification does not publish: fulfillment must be a separately audited, idempotent transaction.
 await env.DB.prepare("UPDATE payments SET status='success' WHERE id=? AND status='pending'").bind(p.id).run();
 return respond({verified:true,publication_pending_review:true},200,origin);
}
