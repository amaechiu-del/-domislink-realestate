import {NextRequest,NextResponse} from "next/server";
const issuer=process.env.ONELINK_ISSUER||"https://sso.domislink.com";
const client=process.env.ONELINK_CLIENT_ID||"";
const origin=process.env.APP_ORIGIN||"";
const b64=(bytes:Uint8Array)=>Buffer.from(bytes).toString("base64url");
export async function GET(req:NextRequest){
 if(!client||!origin||new URL(origin).origin!==req.nextUrl.origin)return NextResponse.json({error:"OneLink client or app origin not configured"},{status:503});
 const metadataResponse=await fetch(issuer+"/.well-known/openid-configuration",{cache:"no-store"});
 if(!metadataResponse.ok)return NextResponse.json({error:"OneLink discovery unavailable"},{status:503});
 const metadata=await metadataResponse.json();
 if(metadata.issuer!==issuer||!metadata.authorization_endpoint?.startsWith(issuer+"/")||!metadata.code_challenge_methods_supported?.includes("S256"))return NextResponse.json({error:"OneLink PKCE discovery mismatch"},{status:503});
 const state=b64(crypto.getRandomValues(new Uint8Array(32))),verifier=b64(crypto.getRandomValues(new Uint8Array(32))),nonce=b64(crypto.getRandomValues(new Uint8Array(32)));
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier));
 const redirect=new URL(metadata.authorization_endpoint);
 for(const [k,v] of Object.entries({response_type:"code",client_id:client,redirect_uri:origin+"/api/onelink/callback",scope:"openid profile email",state,nonce,code_challenge:b64(new Uint8Array(digest)),code_challenge_method:"S256"}))redirect.searchParams.set(k,v);
 const response=NextResponse.redirect(redirect);
 const options={httpOnly:true,secure:true,sameSite:"lax" as const,path:"/",maxAge:600};
 response.cookies.set("dlk_oidc_state",state,options);response.cookies.set("dlk_oidc_verifier",verifier,options);response.cookies.set("dlk_oidc_nonce",nonce,options);
 return response;
}
