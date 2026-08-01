import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@toolnova/database";
import { getPlanById } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!userId) {
      return NextResponse.json({ toolUsage: 0, apiCalls: 0, limit: 10 });
    }

    const uid = parseInt(userId, 10);
    if (isNaN(uid)) {
      return NextResponse.json({ toolUsage: 0, apiCalls: 0, limit: 10 });
    }

    const subscription = await prisma.subscription.findUnique({ where: { userId: uid } });
    const plan = getPlanById(subscription?.plan ?? "free");

    const toolUsage = await prisma.toolUsage.count({
      where: { userId: uid, createdAt: { gte: today } },
    });

    const apiCalls = 0;

    return NextResponse.json({ toolUsage, apiCalls, limit: plan.apiLimit });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json({ toolUsage: 0, apiCalls: 0, limit: 10 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = parseInt(userId, 10);
    if (isNaN(uid)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const { toolId } = await req.json();

    await prisma.toolUsage.create({
      data: {
        toolId,
        userId: uid,
        metadata: JSON.stringify({ source: "api", timestamp: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage increment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
