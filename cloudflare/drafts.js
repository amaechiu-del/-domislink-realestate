import {verifyOneLinkToken} from "./one-link-identity.js";
const json=(body,status=200,origin="")=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","access-control-allow-origin":origin,"vary":"Origin","cache-control":"no-store"}});
const types=new Set(["rent","sale","service","tenant"]);
export async function createDraft(req,env,origin){
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return json({error:"OneLink sign-in required"},401,origin);
 let identity;try{identity=await verifyOneLinkToken(bearer.slice(7),env)}catch{return json({error:"Invalid OneLink identity"},401,origin)}
 let b;try{b=await req.json()}catch{return json({error:"Invalid JSON"},400,origin)}
 if(!b||typeof b.title!=="string"||b.title.trim().length<8||b.title.length>140||!types.has(b.type)||typeof b.community_slug!=="string"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.community_slug)||typeof b.location_label!=="string"||b.location_label.trim().length<3||b.location_label.length>160||!Number.isSafeInteger(b.price)||b.price<0||b.price>1000000000000)return json({error:"Invalid listing fields"},400,origin);
 const community=await env.DB.prepare("SELECT id FROM communities WHERE slug=?").bind(b.community_slug).first();
 if(!community)return json({error:"Choose a verified community"},422,origin);
 const id=crypto.randomUUID();
 try{await env.DB.prepare("INSERT INTO listings(id,owner_id,community_id,title,location_label,price,type,status) VALUES(?,?,?,?,?,?,?,'draft')").bind(id,identity.subject,community.id,b.title.trim(),b.location_label.trim(),b.price,b.type).run()}
 catch{return json({error:"Unable to save draft"},503,origin)}
 return json({id,status:"draft",next:"/onelink/pricing?listing_id="+encodeURIComponent(id)},201,origin);
}
export async function listMyDrafts(req,env,origin){
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return json({error:"OneLink sign-in required"},401,origin);
 let identity;try{identity=await verifyOneLinkToken(bearer.slice(7),env)}catch{return json({error:"Invalid OneLink identity"},401,origin)}
 const r=await env.DB.prepare("SELECT id,title,price,type,status,created_at FROM listings WHERE owner_id=? ORDER BY created_at DESC LIMIT 50").bind(identity.subject).all();
 return json({items:r.results||[]},200,origin);
}
