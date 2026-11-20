"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
type Community={slug:string;name:string;country_code?:string;state_name?:string;city_name?:string;district_name?:string;neighborhood_name?:string;latitude:number|null;longitude:number|null};
type Listing={id:string;title:string;location_label:string;price:number;type:string;latitude:number|null;longitude:number|null};
export default function CommunityPage(){
 const params=useParams(),slug=String(params.slug||"");
 const [community,setCommunity]=useState<Community|null>(null),[items,setItems]=useState<Listing[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{try{
  const [a,b]=await Promise.all([fetch("/api/onelink/community-detail?slug="+encodeURIComponent(slug)),fetch("/api/onelink/public-listings?community="+encodeURIComponent(slug))]);
  if(!a.ok||!b.ok)throw Error(a.status===404?"Community not found":"Community temporarily unavailable");
  const detail=await a.json(),listings=await b.json();if(active){setCommunity(detail.community);setItems(listings.items||[])}
 }catch(e){if(active)setError(e instanceof Error?e.message:"Unable to load community")}finally{if(active)setLoading(false)}})()},[slug]);
 const lat=community?.latitude,lon=community?.longitude,hasMap=typeof lat==="number"&&typeof lon==="number"&&Number.isFinite(lat)&&Number.isFinite(lon);
 const map=hasMap?`https://www.openstreetmap.org/export/embed.html?bbox=${lon!-0.025}%2C${lat!-0.02}%2C${lon!+0.025}%2C${lat!+0.02}&layer=mapnik&marker=${lat}%2C${lon}`:"";
 return <main style={{fontFamily:"system-ui",maxWidth:1100,margin:"auto",padding:24,color:"#1b2c50"}}>
  <a href="/onelink">← Marketplace</a>
  {loading?<p>Loading community…</p>:error?<p role="alert">{error}</p>:community&&<>
   <h1>{community.name}</h1>
   <p>{[community.neighborhood_name,community.district_name,community.city_name,community.state_name,community.country_code].filter(Boolean).join(" · ")}</p>
   <p>Browse published properties and local services in this verified community.</p>
   {hasMap&&<section><h2>Community map</h2><iframe title={"Map of "+community.name} src={map} loading="lazy" referrerPolicy="no-referrer" style={{width:"100%",height:340,border:"1px solid #ddd",borderRadius:14}}/><p style={{fontSize:12}}>Map © OpenStreetMap contributors. This map marks the community centre, not individual property addresses.</p></section>}
   <h2>Listings ({items.length})</h2>
   {items.length===0?<p>No published listings here yet. <a href="/onelink/post-ad">Post the first advertisement</a>.</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>{items.map(x=><article key={x.id} style={{border:"1px solid #dfe4ee",borderRadius:14,padding:20}}><strong>{x.title}</strong><p>{x.type} · {x.location_label}</p><p>₦{x.price.toLocaleString("en-NG")}</p><a href={"/onelink/enquire?listing_id="+encodeURIComponent(x.id)}>Enquire about this listing</a> · <a target="_blank" rel="noopener noreferrer" href={"https://wa.me/?text="+encodeURIComponent("Explore "+x.title+" in "+community.name+" on DomisLinker: "+"https://propertymarketplace.domislinker.com/onelink/community/"+community.slug)}>Share on WhatsApp</a></article>)}</div>}
  </>}
 </main>
}
