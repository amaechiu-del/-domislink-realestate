"use client";
import {useSearchParams} from "next/navigation";
import {Suspense,useState} from "react";
function Receipt(){
 const params=useSearchParams(),reference=params.get("reference")||params.get("trxref")||"";
 const [message,setMessage]=useState("");
 const [checking,setChecking]=useState(false);
 const [recovery,setRecovery]=useState("");
 async function verify(){setChecking(true);setMessage("");try{const r=await fetch("/api/onelink/payments/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({reference})});const d=await r.json();setMessage(d.published?"Payment verified. Your advertisement is published.":d.verified?"Payment verified; publication requires reconciliation.":d.error||"Payment not confirmed.");if(d.published)setRecovery("published")}catch{setMessage("Verification temporarily unavailable.")}finally{setChecking(false)}}
 async function reconcile(){setChecking(true);setMessage("");try{const r=await fetch("/api/onelink/payments/reconcile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({reference})});const d=await r.json();if(!r.ok)throw Error(d.error||"Reconciliation unavailable");if(d.status==="success"){setMessage("Paystack confirms your payment. Select Verify payment to complete publication.");setRecovery("success")}else if(d.retry_allowed){setMessage("Paystack reports this payment failed. You may return to your advertisement to start a new checkout.");setRecovery("failed")}else{setMessage("Payment remains unresolved. Do not pay again until the status is confirmed.");setRecovery("pending")}}catch(e){setMessage(e instanceof Error?e.message:"Reconciliation unavailable")}finally{setChecking(false)}}
 const valid=/^dlk_[a-f0-9]{32}$/.test(reference);
 return <main style={{minHeight:"100vh",background:"#f6f8fc",padding:"48px 16px",fontFamily:"system-ui",color:"#192b54"}}>
 <section style={{maxWidth:600,margin:"auto",background:"#fff",padding:30,borderRadius:20}}>
 <a href="/onelink">← DomisLinker</a><h1>Payment return</h1>
 {valid?<><p>Paystack has returned you to DomisLinker. Your payment must still be verified by our server before your advertisement is published.</p>
 <p>Reference: <code style={{overflowWrap:"anywhere"}}>{reference}</code></p>
 <p>Use Verify payment to check the transaction securely. If your session has expired, sign in with OneLink again and return to this page.</p>
 <button type="button" disabled={checking} onClick={verify} style={{background:"#192c69",color:"white",border:0,padding:"12px 18px",borderRadius:10,marginRight:8}}>{checking?"Checking…":"Verify payment"}</button><button type="button" onClick={()=>{navigator.clipboard?.writeText(reference).then(()=>setMessage("Reference copied")).catch(()=>setMessage("Copy the reference above manually"))}} style={{background:"#182c69",color:"white",border:0,padding:"12px 18px",borderRadius:10}}>Copy payment reference</button> <button type="button" disabled={checking} onClick={reconcile} style={{padding:"12px 18px",borderRadius:10,marginTop:10}}>Check payment status</button>
 {message&&<p role="status">{message}</p>}{recovery==="published"&&<p><a href="/onelink/my-ads">View my advertisements</a></p>}{recovery==="failed"&&<p><a href="/onelink/my-ads">Return to my advertisements</a></p>}</>:<p>No valid DomisLinker payment reference was provided. If you paid, contact support with your Paystack receipt.</p>}
 <p style={{fontSize:13,color:"#626b7b"}}>Payment verification requires a valid OneLink session. Returning to this page is not proof of payment.</p>
 </section></main>;
}
export default function PaymentReturn(){return <Suspense fallback={<p>Loading payment details…</p>}><Receipt/></Suspense>}
