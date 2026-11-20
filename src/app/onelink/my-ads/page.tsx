"use client";
import {useEffect,useState} from "react";
type Ad={id:string;title:string;price:number;type:string;status:string;created_at:string};
const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
export default function MyAds(){
 const [ads,setAds]=useState<Ad[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function refresh(){
  setLoading(true);setError("");
  try{const r=await fetch("/api/onelink/my-ads",{cache:"no-store"});const d=await r.json();
   if(!r.ok)throw Error(d.error||"Unable to load your advertisements");
   setAds(Array.isArray(d.items)?d.items:[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load advertisements")}finally{setLoading(false)}
 }
 useEffect(()=>{void refresh()},[]);
 return <main style={{minHeight:"100vh",background:"#f7f8fc",padding:"32px 16px",fontFamily:"system-ui",color:"#182747"}}>
 <section style={{maxWidth:900,margin:"auto"}}>
 <a href="/onelink">← DomisLinker marketplace</a><h1>My advertisements</h1>
 <p>Manage your property and service advertisements with your OneLink account. Only advertisements belonging to your signed-in identity are shown.</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"22px 0"}}>
 <a href="/onelink/post-ad" style={{padding:"12px 18px",borderRadius:10,background:"#182b64",color:"white",textDecoration:"none"}}>+ Create advertisement</a>
 <button onClick={()=>void refresh()} disabled={loading} style={{padding:"12px 18px",borderRadius:10,border:"1px solid #cbd5e1",background:"white"}}>Refresh</button>
 </div>
 {loading?<p role="status">Loading your advertisements…</p>:error?<div role="alert" style={{background:"#fff3e7",padding:20,borderRadius:12}}><p>{error}</p><a href="/api/onelink/login">Sign in with OneLink</a></div>:ads.length===0?<section style={{background:"white",padding:25,borderRadius:14}}><h2>No advertisements yet</h2><p>Create a draft, choose a package, and complete secure payment to publish.</p></section>:<div style={{display:"grid",gap:14}}>{ads.map(ad=><article key={ad.id} style={{background:"white",border:"1px solid #e3e8ef",borderLeft:"5px solid #d6a52a",borderRadius:14,padding:20}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><h2 style={{margin:0,fontSize:20}}>{ad.title}</h2><strong>{ad.status.replaceAll("_"," ")}</strong></div>
 <p>{ad.type} · {money(ad.price)} · {new Date(ad.created_at).toLocaleDateString("en-NG")}</p>
 {ad.status==="draft"&&<a href={"/onelink/checkout?listing_id="+encodeURIComponent(ad.id)}>Choose package and pay</a>}
 {ad.status==="published"&&<p>Published — visible in the marketplace until expiry.</p>}
 {ad.status==="pending_payment"&&<p>Payment verification or reconciliation required.</p>}
 </article>)}</div>}
 </section></main>;
}
