"use client";
import {useState} from "react";
type Message={id:string;sender_wa_id:string;message_type:string;text_body:string|null;transcription:string|null;translation:string|null;state:string;created_at:string};
type Draft={id:string;inbound_id:string;body:string;state:string;created_at:string};
export default function AgentCommand(){
 const [tenant,setTenant]=useState(""),[role,setRole]=useState(""),[messages,setMessages]=useState<Message[]>([]),[drafts,setDrafts]=useState<Draft[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[text,setText]=useState<Record<string,string>>({});
 async function load(){setBusy(true);setError("");try{
  const r=await fetch("/api/onelink/agents?tenant_id="+encodeURIComponent(tenant),{cache:"no-store"});const data=await r.json();if(!r.ok)throw Error(data.error||"Unable to load inbox");
  setRole(data.role);setMessages(data.messages||[]);setDrafts(data.drafts||[]);
 }catch(e){setError(e instanceof Error?e.message:"Unable to load inbox")}finally{setBusy(false)}}
 async function action(payload:Record<string,string>,type:"draft"|"review"){setBusy(true);setError("");try{
  const r=await fetch("/api/onelink/agents?action="+type,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...payload,tenant_id:tenant})});
  const d=await r.json();if(!r.ok)throw Error(d.error||"Operation failed");await load();
 }catch(e){setError(e instanceof Error?e.message:"Operation failed")}finally{setBusy(false)}}
 return <main style={{fontFamily:"system-ui",maxWidth:1100,margin:"32px auto",padding:24,color:"#192b54"}}>
 <a href="/onelink">← Marketplace</a><h1>DomisLink WhatsApp Agent Command Centre</h1>
 <p>OneLink-protected tenant conversations, draft replies and human review. Approving a draft does not send a WhatsApp message.</p>
 <label>Authorized tenant ID <input value={tenant} onChange={e=>setTenant(e.target.value)} placeholder="Your tenant ID" style={{padding:10,margin:10}}/></label>
 <button disabled={busy||!tenant} onClick={load}>Open my inbox</button> <a href="/api/onelink/login">OneLink sign-in</a>
 {error&&<p role="alert">{error}</p>}{role&&<p>Access role: <strong>{role}</strong></p>}
 <h2>Customer messages</h2>{messages.length===0?<p>No messages loaded.</p>:<div style={{display:"grid",gap:12}}>{messages.map(m=><article key={m.id} style={{padding:16,border:"1px solid #dbe1ec",borderRadius:12}}>
 <strong>{m.message_type} · {m.state}</strong><p>Sender: {m.sender_wa_id}</p><p style={{whiteSpace:"pre-wrap"}}>{m.translation||m.transcription||m.text_body||"Media message"}</p><small>{m.created_at}</small>
 {["agent","reviewer","admin"].includes(role)&&<div><textarea aria-label={"Reply draft for "+m.id} rows={3} placeholder="Write a reply for human review" value={text[m.id]||""} onChange={e=>setText(s=>({...s,[m.id]:e.target.value}))} style={{width:"100%",padding:10,marginTop:10}}/><button disabled={busy||!text[m.id]?.trim()} onClick={()=>action({inbound_id:m.id,text:text[m.id]},"draft")}>Save reply draft</button></div>}
 </article>)}</div>}
 <h2>Reply review queue</h2>{drafts.length===0?<p>No drafts loaded.</p>:<div style={{display:"grid",gap:12}}>{drafts.map(d=><article key={d.id} style={{padding:16,border:"1px solid #dbe1ec",borderRadius:12}}><strong>{d.state}</strong><p style={{whiteSpace:"pre-wrap"}}>{d.body}</p>
 {d.state==="pending_review"&&["reviewer","admin"].includes(role)&&<div style={{display:"flex",gap:10}}><button disabled={busy} onClick={()=>action({draft_id:d.id,decision:"approved"},"review")}>Approve draft</button><button disabled={busy} onClick={()=>action({draft_id:d.id,decision:"rejected"},"review")}>Reject draft</button></div>}
 </article>)}</div>}
 </main>
}
