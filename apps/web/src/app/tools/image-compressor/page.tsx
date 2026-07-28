"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  loadImageFromFile,
  compressImage,
  compressBatch,
  downloadCompressedImage,
  downloadAllCompressed,
  validateImageFile,
  formatFileSize,
  getSavingsColor,
} from "@toolnova/core/src/tools/image-compressor";
import type {
  ImageFile,
  CompressionResult,
  CompressionConfig,
  CompressionFormat,
  CompressionPreset,
} from "@toolnova/core/src/tools/image-compressor";

const FORMAT_OPTIONS: { value: CompressionFormat; label: string }[] = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

const PRESET_OPTIONS: { value: CompressionPreset; label: string; desc: string }[] = [
  { value: "web", label: "Web", desc: "Optimized for web — 80% quality" },
  { value: "print", label: "Print", desc: "High quality for print — 95%" },
  { value: "maximum", label: "Max", desc: "Lossless — 100%" },
  { value: "minimum", label: "Min", desc: "Smallest size — 50%" },
  { value: "custom", label: "Custom", desc: "Set your own quality" },
];

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

export default function ImageCompressorPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [config, setConfig] = useState<Partial<CompressionConfig>>({
    format: "jpeg",
    quality: 85,
    preset: "web",
    maintainExif: true,
    progressive: true,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [toast, setToast] = useState<Toast | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const valid: ImageFile[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }
      try {
        const imageFile = await loadImageFromFile(file);
        valid.push(imageFile);
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "Failed to load"}`);
      }
    }

    if (errors.length > 0) {
      showToast(errors[0], "error");
    }

    setImages((prev) => [...prev, ...valid]);
    if (valid.length > 0) {
      showToast(`Added ${valid.length} image(s)`, "success");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleCompress = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setResults([]);
    setProgress({ completed: 0, total: images.length });

    try {
      const batchResult = await compressBatch(images, config, (completed, total) => {
        setProgress({ completed, total });
      });
      setResults(batchResult.results);
      showToast(
        `Compressed ${batchResult.results.length} images — saved ${formatFileSize(batchResult.totalSavings)} (${batchResult.totalSavingsPercent}%)`,
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Compression failed", "error");
    } finally {
      setProcessing(false);
    }
  }, [images, config]);

  const handleCompressSingle = useCallback(async (image: ImageFile) => {
    try {
      const result = await compressImage(image, config);
      setResults((prev) => {
        const filtered = prev.filter((r) => r.originalId !== image.id);
        return [...filtered, result];
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  }, [config]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResults((prev) => prev.filter((r) => r.originalId !== id));
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setResults([]);
  }, []);

  const getResultForImage = (imageId: string): CompressionResult | undefined => {
    return results.find((r) => r.originalId === imageId);
  };

  const totalOriginal = results.reduce((sum, r) => sum + r.original.size, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressed.size, 0);
  const totalSavings = totalOriginal - totalCompressed;
  const totalSavingsPercent = totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14,
          background: toast.type === "success" ? "#198754" : toast.type === "error" ? "#dc3545" : "#0d6efd",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>{toast.message}</div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>Image Compressor</h1>
          <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>Compress PNG, JPG, JPEG, and WebP images with real-time preview</p>
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
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, color: "#495057", fontWeight: 600, margin: "0 0 4px" }}>
            Drop images here or click to upload
          </p>
          <p style={{ fontSize: 13, color: "#adb5bd", margin: 0 }}>
            PNG, JPG, JPEG, WebP — up to 50MB each — max 50 files
          </p>
          <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: "none" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Images Grid */}
          <div>
            {images.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 60, textAlign: "center", border: "1px solid #e9ecef" }}>
                <p style={{ color: "#adb5bd", fontSize: 15 }}>No images uploaded yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {images.map((image) => {
                  const result = getResultForImage(image.id);
                  return (
                    <div key={image.id} style={{
                      background: "#fff", borderRadius: 12, padding: 16,
                      border: "1px solid #e9ecef", display: "flex", gap: 16, alignItems: "center",
                    }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 80, height: 80, borderRadius: 8, overflow: "hidden",
                        background: "#f1f3f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <img src={image.thumbnail} alt={image.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {image.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>
                          {image.width}x{image.height} | {formatFileSize(image.size)}
                        </div>

                        {result && (
                          <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#6c757d" }}>→</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>
                              {formatFileSize(result.compressed.size)}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                              color: "#fff", background: getSavingsColor(result.compressed.savingsPercent),
                            }}>
                              {result.compressed.savingsPercent > 0 ? "-" : "+"}{Math.abs(result.compressed.savingsPercent)}%
                            </span>
                            <span style={{ fontSize: 11, color: "#adb5bd" }}>
                              {result.processingTime}ms
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        {result ? (
                          <button onClick={() => downloadCompressedImage(result)}
                            style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                            Download
                          </button>
                        ) : (
                          <button onClick={() => handleCompressSingle(image)}
                            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #dee2e6", background: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                            Compress
                          </button>
                        )}
                        <button onClick={() => removeImage(image.id)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc3545", fontSize: 12, cursor: "pointer" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {results.length > 0 && (
              <div style={{
                marginTop: 16, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16,
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 4 }}>Original</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{formatFileSize(totalOriginal)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 4 }}>Compressed</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{formatFileSize(totalCompressed)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 4 }}>Saved</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: getSavingsColor(totalSavingsPercent) }}>
                    {formatFileSize(Math.abs(totalSavings))}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 4 }}>Reduction</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: getSavingsColor(totalSavingsPercent) }}>
                    {totalSavingsPercent > 0 ? "-" : ""}{Math.abs(totalSavingsPercent)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Settings</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Output Format</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {FORMAT_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => setConfig((c) => ({ ...c, format: opt.value }))}
                      style={{
                        flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: `2px solid ${config.format === opt.value ? "#0d6efd" : "#dee2e6"}`,
                        background: config.format === opt.value ? "#e7f1ff" : "#fff",
                        color: config.format === opt.value ? "#0d6efd" : "#495057",
                      }}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Preset</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PRESET_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => {
                        setConfig((c) => ({ ...c, preset: opt.value }));
                        if (opt.value === "web") setConfig((c) => ({ ...c, quality: 80 }));
                        if (opt.value === "print") setConfig((c) => ({ ...c, quality: 95 }));
                        if (opt.value === "maximum") setConfig((c) => ({ ...c, quality: 100 }));
                        if (opt.value === "minimum") setConfig((c) => ({ ...c, quality: 50 }));
                      }}
                      style={{
                        padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer", textAlign: "left",
                        border: `2px solid ${config.preset === opt.value ? "#0d6efd" : "#dee2e6"}`,
                        background: config.preset === opt.value ? "#e7f1ff" : "#fff",
                      }}>
                      <span style={{ fontWeight: 600, color: config.preset === opt.value ? "#0d6efd" : "#1a1a2e" }}>{opt.label}</span>
                      <span style={{ fontSize: 11, color: "#6c757d", marginLeft: 6 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {config.preset === "custom" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                    Quality: {config.quality}%
                  </label>
                  <input type="range" min={1} max={100} step={1} value={config.quality}
                    onChange={(e) => setConfig((c) => ({ ...c, quality: Number(e.target.value), preset: "custom" }))}
                    style={{ width: "100%" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#adb5bd" }}>
                    <span>Smaller</span><span>Better</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#495057" }}>
                  <input type="checkbox" checked={config.maintainExif ?? true}
                    onChange={(e) => setConfig((c) => ({ ...c, maintainExif: e.target.checked }))} />
                  <span>Maintain EXIF Data</span>
                </label>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#495057" }}>
                  <input type="checkbox" checked={config.progressive ?? true}
                    onChange={(e) => setConfig((c) => ({ ...c, progressive: e.target.checked }))} />
                  <span>Progressive JPEG</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handleCompress} disabled={images.length === 0 || processing}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 8, border: "none",
                  background: images.length > 0 && !processing ? "#0d6efd" : "#adb5bd",
                  color: "#fff", fontWeight: 700, fontSize: 15, cursor: images.length > 0 && !processing ? "pointer" : "not-allowed",
                }}>
                {processing
                  ? `Compressing ${progress.completed}/${progress.total}...`
                  : `Compress All (${images.length})`}
              </button>

              {results.length > 0 && (
                <button onClick={() => downloadAllCompressed(results)}
                  style={{
                    width: "100%", padding: "12px 20px", borderRadius: 8, border: "2px solid #198754",
                    background: "#fff", color: "#198754", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}>
                  Download All ({results.length})
                </button>
              )}

              {images.length > 0 && (
                <button onClick={clearAll}
                  style={{
                    width: "100%", padding: "10px 20px", borderRadius: 8, border: "1px solid #dee2e6",
                    background: "#fff", color: "#6c757d", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}>
                  Clear All
                </button>
              )}
            </div>

            {/* Processing indicator */}
            {processing && (
              <div style={{ background: "#e7f1ff", borderRadius: 8, padding: 12 }}>
                <div style={{ height: 4, background: "#dee2e6", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "#0d6efd", borderRadius: 2,
                    width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                    transition: "width 0.3s",
                  }} />
                </div>
                <div style={{ fontSize: 12, color: "#0d6efd", marginTop: 6, textAlign: "center" }}>
                  Processing {progress.completed} of {progress.total}...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 340px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
