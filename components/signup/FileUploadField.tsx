"use client";

import { useRef } from "react";
import { UploadCloud, X } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Dropzone-style file picker. Holds the File object in state only — no real upload.
 */
export function FileUploadField({
  label,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</label>
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-alt px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{file.name}</p>
            <p className="text-xs text-ink-400">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-danger hover:opacity-80"
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-surface-border bg-surface-alt px-4 py-6 text-center transition-colors hover:border-brand-400"
        >
          <UploadCloud size={22} className="text-ink-400" />
          <span className="text-sm font-semibold text-ink-700">Click to upload</span>
          <span className="text-xs text-ink-400">PDF, JPG or PNG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
