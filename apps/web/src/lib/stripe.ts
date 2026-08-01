import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: ["10 tools per day", "Basic features", "Community support"],
    apiLimit: 10,
  },
  pro: {
    name: "Pro",
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    features: ["Unlimited tools", "Advanced features", "Priority support", "API access (1,000 req/mo)", "No ads"],
    apiLimit: 1000,
  },
  enterprise: {
    name: "Enterprise",
    price: 29,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    features: ["Everything in Pro", "API access (10,000 req/mo)", "Custom integrations", "SLA", "Dedicated support"],
    apiLimit: 10000,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanById(id: string) {
  return PLANS[id as PlanId] || PLANS.free;
}
