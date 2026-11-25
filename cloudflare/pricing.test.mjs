import test from "node:test";
import assert from "node:assert/strict";
import {quote} from "./pricing.js";
test("base rental quote",()=>assert.equal(quote({type:"rent"}).total_kobo,500000));
test("featured sale",()=>assert.equal(quote({type:"sale",featured:true}).total_kobo,1200000));
test("duration prorates in integer kobo",()=>assert.equal(quote({type:"service",days:90}).total_kobo,600000));
test("unknown categories rejected",()=>assert.throws(()=>quote({type:"other"})));
test("unsupported durations rejected",()=>assert.throws(()=>quote({type:"rent",days:1})));
