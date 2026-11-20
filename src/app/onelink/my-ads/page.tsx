"use client";
import {useEffect,useState} from "react";
type Ad={id:string;title:string;location_label?:string;price:number;type:string;status:string;created_at:string};
const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
export default function MyAds(){
 const [ads,setAds]=useState<Ad[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [editing,setEditing]=useState<string|null>(null),[title,setTitle]=useState(""),[location,setLocation]=useState(""),[price,setPrice]=useState(""),[saving,setSaving]=useState(false);
 async function save(id:string){setSaving(true);setError("");try{const r=await fetch("/api/onelink/drafts",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,title,location_label:location,price:Number(price)})});const d=await r.json();if(!r.ok)throw Error(d.error||"Update failed");setEditing(null);await refresh()}catch(e){setError(e instanceof Error?e.message:"Update failed")}finally{setSaving(false)}}
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
 {ad.status==="draft"&&<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><a href={"/onelink/checkout?listing_id="+encodeURIComponent(ad.id)}>Choose package and pay</a><button type="button" onClick={()=>{setEditing(ad.id);setTitle(ad.title);setLocation(ad.location_label||"");setPrice(String(ad.price))}}>Edit draft</button></div>}
 {editing===ad.id&&<form onSubmit={e=>{e.preventDefault();void save(ad.id)}} style={{display:"grid",gap:10,marginTop:16}}><label>Title<input required minLength={8} maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} style={{display:"block",width:"100%"}}/></label><label>Location<input required minLength={3} maxLength={160} value={location} onChange={e=>setLocation(e.target.value)} style={{display:"block",width:"100%"}}/></label><label>Price (NGN)<input required type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} style={{display:"block",width:"100%"}}/></label><div><button type="submit" disabled={saving}>{saving?"Saving…":"Save changes"}</button> <button type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form>}
 {ad.status==="published"&&<p>Published — visible in the marketplace until expiry.</p>}
 {ad.status==="pending_payment"&&<p>Payment verification or reconciliation required.</p>}
 </article>)}</div>}
 </section></main>;
}
