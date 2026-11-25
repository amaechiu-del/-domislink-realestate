// ElevenLabs + Meta Graph media adapter. Credentials remain in Worker secrets.
const GRAPH_VERSION="v23.0";
export function voiceConfiguration(env){
 return {meta:Boolean(env.WHATSAPP_ACCESS_TOKEN),elevenlabs:Boolean(env.ELEVENLABS_API_KEY),model:env.ELEVENLABS_STT_MODEL||"scribe_v1",translation:Boolean(env.VOICE_TRANSLATION_ENDPOINT)};
}
export async function downloadWhatsAppAudio(mediaId,env,fetcher=fetch){
 if(!env.WHATSAPP_ACCESS_TOKEN)throw Error("WhatsApp media provider not configured");
 if(!/^[A-Za-z0-9_-]{4,200}$/.test(mediaId))throw Error("Invalid media identifier");
 const auth={Authorization:"Bearer "+env.WHATSAPP_ACCESS_TOKEN};
 const metadata=await fetcher("https://graph.facebook.com/"+GRAPH_VERSION+"/"+encodeURIComponent(mediaId),{headers:auth,signal:AbortSignal.timeout(12000)});
 if(!metadata.ok)throw Error("Meta media lookup failed");
 const details=await metadata.json(),url=details.url;
 if(typeof url!=="string"||!url.startsWith("https://"))throw Error("Invalid media URL");
 const host=new URL(url).hostname;
 if(host!=="lookaside.fbsbx.com"&&!host.endsWith(".fbsbx.com"))throw Error("Untrusted media host");
 const response=await fetcher(url,{headers:auth,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error("Meta media download failed");
 const type=(response.headers.get("content-type")||"").split(";")[0];
 if(!["audio/ogg","audio/opus","audio/mpeg","audio/mp4","audio/aac","audio/amr","audio/wav","application/ogg"].includes(type))throw Error("Unsupported voice format");
 const declared=Number(response.headers.get("content-length")||0);
 if(declared>8_000_000)throw Error("Voice note exceeds 8 MB");
 const audio=await response.arrayBuffer();if(audio.byteLength>8_000_000||audio.byteLength===0)throw Error("Invalid audio size");
 return {audio,type};
}
export async function transcribeElevenLabs(audio,type,env,fetcher=fetch){
 if(!env.ELEVENLABS_API_KEY)throw Error("ElevenLabs not configured");
 const form=new FormData();form.set("model_id",env.ELEVENLABS_STT_MODEL||"scribe_v1");
 form.set("file",new Blob([audio],{type}),"voice-note.ogg");
 const response=await fetcher("https://api.elevenlabs.io/v1/speech-to-text",{method:"POST",headers:{"xi-api-key":env.ELEVENLABS_API_KEY},body:form,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error("ElevenLabs transcription failed");
 const data=await response.json();
 if(typeof data.text!=="string")throw Error("Invalid transcription response");
 return {text:data.text.slice(0,12000),language_code:typeof data.language_code==="string"?data.language_code.slice(0,16):null};
}
// Optional translation is deliberately a separate, explicitly configured provider contract.
export async function translateText(text,target,env,fetcher=fetch){
 if(!env.VOICE_TRANSLATION_ENDPOINT||!env.VOICE_TRANSLATION_TOKEN)throw Error("Translation provider not configured");
 const endpoint=new URL(env.VOICE_TRANSLATION_ENDPOINT);
 if(endpoint.protocol!=="https:"||!env.VOICE_TRANSLATION_ALLOWED_HOST||endpoint.hostname!==env.VOICE_TRANSLATION_ALLOWED_HOST)throw Error("Translation endpoint not allowed");
 const response=await fetcher(endpoint.toString(),{method:"POST",headers:{"authorization":"Bearer "+env.VOICE_TRANSLATION_TOKEN,"content-type":"application/json"},body:JSON.stringify({text,target_language:target}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Translation failed");
 const data=await response.json();if(typeof data.translation!=="string")throw Error("Invalid translation response");
 return data.translation.slice(0,12000);
}
