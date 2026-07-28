import type { ImageFormat } from "./image-format";

export interface ImageMetadata {
  width: number;
  height: number;
  format: ImageFormat;
  channels: number;
  hasAlpha: boolean;
  colorSpace: string;
  density?: number;
  size: number;
  EXIF?: ImageExifData;
  ICC?: ImageICCProfile;
}

export interface ImageExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  flash?: boolean;
  whiteBalance?: string;
  exposureProgram?: number;
  meteringMode?: number;
  orientation?: number;
  copyright?: string;
  artist?: string;
  imageDescription?: string;
  userComment?: string;
  GPS?: ImageGPSData;
}

export interface ImageGPSData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeRef?: string;
  longitudeRef?: string;
}

export interface ImageICCProfile {
  name: string;
  description: string;
  colorSpace: string;
}

export interface ImageDimension {
  width: number;
  height: number;
}

export interface ImageRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ImagePoint {
  x: number;
  y: number;
}

export interface ImagePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ImageColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function createColor(r: number, g: number, b: number, a: number = 255): ImageColor {
  return { r, g, b, a };
}

export const COLORS = {
  WHITE: createColor(255, 255, 255),
  BLACK: createColor(0, 0, 0),
  TRANSPARENT: createColor(0, 0, 0, 0),
  RED: createColor(255, 0, 0),
  GREEN: createColor(0, 128, 0),
  BLUE: createColor(0, 0, 255),
} as const;
