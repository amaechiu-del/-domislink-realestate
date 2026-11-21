import {NextRequest,NextResponse} from "next/server";
const endpoints={"initialize":"/api/payments/initialize","verify":"/api/payments/verify","reconcile":"/api/payments/reconcile"} as const;
export async function POST(req:NextRequest,context:{params:Promise<{action:string}>}){
 const {action}=await context.params;
 if(!(action in endpoints))return NextResponse.json({error:"Unknown action"},{status:404});
 if(req.headers.get("origin")!==req.nextUrl.origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 const api=process.env.DOMISLINKER_API_URL||"",secret=process.env.ONELINK_SESSION_KEY||"",cookie=req.cookies.get("dlk_session")?.value;
 if(!api.startsWith("https://")||!/^[a-f0-9]{64}$/i.test(secret))return NextResponse.json({error:"Payment gateway not configured"},{status:503});
 if(!cookie)return NextResponse.json({error:"OneLink sign-in required"},{status:401});
 try{
  const bytes=Buffer.from(cookie,"base64url");if(bytes.length<29)throw Error("Invalid session");
  const key=await crypto.subtle.importKey("raw",Buffer.from(secret,"hex"),"AES-GCM",false,["decrypt"]);
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes.subarray(0,12)},key,bytes.subarray(12));
  const session=JSON.parse(new TextDecoder().decode(plain));
  if(typeof session.token!=="string"||!Number.isFinite(session.expires)||session.expires<Date.now())throw Error("Session expired");
  const body=await req.text();if(body.length>4096)return NextResponse.json({error:"Payload too large"},{status:413});
  const upstream=await fetch(new URL(endpoints[action as keyof typeof endpoints],api),{method:"POST",headers:{"authorization":"Bearer "+session.token,"content-type":"application/json"},body,cache:"no-store"});
  return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Session invalid or expired; sign in again"},{status:401})}
}
