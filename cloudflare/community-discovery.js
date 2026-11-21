const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
export async function communityDetail(req,env){
 const slug=new URL(req.url).searchParams.get("slug")||"";
 if(!/^[a-z0-9-]{2,100}$/.test(slug))return json({error:"Invalid community"},400);
 try{
  const community=await env.DB.prepare("SELECT slug,name,country_code,state_name,city_name,district_name,neighborhood_name,latitude,longitude FROM communities WHERE slug=? AND verified=1").bind(slug).first();
  if(!community)return json({error:"Community not found"},404);
  return json({community});
 }catch{return json({error:"Community details unavailable"},503)}
}
export async function nearbyCommunities(req,env){
 const url=new URL(req.url),lat=Number(url.searchParams.get("lat")),lon=Number(url.searchParams.get("lon"));
 if(!url.searchParams.has("lat")||!url.searchParams.has("lon")||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return json({error:"Valid latitude and longitude required"},400);
 try{
  // Bounding-box search is index-friendly for future geospatial migration; distances are approximate.
  const delta=0.5,lower=Math.max(-90,lat-delta),upper=Math.min(90,lat+delta);
  const rows=await env.DB.prepare("SELECT slug,name,latitude,longitude,city_name,state_name FROM communities WHERE verified=1 AND latitude BETWEEN ? AND ? AND longitude IS NOT NULL ORDER BY ABS(latitude-?)+ABS(longitude-?) LIMIT 30").bind(lower,upper,lat,lon).all();
  const items=(rows.results||[]).filter(x=>Math.abs(x.longitude-lon)<=delta);
  return json({items});
 }catch{return json({error:"Nearby communities unavailable"},503)}
}
