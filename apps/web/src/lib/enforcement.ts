import prisma from "@toolnova/database";
import { checkFeatureLimit, type FeatureDecision, type FeatureKey, type PlanId } from "@/lib/plans";

const PLAN_IDS: readonly string[] = ["free", "pro", "enterprise"];

export function parseUserId(userId: string | null | undefined): number | null {
  if (!userId) return null;
  const uid = parseInt(userId, 10);
  return Number.isNaN(uid) ? null : uid;
}

export function normalizePlanId(plan: string): PlanId {
  return PLAN_IDS.includes(plan) ? (plan as PlanId) : "free";
}

export async function getEffectivePlanId(userId: string | null | undefined): Promise<PlanId> {
  const uid = parseUserId(userId);
  if (uid === null) return "free";
  try {
    const subscription = await prisma.subscription.findUnique({ where: { userId: uid } });
    if (!subscription || subscription.status !== "active") return "free";
    if (subscription.expiresAt && subscription.expiresAt < new Date()) return "free";
    return normalizePlanId(subscription.plan);
  } catch (error) {
    console.error("Effective plan lookup error:", error);
    return "free";
  }
}

export async function checkLimitForUser(
  feature: FeatureKey,
  value: number,
  userId: string | null | undefined
): Promise<FeatureDecision> {
  const plan = await getEffectivePlanId(userId);
  return checkFeatureLimit(feature, value, plan);
}

export async function recordToolUsage(
  slug: string,
  userId: string | null | undefined,
  meta: Record<string, unknown> = {}
): Promise<void> {
  try {
    const uid = parseUserId(userId);
    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool) return;
    await prisma.toolUsage.create({
      data: {
        toolId: tool.id,
        userId: uid,
        metadata: JSON.stringify({ source: "enforce", timestamp: new Date().toISOString(), ...meta }),
      },
    });
  } catch (error) {
    console.error("Usage record error:", error);
  }
}
