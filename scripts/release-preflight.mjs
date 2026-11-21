import {readFileSync,existsSync} from "node:fs";
const errors=[],warnings=[];
const read=p=>readFileSync(p,"utf8");
const config=JSON.parse(read("cloudflare/wrangler.jsonc"));
if(!config.d1_databases?.some(d=>d.binding==="DB"))errors.push("Missing D1 DB binding");
if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(config.d1_databases?.find(d=>d.binding==="DB")?.database_id||""))warnings.push("D1 database ID placeholder: cannot deploy remotely");
if(config.vars?.ONELINK_ISSUER!=="https://sso.domislink.com")warnings.push("Verify OneLink issuer");
for(const p of ["cloudflare/schema.sql","cloudflare/d1-release-preflight.sql","cloudflare/migrations/0002_payment_fulfillment.sql","cloudflare/migrations/0003_payment_reservations_adjustments.sql","cloudflare/migrations/0004_commission_adjustments.sql","cloudflare/migrations/0005_adjustment_reviews.sql","cloudflare/migrations/0006_listing_renewals.sql","cloudflare/migrations/0007_community_discovery_enquiries.sql","cloudflare/migrations/0008_whatsapp_voice_gateway.sql","cloudflare/migrations/0009_whatsapp_voice_processing.sql","cloudflare/migrations/0010_whatsapp_voice_jobs.sql","cloudflare/migrations/0011_whatsapp_agent_command.sql","cloudflare/migrations/0012_whatsapp_outbound_controls.sql"]){if(!existsSync(p))errors.push("Missing "+p)}
for(const t of ["communities","listings","agents","payments","commission_ledger"]){if(!new RegExp("CREATE TABLE IF NOT EXISTS "+t+"\\b","i").test(read("cloudflare/schema.sql")))errors.push("Missing table "+t)}
if(!existsSync("package-lock.json"))warnings.push("Missing npm lockfile");
const deploy=process.argv.includes("--deploy");
const dbid=config.d1_databases?.find(d=>d.binding==="DB")?.database_id||"";
if(deploy&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbid))errors.push("Deployment blocked: real D1 database UUID required");
if(deploy&&!config.vars?.APP_ORIGIN?.startsWith("https://"))errors.push("Deployment blocked: HTTPS APP_ORIGIN required");
if(deploy&&!process.env.CLOUDFLARE_API_TOKEN)errors.push("Deployment blocked: CLOUDFLARE_API_TOKEN required");
console.log(JSON.stringify({result:errors.length?"FAIL":deploy?"PASS_DEPLOY_CONFIG":"PASS_WITH_EXTERNAL_GATES",errors,warnings,external_gates:["D1 remote migration","OneLink live login","Paystack sandbox payment and webhook"]},null,2));
if(errors.length)process.exitCode=1;
