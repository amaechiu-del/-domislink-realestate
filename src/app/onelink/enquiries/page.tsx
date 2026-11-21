"use client";
import {useEffect,useState} from "react";
type Lead={id:string;title:string;sender_name:string;sender_email:string;message:string;created_at:string;status:string};
export default function Inbox(){
 const [items,setItems]=useState<Lead[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;fetch("/api/onelink/enquiries",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to load enquiries");if(active)setItems(d.items||[])}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 return <main style={{fontFamily:"system-ui",maxWidth:850,margin:"40px auto",padding:24,color:"#192b54"}}><a href="/onelink/my-ads">← My advertisements</a><h1>Advertiser enquiry inbox</h1><p>Private enquiries for listings you own. Do not share sender details publicly.</p>
 {loading?<p>Loading enquiries…</p>:error?<p role="alert">{error} <a href="/api/onelink/login">Sign in</a></p>:items.length===0?<p>No enquiries yet.</p>:<div style={{display:"grid",gap:14}}>{items.map(x=><article key={x.id} style={{border:"1px solid #e2e5ee",padding:20,borderRadius:12}}><strong>{x.title}</strong><p>{x.sender_name} · <a href={"mailto:"+encodeURIComponent(x.sender_email)}>{x.sender_email}</a></p><p style={{whiteSpace:"pre-wrap"}}>{x.message}</p><small>{x.created_at} · {x.status}</small></article>)}</div>}
 </main>
}
