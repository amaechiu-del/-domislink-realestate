"use client";
import {useState} from "react";
const API=process.env.NEXT_PUBLIC_DOMISLINKER_API_URL||"";
type Form={title:string;type:string;community_slug:string;location_label:string;price:string};
export default function NewAdvertisement(){
 const [form,setForm]=useState<Form>({title:"",type:"rent",community_slug:"",location_label:"",price:""});
 const [message,setMessage]=useState("");
 const update=(key:keyof Form,value:string)=>setForm(v=>({...v,[key]:value}));
 async function submit(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();setMessage("");
 // OneLink's authorization-code/PKCE session exchange is not wired yet.
 // Never request users to paste access tokens into the browser.
 setMessage("OneLink sign-in must be connected before your advertisement can be saved securely. Your details remain in this form.");
 }
 return <main style={{background:"#f7f8fc",minHeight:"100vh",padding:"40px 16px",fontFamily:"system-ui",color:"#162347"}}>
 <section style={{maxWidth:680,margin:"auto",background:"white",padding:28,borderRadius:20}}>
 <a href="/onelink">← Marketplace</a><h1>Create an advertisement</h1><p>One advertisement per property or service. Save a draft, choose a package, then pay securely to publish.</p>
 <form onSubmit={submit} style={{display:"grid",gap:16}}>
 <label>Category<select required value={form.type} onChange={e=>update("type",e.target.value)} style={{display:"block",padding:12,width:"100%"}}>{[["rent","Rent"],["sale","For sale"],["service","Service provider"],["tenant","Tenant request"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
 <label>Advertisement title<input required minLength={8} maxLength={140} value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Two-bedroom apartment in Ikeja" style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <label>Verified community slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.community_slug} onChange={e=>update("community_slug",e.target.value)} placeholder="lagos-ikeja" style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <label>Location description<input required minLength={3} value={form.location_label} onChange={e=>update("location_label",e.target.value)} placeholder="Ikeja, Lagos" style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <label>Price in NGN<input required type="number" min="0" step="1" value={form.price} onChange={e=>update("price",e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box"}}/></label>
 <button type="submit" style={{background:"#192c69",color:"white",border:0,padding:15,borderRadius:12,cursor:"pointer"}}>Continue to OneLink sign-in</button>
 </form>{message&&<p role="status" style={{padding:15,background:"#fff4db",borderRadius:12}}>{message}</p>}
 <p style={{color:"#6b7280",fontSize:13}}>The advertiser form is a preview until OneLink login and verified community selection are connected. No advertisement is published or charged here.</p>
 <a href="/onelink/pricing">View advertising packages</a>
 </section></main>;
}
