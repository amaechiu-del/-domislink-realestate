import {NextRequest,NextResponse} from "next/server";
const api=process.env.DOMISLINKER_API_URL||"";
export async function POST(req:NextRequest){return forward(req,"POST")}
export async function PATCH(req:NextRequest){return forward(req,"PATCH")}
async function forward(req:NextRequest,method:"POST"|"PATCH"){
 const origin=req.headers.get("origin");if(!origin||origin!==req.nextUrl.origin)return NextResponse.json({error:"Invalid request origin"},{status:403});
 if(!api||!api.startsWith("https://"))return NextResponse.json({error:"Marketplace API not configured"},{status:503});
 const secret=process.env.ONELINK_SESSION_KEY,cookie=req.cookies.get("dlk_session")?.value;
 if(!secret||!/^[a-f0-9]{64}$/i.test(secret)||!cookie)return NextResponse.json({error:"Sign in with OneLink first"},{status:401});
 try{
  const bytes=Buffer.from(cookie,"base64url"),iv=bytes.subarray(0,12);
  const key=await crypto.subtle.importKey("raw",Buffer.from(secret,"hex"),"AES-GCM",false,["decrypt"]);
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,bytes.subarray(12));
  const session=JSON.parse(new TextDecoder().decode(plain));
  if(!session.token||session.expires<Date.now())throw Error("Expired session");
  const body=await req.text();if(body.length>16000)return NextResponse.json({error:"Payload too large"},{status:413});
  const upstream=await fetch(new URL("/api/listings/drafts",api),{method,headers:{"content-type":"application/json","authorization":"Bearer "+session.token},body,cache:"no-store"});
  return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Session expired; sign in again"},{status:401})}
}
