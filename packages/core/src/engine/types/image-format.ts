export type ImageFormat = "png" | "jpg" | "jpeg" | "webp" | "gif" | "bmp";

export type ImageColorSpace = "srgb" | "rgb" | "cmyk" | "lab" | "gray" | "b-w";

export type ImageInterpolation = "nearest" | "bilinear" | "bicubic" | "lanczos" | "mitchell";

export type ImageFlipDirection = "horizontal" | "vertical" | "both";

export type ImageBlendMode =
  | "over"
  | "atop"
  | "xor"
  | "plus"
  | "minus"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "colour-dodge"
  | "colour-burn"
  | "linear-burn"
  | "difference"
  | "exclusion";

export type ImageExtendBackground = "white" | "black" | "transparent" | "mirror" | "repeat";

export type ImageOutputFormat = Exclude<ImageFormat, "jpg"> | "jpeg";

export const IMAGE_FORMATS: readonly ImageFormat[] = ["png", "jpg", "jpeg", "webp", "gif", "bmp"];

export const IMAGE_FORMAT_MIME: Record<ImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
};

export const SUPPORTED_FORMATS: ReadonlySet<ImageFormat> = new Set(IMAGE_FORMATS);

export function isValidFormat(format: string): format is ImageFormat {
  return SUPPORTED_FORMATS.has(format as ImageFormat);
}

export function normalizeFormat(format: string): ImageFormat {
  const lower = format.toLowerCase();
  if (lower === "jpg") return "jpeg";
  if (isValidFormat(lower)) return lower;
  throw new Error(`Unsupported image format: ${format}`);
}
