import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const files=["schema.sql","migrations/0002_payment_fulfillment.sql","migrations/0003_payment_reservations_adjustments.sql","migrations/0004_commission_adjustments.sql","migrations/0005_adjustment_reviews.sql","migrations/0006_listing_renewals.sql","migrations/0007_community_discovery_enquiries.sql","migrations/0008_whatsapp_voice_gateway.sql","migrations/0009_whatsapp_voice_processing.sql","migrations/0010_whatsapp_voice_jobs.sql","migrations/0011_whatsapp_agent_command.sql"];
const args=process.argv.slice(2),apply=args.includes("--apply"),remote=args.includes("--remote");
if(apply&&!remote){console.error("Refusing mutation without --remote");process.exit(2)}
const config=JSON.parse(readFileSync("cloudflare/wrangler.jsonc","utf8"));
const database=config.d1_databases?.find(d=>d.binding==="DB");
if(!database||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(database.database_id||"")){
 console.error("A real D1 database UUID is required even for the remote migration plan");process.exit(2);
}
console.log("Database:",database.database_name,"("+database.database_id+")");
console.log("Plan:",files.join(" -> "));
if(!apply){console.log("DRY RUN ONLY. To execute on a newly created EMPTY remote D1 database: node scripts/d1-bootstrap.mjs --remote --apply");process.exit(0)}
if(process.env.DOMISLINKER_CONFIRM_EMPTY_DB!==database.database_name){console.error("Set DOMISLINKER_CONFIRM_EMPTY_DB to the exact database name after verifying it is empty");process.exit(2)}
if(!process.env.CLOUDFLARE_API_TOKEN||!process.env.CLOUDFLARE_ACCOUNT_ID){console.error("Cloudflare API token and account ID required");process.exit(2)}
// Guard against running non-idempotent ALTER TABLE migrations twice.
// A partially migrated database requires manual recovery; never blindly resume.
const inspect=spawnSync("npx",["--yes","wrangler@4","d1","execute",database.database_name,"--remote","--command","SELECT name FROM sqlite_master WHERE type='table' AND name IN ('communities','listings','payments','commission_ledger','payment_adjustments','commission_adjustments','adjustment_reviews')","--json","--config","cloudflare/wrangler.jsonc"],{encoding:"utf8",stdio:["ignore","pipe","pipe"],shell:process.platform==="win32"});
if(inspect.status!==0){console.error(inspect.stderr);process.exit(1)}
let rows;try{const response=JSON.parse(inspect.stdout);rows=Array.isArray(response)?response.flatMap(x=>x.results||[]):response.results||[]}catch{console.error("Unable to verify database emptiness");process.exit(1)}
if(rows.length){console.error("Refusing bootstrap: existing marketplace tables detected. Use a reviewed migration plan.");process.exit(2)}
for(const file of files){
 console.log("Applying:",file);
 const run=spawnSync("npx",["--yes","wrangler@4","d1","execute",database.database_name,"--remote","--file","cloudflare/"+file,"--config","cloudflare/wrangler.jsonc"],{stdio:"inherit",shell:process.platform==="win32"});
 if(run.status!==0){console.error("STOP: migration failed at "+file+". Database may be partially initialized; inspect before retrying.");process.exit(1)}
}
console.log("Fresh D1 bootstrap completed. Verify /api/ready and payment sandbox acceptance.");
