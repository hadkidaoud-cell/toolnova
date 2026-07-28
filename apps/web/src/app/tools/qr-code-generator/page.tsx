"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { encode, renderSVG, svgToDataUrl, downloadFile, addToHistory, getDownloadHistory, removeFromHistory, clearHistory, formatTimestamp } from "@toolnova/core/src/tools/qr-code-generator";
import type { ECLevel, QRConfig, QRMatrix } from "@toolnova/core/src/tools/qr-code-generator";
import type { DownloadHistoryEntry } from "@toolnova/core/src/tools/qr-code-generator";

const EC_OPTIONS: { value: ECLevel; label: string; desc: string }[] = [
  { value: "L", label: "Low", desc: "7% recovery" },
  { value: "M", label: "Medium", desc: "15% recovery" },
  { value: "Q", label: "Quartile", desc: "25% recovery" },
  { value: "H", label: "High", desc: "30% recovery" },
];

const PRESET_COLORS = [
  { fg: "#000000", bg: "#ffffff", name: "Classic" },
  { fg: "#1a1a2e", bg: "#eef2f7", name: "Slate" },
  { fg: "#0d6efd", bg: "#ffffff", name: "Blue" },
  { fg: "#198754", bg: "#ffffff", name: "Green" },
  { fg: "#dc3545", bg: "#ffffff", name: "Red" },
  { fg: "#6f42c1", bg: "#ffffff", name: "Purple" },
  { fg: "#fd7e14", bg: "#ffffff", name: "Orange" },
  { fg: "#20c997", bg: "#ffffff", name: "Teal" },
  { fg: "#000000", bg: "#ffd700", name: "Gold" },
  { fg: "#ffffff", bg: "#000000", name: "Inverted" },
];

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("https://toolnova.com");
  const [ecLevel, setEcLevel] = useState<ECLevel>("M");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(4);
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [logoSize, setLogoSize] = useState(0);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [matrix, setMatrix] = useState<QRMatrix | null>(null);
  const [svgOutput, setSvgOutput] = useState("");
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config: QRConfig = { text, ecLevel, size, margin, foreground, background, logoSize, logoDataUrl };

  const generate = useCallback(() => {
    try {
      setError(null);
      if (!text.trim()) {
        setError("Enter text or URL to generate QR code");
        return;
      }
      const m = encode(text, ecLevel);
      setMatrix(m);
      setSvgOutput(renderSVG(m, config));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
      setMatrix(null);
    }
  }, [text, ecLevel, size, margin, foreground, background, logoSize, logoDataUrl]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => { setHistory(getDownloadHistory()); }, []);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPNG = useCallback(() => {
    if (!matrix) return;
    const canvas = document.createElement("canvas");
    const moduleCount = matrix.size;
    const totalModules = moduleCount + margin * 2;
    const moduleSize = Math.max(1, Math.floor(size / totalModules));
    canvas.width = totalModules * moduleSize;
    canvas.height = totalModules * moduleSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = foreground;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (matrix.modules[row]![col]) {
          ctx.fillRect((col + margin) * moduleSize, (row + margin) * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        downloadFile(url, `qr-code-${Date.now()}.png`, "image/png");
        URL.revokeObjectURL(url);
        addToHistory(text, config);
        setHistory(getDownloadHistory());
        showToast("PNG downloaded", "success");
      }
    }, "image/png");
  }, [matrix, size, margin, foreground, background, text, config]);

  const handleDownloadSVG = useCallback(() => {
    if (!svgOutput) return;
    const dataUrl = svgToDataUrl(svgOutput);
    downloadFile(dataUrl, `qr-code-${Date.now()}.svg`, "image/svg+xml");
    addToHistory(text, config);
    setHistory(getDownloadHistory());
    showToast("SVG downloaded", "success");
  }, [svgOutput, text, config]);

  const handleCopy = useCallback(async () => {
    if (!svgOutput) return;
    try {
      const blob = new Blob([svgOutput], { type: "image/svg+xml" });
      await navigator.clipboard.write([new ClipboardItem({ "image/svg+xml": blob })]);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Copy not supported in this browser", "error");
    }
  }, [svgOutput]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo must be under 2MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoDataUrl(undefined);
    setLogoSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleHistoryRestore = useCallback((entry: DownloadHistoryEntry) => {
    setText(entry.text);
    setEcLevel(entry.config.ecLevel);
    setSize(entry.config.size);
    setMargin(entry.config.margin);
    setForeground(entry.config.foreground);
    setBackground(entry.config.background);
    setLogoSize(entry.config.logoSize);
    setShowHistory(false);
    showToast("Settings restored", "success");
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    removeFromHistory(id);
    setHistory(getDownloadHistory());
  }, []);

  const handleHistoryClear = useCallback(() => {
    clearHistory();
    setHistory([]);
    showToast("History cleared", "success");
  }, []);

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
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>QR Code Generator</h1>
          <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>Generate custom QR codes with colors, logos, and multiple formats</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Content</h2>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Text or URL</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #dee2e6", borderRadius: 8,
                    fontSize: 14, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 12, color: "#adb5bd", marginTop: 4, display: "block" }}>
                  {text.length} characters
                </span>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Error Correction</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {EC_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEcLevel(opt.value)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, border: `2px solid ${ecLevel === opt.value ? "#0d6efd" : "#dee2e6"}`,
                      background: ecLevel === opt.value ? "#e7f1ff" : "#fff", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: ecLevel === opt.value ? "#0d6efd" : "#1a1a2e" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "#6c757d" }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Appearance</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Size: {size}px</label>
                  <input type="range" min={100} max={2000} step={50} value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Margin: {margin}</label>
                  <input type="range" min={0} max={10} step={1} value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Foreground</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)}
                      style={{ width: 40, height: 36, border: "1px solid #dee2e6", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                    <input type="text" value={foreground} onChange={(e) => setForeground(e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 13, fontFamily: "monospace" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Background</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={background} onChange={(e) => setBackground(e.target.value)}
                      style={{ width: 40, height: 36, border: "1px solid #dee2e6", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                    <input type="text" value={background} onChange={(e) => setBackground(e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 13, fontFamily: "monospace" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 8 }}>Color Presets</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PRESET_COLORS.map((preset) => (
                    <button key={preset.name} title={preset.name}
                      onClick={() => { setForeground(preset.fg); setBackground(preset.bg); }}
                      style={{
                        width: 32, height: 32, borderRadius: 6, border: "2px solid #dee2e6", cursor: "pointer",
                        background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                      }} />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Logo Size: {logoSize}%
                </label>
                <input type="range" min={0} max={30} step={1} value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #dee2e6", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                    Upload Logo
                  </button>
                  {logoDataUrl && (
                    <button onClick={removeLogo}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc3545", cursor: "pointer", fontSize: 13 }}>
                      Remove
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Preview</h2>

              {error ? (
                <div style={{ padding: 24, background: "#fff5f5", borderRadius: 8, color: "#dc3545", fontSize: 14, textAlign: "center" }}>{error}</div>
              ) : (
                <div ref={previewRef} style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  padding: 24, background: "#f8f9fa", borderRadius: 8, minHeight: 200,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: svgOutput }}
                    style={{ maxWidth: "100%", lineHeight: 0 }} />
                </div>
              )}

              {matrix && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#adb5bd", textAlign: "center" }}>
                  {matrix.size}x{matrix.size} modules | Version {Math.floor((matrix.size - 17) / 4)} | EC: {ecLevel}
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Download</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={handleDownloadPNG} disabled={!matrix}
                  style={{
                    padding: "12px 16px", borderRadius: 8, border: "none", background: "#0d6efd", color: "#fff",
                    fontWeight: 600, fontSize: 14, cursor: matrix ? "pointer" : "not-allowed", opacity: matrix ? 1 : 0.5,
                  }}>PNG</button>
                <button onClick={handleDownloadSVG} disabled={!matrix}
                  style={{
                    padding: "12px 16px", borderRadius: 8, border: "none", background: "#198754", color: "#fff",
                    fontWeight: 600, fontSize: 14, cursor: matrix ? "pointer" : "not-allowed", opacity: matrix ? 1 : 0.5,
                  }}>SVG</button>
              </div>
              <button onClick={handleCopy} disabled={!matrix}
                style={{
                  width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 8,
                  border: "2px solid #dee2e6", background: "#fff", color: "#1a1a2e",
                  fontWeight: 600, fontSize: 14, cursor: matrix ? "pointer" : "not-allowed", opacity: matrix ? 1 : 0.5,
                }}>Copy to Clipboard</button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1a1a2e" }}>History</h2>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowHistory(!showHistory)}
                    style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #dee2e6", background: "#fff", cursor: "pointer", fontSize: 12 }}>
                    {showHistory ? "Hide" : "Show"}
                  </button>
                  {history.length > 0 && (
                    <button onClick={handleHistoryClear}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc3545", cursor: "pointer", fontSize: 12 }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {showHistory && (
                <div style={{ maxHeight: 240, overflowY: "auto" }}>
                  {history.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#adb5bd", textAlign: "center", padding: 16 }}>No history yet</p>
                  ) : (
                    history.map((entry) => (
                      <div key={entry.id} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                        borderBottom: "1px solid #f1f3f5",
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: entry.thumbnail }}
                          style={{ width: 32, height: 32, flexShrink: 0, lineHeight: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.text}
                          </div>
                          <div style={{ fontSize: 11, color: "#adb5bd" }}>{formatTimestamp(entry.timestamp)}</div>
                        </div>
                        <button onClick={() => handleHistoryRestore(entry)}
                          style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #dee2e6", background: "#fff", cursor: "pointer", fontSize: 11 }}>
                          Use
                        </button>
                        <button onClick={() => handleHistoryDelete(entry.id)}
                          style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc3545", cursor: "pointer", fontSize: 11 }}>
                          Del
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
