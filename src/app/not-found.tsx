// ============================================================
// ToolNova 404 Page
// ============================================================

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-8xl font-bold text-brand-600">404</p>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-primary"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/tools"
              className="btn-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Tools
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
