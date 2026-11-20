import {NextRequest,NextResponse} from "next/server";
const api=process.env.DOMISLINKER_API_URL||"";
export async function GET(req:NextRequest){
 if(!api.startsWith("https://"))return NextResponse.json({error:"Marketplace API not configured"},{status:503});
 const secret=process.env.ONELINK_SESSION_KEY,cookie=req.cookies.get("dlk_session")?.value;
 if(!secret||!/^[a-f0-9]{64}$/i.test(secret)||!cookie)return NextResponse.json({error:"Sign in with OneLink first"},{status:401});
 try{
  const bytes=Buffer.from(cookie,"base64url");
  if(bytes.length<29)throw Error("Invalid session");
  const key=await crypto.subtle.importKey("raw",Buffer.from(secret,"hex"),"AES-GCM",false,["decrypt"]);
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes.subarray(0,12)},key,bytes.subarray(12));
  const session=JSON.parse(new TextDecoder().decode(plain));
  if(typeof session.token!=="string"||!session.token||!Number.isFinite(session.expires)||session.expires<Date.now())throw Error("Expired session");
  const upstream=await fetch(new URL("/api/listings/mine",api),{headers:{authorization:"Bearer "+session.token},cache:"no-store"});
  return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Session expired; sign in again"},{status:401})}
}
