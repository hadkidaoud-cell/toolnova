// ============================================================
// ToolNova CTA
// ============================================================

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="section-padding bg-brand-600">
      <div className="container-toolnova text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to Get Things Done?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
          Join thousands of users who use ToolNova every day to boost their productivity.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-600 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
          >
            Explore All Tools
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
