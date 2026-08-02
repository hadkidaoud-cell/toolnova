"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, WandSparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

export function AISpotlight() {
  const { dict } = useI18n();
  const s = dict.home.aiSpotlight;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-brand-600 to-brand-700 p-8 sm:p-12">
            <div className="bg-grid absolute inset-0 opacity-10" />
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-10 top-10 hidden h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20 backdrop-blur md:flex"
            >
              <WandSparkles className="h-7 w-7 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute bottom-14 right-32 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur lg:flex"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>

            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20">
                <Sparkles className="h-3 w-3" />
                {s.badge}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {s.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-brand-50">{s.subtitle}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/tools/background-remover">
                  <Button className="h-12 bg-white px-7 text-brand-700 hover:bg-brand-50">
                    {s.cta}
                    <ArrowRight className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                  </Button>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-brand-100">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {s.privacy}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    {s.onDevice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
