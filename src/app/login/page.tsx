"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const login = () => {
    alert("Login with: " + email);
  };

  return (
    <div style={{background:"#0a0a0f",color:"white",minHeight:"100vh",padding:"40px"}}>
      <h1 style={{textAlign:"center",fontSize:"32px"}}>Welcome <span style={{color:"#EEFF00"}}>Back</span></h1>
      <div style={{maxWidth:"400px",margin:"24px auto",background:"#16161d",padding:"24px",borderRadius:"12px"}}>
        <input placeholder="Email" type="email" onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:"12px",marginBottom:"12px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <input placeholder="Password" type="password" onChange={e=>setPass(e.target.value)} style={{width:"100%",padding:"12px",marginBottom:"24px",background:"#0a0a0f",border:"1px solid #333",borderRadius:"8px",color:"white"}}/>
        <button onClick={login} style={{width:"100%",padding:"16px",background:"#EEFF00",color:"black",borderRadius:"8px",fontWeight:"bold"}}>Login</button>
        <p style={{textAlign:"center",marginTop:"16px",color:"#888"}}>No account? <a href="/register" style={{color:"#EEFF00"}}>Register</a></p>
      </div>
      <p style={{textAlign:"center"}}><a href="/" style={{color:"#EEFF00"}}>← Home</a></p>
    </div>
  );
}