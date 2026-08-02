import {
  canvasFromImage,
  canvasToBlob,
  blobToDataUrl,
} from "./image-utils";

export type ImageFormat = "png" | "jpeg" | "webp" | "gif" | "bmp" | "other";

export type WebpTarget = "png" | "jpeg";

export function detectImageFormat(fileName: string, mimeType: string): ImageFormat {
  const ext = (fileName.split(".").pop() ?? "").toLowerCase();
  if (mimeType === "image/png" || ext === "png") return "png";
  if (mimeType === "image/jpeg" || mimeType === "image/jpg" || ext === "jpg" || ext === "jpeg") return "jpeg";
  if (mimeType === "image/webp" || ext === "webp") return "webp";
  if (mimeType === "image/gif" || ext === "gif") return "gif";
  if (mimeType === "image/bmp" || ext === "bmp") return "bmp";
  return "other";
}

export function encodeToWebp(
  image: HTMLImageElement,
  quality: number
): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const canvas = canvasFromImage(image);
    canvasToBlob(canvas, "image/webp", quality / 100)
      .then((blob) => {
        if (!blob) {
          reject(new Error("encode-failed"));
          return;
        }
        blobToDataUrl(blob).then((dataUrl) => resolve({ dataUrl, size: blob.size })).catch(reject);
      })
      .catch(reject);
  });
}

export function encodeFromWebp(
  image: HTMLImageElement,
  target: WebpTarget,
  quality: number
): Promise<{ dataUrl: string; size: number; ext: string }> {
  return new Promise((resolve, reject) => {
    const canvas = canvasFromImage(image);
    const ctx = canvas.getContext("2d");
    if (target === "jpeg" && ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    }
    const mimeType = target === "png" ? "image/png" : "image/jpeg";
    canvasToBlob(canvas, mimeType, target === "jpeg" ? quality / 100 : undefined)
      .then((blob) => {
        if (!blob) {
          reject(new Error("encode-failed"));
          return;
        }
        blobToDataUrl(blob).then((dataUrl) => resolve({ dataUrl, size: blob.size, ext: target === "png" ? "png" : "jpg" })).catch(reject);
      })
      .catch(reject);
  });
}
