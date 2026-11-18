import { quote } from "./pricing.js";
import { verifyOneLinkToken } from "./one-link-identity.js";
const json=(data,status=200,origin="")=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","access-control-allow-origin":origin,"vary":"Origin","cache-control":"no-store"}});
export default {async fetch(req,env){
 const url=new URL(req.url),origin=req.headers.get("Origin")||"",allowed=origin===env.APP_ORIGIN?origin:"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":allowed,"access-control-allow-methods":"GET, POST, OPTIONS","access-control-allow-headers":"Content-Type, Authorization","vary":"Origin"}});
 if(url.pathname==="/api/health"&&req.method==="GET")return json({ok:true,service:"domislinker-marketplace"},200,allowed);
 if(url.pathname==="/api/pricing/quote"&&req.method==="POST"){
  let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400,allowed)}
  try{return json({quote:quote({type:body.type,days:body.days??45,featured:body.featured??false}),status:"estimate_only",checkout_enabled:false},200,allowed)}
  catch(e){return json({error:e.message},400,allowed)}
 }
 if(url.pathname==="/api/me"&&req.method==="GET"){
  const auth=req.headers.get("Authorization")||"";
  if(!auth.startsWith("Bearer "))return json({error:"Authentication required"},401,allowed);
  if(!env.ONELINK_AUDIENCE||!env.ONELINK_ISSUER)return json({error:"Identity service not configured"},503,allowed);
  try{const identity=await verifyOneLinkToken(auth.slice(7),env);return json({subject:identity.subject,issuer:env.ONELINK_ISSUER},200,allowed)}
  catch{return json({error:"Invalid or expired credentials"},401,allowed)}
 }
 if(url.pathname==="/api/listings"&&req.method==="GET"){
  const community=url.searchParams.get("community"),type=url.searchParams.get("type");
  if(type&&!["rent","sale","service","tenant"].includes(type))return json({error:"Invalid category"},400,allowed);
  let sql="SELECT l.id,l.title,l.location_label,l.price,l.type,l.status,c.slug AS community_slug FROM listings l JOIN communities c ON c.id=l.community_id WHERE l.status='published' AND (l.expires_at IS NULL OR l.expires_at > datetime('now'))";
  const args=[];if(community){sql+=" AND c.slug=?";args.push(community)}if(type){sql+=" AND l.type=?";args.push(type)}
  sql+=" ORDER BY l.created_at DESC LIMIT 50";
  try{const result=await env.DB.prepare(sql).bind(...args).all();return json({items:result.results||[]},200,allowed)}catch{return json({error:"Database unavailable"},503,allowed)}
 }
 if(req.method==="POST"&&url.pathname==="/api/listings")return json({error:"Paid publication is not yet enabled"},403,allowed);
 return json({error:"Not found"},404,allowed);
}};