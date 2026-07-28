"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Something went wrong
        </h1>
        <button
          onClick={() => reset()}
          className="mt-8 inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
