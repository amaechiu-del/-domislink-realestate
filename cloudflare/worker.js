const json=(data,status=200,origin="")=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","access-control-allow-origin":origin,"vary":"Origin","cache-control":"no-store"}});
export default {async fetch(req,env){
 const url=new URL(req.url);const origin=req.headers.get("Origin")||"";const allowed=origin===env.APP_ORIGIN?origin:"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":allowed,"access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"Content-Type","vary":"Origin"}});
 if(url.pathname==="/api/health")return json({ok:true,service:"domislinker-marketplace"},200,allowed);
 if(url.pathname==="/api/listings"&&req.method==="GET"){
  const community=url.searchParams.get("community");
  const type=url.searchParams.get("type");
  if(type&&!["rent","sale","service","tenant"].includes(type))return json({error:"Invalid category"},400,allowed);
  let sql="SELECT l.id,l.title,l.location_label,l.price,l.type,l.status,c.slug AS community_slug FROM listings l JOIN communities c ON c.id=l.community_id WHERE l.status='published' AND (l.expires_at IS NULL OR l.expires_at > datetime('now'))";
  const args=[];if(community){sql+=" AND c.slug=?";args.push(community)}if(type){sql+=" AND l.type=?";args.push(type)}
  sql+=" ORDER BY l.created_at DESC LIMIT 50";
  try{const result=await env.DB.prepare(sql).bind(...args).all();return json({items:result.results||[]},200,allowed)}catch{return json({error:"Database unavailable"},503,allowed)}
 }
 return json({error:"Not found"},404,allowed);
}};