// Read-only post-deployment smoke test. No charges, writes or credentials.
const base=(process.env.DOMISLINKER_WORKER_HEALTH_URL||process.argv[2]||"").replace(/\/$/,"");
if(!/^https:\/\/[^/]+/.test(base)){console.error("Provide an HTTPS Worker origin");process.exit(2)}
const checks=[
 ["/api/health",200,data=>data.ok===true],
 ["/api/ready",200,data=>data.ready===true],
 ["/api/auth/readiness",200,data=>typeof data.ready==="boolean"],
 ["/api/listings",200,data=>Array.isArray(data.items)],
 ["/api/communities?q=Lagos",200,data=>Array.isArray(data.items)],
 ["/api/payments/status?reference=dlk_"+"a".repeat(32),401,data=>!!data.error]
];
let failed=0;
for(const [path,expected,validate] of checks){
 try{
  const r=await fetch(new URL(path,base),{headers:{accept:"application/json"},signal:AbortSignal.timeout(12000)});
  const data=await r.json();
  const pass=r.status===expected&&validate(data);
  console.log((pass?"PASS ":"FAIL ")+path+" HTTP "+r.status);
  if(!pass)failed++;
 }catch(e){failed++;console.error("FAIL "+path+": "+(e?.message||e))}
}
if(failed){console.error(failed+" smoke checks failed");process.exitCode=1}
else console.log("Read-only Worker smoke checks passed. OneLink login and Paystack sandbox still require separate acceptance.");
