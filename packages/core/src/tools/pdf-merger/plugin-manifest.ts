import type { PdfMergeConfig } from "./types";
import { DEFAULT_MERGE_CONFIG } from "./types";

export interface PdfMergerInput {
  files: File[];
  outputName?: string;
  preserveBookmarks?: boolean;
  preserveMetadata?: boolean;
  pageSelections?: Record<string, number[]>;
}

export interface PdfMergerOutput {
  blob: Blob;
  dataUrl: string;
  fileName: string;
  size: number;
  pageCount: number;
  sourceFiles: number;
}

export function createPdfMergerConfig(): import("../../sdk/types/tool-config").ToolConfig {
  return {
    id: "pdf-merger",
    name: "PDF Merger",
    description: "Merge multiple PDF files into a single document with drag & drop, reordering, and preview",
    version: "1.0.0",
    category: "utilities",
    tags: ["pdf", "merge", "combine", "join", "document", "utility"],
    icon: "pdf-merge",
    permissions: {
      access: "public",
    },
    timeout: 120000,
    retries: 0,
    retryDelay: 0,
    cacheable: false,
    cacheTtl: 0,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 10,
    },
    metadata: {
      author: "ToolNova",
      authorUrl: "https://toolnova.com",
      documentation: "https://toolnova.com/tools/pdf-merger",
      license: "MIT",
    },
    inputs: [
      {
        id: "files",
        name: "PDF Files",
        type: "file",
        label: "Upload PDF Files",
        description: "Select one or more PDF files to merge (max 20 files, 100MB each)",
        required: true,
        accept: "application/pdf",
      },
      {
        id: "outputName",
        name: "Output Name",
        type: "text",
        label: "Output File Name",
        description: "Name for the merged PDF file",
        required: false,
        defaultValue: "merged.pdf",
        placeholder: "merged.pdf",
      },
      {
        id: "preserveBookmarks",
        name: "Preserve Bookmarks",
        type: "boolean",
        label: "Preserve Bookmarks",
        description: "Keep bookmarks from source PDFs in the merged file",
        required: false,
        defaultValue: true,
      },
      {
        id: "preserveMetadata",
        name: "Preserve Metadata",
        type: "boolean",
        label: "Preserve Metadata",
        description: "Keep document metadata from source files",
        required: false,
        defaultValue: true,
      },
    ],
    schema: {},
  };
}

export function createDefaultMergeConfig(): PdfMergeConfig {
  return { ...DEFAULT_MERGE_CONFIG };
}
