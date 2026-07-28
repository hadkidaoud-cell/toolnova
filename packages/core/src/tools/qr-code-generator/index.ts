export { encode } from "./engine";
export type { ECLevel, QRConfig, QRMatrix, QRModule, EncodingMode } from "./engine";
export { EC_LEVELS, DEFAULT_QR_CONFIG, MAX_VERSION } from "./engine";
export { getDataCapacity, getECCount, getBlockInfo, getTotalCodewords } from "./engine";

export { renderSVG, renderToCanvas, canvasToBlob, canvasToDataURL, svgToDataUrl, downloadFile, copyImageToClipboard } from "./renderer";
export type { RenderOptions } from "./renderer";

export { getDownloadHistory, addToHistory, removeFromHistory, clearHistory, formatTimestamp } from "./utils";
export type { DownloadHistoryEntry } from "./utils";

export { createQRCodeGeneratorConfig, createDefaultQRConfig } from "./plugin-manifest";
export type { QRCodeGeneratorInput, QRCodeGeneratorOutput } from "./plugin-manifest";
