export interface ThumbnailPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  hint: string;
}

export const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  { id: "youtube", label: "YouTube", width: 1280, height: 720, hint: "Thumbnail · 16:9" },
  { id: "twitter", label: "X / Twitter", width: 1600, height: 900, hint: "Post · 16:9" },
  { id: "facebook", label: "Facebook", width: 1200, height: 630, hint: "Post · 1.91:1" },
  { id: "instagram", label: "Instagram", width: 1080, height: 1080, hint: "Post · 1:1" },
  { id: "story", label: "Story", width: 1080, height: 1920, hint: "Story · 9:16" },
  { id: "linkedin", label: "LinkedIn", width: 1584, height: 396, hint: "Banner · 4:1" },
  { id: "blog", label: "Blog Card", width: 1200, height: 630, hint: "OG image · 1.91:1" },
];

export function getPreset(id: string): ThumbnailPreset {
  return THUMBNAIL_PRESETS.find((p) => p.id === id) ?? THUMBNAIL_PRESETS[0]!;
}

export interface ThumbnailOptions {
  preset: ThumbnailPreset;
  background: string;
  background2: string;
  useGradient: boolean;
  accent: string;
  title: string;
  titleColor: string;
  subtitle: string;
  subtitleColor: string;
  logoImage?: HTMLImageElement;
}

const TITLE_CHARS_PER_LINE = 26;
const SUBTITLE_CHARS_PER_LINE = 44;

export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  let truncated = false;
  for (const word of words) {
    const next = current === "" ? word : current + " " + word;
    if (current !== "" && next.length > maxChars) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) {
        truncated = true;
        break;
      }
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current !== "") lines.push(current);
  if (truncated && lines.length > 0) {
    const last = lines[lines.length - 1] ?? "";
    lines[lines.length - 1] = last.length >= 3 ? last.slice(0, -3) + "..." : last;
  }
  return lines;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const value = Number.parseInt(clean, 16);
  if (Number.isNaN(value) || clean.length !== 6) return { r: 17, g: 24, b: 39 };
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function cssColor(hex: string, alpha = 1): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawText(canvas: HTMLCanvasElement, options: ThumbnailOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  const titleLines = wrapText(options.title, TITLE_CHARS_PER_LINE, 3);
  const subtitleLines = wrapText(options.subtitle, SUBTITLE_CHARS_PER_LINE, 2);

  const titleSize = Math.round(width * 0.075);
  const subtitleSize = Math.round(width * 0.037);
  const hasLogo = Boolean(options.logoImage);
  const logoZone = hasLogo ? Math.round(height * 0.22) : 0;
  const textTop = logoZone + Math.round(height * 0.05);

  ctx.textBaseline = "top";

  if (hasLogo && options.logoImage) {
    const img = options.logoImage;
    const maxW = Math.round(width * 0.3);
    const maxH = Math.round(height * 0.18);
    const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = Math.round(width * 0.06);
    const y = Math.round(height * 0.02);
    ctx.drawImage(img, x, y, w, h);
  }

  ctx.textAlign = "left";
  ctx.shadowColor = cssColor(options.background, 0.9);
  ctx.shadowBlur = Math.round(width * 0.008);

  ctx.font = `800 ${titleSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = options.titleColor;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, Math.round(width * 0.06), textTop + i * titleSize * 1.15);
  });

  ctx.font = `500 ${subtitleSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = options.subtitleColor;
  subtitleLines.forEach((line, i) => {
    ctx.fillText(line, Math.round(width * 0.06), textTop + titleLines.length * titleSize * 1.15 + i * subtitleSize * 1.4);
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = options.accent;
  ctx.fillRect(0, 0, Math.round(width * 0.012), height);
}

export function renderThumbnail(options: ThumbnailOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = options.preset.width;
  canvas.height = options.preset.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (options.useGradient && options.background2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, options.background);
    gradient.addColorStop(1, options.background2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = options.background;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawText(canvas, options);
  return canvas;
}
