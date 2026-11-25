"use client";
import {useEffect,useState} from "react";
const API=process.env.NEXT_PUBLIC_DOMISLINKER_API_URL||"";
type Community={slug:string;name:string};
export default function CommunityPicker({value,onChange}:{value:string;onChange:(slug:string)=>void}){
 const [query,setQuery]=useState(""),[items,setItems]=useState<Community[]>([]),[error,setError]=useState("");
 useEffect(()=>{if(!API)return;const controller=new AbortController();const timeout=setTimeout(()=>{
 fetch(API+"/api/communities?q="+encodeURIComponent(query),{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error("Community search unavailable");return r.json()}).then(data=>{setItems(data.items||[]);setError("")}).catch(e=>{if(e.name!=="AbortError")setError("Unable to load verified communities")});
 },250);return()=>{clearTimeout(timeout);controller.abort()}},[query]);
 return <div><label htmlFor="community-query">Find your community</label><input id="community-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search city or neighbourhood" style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/>
 <select aria-label="Verified community" required value={value} onChange={e=>onChange(e.target.value)} style={{display:"block",padding:12,width:"100%",marginTop:8}}><option value="">Choose a verified community</option>{items.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}{value&&!items.some(c=>c.slug===value)&&<option value={value}>{value}</option>}</select>
 {error&&<p role="status">{error}</p>}{!API&&<p role="status">Marketplace API configuration required.</p>}</div>;
}
