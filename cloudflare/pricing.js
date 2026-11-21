// Prices are provisional configuration until product owner signs off.
export const BASE_FEES_KOBO={rent:500000,sale:1000000,tenant:350000,service:300000};
export const DURATIONS=[45,68,90];
export function quote({type,days=45,featured=false}){
 if(!Object.hasOwn(BASE_FEES_KOBO,type))throw new Error("Unsupported listing category");
 if(!DURATIONS.includes(days))throw new Error("Unsupported duration");
 if(typeof featured!=="boolean")throw new Error("Invalid featured option");
 const base=Math.round(BASE_FEES_KOBO[type]*days/45);
 const boost=featured?Math.round(base*0.2):0;
 return {currency:"NGN",type,days,featured,base_kobo:base,boost_kobo:boost,total_kobo:base+boost};
}
