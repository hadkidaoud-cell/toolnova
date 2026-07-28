// ============================================================
// ToolNova Error Page
// ============================================================

"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-bold text-red-500">!</p>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            An unexpected error occurred. Please try again.
          </p>
          <button onClick={reset} className="btn-primary mt-8">
            Try Again
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
