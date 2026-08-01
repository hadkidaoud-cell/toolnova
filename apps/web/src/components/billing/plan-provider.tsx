"use client";

import * as React from "react";
import { PLAN_IDS, limitFor as limitForPlan, type FeatureKey, type PlanId } from "@/lib/plans";

const PLAN_STORAGE_KEY = "toolnova-plan-demo";

interface PlanContextValue {
  plan: PlanId;
  ready: boolean;
  isPro: boolean;
  limitFor: (feature: FeatureKey) => number | null;
  upgrade: () => void;
  setDemoPlan: (plan: PlanId) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = React.useState<PlanId>("free");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let detected: PlanId = "free";
      try {
        const demo = window.localStorage.getItem(PLAN_STORAGE_KEY);
        if (isPlanId(demo)) {
          detected = demo;
        } else {
          const res = await fetch("/api/subscription/status", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { plan?: string };
            if (isPlanId(data.plan)) detected = data.plan;
          }
        }
      } catch {
        /* fall back to free */
      }
      if (!cancelled) {
        setPlan(detected);
        setReady(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      plan,
      ready,
      isPro: plan !== "free",
      limitFor: (feature) => limitForPlan(feature, plan),
      upgrade: () => {
        window.location.assign("/pricing");
      },
      setDemoPlan: (next) => {
        try {
          window.localStorage.setItem(PLAN_STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
        setPlan(next);
      },
    }),
    [plan, ready]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return ctx;
}
