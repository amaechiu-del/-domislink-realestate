// Cloudflare Cron: bounded, opt-in processing. No outbound messages are sent.
import {enqueueVoiceJobs,drainVoiceJobs} from "./voice-jobs.js";
export async function runVoiceSchedule(env,log=console){
 if(env.VOICE_CRON_ENABLED!=="true")return {enabled:false};
 if(!env.VOICE_PROCESSOR_TOKEN||!env.DB){log.warn("Voice cron disabled: required configuration missing");return {enabled:false,reason:"configuration"}}
 const auth={"authorization":"Bearer "+env.VOICE_PROCESSOR_TOKEN};
 const enqueue=await enqueueVoiceJobs(new Request("https://internal.invalid/api/voice/jobs/enqueue",{method:"POST",headers:auth}),env);
 if(!enqueue.ok)throw Error("Voice enqueue failed: "+enqueue.status);
 const result={enabled:true,queued:(await enqueue.json()).queued,drained:0,failures:0};
 const max=Math.min(5,Math.max(1,Number(env.VOICE_CRON_BATCH_SIZE)||3));
 for(let i=0;i<max;i++){
  const r=await drainVoiceJobs(new Request("https://internal.invalid/api/voice/jobs/drain",{method:"POST",headers:auth}),env);
  if(!r.ok)throw Error("Voice drain failed: "+r.status);
  const data=await r.json();
  if(!data.processed)break;
  result.drained++;
  if(!data.success)result.failures++;
 }
 log.info("Voice cron completed",{queued:result.queued,drained:result.drained,failures:result.failures});
 return result;
}
