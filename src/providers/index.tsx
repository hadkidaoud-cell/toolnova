// ============================================================
// ToolNova Providers
// ============================================================

"use client";

import { ThemeProvider } from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
