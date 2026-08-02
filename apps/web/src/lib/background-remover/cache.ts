import { getModel, type BgModelId } from "./config";

const CACHE_NAME = "toolnova-bgremover-v1";

function supportsCacheApi(): boolean {
  return typeof caches !== "undefined";
}

async function openCache(): Promise<Cache | null> {
  if (!supportsCacheApi()) return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

async function readCache(url: string): Promise<ArrayBuffer | null> {
  const cache = await openCache();
  if (!cache) return null;
  try {
    const res = await cache.match(url);
    if (!res) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function writeCache(url: string, buffer: ArrayBuffer): Promise<void> {
  const cache = await openCache();
  if (!cache) return;
  try {
    await cache.put(url, new Response(buffer));
  } catch {
    /* cache full or unavailable — model still works this session */
  }
}

export async function fetchWithProgress(
  url: string,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch-failed:${res.status}`);
  const contentLength = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !contentLength) return res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      onProgress?.(received / contentLength);
    }
  }
  const blob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
  return await blob.arrayBuffer();
}

export async function loadModelBuffer(
  modelId: BgModelId,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  const cfg = getModel(modelId);
  const urls: string[] = [];
  if (cfg.localSource) urls.push(cfg.localSource);
  if (cfg.remoteUrl) urls.push(cfg.remoteUrl);

  let lastError: unknown = null;
  for (const url of urls) {
    const cached = await readCache(url);
    if (cached) return cached;
    try {
      const buffer = await fetchWithProgress(url, onProgress);
      await writeCache(url, buffer);
      return buffer;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(lastError instanceof Error ? lastError.message : "model-unavailable");
}
