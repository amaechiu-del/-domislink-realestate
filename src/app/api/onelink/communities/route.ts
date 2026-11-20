import {NextRequest,NextResponse} from "next/server";
export async function GET(req:NextRequest){
 const api=process.env.DOMISLINKER_API_URL||"";
 if(!api.startsWith("https://"))return NextResponse.json({error:"Marketplace API not configured"},{status:503});
 const q=(req.nextUrl.searchParams.get("q")||"").trim().slice(0,60);
 const upstream=new URL("/api/communities",api);upstream.searchParams.set("q",q);
 try{
  const response=await fetch(upstream,{headers:{accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(10000)});
  return new NextResponse(await response.text(),{status:response.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Community discovery temporarily unavailable"},{status:503})}
}
