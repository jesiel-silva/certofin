import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    });
  }

  return stripeInstance;
}

export const STRIPE_CONFIG = {
  priceIdPro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID_PRO || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};
