"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { PdfInputFile, PdfPageInfo, PdfMergeConfig } from "@toolnova/core/src/tools/pdf-merger";
import {
  loadPdfFromFile,
  validatePdfFile,
  getPageInfos,
  formatFileSize,
  downloadBlob,
  mergePdfBuffers,
} from "@toolnova/core/src/tools/pdf-merger";

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

export default function PdfMergerPage() {
  const [files, setFiles] = useState<PdfInputFile[]>([]);
  const [pageInfos, setPageInfos] = useState<PdfPageInfo[]>([]);
  const [config, setConfig] = useState<PdfMergeConfig>({
    outputName: "merged.pdf",
    preserveBookmarks: true,
    preserveMetadata: true,
    flattenLayers: false,
    compressOutput: true,
  });
  const [merging, setMerging] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [previewFile, setPreviewFile] = useState<PdfInputFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPageCount = files.reduce((sum, f) => sum + f.pageCount, 0);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (files.length + incoming.length > 20) {
      showToast("Maximum 20 files allowed", "error");
      return;
    }

    const valid: PdfInputFile[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      const err = validatePdfFile(file);
      if (err) {
        errors.push(`${file.name}: ${err}`);
        continue;
      }
      try {
        const pdf = await loadPdfFromFile(file);
        valid.push(pdf);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "Failed to load"}`);
      }
    }

    if (errors.length > 0) showToast(errors[0], "error");
    if (valid.length > 0) {
      setFiles((prev) => {
        const updated = [...prev, ...valid];
        return updated;
      });
      showToast(`Added ${valid.length} PDF(s)`, "success");
    }
  }, [files.length]);

  useEffect(() => {
    const infos: PdfPageInfo[] = [];
    for (const f of files) {
      infos.push(...getPageInfos(f));
    }
    setPageInfos(infos);
    setResultBlob(null);
    setResultSize(0);
  }, [files]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  }, [previewFile]);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      const arr = [...prev];
      const item = arr[from];
      if (item === undefined || to < 0 || to >= arr.length) return arr;
      arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      showToast("Add at least 2 PDF files to merge", "error");
      return;
    }

    setMerging(true);
    setResultBlob(null);

    try {
      const buffers = files.map((f) => f.buffer);
      const outputName = config.outputName.endsWith(".pdf") ? config.outputName : `${config.outputName}.pdf`;
      const result = mergePdfBuffers(buffers, outputName);
      setResultBlob(result.blob);
      setResultSize(result.size);
      showToast(`Merged ${result.pageCount} pages into ${outputName}`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Merge failed", "error");
    } finally {
      setMerging(false);
    }
  }, [files, config]);

  const handleDownload = useCallback(() => {
    if (resultBlob === null) return;
    const outputName = config.outputName.endsWith(".pdf") ? config.outputName : `${config.outputName}.pdf`;
    downloadBlob(resultBlob, outputName);
  }, [resultBlob, config]);

  const previewUrl = previewFile !== null ? URL.createObjectURL(new Blob([previewFile.buffer], { type: "application/pdf" })) : null;

  useEffect(() => {
    return () => {
      if (previewUrl !== null) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {toast !== null && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14,
          background: toast.type === "success" ? "#198754" : toast.type === "error" ? "#dc3545" : "#0d6efd",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>{toast.message}</div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>PDF Merger</h1>
          <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>Combine multiple PDF files into one. Drag to reorder, preview, and download.</p>
        </header>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#0d6efd" : "#dee2e6"}`,
            borderRadius: 12, padding: "40px 24px", textAlign: "center", cursor: "pointer",
            background: dragOver ? "#e7f1ff" : "#fff", marginBottom: 24,
            transition: "all 0.2s",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9,15 12,12 15,15" />
          </svg>
          <p style={{ fontSize: 16, color: "#495057", fontWeight: 600, margin: "12px 0 4px" }}>
            Drop PDF files here or click to upload
          </p>
          <p style={{ fontSize: 13, color: "#adb5bd", margin: 0 }}>
            PDF files only — up to 100MB each — max 20 files
          </p>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,application/pdf"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: previewFile !== null ? "1fr 1fr" : "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* File List */}
          <div>
            {files.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 60, textAlign: "center", border: "1px solid #e9ecef" }}>
                <p style={{ color: "#adb5bd", fontSize: 15 }}>No PDF files added yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((file, idx) => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#0d6efd"; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = "#e9ecef"; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#e9ecef";
                      if (dragIdx !== null && dragIdx !== idx) moveFile(dragIdx, idx);
                      setDragIdx(null);
                    }}
                    onDragEnd={() => setDragIdx(null)}
                    style={{
                      background: previewFile?.id === file.id ? "#e7f1ff" : "#fff",
                      borderRadius: 10, padding: "14px 16px",
                      border: `2px solid ${previewFile?.id === file.id ? "#0d6efd" : "#e9ecef"}`,
                      display: "flex", gap: 12, alignItems: "center",
                      cursor: "grab", transition: "all 0.15s",
                    }}
                  >
                    {/* Drag Handle */}
                    <div style={{ color: "#adb5bd", fontSize: 18, cursor: "grab", userSelect: "none" }} title="Drag to reorder">⠿</div>

                    {/* Order Number */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: "#0d6efd", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>{idx + 1}</div>

                    {/* PDF Icon */}
                    <div style={{
                      width: 40, height: 48, borderRadius: 4, background: "#dc3545", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 11, flexShrink: 0, lineHeight: 1,
                    }}>PDF</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>
                        {file.pageCount} page{file.pageCount !== 1 ? "s" : ""} · {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewFile(previewFile?.id === file.id ? null : file); }}
                        title="Preview"
                        style={{
                          padding: "6px 10px", borderRadius: 6, border: `1px solid ${previewFile?.id === file.id ? "#0d6efd" : "#dee2e6"}`,
                          background: previewFile?.id === file.id ? "#e7f1ff" : "#fff",
                          color: previewFile?.id === file.id ? "#0d6efd" : "#495057",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>
                        {previewFile?.id === file.id ? "Close" : "Preview"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                        title="Remove"
                        style={{
                          padding: "6px 10px", borderRadius: 6, border: "1px solid #fecaca",
                          background: "#fff5f5", color: "#dc3545", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Merge Result */}
            {resultBlob !== null && (
              <div style={{
                marginTop: 16, background: "#fff", borderRadius: 12, border: "2px solid #198754",
                padding: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#198754" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                  <div>
                    <div style={{ fontWeight: 700, color: "#198754", fontSize: 16 }}>Merge Complete</div>
                    <div style={{ fontSize: 13, color: "#6c757d" }}>
                      {totalPageCount} pages · {formatFileSize(resultSize)}
                    </div>
                  </div>
                </div>
                <button onClick={handleDownload}
                  style={{
                    width: "100%", padding: "12px 20px", borderRadius: 8, border: "none",
                    background: "#198754", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                  }}>
                  Download Merged PDF
                </button>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewFile !== null && previewUrl !== null && (
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e9ecef",
              overflow: "hidden", position: "sticky", top: 24,
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e9ecef", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{previewFile.name}</span>
                <button onClick={() => setPreviewFile(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6c757d" }}>×</button>
              </div>
              <iframe src={previewUrl} title={previewFile.name}
                style={{ width: "100%", height: 600, border: "none" }} />
            </div>
          )}

          {/* Sidebar Settings */}
          {previewFile === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Settings</h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Output File Name</label>
                  <input type="text" value={config.outputName}
                    onChange={(e) => setConfig((c) => ({ ...c, outputName: e.target.value }))}
                    placeholder="merged.pdf"
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #dee2e6",
                      fontSize: 14, outline: "none", boxSizing: "border-box",
                    }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#495057" }}>
                    <input type="checkbox" checked={config.preserveBookmarks}
                      onChange={(e) => setConfig((c) => ({ ...c, preserveBookmarks: e.target.checked }))} />
                    <span>Preserve Bookmarks</span>
                  </label>
                </div>

                <div style={{ marginBottom: 0 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#495057" }}>
                    <input type="checkbox" checked={config.preserveMetadata}
                      onChange={(e) => setConfig((c) => ({ ...c, preserveMetadata: e.target.checked }))} />
                    <span>Preserve Metadata</span>
                  </label>
                </div>
              </div>

              {/* Stats */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1a1a2e" }}>Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6c757d" }}>Files</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{files.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6c757d" }}>Total Pages</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{totalPageCount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6c757d" }}>Total Size</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                    {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={handleMerge}
                  disabled={files.length < 2 || merging}
                  style={{
                    width: "100%", padding: "14px 20px", borderRadius: 8, border: "none",
                    background: files.length >= 2 && !merging ? "#0d6efd" : "#adb5bd",
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    cursor: files.length >= 2 && !merging ? "pointer" : "not-allowed",
                  }}>
                  {merging ? "Merging..." : `Merge ${files.length} PDFs`}
                </button>

                {files.length > 0 && (
                  <button onClick={() => { setFiles([]); setResultBlob(null); setPreviewFile(null); }}
                    style={{
                      width: "100%", padding: "10px 20px", borderRadius: 8, border: "1px solid #dee2e6",
                      background: "#fff", color: "#6c757d", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 340px"],
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
