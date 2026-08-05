export interface ToolMetadata {
  badges: string[];
  time: number;
  uses: number;
  free: boolean;
}

export type ToolBadge = "new" | "ai" | "popular" | "recommended";

const DEFAULT_METADATA: ToolMetadata = { badges: [], time: 1, uses: 0, free: true };

export function parseToolMetadata(metadata: string | null): ToolMetadata {
  if (!metadata) return { ...DEFAULT_METADATA };
  try {
    const parsed = JSON.parse(metadata) as Partial<ToolMetadata>;
    return {
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      time: typeof parsed.time === "number" ? parsed.time : 1,
      uses: typeof parsed.uses === "number" ? parsed.uses : 0,
      free: typeof parsed.free === "boolean" ? parsed.free : true,
    };
  } catch {
    return { ...DEFAULT_METADATA };
  }
}

export function stringifyToolMetadata(meta: ToolMetadata): string {
  return JSON.stringify(meta);
}
