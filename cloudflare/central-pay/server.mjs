// Vendored from domislink-pay at 177ff8443667426b16f1a02aa7b62f9c7f2b21a5. Backend only.
// Server-only SDK. Supply a short-lived service token from your trusted identity provider.
export function createDomisLinkPay({getToken,fetcher=fetch,baseUrl="https://pay.domislink.com"}){
 const base=new URL(baseUrl);
 if(base.protocol!=="https:"||base.username||base.password||base.pathname!=="/"||base.search||base.hash)throw new Error("invalid_pay_origin");
 async function request(path,body){
  const token=await getToken();
  if(typeof token!=="string"||!token)throw new Error("service_token_required");
  const res=await fetcher(new URL(path,base),{method:body===undefined?"GET":"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),redirect:"error",signal:AbortSignal.timeout(15000)});
  const data=await res.json();
  if(!res.ok)throw Object.assign(new Error("pay_request_failed"),{status:res.status,code:data.error});
  return data;
 }
 const query=(path,params)=>path+"?"+new URLSearchParams(params);
 return Object.freeze({
  checkout:body=>request("/v1/application/checkout",body),
  paymentStatus:id=>request(query("/v1/application/payment-status",{intent_id:id})),
  startTrial:body=>request("/v1/application/subscriptions/trial",body),
  subscriptionStatus:(plan,customer)=>request(query("/v1/application/subscriptions/status",{plan_id:plan,customer_subject:customer})),
  fulfill:intent=>request("/v1/application/subscriptions/fulfill",{intent_id:intent}),
  events:cursor=>request(query("/v1/application/events",cursor?{cursor}:{}))
 });
}
