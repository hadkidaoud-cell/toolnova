import type { QRConfig } from "../engine/types";
import { encode } from "../engine/encoder";
import { renderSVG } from "../renderer/svg-renderer";

export interface DownloadHistoryEntry {
  id: string;
  text: string;
  config: QRConfig;
  thumbnail: string;
  timestamp: number;
}

const HISTORY_KEY = "toolnova-qr-download-history";
const MAX_HISTORY = 50;

export function getDownloadHistory(): DownloadHistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(text: string, config: QRConfig): DownloadHistoryEntry {
  const history = getDownloadHistory();
  const matrix = encode(text, config.ecLevel);
  const thumbnail = renderSVG(matrix, { ...config, size: 64, margin: 1 });

  const entry: DownloadHistoryEntry = {
    id: `qr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    text,
    config: { ...config },
    thumbnail,
    timestamp: Date.now(),
  };

  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  return entry;
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

export function clearHistory(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(HISTORY_KEY);
  }
}

function getHistory(): DownloadHistoryEntry[] {
  return getDownloadHistory();
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
