import test from "node:test";
import assert from "node:assert/strict";
import {processVoice,voiceReadiness} from "./voice-processor.js";
import {transcribeElevenLabs,downloadWhatsAppAudio,translateText} from "./voice-providers.js";
test("voice processor requires internal secret before accessing D1",async()=>{
 const r=await processVoice(new Request("https://test/api/voice/process",{method:"POST",body:"{}"}),{VOICE_PROCESSOR_TOKEN:"secret"});assert.equal(r.status,401);
});
test("voice processor validates inbound ID",async()=>{
 const r=await processVoice(new Request("https://test/api/voice/process",{method:"POST",headers:{authorization:"Bearer secret"},body:JSON.stringify({inbound_id:"invalid"})}),{VOICE_PROCESSOR_TOKEN:"secret",DB:{}});assert.equal(r.status,400);
});
test("voice readiness never exposes credentials",async()=>{
 const r=await voiceReadiness({WHATSAPP_ACCESS_TOKEN:"secret",ELEVENLABS_API_KEY:"secret"}),data=await r.json();
 assert.equal(data.meta,true);assert.equal(data.elevenlabs,true);assert.equal(data.outbound_enabled,false);assert.equal(JSON.stringify(data).includes("secret"),false);
});
test("Meta media rejects arbitrary external hosts before download",async()=>{
 let calls=0;
 await assert.rejects(()=>downloadWhatsAppAudio("media123",{WHATSAPP_ACCESS_TOKEN:"token"},async()=>{calls++;return new Response(JSON.stringify({url:"https://evil.example/audio"}),{status:200,headers:{"content-type":"application/json"}})}),/Untrusted media host/);
 assert.equal(calls,1);
});
test("ElevenLabs transcription parses supported response",async()=>{
 const result=await transcribeElevenLabs(new Uint8Array([1,2,3]),"audio/ogg",{ELEVENLABS_API_KEY:"key"},async(url,options)=>{
 assert.equal(url,"https://api.elevenlabs.io/v1/speech-to-text");assert.equal(options.headers["xi-api-key"],"key");
 return new Response(JSON.stringify({text:"Hello world",language_code:"en"}),{headers:{"content-type":"application/json"}});
 });
 assert.deepEqual(result,{text:"Hello world",language_code:"en"});
});
test("translation adapter refuses unapproved host",async()=>{
 await assert.rejects(()=>translateText("Hello","fr",{VOICE_TRANSLATION_ENDPOINT:"https://untrusted.example/translate",VOICE_TRANSLATION_ALLOWED_HOST:"trusted.example",VOICE_TRANSLATION_TOKEN:"token"}),/not allowed/);
});
