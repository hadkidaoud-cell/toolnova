import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@toolnova/database";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const tool = await prisma.tool.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tool || tool.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await prisma.tool.update({
      where: { id: tool.id },
      data: { views: { increment: 1 } },
    });

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");

    await prisma.toolUsage.create({
      data: {
        toolId: tool.id,
        userId: Number.isFinite(userId) ? userId : null,
        ip,
        userAgent,
        referer,
        metadata: JSON.stringify({ source: "web", path: `/tools/${slug}`, timestamp: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
