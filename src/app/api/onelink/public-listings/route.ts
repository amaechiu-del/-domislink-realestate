import {NextRequest,NextResponse} from "next/server";
export async function GET(req:NextRequest){
 const api=process.env.DOMISLINKER_API_URL||"";
 if(!api.startsWith("https://"))return NextResponse.json({error:"Marketplace API not configured"},{status:503});
 const upstream=new URL("/api/listings",api);
 const type=req.nextUrl.searchParams.get("type");
 const community=req.nextUrl.searchParams.get("community");
 if(type){if(!["rent","sale","service","tenant"].includes(type))return NextResponse.json({error:"Invalid category"},{status:400});upstream.searchParams.set("type",type)}
 if(community){if(community.length>100||!/^[a-z0-9-]+$/i.test(community))return NextResponse.json({error:"Invalid community"},{status:400});upstream.searchParams.set("community",community)}
 try{
  const response=await fetch(upstream,{headers:{accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(10000)});
  const text=await response.text();
  return new NextResponse(text,{status:response.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Marketplace temporarily unavailable"},{status:503})}
}
