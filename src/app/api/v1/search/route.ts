// ============================================================
// ToolNova API - Search
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_QUERY", message: "Search query is required" } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: [],
    meta: { query, total: 0 },
  });
}
