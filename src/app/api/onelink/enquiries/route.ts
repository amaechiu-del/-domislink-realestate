import {NextRequest,NextResponse} from "next/server";
async function forward(req:NextRequest,method:"GET"|"POST"){
 const api=process.env.DOMISLINKER_API_URL||"",secret=process.env.ONELINK_SESSION_KEY||"",cookie=req.cookies.get("dlk_session")?.value;
 if(!api.startsWith("https://")||!/^[a-f0-9]{64}$/i.test(secret))return NextResponse.json({error:"Enquiry service not configured"},{status:503});
 if(!cookie)return NextResponse.json({error:"Sign in with OneLink to contact advertisers"},{status:401});
 try{
  const bytes=Buffer.from(cookie,"base64url");if(bytes.length<29)throw Error("Invalid session");
  const key=await crypto.subtle.importKey("raw",Buffer.from(secret,"hex"),"AES-GCM",false,["decrypt"]);
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes.subarray(0,12)},key,bytes.subarray(12));
  const session=JSON.parse(new TextDecoder().decode(plain));
  if(typeof session.token!=="string"||!Number.isFinite(session.expires)||session.expires<Date.now())return NextResponse.json({error:"Session expired"},{status:401});
  const body=method==="POST"?await req.text():undefined;
  if(body&&body.length>5000)return NextResponse.json({error:"Enquiry too large"},{status:413});
  const url=new URL(method==="GET"?"/api/enquiries/mine":"/api/enquiries",api);
  const response=await fetch(url,{method,headers:{"authorization":"Bearer "+session.token,...(body?{"content-type":"application/json"}:{})},body,cache:"no-store",signal:AbortSignal.timeout(10000)});
  return new NextResponse(await response.text(),{status:response.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
 }catch{return NextResponse.json({error:"Enquiry service temporarily unavailable"},{status:503})}
}
export async function GET(req:NextRequest){return forward(req,"GET")}
export async function POST(req:NextRequest){if(req.headers.get("origin")!==req.nextUrl.origin)return NextResponse.json({error:"Invalid origin"},{status:403});return forward(req,"POST")}
