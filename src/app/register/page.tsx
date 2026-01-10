"use client";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({name:"", email:"", phone:"", pass:""});

  const register = () => {
    alert("Registered: " + form.name + " - " + form.email);
  };

  return (
    <div style={{background:"#0a0a0f",color:"white",minHeight:"100vh",padding:"40px"}}>
      <h1 style={{textAlign:"center",fontSize:"32px"}}>Create <span style={{color:"#EEFF00"}}>Account</span></h1>
      <div style={{maxWidth:"400px",margin:"24px auto",background:"#16161d",padding:"24px",borderRadius:"12px"}}>
        <input placeholder="Full Name" onChange={e=>setForm({...form,name:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <input placeholder="Email" type="email" onChange={e=>setForm({...form,email:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <input placeholder="Phone +234..." onChange={e=>setForm({...form,phone:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <input placeholder="Password" type="password" onChange={e=>setForm({...form,pass:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"24px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <button onClick={register} style={{width:"100%",padding:"16px",background:"#EEFF00",color:"black",borderRadius:"8px",fontWeight:"bold"}}>Register</button>
        <p style={{textAlign:"center",marginTop:"16px",color:"#888"}}>Have account? <a href="/login" style={{color:"#EEFF00"}}>Login</a></p>
      </div>
      <p style={{textAlign:"center"}}><a href="/" style={{color:"#EEFF00"}}>← Home</a></p>
    </div>
  );
}