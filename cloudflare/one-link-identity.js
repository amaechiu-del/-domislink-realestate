// Server-side OneLink OIDC verification; no trust in unsigned identity headers.
// Requires an issuer JWKS and audience configured in Worker secrets/vars.
const decode=b=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0))));
export async function verifyOneLinkToken(token,env){
 if(!token||token.split(".").length!==3)throw new Error("Missing bearer token");
 const [header,payload,signature]=token.split(".");
 const h=decode(header),p=decode(payload);
 if(h.alg!=="RS256"||!h.kid)throw new Error("Unsupported token algorithm");
 if(!env.ONELINK_ISSUER||!env.ONELINK_AUDIENCE||p.iss!==env.ONELINK_ISSUER||!(typeof p.aud==="string"?p.aud===env.ONELINK_AUDIENCE:Array.isArray(p.aud)&&p.aud.includes(env.ONELINK_AUDIENCE))||!p.sub||typeof p.exp!=="number"||p.exp<=Date.now()/1000||typeof p.nbf==="number"&&p.nbf>Date.now()/1000+60||typeof p.iat!=="number"||p.iat>Date.now()/1000+60)throw new Error("Invalid token claims");
 const jwksUrl=env.ONELINK_JWKS_URL||env.ONELINK_ISSUER.replace(/\/$/,"")+"/.well-known/jwks.json";
 const u=new URL(jwksUrl);if(u.protocol!=="https:"||u.origin!==new URL(env.ONELINK_ISSUER).origin)throw new Error("Invalid JWKS origin");
 const res=await fetch(u.toString());if(!res.ok)throw new Error("Identity keys unavailable");
 const {keys}=await res.json();const key=keys.find(k=>k.kid===h.kid&&k.kty==="RSA"&&(!k.alg||k.alg==="RS256")&&(!k.use||k.use==="sig"));
 if(!key)throw new Error("Unknown signing key");
 const publicKey=await crypto.subtle.importKey("jwk",key,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 const sig=Uint8Array.from(atob(signature.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
 if(!await crypto.subtle.verify("RSASSA-PKCS1-v1_5",publicKey,sig,new TextEncoder().encode(header+"."+payload)))throw new Error("Invalid signature");
 return {subject:p.sub,claims:p};
}
