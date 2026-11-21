"use client";
import { useState } from "react";
type Quote={currency:string;type:string;days:number;featured:boolean;base_kobo:number;boost_kobo:number;total_kobo:number};
const API=process.env.NEXT_PUBLIC_DOMISLINKER_API_URL||"";
export default function PricingPage(){
 const [type,setType]=useState("rent"),[days,setDays]=useState(45),[featured,setFeatured]=useState(false);
 const [quote,setQuote]=useState<Quote|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const naira=(k:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:2}).format(k/100);
 async function calculate(){
  setError("");setQuote(null);
  if(!API){setError("Marketplace API has not been configured.");return}
  setBusy(true);
  try{const r=await fetch(API+"/api/pricing/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type,days,featured})});const result=await r.json();if(!r.ok)throw new Error(result.error||"Unable to calculate");setQuote(result.quote)}
  catch(e){setError(e instanceof Error?e.message:"Quote unavailable")}finally{setBusy(false)}
 }
 return <main style={{minHeight:"100vh",background:"#f7f8fc",color:"#15203b",fontFamily:"system-ui",padding:"36px 20px"}}>
 <div style={{maxWidth:640,margin:"auto",background:"white",padding:30,borderRadius:20,boxShadow:"0 10px 30px #10204b12"}}>
 <a href="/onelink">← Back to marketplace</a><h1>Advertise on DomisLinker</h1><p>Choose one item per advertisement. Get an estimate before checkout.</p>
 <label style={{display:"block",margin:"22px 0 8px"}}>Advertisement category</label>
 <select value={type} onChange={e=>{setType(e.target.value);setQuote(null)}} style={{padding:12,width:"100%"}}>{[["rent","Property for rent"],["sale","Property for sale"],["service","Service provider"],["tenant","Tenant request"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
 <label style={{display:"block",margin:"22px 0 8px"}}>Duration</label>
 <select value={days} onChange={e=>{setDays(Number(e.target.value));setQuote(null)}} style={{padding:12,width:"100%"}}>{[45,68,90].map(d=><option key={d} value={d}>{d} days</option>)}</select>
 <label style={{display:"block",margin:"22px 0"}}><input type="checkbox" checked={featured} onChange={e=>{setFeatured(e.target.checked);setQuote(null)}}/> Featured placement (+20%)</label>
 <button onClick={calculate} disabled={busy} style={{background:"#182b64",color:"white",padding:"14px 20px",border:0,borderRadius:10,marginTop:24,cursor:"pointer"}}>{busy?"Calculating…":"Calculate price"}</button>
 {error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}
 {quote&&<section aria-live="polite" style={{background:"#f4f1ff",padding:20,borderRadius:14,marginTop:24}}><h2>Price estimate</h2><p>Base fee: {naira(quote.base_kobo)}</p><p>Featured upgrade: {naira(quote.boost_kobo)}</p><strong style={{fontSize:25}}>Total: {naira(quote.total_kobo)}</strong><p style={{fontSize:13}}>Payment and publication will be enabled after secure Paystack verification is integrated.</p></section>}
 </div></main>
}