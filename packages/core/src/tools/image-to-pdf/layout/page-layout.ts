import type { PageDimensions, Margins, ProcessedImage, ImageEntry } from "../types";
import { getContentArea } from "../config";

export interface FitResult {
  fittedWidth: number;
  fittedHeight: number;
  x: number;
  y: number;
}

export function fitImageToPage(
  imageWidth: number,
  imageHeight: number,
  pageDimensions: PageDimensions,
  margins: Margins,
  rotation: number
): FitResult {
  const contentArea = getContentArea(pageDimensions, margins);

  let effectiveWidth = imageWidth;
  let effectiveHeight = imageHeight;

  if (rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270) {
    effectiveWidth = imageHeight;
    effectiveHeight = imageWidth;
  }

  const scaleX = contentArea.width / effectiveWidth;
  const scaleY = contentArea.height / effectiveHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const fittedWidth = effectiveWidth * scale;
  const fittedHeight = effectiveHeight * scale;

  const x = contentArea.x + (contentArea.width - fittedWidth) / 2;
  const y = contentArea.y + (contentArea.height - fittedHeight) / 2;

  return { fittedWidth, fittedHeight, x, y };
}

export function processImageForPage(
  entry: ImageEntry,
  pageDimensions: PageDimensions,
  margins: Margins
): ProcessedImage {
  const fit = fitImageToPage(
    entry.width,
    entry.height,
    pageDimensions,
    margins,
    entry.rotation
  );

  return {
    id: entry.id,
    buffer: entry.buffer,
    width: entry.width,
    height: entry.height,
    fittedWidth: fit.fittedWidth,
    fittedHeight: fit.fittedHeight,
    x: fit.x,
    y: fit.y,
    rotation: entry.rotation,
    name: entry.name,
  };
}

export function processAllImages(
  images: ImageEntry[],
  pageDimensions: PageDimensions,
  margins: Margins
): ProcessedImage[] {
  return images.map((img) => processImageForPage(img, pageDimensions, margins));
}
