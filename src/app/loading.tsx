// ============================================================
// ToolNova Loading Page
// ============================================================

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600 dark:border-neutral-800 dark:border-t-brand-400" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    </div>
  );
}
