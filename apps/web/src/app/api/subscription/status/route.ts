import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@toolnova/database";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ plan: "free", expiresAt: null });
    }

    const uid = parseInt(userId, 10);
    if (isNaN(uid)) {
      return NextResponse.json({ plan: "free", expiresAt: null });
    }

    const subscription = await prisma.subscription.findUnique({ where: { userId: uid } });

    if (!subscription || subscription.status !== "active" || (subscription.expiresAt && subscription.expiresAt < new Date())) {
      return NextResponse.json({ plan: "free", expiresAt: null });
    }

    return NextResponse.json({
      plan: subscription.plan,
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json({ plan: "free", expiresAt: null });
  }
}
