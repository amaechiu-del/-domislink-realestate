import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";
const read=p=>readFileSync(p,"utf8");
function database(){
 const db=new DatabaseSync(":memory:");
 db.exec("PRAGMA foreign_keys=ON;");
 db.exec(read("cloudflare/schema.sql"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals"])db.exec(read("cloudflare/migrations/"+name+".sql"));
 return db;
}
function seed(db){
 db.prepare("INSERT INTO communities(id,place_id,name,slug) VALUES('c','p','Lagos','lagos')").run();
 db.prepare("INSERT INTO listings(id,owner_id,community_id,title,location_label,price,type,status) VALUES('l','u','c','Test property','Lagos',100,'rent','draft')").run();
}
test("all payment and renewal migrations apply on a fresh SQLite database",()=>{
 const db=database();
 assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='uq_listing_outstanding_payment'").get());
 db.close();
});
test("a failed reservation releases only its own listing and a new pending payment remains unique",()=>{
 const db=database();seed(db);
 const insert=db.prepare("INSERT INTO payments(id,reference,listing_id,amount_kobo,status,duration_days,featured) VALUES(?,?,'l',500000,?,45,0)");
 insert.run("p1","r1","pending");
 assert.throws(()=>insert.run("p2","r2","pending"));
 db.prepare("UPDATE payments SET status='failed' WHERE id='p1'").run();
 insert.run("p2","r2","pending");
 assert.throws(()=>insert.run("p3","r3","success"));
 db.close();
});
test("a paid listing has at most one first-generation renewal draft",()=>{
 const db=database();seed(db);
 db.prepare("UPDATE listings SET status='expired' WHERE id='l'").run();
 const insert=db.prepare("INSERT INTO listings(id,owner_id,community_id,title,location_label,price,type,status,renewal_of_id) VALUES(?,'u','c','Renewed property','Lagos',100,'rent','draft','l')");
 insert.run("new1");assert.throws(()=>insert.run("new2"));
 db.close();
});
