import {createDomisLinkPay} from "./server.mjs";
// Internal backend adapter only. The caller must load an authorized, persisted
// tenant order and derive all fields from trusted records, not browser JSON.
export function centralPayBackend({enabled,getServiceToken,fetcher=fetch}){
 if(enabled!=="true")throw new Error("central_pay_disabled");
 const sdk=createDomisLinkPay({getToken:getServiceToken,fetcher});
 return Object.freeze({
  async checkout(order){
   if(!order||typeof order.productId!=="string"||typeof order.idempotencyKey!=="string"||typeof order.email!=="string"||!/^[A-Z]{2}$/.test(order.countryCode??""))throw new Error("invalid_trusted_order");
   const body={product_id:order.productId,idempotency_key:order.idempotencyKey,email:order.email,country_code:order.countryCode};
   if(order.subscriptionId!==undefined){
    if(typeof order.subscriptionId!=="string"||typeof order.customerSubject!=="string")throw new Error("invalid_subscription_order");
    body.subscription_id=order.subscriptionId;body.customer_subject=order.customerSubject;
   }
   return sdk.checkout(body);
  },
  // Only pass an intent ID previously bound to the authorized tenant order.
  paymentStatus:order=>{if(!order||typeof order.centralIntentId!=="string"||!order.centralIntentId)throw new Error("missing_order_intent");return sdk.paymentStatus(order.centralIntentId);}
 });
}
