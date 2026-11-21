import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {communityDetail,nearbyCommunities} from "./community-discovery.js";
function db(){
 const database=new DatabaseSync(":memory:");
 database.exec(readFileSync("cloudflare/schema.sql","utf8"));
 for(const name of ["0002_payment_fulfillment","0003_payment_reservations_adjustments","0004_commission_adjustments","0005_adjustment_reviews","0006_listing_renewals","0007_community_discovery_enquiries"])database.exec(readFileSync("cloudflare/migrations/"+name+".sql","utf8"));
 database.exec("INSERT INTO communities(id,place_id,name,slug,country_code,state_name,city_name,latitude,longitude,verified) VALUES('c1','place1','Ikeja','ikeja','NG','Lagos','Ikeja',6.6,3.35,1),('c2','place2','Unverified','unverified','NG','Lagos','Lagos',6.61,3.36,0)");
 return {database,DB:{prepare(sql){const stmt=database.prepare(sql);return {bind(...args){return {first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)})}}}}}};
}
test("verified community storefront never exposes unverified locations",async()=>{
 const x=db();const ok=await communityDetail(new Request("https://test/api/communities/detail?slug=ikeja"),{DB:x.DB});assert.equal(ok.status,200);
 const missing=await communityDetail(new Request("https://test/api/communities/detail?slug=unverified"),{DB:x.DB});assert.equal(missing.status,404);x.database.close();
});
test("nearby map results contain only verified communities",async()=>{
 const x=db();const r=await nearbyCommunities(new Request("https://test/api/communities/nearby?lat=6.6&lon=3.35"),{DB:x.DB});
 assert.equal(r.status,200);assert.deepEqual((await r.json()).items.map(x=>x.slug),["ikeja"]);x.database.close();
});
test("reject invalid geographic coordinates",async()=>{
 const r=await nearbyCommunities(new Request("https://test/api/communities/nearby?lat=100&lon=3"),{DB:{}});assert.equal(r.status,400);
});
