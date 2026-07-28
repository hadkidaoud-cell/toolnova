export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
