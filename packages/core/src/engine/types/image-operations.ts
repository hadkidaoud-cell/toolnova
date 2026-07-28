import type { ImageFormat, ImageInterpolation, ImageBlendMode, ImageExtendBackground } from "./image-format";
import type { ImageRegion, ImageColor } from "./image-metadata";

export type ImageOperationType =
  | "resize"
  | "compress"
  | "rotate"
  | "crop"
  | "merge"
  | "split"
  | "convert"
  | "flip"
  | "trim"
  | "extend"
  | "flatten"
  | "negate"
  | "normalize"
  | "blur"
  | "sharpen"
  | "threshold"
  | "modulate"
  | "tint"
  | "gamma";

export interface ImageOperation {
  type: ImageOperationType;
  params: Record<string, unknown>;
}

export interface ResizeParams {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top" | "center" | "entropy" | "attention";
  background?: ImageColor;
  kernel?: ImageInterpolation;
  withoutEnlargement?: boolean;
  withoutReduction?: boolean;
}

export interface CompressParams {
  quality: number;
  effort?: number;
  lossless?: boolean;
  nearLossless?: boolean;
  chromaSubsampling?: boolean;
  palette?: boolean;
  colours?: number;
  dither?: number;
}

export interface RotateParams {
  angle: number;
  background?: ImageColor;
  extend?: ImageExtendBackground;
}

export interface CropParams {
  region: ImageRegion;
  gravity?: "north" | "northeast" | "east" | "southeast" | "south" | "southwest" | "west" | "northwest" | "center" | "centre" | "smart" | "entropy" | "attention";
}

export interface MergeParams {
  images: string[];
  operations: MergeOperation[];
}

export interface MergeOperation {
  input: string;
  blend?: ImageBlendMode;
  gravity?: string;
  left?: number;
  top?: number;
  premultiplied?: boolean;
}

export interface SplitParams {
  columns?: number;
  rows?: number;
  tileWidth?: number;
  tileHeight?: number;
}

export interface ConvertParams {
  format: ImageFormat;
  quality?: number;
  options?: Record<string, unknown>;
}

export interface FlipParams {
  direction: "horizontal" | "vertical" | "both";
}

export interface TrimParams {
  threshold?: number;
  background?: ImageColor;
  lineArt?: boolean;
}

export interface ExtendParams {
  width?: number;
  height?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  background?: ImageColor | ImageExtendBackground;
}

export interface FlattenParams {
  background?: ImageColor;
}

export interface NegateParams {
  alpha?: boolean;
}

export interface NormalizeParams {
  lower?: number;
  upper?: number;
}

export interface BlurParams {
  sigma: number;
  minAmplitude?: number;
}

export interface SharpenParams {
  sigma?: number;
  m1?: number;
  m2?: number;
  x1?: number;
  y2?: number;
  y3?: number;
}

export interface ThresholdParams {
  threshold: number;
  options?: {
    greyscale?: boolean;
    alpha?: boolean;
    threshold?: "above" | "below";
  };
}

export interface ModulateParams {
  brightness?: number;
  saturation?: number;
  hue?: number;
  lightness?: number;
}

export interface TintParams {
  r: number;
  g: number;
  b: number;
}

export interface GammaParams {
  gamma?: number;
  gammaOut?: number;
}

export type ImageOperationParams =
  | ResizeParams
  | CompressParams
  | RotateParams
  | CropParams
  | MergeParams
  | SplitParams
  | ConvertParams
  | FlipParams
  | TrimParams
  | ExtendParams
  | FlattenParams
  | NegateParams
  | NormalizeParams
  | BlurParams
  | SharpenParams
  | ThresholdParams
  | ModulateParams
  | TintParams
  | GammaParams;
