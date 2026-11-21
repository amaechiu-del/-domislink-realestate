import {NextRequest,NextResponse} from "next/server";
const issuer=process.env.ONELINK_ISSUER||"https://sso.domislink.com";
const origin=process.env.APP_ORIGIN||"";
const client=process.env.ONELINK_CLIENT_ID||"";
const decode=(s:string)=>JSON.parse(Buffer.from(s,"base64url").toString("utf8"));
async function verifyIdToken(token:string,nonce:string,jwksUrl:string){
 const parts=token.split(".");if(parts.length!==3)throw Error("Invalid ID token");
 const h=decode(parts[0]),p=decode(parts[1]),now=Math.floor(Date.now()/1000);
 if(h.alg!=="RS256"||!h.kid||p.iss!==issuer||!(Array.isArray(p.aud)?p.aud.includes(client):p.aud===client)||p.nonce!==nonce||!p.sub||typeof p.exp!=="number"||p.exp<=now||typeof p.iat!=="number"||p.iat>now+60||p.nbf&&p.nbf>now+60||p.azp&&p.azp!==client||Array.isArray(p.aud)&&p.aud.length>1&&p.azp!==client)throw Error("Invalid ID token claims");
 const keys=await fetch(jwksUrl,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("JWKS unavailable");return r.json()});
 const jwk=keys.keys?.find((k:{kid?:string;kty?:string})=>k.kid===h.kid&&k.kty==="RSA");
 if(!jwk)throw Error("Signing key unavailable");
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 if(!await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,Buffer.from(parts[2],"base64url"),new TextEncoder().encode(parts[0]+"."+parts[1])))throw Error("Invalid signature");
 return p.sub as string;
}
export async function GET(req:NextRequest){
 const response=NextResponse.redirect(new URL("/onelink/post-ad",origin||req.url));
 for(const name of ["dlk_oidc_state","dlk_oidc_verifier","dlk_oidc_nonce"])response.cookies.delete(name);
 try{
  if(!origin||new URL(origin).origin!==req.nextUrl.origin||!client)throw Error("Client not configured");
  const state=req.cookies.get("dlk_oidc_state")?.value,verifier=req.cookies.get("dlk_oidc_verifier")?.value,nonce=req.cookies.get("dlk_oidc_nonce")?.value;
  const code=req.nextUrl.searchParams.get("code");
  if(!state||!verifier||!nonce||!code||req.nextUrl.searchParams.get("state")!==state)throw Error("Invalid login state");
  const metadata=await fetch(issuer+"/.well-known/openid-configuration",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Discovery unavailable");return r.json()});
  if(metadata.issuer!==issuer||!metadata.token_endpoint?.startsWith(issuer+"/")||!metadata.jwks_uri?.startsWith(issuer+"/"))throw Error("Untrusted identity provider");
  const tokenResponse=await fetch(metadata.token_endpoint,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",code,client_id:client,redirect_uri:origin+"/api/onelink/callback",code_verifier:verifier}),cache:"no-store"});
  if(!tokenResponse.ok)throw Error("Token exchange failed");
  const tokens=await tokenResponse.json();
  if(typeof tokens.id_token!=="string"||typeof tokens.access_token!=="string")throw Error("Missing tokens");
  await verifyIdToken(tokens.id_token,nonce,metadata.jwks_uri);
  // Encrypt API access token with an independently configured 256-bit key.
  const secret=process.env.ONELINK_SESSION_KEY;
  if(!secret||!/^[a-f0-9]{64}$/i.test(secret))throw Error("Session encryption not configured");
  const key=await crypto.subtle.importKey("raw",Buffer.from(secret,"hex"),"AES-GCM",false,["encrypt"]);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify({token:tokens.access_token,expires:Date.now()+Math.min(Number(tokens.expires_in)||900,3600)*1000})));
  response.cookies.set("dlk_session",Buffer.concat([Buffer.from(iv),Buffer.from(ciphertext)]).toString("base64url"),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:Math.min(Number(tokens.expires_in)||900,3600)});
  return response;
 }catch{return NextResponse.redirect(new URL("/onelink/post-ad?auth=failed",origin||req.url))}
}
