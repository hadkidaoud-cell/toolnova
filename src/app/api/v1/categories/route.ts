// ============================================================
// ToolNova API - Categories
// ============================================================

import { NextResponse } from "next/server";
import { TOOL_CATEGORIES } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: TOOL_CATEGORIES.map((cat, i) => ({
      id: cat.slug,
      ...cat,
      tools: [],
      order: i,
    })),
  });
}
