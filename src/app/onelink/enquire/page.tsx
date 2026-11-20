"use client";
import {Suspense,useState} from "react";
import {useSearchParams} from "next/navigation";
function Form(){
 const params=useSearchParams(),listing=params.get("listing_id")||"";
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[message,setMessage]=useState(""),[website,setWebsite]=useState(""),[busy,setBusy]=useState(false),[status,setStatus]=useState(""),[sent,setSent]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setStatus("");try{
  const r=await fetch("/api/onelink/enquiries",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({listing_id:listing,name,email,message,website})});
  const data=await r.json();if(!r.ok)throw Error(data.error||"Unable to send enquiry");
  setSent(true);setStatus("Enquiry received. The advertiser can view it in their OneLink inbox.");
 }catch(e){setStatus(e instanceof Error?e.message:"Enquiry unavailable")}finally{setBusy(false)}}
 return <main style={{fontFamily:"system-ui",maxWidth:620,margin:"40px auto",padding:24,color:"#192b54"}}><a href="/onelink">← Marketplace</a><h1>Contact the advertiser</h1><p>Sign in with OneLink before sending. Your name, email and message will be shared privately with the listing owner. Do not include passwords or payment details.</p>
 {!/^[0-9a-f-]{36}$/i.test(listing)?<p>Choose a listing to contact its advertiser.</p>:sent?<p role="status">{status}</p>:<form onSubmit={submit} style={{display:"grid",gap:14}}>
 <label>Your name<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:12}}/></label>
 <label>Email<input type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12}}/></label>
 <label>Message<textarea required minLength={10} maxLength={2000} rows={6} value={message} onChange={e=>setMessage(e.target.value)} style={{display:"block",width:"100%",padding:12}}/></label>
 <div style={{position:"absolute",left:"-9999px"}} aria-hidden="true"><label>Website<input tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
 <button type="submit" disabled={busy} style={{padding:14,background:"#192b54",color:"white",border:0,borderRadius:10}}>{busy?"Sending…":"Send private enquiry"}</button>{status&&<p role="alert">{status}</p>}
 </form>}
 <p><a href="/api/onelink/login">Sign in with OneLink</a></p></main>
}
export default function Enquire(){return <Suspense fallback={<p>Loading enquiry form…</p>}><Form/></Suspense>}
