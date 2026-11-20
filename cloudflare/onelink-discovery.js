// Inspect OneLink's actual public OIDC discovery document without assuming endpoints.
export async function inspectOneLink(env){
 const issuer=env.ONELINK_ISSUER;
 if(!issuer)return {configured:false,reason:"Issuer not configured"};
 let base;
 try{base=new URL(issuer);if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash)throw Error("Invalid issuer")}
 catch{return {configured:false,reason:"Invalid issuer"}}
 const url=new URL("/.well-known/openid-configuration",base);
 try{
  const response=await fetch(url.toString(),{redirect:"manual",signal:AbortSignal.timeout(7000)});
  if(!response.ok)return {configured:false,reason:"Discovery unavailable"};
  const data=await response.json();
  const required=["authorization_endpoint","token_endpoint","jwks_uri"];
  if(data.issuer!==issuer||required.some(k=>typeof data[k]!=="string"||!data[k].startsWith(base.origin+"/")))return {configured:false,reason:"Discovery contract mismatch"};
  return {configured:true,issuer,authorization_endpoint:data.authorization_endpoint,token_endpoint:data.token_endpoint,jwks_uri:data.jwks_uri,pkce_s256_supported:Array.isArray(data.code_challenge_methods_supported)&&data.code_challenge_methods_supported.includes("S256")};
 }catch{return {configured:false,reason:"Discovery unavailable"}}
}
