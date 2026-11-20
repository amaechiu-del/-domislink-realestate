import {NextRequest,NextResponse} from "next/server";
export async function GET(req:NextRequest){
 const api=process.env.DOMISLINKER_API_URL||"";
 if(!api.startsWith("https://"))return NextResponse.json({error:"Marketplace not configured"},{status:503});
 const slug=req.nextUrl.searchParams.get("slug")||"";
 if(!/^[a-z0-9-]{2,100}$/.test(slug))return NextResponse.json({error:"Invalid community"}, {status:400});
 try{
  const url=new URL("/api/communities/detail",api);url.searchParams.set("slug",slug);
  const r=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(10000)});
  return new NextResponse(await r.text(),{status:r.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Community unavailable"},{status:503})}
}
