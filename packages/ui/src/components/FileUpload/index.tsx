import { useRef, useState } from "react";
import { FileUploadProps } from "../../types";
import { cn } from "../../utils";

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFilesChange,
  disabled = false,
  children,
  className,
  testId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    if (maxSize) {
      const oversized = fileArray.find((f) => f.size > maxSize);
      if (oversized) {
        setError(`File "${oversized.name}" exceeds maximum size of ${formatSize(maxSize)}`);
        return;
      }
    }

    setError(null);
    onFilesChange?.(fileArray);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div data-testid={testId} className={cn("w-full", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        {children || (
          <>
            <svg className="mb-2 h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Drag and drop or <span className="text-brand-600">click to upload</span>
            </p>
            {accept && (
              <p className="mt-1 text-xs text-neutral-500">Accepted: {accept}</p>
            )}
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
