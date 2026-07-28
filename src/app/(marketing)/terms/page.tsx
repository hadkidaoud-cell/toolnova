// ============================================================
// ToolNova Terms of Service Page
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ToolNova Terms of Service.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-toolnova py-16 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Last updated: January 2026
            </p>

            <div className="mt-10 space-y-8 text-neutral-700 dark:text-neutral-300">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Acceptance of Terms
                </h2>
                <p className="leading-relaxed">
                  By accessing or using ToolNova, you agree to be bound by these Terms of Service.
                  If you do not agree, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Use of Services
                </h2>
                <p className="mb-4 leading-relaxed">You agree to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Use our tools for lawful purposes only.</li>
                  <li>Not attempt to disrupt or compromise our services.</li>
                  <li>Not use automated systems to access our tools without permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Intellectual Property
                </h2>
                <p className="leading-relaxed">
                  The tools and content on ToolNova are owned by us and protected by intellectual
                  property laws. You may use the tools but may not copy or redistribute our code or
                  content.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Limitation of Liability
                </h2>
                <p className="leading-relaxed">
                  ToolNova is provided &quot;as is&quot; without warranties. We are not liable for any
                  damages arising from your use of our tools.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
                  Changes to Terms
                </h2>
                <p className="leading-relaxed">
                  We may update these terms from time to time. Continued use of our services after
                  changes constitutes acceptance of the new terms.
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
