"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n";

const PLAN_META = [
  { price: { monthly: "0", yearly: "0" }, popular: false },
  { price: { monthly: "9", yearly: "89" }, popular: true },
  { price: { monthly: "29", yearly: "289" }, popular: false },
];

export default function PricingPage() {
  const { dict } = useI18n();
  const [annual, setAnnual] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const PLANS = dict.pricing.plans.map((plan, i) => ({
    ...plan,
    price: PLAN_META[i]?.price ?? { monthly: "0", yearly: "0" },
    period: "/month",
    popular: PLAN_META[i]?.popular ?? false,
  }));

  const PRICING_FAQ = dict.pricing.faqItems;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50/50 to-white pb-20 pt-16 dark:border-neutral-800 dark:from-brand-950/10 dark:to-neutral-950">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-b from-brand-500/10 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-4">{dict.pricing.badge}</Badge>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
              {dict.pricing.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              {dict.pricing.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span className={cn("text-sm font-medium", !annual ? "text-neutral-900 dark:text-white" : "text-neutral-500")}>
              {dict.pricing.monthly}
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                annual ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-neutral-900 dark:text-white" : "text-neutral-500")}>
              {dict.pricing.yearly}
            </span>
            {annual && (
              <Badge variant="default" className="text-xs">
                {dict.pricing.saveUpTo}
              </Badge>
            )}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg",
                plan.popular
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 dark:border-brand-600 dark:bg-neutral-900"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1 text-xs">{dict.pricing.recommended}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-neutral-900 dark:text-white">
                  ${annual ? plan.price.yearly : plan.price.monthly}
                </span>
                {i !== 0 && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    /{annual ? "year" : "month"}
                  </span>
                )}
              </div>

              {annual && i !== 0 && (
                <p className="mb-6 text-sm text-brand-600 dark:text-brand-400">
                  ${plan.price.monthly}/mo billed annually
                </p>
              )}

              <Link href="#">
              <Button
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                className="mb-8 h-12 w-full text-base"
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
              </Button>
              </Link>

              <Separator className="mb-6" />

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600" />
                    )}
                    <span className={cn(f.included ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500")}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-8 max-w-lg rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400"
        >
          <Shield className="mx-auto mb-2 h-5 w-5 text-brand-600 dark:text-brand-400" />
          {dict.pricing.guarantee}
        </motion.div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50/50 py-20 dark:border-neutral-800 dark:bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">{dict.pricing.faqBadge}</Badge>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
              {dict.pricing.faqTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
              {dict.pricing.faqSubtitle}
            </p>
          </motion.div>

          <div className="mx-auto mt-12 max-w-2xl space-y-3">
            {PRICING_FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-neutral-900 dark:text-white"
                >
                  {item.q}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-neutral-500 transition-transform",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-neutral-100 px-6 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-16 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <Sparkles className="mx-auto h-8 w-8 text-white/70" />
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                {dict.pricing.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-brand-100">
                {dict.pricing.ctaSubtitle}
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="#">
                  <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                    {dict.pricing.contactSales}
                  </Button>
                </Link>
                <Link href="#">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                    {dict.pricing.viewDocs}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
