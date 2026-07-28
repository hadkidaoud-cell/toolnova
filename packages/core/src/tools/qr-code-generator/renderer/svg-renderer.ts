import type { QRMatrix, QRConfig } from "../engine/types";

export interface RenderOptions {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  logoDataUrl?: string;
  logoSize: number;
  format: "svg" | "png";
}

export function renderSVG(matrix: QRMatrix, config: QRConfig): string {
  const moduleCount = matrix.size;
  const moduleSize = 1;
  const totalSize = moduleCount + config.margin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${config.size}" height="${config.size}" shape-rendering="crispEdges">`;
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="${config.background}"/>`;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix.modules[row]![col]) {
        svg += `<rect x="${col + config.margin}" y="${row + config.margin}" width="${moduleSize}" height="${moduleSize}" fill="${config.foreground}"/>`;
      }
    }
  }

  if (config.logoSize > 0) {
    const logoPixels = Math.floor(moduleCount * config.logoSize * 0.01);
    const logoX = (totalSize - logoPixels) / 2;
    const logoY = (totalSize - logoPixels) / 2;
    const padding = 0.5;

    svg += `<rect x="${logoX - padding}" y="${logoY - padding}" width="${logoPixels + padding * 2}" height="${logoPixels + padding * 2}" rx="1" fill="${config.background}"/>`;

    if (config.logoDataUrl) {
      svg += `<image x="${logoX}" y="${logoY}" width="${logoPixels}" height="${logoPixels}" href="${config.logoDataUrl}" preserveAspectRatio="xMidYMid meet"/>`;
    } else {
      const cx = logoX + logoPixels / 2;
      const cy = logoY + logoPixels / 2;
      const r = logoPixels * 0.3;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${config.foreground}" opacity="0.3"/>`;
      svg += `<rect x="${cx - r * 0.6}" y="${cy - r * 0.15}" width="${r * 1.2}" height="${r * 0.3}" fill="${config.background}"/>`;
      svg += `<rect x="${cx - r * 0.15}" y="${cy - r * 0.6}" width="${r * 0.3}" height="${r * 1.2}" fill="${config.background}"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

export function renderToCanvas(matrix: QRMatrix, config: QRConfig): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;

  const moduleCount = matrix.size;
  const marginModules = config.margin;
  const totalModules = moduleCount + marginModules * 2;
  const moduleSize = Math.max(1, Math.floor(config.size / totalModules));

  const canvas = document.createElement("canvas");
  canvas.width = totalModules * moduleSize;
  canvas.height = totalModules * moduleSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = config.foreground;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix.modules[row]![col]) {
        ctx.fillRect(
          (col + marginModules) * moduleSize,
          (row + marginModules) * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }

  if (config.logoSize > 0 && config.logoDataUrl) {
    const logoPixels = Math.floor(moduleCount * config.logoSize * 0.01) * moduleSize;
    const logoX = (canvas.width - logoPixels) / 2;
    const logoY = (canvas.height - logoPixels) / 2;
    const padding = moduleSize;

    ctx.fillStyle = config.background;
    ctx.fillRect(logoX - padding, logoY - padding, logoPixels + padding * 2, logoPixels + padding * 2);

    const img = new Image();
    img.src = config.logoDataUrl;
    ctx.drawImage(img, logoX, logoY, logoPixels, logoPixels);
  }

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to convert canvas to blob"));
    }, "image/png");
  });
}

export function canvasToDataURL(canvas: HTMLCanvasElement, format: "png" | "jpeg" = "png"): string {
  return canvas.toDataURL(`image/${format}`);
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function downloadFile(data: string, filename: string, _mimeType: string): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("a");
  link.href = data;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyImageToClipboard(matrix: QRMatrix, config: QRConfig): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.write) return false;

  try {
    const svg = renderSVG(matrix, config);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    await navigator.clipboard.write([
      new ClipboardItem({ "image/svg+xml": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
