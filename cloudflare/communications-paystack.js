// Paystack verification is server-to-server. Never trust browser payment success or unverified webhooks.
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export async function verifyCommunicationsPayment(req,env,fetcher=fetch){
 if(!env.COMMUNICATIONS_BILLING_TOKEN||req.headers.get("authorization")!=="Bearer "+env.COMMUNICATIONS_BILLING_TOKEN)return json({error:"Unauthorized"},401);
 if(!env.PAYSTACK_SECRET_KEY)return json({error:"Paystack not configured"},503);
 let input;try{input=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const reference=input?.reference;
 if(typeof reference!=="string"||!/^[A-Za-z0-9._=-]{8,150}$/.test(reference))return json({error:"Invalid reference"},400);
 const record=await env.DB.prepare("SELECT reference,tenant_id,amount_kobo,currency,status FROM whatsapp_paystack_transactions WHERE reference=?").bind(reference).first();
 if(!record)return json({error:"Unknown payment reference"},404);
 if(record.status==="verified")return json({verified:true,already_verified:true});
 try{
  const response=await fetcher("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{authorization:"Bearer "+env.PAYSTACK_SECRET_KEY},signal:AbortSignal.timeout(12000)});
  if(!response.ok)return json({error:"Payment provider unavailable"},502);
  const payload=await response.json(),transaction=payload?.data;
  const valid=payload.status===true&&transaction?.status==="success"&&transaction.reference===reference&&Number(transaction.amount)===Number(record.amount_kobo)&&transaction.currency===record.currency&&String(transaction.id||"").length>0;
  if(!valid)return json({verified:false,reason:"Provider payment does not match expected transaction"},409);
  const update=await env.DB.prepare("UPDATE whatsapp_paystack_transactions SET status='verified',paystack_transaction_id=?,verified_at=CURRENT_TIMESTAMP WHERE reference=? AND status='pending'").bind(String(transaction.id),reference).run();
  return json({verified:Number(update.meta?.changes||0)===1,tenant_id:record.tenant_id,subscription_activated:false});
 }catch{return json({error:"Verification unavailable"},502)}
}
