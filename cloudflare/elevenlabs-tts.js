// Optional ElevenLabs text-to-speech adapter; never automatically sends generated audio to WhatsApp.
export async function synthesizeVoice(text,env,fetcher=fetch){
 if(!env.ELEVENLABS_API_KEY||!env.ELEVENLABS_VOICE_ID)throw Error("Voice synthesis not configured");
 if(typeof text!=="string"||!text.trim()||text.length>2500)throw Error("Invalid voice text");
 const voiceId=env.ELEVENLABS_VOICE_ID;
 if(!/^[a-zA-Z0-9_-]{10,100}$/.test(voiceId))throw Error("Invalid voice identifier");
 const response=await fetcher("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(voiceId),{
  method:"POST",headers:{"xi-api-key":env.ELEVENLABS_API_KEY,"content-type":"application/json","accept":"audio/mpeg"},
  body:JSON.stringify({text,model_id:env.ELEVENLABS_TTS_MODEL||"eleven_multilingual_v2"}),
  signal:AbortSignal.timeout(30000)
 });
 if(!response.ok)throw Error("Voice synthesis provider failed");
 const type=(response.headers.get("content-type")||"").split(";")[0];
 if(type!=="audio/mpeg")throw Error("Unexpected audio format");
 if(Number(response.headers.get("content-length")||0)>5_000_000)throw Error("Generated voice exceeds limit");
 const audio=await response.arrayBuffer();
 if(audio.byteLength===0||audio.byteLength>5_000_000)throw Error("Invalid generated audio");
 return {audio,mime_type:"audio/mpeg"};
}
