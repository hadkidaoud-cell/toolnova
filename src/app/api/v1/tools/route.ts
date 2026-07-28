// ============================================================
// ToolNova API - Tools
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  return NextResponse.json({
    success: true,
    data: [],
    meta: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  });
}
