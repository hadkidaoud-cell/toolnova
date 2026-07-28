export type ECLevel = "L" | "M" | "Q" | "H";

export type EncodingMode = "numeric" | "alphanumeric" | "byte" | "kanji";

export interface QRConfig {
  text: string;
  ecLevel: ECLevel;
  size: number;
  margin: number;
  foreground: string;
  background: string;
  logoSize: number;
  logoDataUrl?: string;
}

export interface QRModule {
  row: number;
  col: number;
  dark: boolean;
  reserved: boolean;
}

export interface QRMatrix {
  size: number;
  modules: boolean[][];
  isFunction: boolean[][];
}

export const EC_LEVELS: Record<ECLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

export const DEFAULT_QR_CONFIG: QRConfig = {
  text: "https://toolnova.com",
  ecLevel: "M",
  size: 300,
  margin: 4,
  foreground: "#000000",
  background: "#ffffff",
  logoSize: 0,
};
