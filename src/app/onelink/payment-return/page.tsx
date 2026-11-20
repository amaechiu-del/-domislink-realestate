"use client";
import {useSearchParams} from "next/navigation";
import {Suspense,useState} from "react";
const API=process.env.NEXT_PUBLIC_DOMISLINKER_API_URL||"";
function Receipt(){
 const params=useSearchParams(),reference=params.get("reference")||params.get("trxref")||"";
 const [message,setMessage]=useState("");
 const valid=/^dlk_[a-f0-9]{32}$/.test(reference);
 return <main style={{minHeight:"100vh",background:"#f6f8fc",padding:"48px 16px",fontFamily:"system-ui",color:"#192b54"}}>
 <section style={{maxWidth:600,margin:"auto",background:"#fff",padding:30,borderRadius:20}}>
 <a href="/onelink">← DomisLinker</a><h1>Payment return</h1>
 {valid?<><p>Paystack has returned you to DomisLinker. Your payment must still be verified by our server before your advertisement is published.</p>
 <p>Reference: <code style={{overflowWrap:"anywhere"}}>{reference}</code></p>
 <p>Once OneLink sign-in is connected, this page will verify the transaction using your authenticated session. Until then, please retain your reference.</p>
 <button type="button" onClick={()=>{navigator.clipboard?.writeText(reference).then(()=>setMessage("Reference copied")).catch(()=>setMessage("Copy the reference above manually"))}} style={{background:"#182c69",color:"white",border:0,padding:"12px 18px",borderRadius:10}}>Copy payment reference</button>
 {message&&<p role="status">{message}</p>}</>:<p>No valid DomisLinker payment reference was provided. If you paid, contact support with your Paystack receipt.</p>}
 <p style={{fontSize:13,color:"#626b7b"}}>{API?"Payment status is not yet connected to the OneLink browser session.":"Marketplace API is not configured."} Returning to this page is not proof of payment.</p>
 </section></main>;
}
export default function PaymentReturn(){return <Suspense fallback={<p>Loading payment details…</p>}><Receipt/></Suspense>}
