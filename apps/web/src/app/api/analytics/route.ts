import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, action } = body;

    console.log(`[Analytics] tool=${tool}, action=${action}`, { timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
