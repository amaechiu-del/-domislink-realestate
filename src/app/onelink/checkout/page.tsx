"use client";
import {useSearchParams} from "next/navigation";
import {Suspense,useState} from "react";
function Checkout(){
 const params=useSearchParams(),listing=params.get("listing_id")||"";
 const [email,setEmail]=useState(""),[days,setDays]=useState(45),[featured,setFeatured]=useState(false),[referral,setReferral]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function pay(){
  if(!listing||!email)return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/onelink/payments/initialize",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({listing_id:listing,email,days,featured,referral_code:referral.trim()||undefined})});
   const data=await r.json();
   if(!r.ok)throw Error(data.error||"Checkout unavailable");
   const destination=new URL(data.authorization_url);
   if(destination.protocol!=="https:"||!(destination.hostname==="paystack.com"||destination.hostname.endsWith(".paystack.com")))throw Error("Unexpected payment destination");
   window.location.assign(destination.toString());
  }catch(e){setError(e instanceof Error?e.message:"Checkout unavailable");setBusy(false)}
 }
 return <main style={{minHeight:"100vh",background:"#f7f8fc",padding:"36px 16px",fontFamily:"system-ui",color:"#192b54"}}><section style={{maxWidth:560,margin:"auto",padding:30,borderRadius:20,background:"#fff"}}>
 <a href="/onelink">← Marketplace</a><h1>Pay to publish your advertisement</h1>
 {!listing?<p>First <a href="/onelink/post-ad">create an advertisement draft</a>.</p>:<><p>Your listing will be published only after Paystack confirms payment. The server calculates the amount.</p>
 <label>Email for Paystack receipt<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <label>Duration<select value={days} onChange={e=>setDays(Number(e.target.value))} style={{display:"block",padding:12,width:"100%"}}>{[45,68,90].map(d=><option key={d} value={d}>{d} days</option>)}</select></label>
 <label><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/> Featured placement (+20%)</label>
 <label>Agent referral code (optional)<input value={referral} onChange={e=>setReferral(e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <p><a href="/onelink/pricing">View estimated prices</a></p><button disabled={busy||!email} onClick={pay} style={{background:"#192c69",color:"white",border:0,borderRadius:12,padding:14}}>{busy?"Connecting to Paystack…":"Proceed to secure payment"}</button>
 {error&&<p role="alert">{error}</p>}</>}
 </section></main>;
}
export default function CheckoutPage(){return <Suspense fallback={<p>Loading checkout…</p>}><Checkout/></Suspense>}
