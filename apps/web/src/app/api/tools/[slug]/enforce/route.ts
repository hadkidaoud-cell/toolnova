import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FEATURE_LIMITS, isFeatureKey } from "@/lib/plans";
import { checkLimitForUser, getEffectivePlanId, recordToolUsage } from "@/lib/enforcement";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const body = (await req.json().catch(() => null)) as { feature?: unknown; value?: unknown } | null;
    const feature = body?.feature;
    const value = body?.value;

    if (!isFeatureKey(feature) || typeof value !== "number" || Number.isNaN(value) || value < 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const decision = await checkLimitForUser(feature, value, userId);

    if (decision.allowed) {
      await recordToolUsage(slug, userId, { feature, value });
    }

    return NextResponse.json(decision);
  } catch (error) {
    console.error("Enforcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    const plan = await getEffectivePlanId(userId);
    return NextResponse.json({ slug, plan, limits: FEATURE_LIMITS });
  } catch (error) {
    console.error("Enforcement limits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
