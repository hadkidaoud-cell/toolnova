"use client";
import { useUsage } from "@/hooks/use-usage";
import { Progress } from "@toolnova/ui";
import { Button } from "@toolnova/ui";

export function UsageCounter() {
  const { usage, loading, isLimited } = useUsage();

  if (loading) return <div className="animate-pulse h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />;

  const percentage = Math.min((usage.toolUsage / usage.limit) * 100, 100);

  return (
    <div className="space-y-2 p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          {usage.toolUsage}/{usage.limit} tools used today
        </span>
        {isLimited && (
          <span className="text-xs text-red-500 font-semibold">Limit reached</span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
      {isLimited && (
        <div className="pt-1">
          <Button size="sm" variant="primary" className="w-full text-xs">
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}
