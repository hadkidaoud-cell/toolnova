// ============================================================
// ToolNova Privacy Policy Page
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ToolNova Privacy Policy - how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-toolnova py-16 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Last updated: January 2026
            </p>

            <div className="mt-10 space-y-8 text-neutral-700 dark:text-neutral-300">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Introduction
                </h2>
                <p className="leading-relaxed">
                  Welcome to ToolNova. We respect your privacy and are committed to protecting your
                  personal data. This privacy policy explains how we handle your information when you
                  use our website and tools.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Information We Collect
                </h2>
                <p className="mb-4 leading-relaxed">
                  ToolNova is designed with privacy in mind. Here&apos;s what we collect:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Usage Data:</strong> Anonymous analytics to understand how our tools are
                    used (page views, tool usage counts).
                  </li>
                  <li>
                    <strong>Contact Information:</strong> Only if you contact us via email or our
                    contact form.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  What We Don&apos;t Collect
                </h2>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Your files are processed in your browser and never uploaded to our servers.</li>
                  <li>We don&apos;t sell your data to third parties.</li>
                  <li>We don&apos;t track individual user behavior across websites.</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Contact Us
                </h2>
                <p className="leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at
                  hello@toolnova.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
