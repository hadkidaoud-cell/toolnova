"use client";
import { ReactNode } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { Lock } from "lucide-react";
import { Button } from "@toolnova/ui";

export function PremiumGate({ children, required = "pro" }: { children: ReactNode; required?: string }) {
  const { subscription, loading } = useSubscription();
  
  if (loading) return <div className="animate-pulse h-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />;
  
  if (subscription.plan === "free" && required !== "free") {
    return (
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-neutral-950/50 z-10 flex flex-col items-center justify-center rounded-xl">
          <Lock className="h-8 w-8 text-neutral-400 mb-2" />
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">Premium Feature</p>
          <p className="text-sm text-neutral-500 mb-4">Upgrade to Pro to unlock this feature</p>
          <Button>Upgrade Now</Button>
        </div>
        <div className="opacity-30 pointer-events-none">{children}</div>
      </div>
    );
  }
  
  return <>{children}</>;
}
