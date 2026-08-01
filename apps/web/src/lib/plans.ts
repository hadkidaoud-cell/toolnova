export const PLAN_IDS = ["free", "pro", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type FeatureKey =
  | "imageBatch"
  | "csvRows"
  | "qrMaxSize"
  | "qrSvg"
  | "resumeDrafts";

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const FEATURE_LIMITS: Record<FeatureKey, Record<PlanId, number | null>> = {
  imageBatch: { free: 3, pro: 50, enterprise: null },
  csvRows: { free: 1000, pro: 100000, enterprise: null },
  qrMaxSize: { free: 300, pro: 800, enterprise: 800 },
  qrSvg: { free: 0, pro: 1, enterprise: 1 },
  resumeDrafts: { free: 1, pro: 25, enterprise: null },
};

export function limitFor(feature: FeatureKey, plan: PlanId): number | null {
  return FEATURE_LIMITS[feature][plan] ?? null;
}

export function isFeatureKey(value: unknown): value is FeatureKey {
  return typeof value === "string" && value in FEATURE_LIMITS;
}

export interface FeatureDecision {
  allowed: boolean;
  limit: number | null;
  plan: PlanId;
}

export function checkFeatureLimit(feature: FeatureKey, value: number, plan: PlanId): FeatureDecision {
  const limit = FEATURE_LIMITS[feature][plan] ?? null;
  return { allowed: limit === null || value <= limit, limit, plan };
}

export function isAllowed(feature: FeatureKey, plan: PlanId): boolean {
  const limit = limitFor(feature, plan);
  return limit === null || limit > 0;
}

export function isPaidPlan(plan: PlanId): boolean {
  return plan !== "free";
}
