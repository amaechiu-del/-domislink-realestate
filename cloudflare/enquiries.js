import {verifyOneLinkToken} from "./one-link-identity.js";
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
async function identity(req,env){const token=(req.headers.get("authorization")||"").match(/^Bearer (.+)$/)?.[1];if(!token)throw Error("No session");return verifyOneLinkToken(token,env)}
export async function submitEnquiry(req,env){
 let user;try{user=await identity(req,env)}catch{return reply({error:"OneLink sign-in required"},401)}
 let body;try{body=await req.json()}catch{return reply({error:"Invalid JSON"},400)}
 const id=String(body?.listing_id||""),name=String(body?.name||"").trim(),email=String(body?.email||"").trim(),message=String(body?.message||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(id)||name.length<2||name.length>100||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||message.length>2000)return reply({error:"Invalid enquiry details"},400);
 if(body.website)return reply({received:true},202);
 try{
  const listing=await env.DB.prepare("SELECT l.id,l.owner_id FROM listings l WHERE l.id=? AND l.status='published' AND (l.expires_at IS NULL OR l.expires_at>datetime('now'))").bind(id).first();
  if(!listing)return reply({error:"Listing not available"},404);
  if(listing.owner_id===user.subject)return reply({error:"Cannot enquire about your own listing"},409);
  const recent=await env.DB.prepare("SELECT COUNT(*) AS n FROM listing_enquiries WHERE sender_subject=? AND created_at>datetime('now','-1 hour')").bind(user.subject).first();
  if(Number(recent?.n||0)>=3)return reply({error:"Enquiry limit reached. Try again later."},429);
  await env.DB.prepare("INSERT INTO listing_enquiries(id,listing_id,sender_subject,sender_name,sender_email,message) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(),id,user.subject,name,email.toLowerCase(),message).run();
  return reply({received:true},201);
 }catch{return reply({error:"Enquiries temporarily unavailable"},503)}
}
export async function myEnquiries(req,env){
 let user;try{user=await identity(req,env)}catch{return reply({error:"OneLink sign-in required"},401)}
 try{const result=await env.DB.prepare("SELECT e.id,e.listing_id,l.title,e.sender_name,e.sender_email,e.message,e.status,e.created_at FROM listing_enquiries e JOIN listings l ON l.id=e.listing_id WHERE l.owner_id=? ORDER BY e.created_at DESC LIMIT 100").bind(user.subject).all();return reply({items:result.results||[]})}
 catch{return reply({error:"Enquiries temporarily unavailable"},503)}
}
