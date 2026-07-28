import type { ECLevel, QRConfig } from "./engine/types";
import { DEFAULT_QR_CONFIG } from "./engine/types";

export interface QRCodeGeneratorInput {
  text: string;
  ecLevel: ECLevel;
  size: number;
  margin: number;
  foreground: string;
  background: string;
  logoSize: number;
  logoDataUrl?: string;
}

export interface QRCodeGeneratorOutput {
  svg: string;
  matrix: import("./engine/types").QRMatrix;
  config: QRConfig;
}

export function createQRCodeGeneratorConfig(): import("../../sdk/types/tool-config").ToolConfig {
  return {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate high-quality QR codes with custom colors, sizes, error correction, and logo support",
    version: "1.0.0",
    category: "utilities",
    tags: ["qr", "code", "generator", "scan", "barcode", "utility"],
    icon: "qr-code",
    permissions: {
      access: "public",
    },
    timeout: 10000,
    retries: 1,
    retryDelay: 500,
    cacheable: false,
    cacheTtl: 0,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 120,
    },
    metadata: {
      author: "ToolNova",
      authorUrl: "https://toolnova.com",
      documentation: "https://toolnova.com/tools/qr-code-generator",
      license: "MIT",
    },
    inputs: [
      {
        id: "text",
        name: "Text or URL",
        type: "text",
        label: "Text or URL to encode",
        description: "Enter the text, URL, or data to encode in the QR code",
        required: true,
        defaultValue: "https://toolnova.com",
        placeholder: "https://example.com",
      },
      {
        id: "ecLevel",
        name: "Error Correction",
        type: "select",
        label: "Error Correction Level",
        description: "Higher levels add more redundancy for damaged codes",
        required: false,
        defaultValue: "M",
        options: [
          { label: "L - Low (7%)", value: "L" },
          { label: "M - Medium (15%)", value: "M" },
          { label: "Q - Quartile (25%)", value: "Q" },
          { label: "H - High (30%)", value: "H" },
        ],
      },
      {
        id: "size",
        name: "Size",
        type: "number",
        label: "QR Code Size (px)",
        description: "Width and height of the output image in pixels",
        required: false,
        defaultValue: 300,
        min: 100,
        max: 2000,
        step: 50,
      },
      {
        id: "margin",
        name: "Margin",
        type: "number",
        label: "Margin (modules)",
        description: "Quiet zone around the QR code in module units",
        required: false,
        defaultValue: 4,
        min: 0,
        max: 10,
        step: 1,
      },
      {
        id: "foreground",
        name: "Foreground Color",
        type: "color",
        label: "Foreground Color",
        description: "Color of the QR code modules",
        required: false,
        defaultValue: "#000000",
      },
      {
        id: "background",
        name: "Background Color",
        type: "color",
        label: "Background Color",
        description: "Color of the QR code background",
        required: false,
        defaultValue: "#ffffff",
      },
      {
        id: "logoSize",
        name: "Logo Size",
        type: "range",
        label: "Logo Size (%)",
        description: "Size of the center logo as percentage of QR code",
        required: false,
        defaultValue: 0,
        min: 0,
        max: 30,
        step: 1,
      },
    ],
    schema: {},
  };
}

export function createDefaultQRConfig(): QRConfig {
  return { ...DEFAULT_QR_CONFIG };
}
