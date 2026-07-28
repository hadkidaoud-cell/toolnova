// ============================================================
// ToolNova About Page
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Zap, Shield, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about ToolNova - every tool you need, one place.",
};

const values = [
  {
    icon: Zap,
    title: "Speed",
    description: "We build tools that work instantly. No waiting, no loading screens.",
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "Your data stays on your device. We never store or share your files.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Everyone deserves access to great tools. That's why everything is free.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="section-padding">
          <div className="container-toolnova">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                About ToolNova
              </h1>
              <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
                ToolNova was created with a simple mission: make powerful tools accessible to everyone.
                We believe that great software should be fast, free, and easy to use.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
          <div className="container-toolnova">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Our Values</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <value.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-toolnova">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-neutral-600 dark:text-neutral-400">
                <p>
                  ToolNova started as a side project by a group of developers who were tired of
                  searching for simple tools across dozens of websites. We wanted one place where
                  you could find everything you need.
                </p>
                <p>
                  Today, ToolNova serves thousands of users daily with free, fast, and reliable
                  online tools. We&apos;re constantly adding new tools and improving existing ones.
                </p>
                <p>
                  Our goal is simple: make every tool you need available in one place. No sign-ups
                  required. No hidden fees. Just tools that work.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
