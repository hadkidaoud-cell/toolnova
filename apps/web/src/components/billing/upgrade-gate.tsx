"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n";
import { usePlan } from "./plan-provider";
import type { PlanId } from "@/lib/plans";

export function ProBadge({ className }: { className?: string }) {
  const { dict } = useI18n();
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-brand-500 ${className ?? ""}`}
    >
      {dict.tools.planGate.badge}
    </span>
  );
}

interface UpgradeGateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

const DEMO_PLANS: PlanId[] = ["pro", "enterprise", "free"];

export function UpgradeGate({ title, description, className = "" }: UpgradeGateProps) {
  const { dict } = useI18n();
  const pg = dict.tools.planGate;
  const { setDemoPlan } = usePlan();
  const [showDemo, setShowDemo] = React.useState(false);

  const planLabels: Record<PlanId, string> = {
    free: pg.planFreeLabel,
    pro: pg.planProLabel,
    enterprise: pg.planEnterpriseLabel,
  };

  return (
    <div className={`rounded-xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800 dark:bg-brand-950/30 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{title ?? pg.title}</span>
        <ProBadge />
      </div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{description ?? pg.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            window.location.assign("/pricing");
          }}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {pg.cta}
        </button>
        <button
          onClick={() => setShowDemo((s) => !s)}
          className="text-xs font-medium text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-400"
        >
          {pg.demoSwitch}
        </button>
      </div>
      {showDemo && (
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setDemoPlan(p)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {planLabels[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
