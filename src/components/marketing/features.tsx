// ============================================================
// ToolNova Features
// ============================================================

import { Zap, Shield, Globe, Smartphone, Lock, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All tools load instantly. No waiting, no buffering.",
  },
  {
    icon: Shield,
    title: "100% Free",
    description: "Every tool is completely free. No hidden fees.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Access from any device, any browser, anywhere.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for mobile, works beautifully on all screens.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data stays on your device. We never store it.",
  },
  {
    icon: Sparkles,
    title: "Regular Updates",
    description: "New tools and features added weekly.",
  },
];

export function Features() {
  return (
    <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-toolnova">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            Why Choose ToolNova?
          </h2>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            Built for speed, designed for everyone
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-700"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
