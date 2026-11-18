"use client";
import { useEffect, useState } from "react";
type Listing = { id:string; title:string; location_label:string; community_slug:string; price:number; type:string; status:string };
const API = process.env.NEXT_PUBLIC_DOMISLINKER_API_URL || "";
const money = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
export default function OneLinkMarketplace(){
 const [listings,setListings]=useState<Listing[]>([]);
 const [search,setSearch]=useState("");
 const [category,setCategory]=useState("all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let active=true;async function load(){if(!API){setLoading(false);setError("Marketplace API is not configured yet.");return;}
 try{const r=await fetch(API+"/api/listings");if(!r.ok)throw new Error("Marketplace temporarily unavailable");const j=await r.json();if(active)setListings(j.items||[]);}catch(e){if(active)setError(e instanceof Error?e.message:"Unable to load");}finally{if(active)setLoading(false);}}load();return()=>{active=false};},[]);
 const shown=listings.filter(x=>(category==="all"||x.type===category)&&[x.title,x.location_label,x.community_slug].join(" ").toLowerCase().includes(search.toLowerCase()));
 return <main style={{minHeight:"100vh",background:"#f7f8fc",color:"#15203b",fontFamily:"system-ui,sans-serif"}}>
 <header style={{background:"#14224b",color:"white",padding:"20px max(20px,5vw)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
 <strong style={{fontSize:24}}>♛ DomisLinker <small style={{fontSize:12,color:"#ffd34d"}}>THE DIGITAL EMPIRE</small></strong>
 <nav style={{display:"flex",gap:16,alignItems:"center"}}><a href="/" style={{color:"white"}}>Home</a><a href="/listings/create" style={{color:"#ffd34d"}}>Post an ad</a><a href="/onelink" style={{color:"white"}}>OneLink</a></nav></header>
 <section style={{background:"linear-gradient(120deg,#182b64,#6c38b9)",color:"white",padding:"55px max(20px,8vw)"}}>
 <div style={{maxWidth:950,margin:"auto"}}><p style={{color:"#ffe175"}}>GLOBAL COMMUNITIES · PROPERTY · LOCAL SERVICES</p><h1 style={{fontSize:"clamp(30px,5vw,56px)",margin:"12px 0"}}>Find your next place. Discover your community.</h1>
 <p>Explore rentals, homes for sale, local professionals and tenant requests in one place.</p>
 <input aria-label="Search communities or listings" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search community, city or property…" style={{width:"100%",maxWidth:650,padding:17,borderRadius:12,border:0,fontSize:16,boxSizing:"border-box"}} /></div></section>
 <section style={{maxWidth:1050,margin:"auto",padding:"30px 20px"}}>
 <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:25}}>{[["all","All"],["rent","Rent"],["sale","For sale"],["service","Professionals"],["tenant","Tenant requests"]].map(([key,label])=><button key={key} onClick={()=>setCategory(key)} style={{padding:"11px 18px",borderRadius:24,border:"1px solid #ddd",background:category===key?"#182b64":"white",color:category===key?"white":"#15203b",cursor:"pointer"}}>{label}</button>)}</div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginBottom:30}}>
 {[["🏘️","Explore communities","Search recognizable local areas"],["🛠️","Find professionals","Plumbers, electricians, movers and more"],["📣","Become an agent","Share referrals and earn on attributed sales"],["✨","AI ad studio","Create attractive listing copy and cards"]].map(([icon,title,desc])=><article key={title} style={{background:"white",padding:22,borderRadius:16,border:"1px solid #e5e8f0"}}><div style={{fontSize:30}}>{icon}</div><h3>{title}</h3><p style={{color:"#58647b"}}>{desc}</p></article>)}</div>
 <h2>Community marketplace</h2>{loading?<p>Loading live listings…</p>:error?<p role="status">{error} Connect the Worker API to display real listings.</p>:shown.length===0?<p>No matching paid listings yet. Try another search or category.</p>:<div style={{display:"grid",gap:14}}>{shown.map(x=><article key={x.id} style={{background:"white",border:"1px solid #e5e8f0",borderRadius:15,padding:22,borderLeft:"6px solid #f6c743"}}><span style={{color:"#6933a5",fontSize:13,textTransform:"uppercase"}}>{x.type}</span><h3>{x.title}</h3><p>📍 {x.location_label}</p><strong>{money(x.price)}</strong></article>)}</div>}
 <p style={{marginTop:32,fontSize:13,color:"#69758a"}}>Owned and operated by DomisLink International Services Ltd. OneLink integration uses shared identity and separate marketplace permissions.</p>
 </section></main>;
}