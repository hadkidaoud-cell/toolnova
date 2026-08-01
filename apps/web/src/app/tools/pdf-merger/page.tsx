"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { PDFDocument } from "pdf-lib";
import { FileStack } from "lucide-react";

const RELATED_SLUGS = ["pdf-compressor", "pdf-splitter", "image-to-pdf"] as const;

const RELATED_ICONS: Record<string, string> = {
  "pdf-compressor": "Z",
  "pdf-splitter": "S",
  "image-to-pdf": "I",
};

const LONG_DESCRIPTION =
  "Our PDF Merger lets you combine multiple PDF files into a single document. Upload PDFs, drag to reorder them, preview individual files, and download the merged result. Powered by pdf-lib for reliable client-side PDF manipulation.";

const FAQ = [
  {
    question: "How does PDF merging work?",
    answer: "Each PDF is loaded and parsed client-side using pdf-lib. We copy all pages from each input PDF into a new document. No files are uploaded to any server — everything happens in your browser.",
  },
  {
    question: "Is there a file size limit?",
    answer: "There's no hard limit, but very large PDFs (over 100MB) may take significant time and memory to process. For best results, merge up to 20 files at a time.",
  },
  {
    question: "Can I reorder pages before merging?",
    answer: "You can drag and drop files to reorder them. Pages within each file maintain their original order. For page-level reordering, use our PDF Splitter tool first.",
  },
];

const ARTICLE = {
  title: "PDF Merging Best Practices",
  content:
    "When merging PDFs, consider the final page order carefully. Place title pages first, followed by tables of contents, main content, and appendices. Our tool preserves all content, fonts, and images from the original PDFs. For optimal results, ensure all input PDFs are compatible (same page size recommended).",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function plural(u: { one: string; other: string }, n: number): string {
  return n === 1 ? u.one : u.other;
}

interface PdfFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

export default function PdfMergerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.document;
  const meta = t.meta["pdf-merger"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "document",
    icon: <FileStack className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/document" },
      { label: meta.name, href: "/tools/pdf-merger" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFiles = useCallback(async (incoming: FileList | File[]) => {
    const fileArray = Array.from(incoming);
    if (files.length + fileArray.length > 20) {
      showToast(t.common.maxFiles, "error");
      return;
    }

    for (const file of fileArray) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        showToast(t.common.notPdf.replace("{name}", file.name), "error");
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setFiles((prev) => [...prev, { id, name: file.name, size: file.size, pageCount, buffer }]);
      } catch {
        showToast(t.common.failedLoadPdf.replace("{name}", file.name), "error");
      }
    }
  }, [files.length, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultBlob(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
  }, [previewUrl]);

  const moveFile = useCallback((from: number, to: number) => {
    if (from === to) return;
    setFiles((prev) => {
      const arr = [...prev];
      const item = arr[from]!;
      arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setResultBlob(null);
  }, []);

  const handlePreview = useCallback((file: PdfFile) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blob = new Blob([file.buffer], { type: "application/pdf" });
    setPreviewUrl(URL.createObjectURL(blob));
  }, [previewUrl]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      showToast(t.merger.addAtLeast, "error");
      return;
    }
    setMerging(true);
    setResultBlob(null);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        for (const page of pages) mergedPdf.addPage(page);
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setResultSize(mergedBytes.length);
      const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
      showToast(t.merger.mergedToast.replace("{pages}", String(totalPages)), "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : t.merger.mergeFailed, "error");
    } finally {
      setMerging(false);
    }
  }, [files, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob]);

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <ToolLayout
      name={tool.name}
      description={tool.description}
      longDescription={tool.longDescription}
      category={tool.category}
      categorySlug={tool.categorySlug}
      breadcrumbs={tool.breadcrumbs}
      icon={tool.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        {toast && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
            toast.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {toast.message}
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
            dragOver ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800"
          }`}
        >
          <svg className="mx-auto h-12 w-12 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9,15 12,12 15,15" />
          </svg>
          <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{t.common.dropPdfs}</p>
          <p className="mt-1 text-sm text-neutral-400">{t.common.pdfOnlyMax20}</p>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,application/pdf"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} className="hidden" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {files.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-neutral-400">{t.common.noPdfFiles}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) moveFile(dragIdx, idx); setDragIdx(null); }}
                    onDragEnd={() => setDragIdx(null)}
                    className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <span className="cursor-grab text-neutral-400" title={t.common.dragToReorder}>⠿</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">{idx + 1}</span>
                    <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-red-500 text-xs font-bold text-white">PDF</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-neutral-500">{file.pageCount} {plural(t.common.page, file.pageCount)} · {formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => handlePreview(file)}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {t.common.preview}
                      </button>
                      <button onClick={() => removeFile(file.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                        {t.common.remove}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resultBlob && (
              <div className="mt-4 rounded-xl border-2 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
                <div className="mb-3 flex items-center gap-3">
                  <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">{t.merger.mergeComplete}</p>
                    <p className="text-xs text-green-600 dark:text-green-500">{totalPages} {plural(t.common.page, totalPages)} · {formatFileSize(resultSize)}</p>
                  </div>
                </div>
                <button onClick={handleDownload}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700">
                  {t.merger.downloadMerged}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                  <span className="text-sm font-medium">{t.common.preview}</span>
                  <button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                    className="text-lg text-neutral-500 hover:text-neutral-700">&times;</button>
                </div>
                <iframe src={previewUrl} className="h-96 w-full border-none" title={t.merger.previewTitle} />
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <h3 className="mb-3 text-sm font-bold text-neutral-900 dark:text-white">{t.merger.summary}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-500">{t.merger.files}</span><span className="font-medium">{files.length}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{t.merger.totalPages}</span><span className="font-medium">{totalPages}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{t.merger.totalSize}</span><span className="font-medium">{formatFileSize(totalSize)}</span></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2 || merging}
                    className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                    {merging ? t.merger.merging : t.merger.merge.replace("{count}", String(files.length))}
                  </button>
                  {files.length > 0 && (
                    <button onClick={() => { setFiles([]); setResultBlob(null); setPreviewUrl(null); }}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {t.common.clearAll}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
