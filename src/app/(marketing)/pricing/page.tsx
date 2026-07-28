// ============================================================
// ToolNova Pricing Page
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "ToolNova pricing - all tools are free to use.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Access to all tools with no limits.",
    features: [
      "All tools included",
      "Unlimited usage",
      "No ads",
      "No file storage",
      "Standard support",
    ],
    cta: "Get Started Free",
    popular: true,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users who need more.",
    features: [
      "Everything in Free",
      "Priority processing",
      "File history (30 days)",
      "Batch processing",
      "Priority support",
    ],
    cta: "Coming Soon",
    popular: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams and businesses.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "File history (90 days)",
      "API access",
      "Custom branding",
    ],
    cta: "Coming Soon",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="section-padding">
          <div className="container-toolnova">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
                All tools are free to use. No hidden fees, no sign-up required.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-toolnova">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 ${
                    plan.popular
                      ? "border-brand-600 bg-white shadow-xl dark:bg-neutral-900"
                      : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-8 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
                      plan.popular
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
