"use client";
import {useSearchParams} from "next/navigation";
import {Suspense,useState} from "react";
function Checkout(){
 const params=useSearchParams(),listing=params.get("listing_id")||"";
 const [reference,setReference]=useState(""),[recovery,setRecovery]=useState(""),[email,setEmail]=useState(""),[days,setDays]=useState(45),[featured,setFeatured]=useState(false),[referral,setReferral]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function pay(){
  if(!listing||!email)return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/onelink/payments/initialize",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({listing_id:listing,email,days,featured,referral_code:referral.trim()||undefined})});
   const data=await r.json();
   if(!r.ok){if(typeof data.reference==="string")setReference(data.reference);throw Error(data.error||"Checkout unavailable")}
   const destination=new URL(data.authorization_url);
   if(destination.protocol!=="https:"||!(destination.hostname==="paystack.com"||destination.hostname.endsWith(".paystack.com")))throw Error("Unexpected payment destination");
   window.location.assign(destination.toString());
  }catch(e){setError(e instanceof Error?e.message:"Checkout unavailable");setBusy(false)}
 }
 async function reconcile(){if(!reference)return;setBusy(true);setRecovery("");try{const r=await fetch("/api/onelink/payments/reconcile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({reference})});const data=await r.json();if(!r.ok)throw Error(data.error||"Reconciliation unavailable");if(data.status==="success"){setRecovery("Payment confirmed by Paystack. Verify this payment to publish your advertisement.");return}if(data.retry_allowed){setReference("");setError("");setRecovery("Paystack confirms the previous payment failed. You can now retry checkout.");return}setRecovery("Payment remains "+(data.status||"pending")+". Another charge is blocked until verification is complete.")}catch(e){setRecovery(e instanceof Error?e.message:"Unable to reconcile payment")}finally{setBusy(false)}}
 return <main style={{minHeight:"100vh",background:"#f7f8fc",padding:"36px 16px",fontFamily:"system-ui",color:"#192b54"}}><section style={{maxWidth:560,margin:"auto",padding:30,borderRadius:20,background:"#fff"}}>
 <a href="/onelink">← Marketplace</a><h1>Pay to publish your advertisement</h1>
 {!listing?<p>First <a href="/onelink/post-ad">create an advertisement draft</a>.</p>:<><p>Your listing will be published only after Paystack confirms payment. The server calculates the amount.</p>
 <label>Email for Paystack receipt<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <label>Duration<select value={days} onChange={e=>setDays(Number(e.target.value))} style={{display:"block",padding:12,width:"100%"}}>{[45,68,90].map(d=><option key={d} value={d}>{d} days</option>)}</select></label>
 <label><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/> Featured placement (+20%)</label>
 <label>Agent referral code (optional)<input value={referral} onChange={e=>setReferral(e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <p><a href="/onelink/pricing">View estimated prices</a></p><button disabled={busy||!email} onClick={pay} style={{background:"#192c69",color:"white",border:0,borderRadius:12,padding:14}}>{busy?"Connecting to Paystack…":"Proceed to secure payment"}</button>
 {error&&<p role="alert">{error}</p>}{reference&&<section style={{padding:14,background:"#fff5e5",borderRadius:10,marginTop:16}}><p>Existing payment reference: <code>{reference}</code></p><button type="button" disabled={busy} onClick={reconcile}>Check payment with Paystack</button><p>Do not pay again while this transaction is unresolved.</p></section>}{recovery&&<p role="status">{recovery}</p>}</>}
 </section></main>;
}
export default function CheckoutPage(){return <Suspense fallback={<p>Loading checkout…</p>}><Checkout/></Suspense>}
