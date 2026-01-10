"use client";
import { useState, useEffect } from "react";

export default function Create() {
  const [f,setF]=useState({title:"",price:"",loc:"",type:"sale"});
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const script=document.createElement("script");
    script.src="https://js.paystack.co/v1/inline.js";
    script.onload=()=>setReady(true);
    document.body.appendChild(script);
  },[]);

  const pay=()=>{
    if(!ready){alert("Loading payment...");return;}
    const handler=(window as any).PaystackPop.setup({
      key:"pk_test_beb2d6a31e76b83149985e1085496275698b2755     ",
      email:"test@domislink.com",
      amount:500000,
      currency:"NGN",
      ref:"DL"+Date.now(),
      callback:(r:any)=>{alert("Payment Success! Ref: "+r.reference);},
      onClose:()=>{alert("Payment cancelled");}
    });
    handler.openIframe();
  };

  return (
    <div style={{background:"#0a0a0f",color:"white",minHeight:"100vh",padding:"40px"}}>
      <h1 style={{textAlign:"center",fontSize:"32px"}}>Post <span style={{color:"#EEFF00"}}>Property</span></h1>
      <div style={{maxWidth:"450px",margin:"24px auto",background:"#16161d",padding:"24px",borderRadius:"12px"}}>
        <input placeholder="Property Title" onChange={e=>setF({...f,title:e.target.value})} style={{width:"100%",padding:"14px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white",boxSizing:"border-box"}}/>
        <input placeholder="Price (₦)" type="number" onChange={e=>setF({...f,price:e.target.value})} style={{width:"100%",padding:"14px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white",boxSizing:"border-box"}}/>
        <input placeholder="Location" onChange={e=>setF({...f,loc:e.target.value})} style={{width:"100%",padding:"14px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white",boxSizing:"border-box"}}/>
        <select onChange={e=>setF({...f,type:e.target.value})} style={{width:"100%",padding:"14px",marginBottom:"24px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white",boxSizing:"border-box"}}>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
          <option value="shortlet">Shortlet</option>
        </select>
        <p style={{color:"#888",marginBottom:"12px"}}>Listing Fee: <span style={{color:"#EEFF00",fontWeight:"bold"}}>₦5,000</span></p>
        <button onClick={pay} style={{width:"100%",padding:"16px",background:"#EEFF00",color:"black",borderRadius:"8px",fontWeight:"bold",border:"none",cursor:"pointer"}}>Pay & Post Property</button>
      </div>
      <p style={{textAlign:"center",marginTop:"24px"}}><a href="/" style={{color:"#EEFF00"}}>← Back Home</a></p>
    </div>
  );
}