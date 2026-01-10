"use client";
import { useState } from "react";

const LISTINGS = [
  { id: "1", title: "4 Bedroom Duplex with Pool", price: 85000000, location: "Lekki, Lagos", type: "sale", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400" },
  { id: "2", title: "3 Bedroom Apartment", price: 3500000, location: "VI, Lagos", type: "rent", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" },
  { id: "3", title: "2 Plots of Land", price: 45000000, location: "Ajah, Lagos", type: "sale", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400" },
  { id: "4", title: "Luxury Shortlet", price: 150000, location: "Ikoyi, Lagos", type: "shortlet", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  return (
    <div style={{background:"#0a0a0f",color:"white",minHeight:"100vh"}}>
      <header style={{background:"#16161d",padding:"16px 24px",display:"flex",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"32px",height:"32px",background:"#EEFF00",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"black",fontWeight:"bold"}}>D</div>
          <span style={{fontWeight:"bold",fontSize:"20px"}}>DomisLink</span>
          <span style={{color:"#EEFF00"}}>Real Estate</span>
        </div>
        <a href="/listings/create" style={{background:"#EEFF00",color:"black",padding:"8px 16px",borderRadius:"8px",fontWeight:"600",textDecoration:"none"}}>Post Property</a>
      </header>
      <section style={{padding:"60px 24px",textAlign:"center"}}>
        <h1 style={{fontSize:"42px",fontWeight:"bold"}}>Find Your Property <span style={{color:"#EEFF00"}}>Worldwide</span></h1>
        <p style={{color:"#888",marginBottom:"24px"}}>Buy, sell, or rent anywhere</p>
        <input placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} style={{padding:"16px",width:"300px",borderRadius:"8px",background:"#16161d",border:"1px solid #2a2a35",color:"white"}}/>
      </section>
      <section style={{padding:"24px",maxWidth:"1000px",margin:"0 auto"}}>
        <h2 style={{fontSize:"24px",marginBottom:"16px"}}>Featured</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"16px"}}>
          {LISTINGS.map((l)=>(
            <div key={l.id} style={{background:"#16161d",borderRadius:"12px",overflow:"hidden"}}>
              <img src={l.image} style={{width:"100%",height:"150px",objectFit:"cover"}}/>
              <div style={{padding:"12px"}}>
                <span style={{background:"#EEFF00",color:"black",padding:"2px 8px",borderRadius:"4px",fontSize:"12px"}}>{l.type}</span>
                <h3 style={{marginTop:"8px"}}>{l.title}</h3>
                <p style={{color:"#888",fontSize:"14px"}}>{l.location}</p>
                <p style={{color:"#EEFF00",fontWeight:"bold"}}>₦{l.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer style={{background:"#16161d",padding:"24px",textAlign:"center",color:"#888",marginTop:"48px"}}>
        <p>© 2025 DomisLink | +234 706 611 7100</p>
      </footer>
    </div>
  );
}