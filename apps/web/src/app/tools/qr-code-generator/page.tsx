"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

const EC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 } as const;
type ECLevel = keyof typeof EC_LEVELS;

const GF256 = (() => {
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v = (v << 1) ^ (v & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  return {
    exp: (a: number) => EXP[a],
    log: (a: number) => LOG[a],
    mul: (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]),
  };
})();

function reedSolomon(numEc: number, data: Uint8Array): Uint8Array {
  const gen = new Uint8Array(numEc + 1);
  gen[0] = 1;
  for (let i = 0; i < numEc; i++) {
    for (let j = numEc; j >= 1; j--) gen[j] = gen[j - 1] ^ GF256.mul(gen[j], GF256.exp(i));
  }
  const msg = new Uint8Array(data.length + numEc);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coeff = msg[i];
    if (coeff !== 0) {
      for (let j = 1; j <= numEc; j++) msg[i + j] ^= GF256.mul(gen[j], coeff);
    }
  }
  return msg.slice(data.length);
}

const VERSION_INFO: [number, number, number][] = [];
const EC_COUNTS: Record<number, [number, number, number, number]> = {
  1:[7,10,13,17],2:[10,16,22,28],3:[15,26,18,22],4:[20,18,26,16],
  5:[26,24,18,22],6:[18,16,24,28],7:[20,18,18,26],8:[24,22,22,26],
  9:[30,22,20,24],10:[18,26,24,28],11:[20,30,28,24],12:[24,22,26,28],
  13:[26,22,24,22],14:[30,24,20,24],15:[22,24,30,24],16:[24,28,24,30],
  17:[28,28,28,28],18:[30,26,28,28],19:[28,26,26,26],20:[28,26,28,28],
  21:[28,26,30,28],22:[28,28,30,30],23:[30,28,30,30],24:[30,28,30,30],
  26:[30,28,30,30],27:[30,28,30,30],28:[30,28,30,30],29:[30,28,30,30],30:[30,28,30,30],
  25:[30,28,30,30],
  31:[30,28,30,30],32:[30,28,30,30],33:[30,28,30,30],34:[30,28,30,30],35:[30,28,30,30],
  36:[30,28,30,30],37:[30,28,30,30],38:[30,28,30,30],39:[30,28,30,30],40:[30,28,30,30],
};

function getVersion(dataLen: number): number {
  for (let v = 1; v <= 40; v++) {
    const cap = v <= 9 ? 17 : v <= 26 ? 14 : 11;
    if (dataLen <= cap * v * v / 100) return v;
  }
  return 40;
}

function getModuleCount(version: number): number {
  return version * 4 + 17;
}

function encodeQR(text: string, ecLevel: ECLevel): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const version = Math.max(1, Math.min(40, getVersion(bytes.length + 2)));
  const size = getModuleCount(version);
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false) as boolean[]);
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false) as boolean[]);

  function placeFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = row + r, x = col + c;
        if (y < 0 || y >= size || x < 0 || x >= size) continue;
        const inBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const inPattern = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inHole = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[y][x] = inBorder || (inPattern && !inHole);
        reserved[y][x] = true;
      }
    }
  }

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  reserved[8][8] = true;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      modules[r + 1][size - 8 + c] = (r + c) % 2 === 0;
      modules[size - 8 + r][c + 1] = (r + c) % 2 === 0;
      reserved[r + 1][size - 8 + c] = true;
      reserved[size - 8 + r][c + 1] = true;
    }
  }

  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        modules[i][size - 11 + j] = i === 1 || i === 4;
        modules[size - 11 + j][i] = i === 1 || i === 4;
        reserved[i][size - 11 + j] = true;
        reserved[size - 11 + j][i] = true;
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        reserved[r][c] = true;
      }
    }
  }

  const ecIdx = EC_LEVELS[ecLevel];
  const ecPerBlock = EC_COUNTS[version]?.[ecIdx] ?? 10;

  let totalCodewords = 0;
  if (version <= 9) totalCodewords = [26,44,70,100,134,172,196,242,292][version - 1] || 292;
  else if (version <= 26) totalCodewords = [352,408,468,552,588,644,700,750,808,870,938,1006,1094,1174,1276,1370,1468,1531,1631,1735,1843][version - 10] || 1843;
  else totalCodewords = [1955,2071,2191,2306,2434,2566,2702,2812,2956][version - 27] || 2956;

  const totalDataBits = totalCodewords * 8;
  const totalEcBits = ecPerBlock * 8;
  const dataBits = totalDataBits - Math.ceil(totalDataBits / (8)) * 0;

  const modeBits = 4;
  const countBits = version <= 9 ? 8 : 16;
  const availableBits = totalDataBits;
  const dataBytes = Math.floor((availableBits - modeBits - countBits) / 8);

  const data = new Uint8Array(dataBytes + 2);
  data[0] = 0x40 | (bytes.length >> (countBits === 8 ? 0 : 8));
  data[1] = bytes.length & 0xff;
  if (countBits === 16) {
    data[0] = 0x40 | (bytes.length >> 8);
    data[1] = bytes.length & 0xff;
  } else {
    data[0] = 0x40 | bytes.length;
  }
  let offset = Math.ceil((modeBits + countBits) / 8);
  for (let i = 0; i < Math.min(bytes.length, dataBytes - offset); i++) {
    data[offset + i] = bytes[i];
  }
  if (dataBytes - offset - bytes.length >= 2) {
    data[offset + bytes.length] = 0xec;
    if (dataBytes - offset - bytes.length > 1) data[offset + bytes.length + 1] = 0x11;
  }

  const rawData = data.slice(0, dataBytes);

  const numBlocks = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1][version - 1] || 1;
  const blockSize = Math.floor(dataBytes / numBlocks);
  const longBlocks = dataBytes % numBlocks;
  const ecPer = ecPerBlock;

  const allCodewords: number[] = [];
  let dataIdx = 0;

  const blocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const sz = blockSize + (b >= numBlocks - longBlocks ? 1 : 0);
    const block = rawData.slice(dataIdx, dataIdx + sz);
    dataIdx += sz;
    blocks.push(block);
    ecBlocks.push(reedSolomon(ecPer, block));
  }

  for (let i = 0; i < blockSize + 1; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blocks[b].length) allCodewords.push(blocks[b][i]);
    }
  }
  for (let i = 0; i < ecPer; i++) {
    for (let b = 0; b < numBlocks; b++) {
      allCodewords.push(ecBlocks[b][i]);
    }
  }

  const bits: number[] = [];
  for (const byte of allCodewords) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }

  const dataPositions: [number, number][] = [];
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    for (let dir = 0; dir < 2; dir++) {
      const row = dir === 0 ? size - 1 : 0;
      const step = dir === 0 ? -1 : 1;
      for (let r = row; ; r += step) {
        if (r < 0 || r >= size) break;
        if (!reserved[r][col]) dataPositions.push([r, col]);
        if (col > 0 && !reserved[r][col - 1]) dataPositions.push([r, col - 1]);
        break;
      }
    }
  }

  const finalPositions: [number, number][] = [];
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    for (let upward = 0; upward < 2; upward++) {
      for (let i = 0; i < size; i++) {
        const row = upward === 0 ? size - 1 - i : i;
        if (row < 0 || row >= size) continue;
        if (reserved[row][col]) continue;
        finalPositions.push([row, col]);
        if (col > 0 && !reserved[row][col - 1]) {
          finalPositions.push([row, col - 1]);
        }
      }
    }
  }

  const seen = new Set<string>();
  const uniquePos: [number, number][] = [];
  for (const [r, c] of finalPositions) {
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePos.push([r, c]);
    }
  }

  for (let i = 0; i < Math.min(bits.length, uniquePos.length); i++) {
    const [r, c] = uniquePos[i];
    modules[r][c] = bits[i] === 1;
  }

  let mask = 0;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    let penalty = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c]) continue;
        const shouldFlip = (() => {
          switch (m) {
            case 0: return (r + c) % 2 === 0;
            case 1: return r % 2 === 0;
            case 2: return c % 3 === 0;
            case 3: return (r + c) % 3 === 0;
            case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
            case 5: return (r * c) % 2 + (r * c) % 3 === 0;
            case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
            case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
          }
        })();
        if (shouldFlip) penalty++;
      }
    }
    if (penalty < bestScore) {
      bestScore = penalty;
      mask = m;
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      let flip = false;
      switch (mask) {
        case 0: flip = (r + c) % 2 === 0; break;
        case 1: flip = r % 2 === 0; break;
        case 2: flip = c % 3 === 0; break;
        case 3: flip = (r + c) % 3 === 0; break;
        case 4: flip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
        case 5: flip = (r * c) % 2 + (r * c) % 3 === 0; break;
        case 6: flip = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
        case 7: flip = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
      }
      if (flip) modules[r][c] = !modules[r][c];
    }
  }

  const formatBits = (ecIdx << 3) | mask;
  let format = formatBits;
  for (let i = 0; i < 10; i++) format = (format << 1) ^ ((format >> 9) * 0x537);
  format ^= 0x5412;
  format = (format << 10) | formatBits;
  format &= 0x7fff;

  const formatMask = 0x5412;
  const finalFormat = format ^ formatMask;

  for (let i = 0; i < 15; i++) {
    const bit = (finalFormat >> i) & 1;
    const pos1 = [0, 1, 2, 3, 4, 5, 7, 8, size - 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2];
    const pos2 = [size - 1 - i, size - 1 - (i < 6 ? i : i + 1)];
    if (i < 8) {
      modules[8][size - 1 - i] = bit === 1;
      if (i < 6) modules[i][8] = bit === 1;
    } else {
      modules[size - 15 + i][8] = bit === 1;
      modules[8][14 - i] = bit === 1;
    }
  }

  for (let i = 0; i < 8; i++) {
    const bit = (finalFormat >> (14 - i)) & 1;
    if (i < 6) modules[8][i] = bit === 1;
    modules[8][7] = true;
    modules[8][8] = true;
    if (i < 8) modules[size - 1 - i][8] = bit === 1;
  }

  modules[size - 8][8] = true;

  return modules;
}

function renderSVG(modules: boolean[][], size: number = 300, fg: string = "#000000", bg: string = "#ffffff", margin: number = 4): string {
  const count = modules.length;
  const cellSize = (size - margin * 2) / count;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count + margin * 2} ${count + margin * 2}" width="${size}" height="${size}">`;
  svg += `<rect width="${count + margin * 2}" height="${count + margin * 2}" fill="${bg}"/>`;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules[r][c]) {
        svg += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="${fg}"/>`;
      }
    }
  }
  svg += "</svg>";
  return svg;
}

const PRESETS = [
  { fg: "#000000", bg: "#ffffff", name: "Classic" },
  { fg: "#0d6efd", bg: "#ffffff", name: "Blue" },
  { fg: "#198754", bg: "#ffffff", name: "Green" },
  { fg: "#dc3545", bg: "#ffffff", name: "Red" },
  { fg: "#6f42c1", bg: "#ffffff", name: "Purple" },
  { fg: "#ffffff", bg: "#000000", name: "Inverted" },
  { fg: "#000000", bg: "#ffd700", name: "Gold" },
  { fg: "#20c997", bg: "#ffffff", name: "Teal" },
];

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("https://toolnova.com");
  const [ecLevel, setEcLevel] = useState<ECLevel>("M");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [modules, setModules] = useState<boolean[][] | null>(null);
  const [error, setError] = useState("");
  const [size, setSize] = useState(300);
  const previewRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    try {
      setError("");
      if (!text.trim()) { setError("Enter text or URL"); return; }
      const m = encodeQR(text, ecLevel);
      setModules(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
      setModules(null);
    }
  }, [text, ecLevel]);

  useEffect(() => { generate(); }, [generate]);

  const svgOutput = modules ? renderSVG(modules, size, fg, bg) : "";

  const downloadPNG = () => {
    if (!modules) return;
    const count = modules.length;
    const canvas = document.createElement("canvas");
    const cellSize = Math.max(1, Math.floor(size / count));
    canvas.width = count * cellSize;
    canvas.height = count * cellSize;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fg;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-code-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  const downloadSVG = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-code-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>QR Code Generator</h1>
          <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>Generate custom QR codes with colors and download as PNG or SVG</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Content</h2>
              <textarea
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL..." rows={3}
                style={{ width: "100%", padding: 10, border: "1px solid #dee2e6", borderRadius: 8, fontSize: 14, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <span style={{ fontSize: 12, color: "#adb5bd" }}>{text.length} chars</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Error Correction</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["L", "M", "Q", "H"] as ECLevel[]).map((level) => (
                  <button key={level} onClick={() => setEcLevel(level)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: `2px solid ${ecLevel === level ? "#0d6efd" : "#dee2e6"}`, background: ecLevel === level ? "#e7f1ff" : "#fff", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: ecLevel === level ? "#0d6efd" : "#1a1a2e" }}>{level}</div>
                    <div style={{ fontSize: 11, color: "#6c757d" }}>{level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Colors</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 4 }}>Foreground</label>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
                      style={{ width: 36, height: 32, border: "1px solid #dee2e6", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                    <input type="text" value={fg} onChange={(e) => setFg(e.target.value)}
                      style={{ flex: 1, padding: "6px 8px", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 4 }}>Background</label>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                      style={{ width: 36, height: 32, border: "1px solid #dee2e6", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                    <input type="text" value={bg} onChange={(e) => setBg(e.target.value)}
                      style={{ flex: 1, padding: "6px 8px", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PRESETS.map((p) => (
                  <button key={p.name} title={p.name} onClick={() => { setFg(p.fg); setBg(p.bg); }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "2px solid #dee2e6", cursor: "pointer", background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }} />
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Size: {size}px</h2>
              <input type="range" min={100} max={800} step={50} value={size}
                onChange={(e) => setSize(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Preview</h2>
              {error ? (
                <div style={{ padding: 20, background: "#fff5f5", borderRadius: 8, color: "#dc3545", fontSize: 14, textAlign: "center" }}>{error}</div>
              ) : (
                <div ref={previewRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20, background: "#f8f9fa", borderRadius: 8 }}>
                  <div dangerouslySetInnerHTML={{ __html: svgOutput }} style={{ maxWidth: "100%", lineHeight: 0 }} />
                </div>
              )}
              {modules && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#adb5bd", textAlign: "center" }}>
                  {modules.length}x{modules.length} modules | EC: {ecLevel}
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e9ecef" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Download</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={downloadPNG} disabled={!modules}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 14, cursor: modules ? "pointer" : "not-allowed", opacity: modules ? 1 : 0.5 }}>
                  Download PNG
                </button>
                <button onClick={downloadSVG} disabled={!modules}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#198754", color: "#fff", fontWeight: 600, fontSize: 14, cursor: modules ? "pointer" : "not-allowed", opacity: modules ? 1 : 0.5 }}>
                  Download SVG
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  );
}
