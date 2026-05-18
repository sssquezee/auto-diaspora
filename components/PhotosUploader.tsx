"use client";

import { useEffect, useState } from "react";

const MAX_FILES = 15;
const MAX_SIZE_MB = 10;

type Labels = {
  dropzoneText: string;
  hintText: string;
  addMore: string;
  removeAria: string;
  tooLarge: string;
  notImage: string;
};

type Props = {
  files: File[];
  onChange: (next: File[]) => void;
  labels: Labels;
};

export function PhotosUploader({ files, onChange, labels }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (added.length === 0) return;

    const rejects: string[] = [];
    const accepted: File[] = [];
    for (const f of added) {
      if (!f.type.startsWith("image/")) {
        rejects.push(labels.notImage);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        rejects.push(labels.tooLarge);
        continue;
      }
      accepted.push(f);
    }
    setWarning(rejects[0] ?? null);
    const merged = [...files, ...accepted].slice(0, MAX_FILES);
    onChange(merged);
  };

  const removeAt = (i: number) => {
    onChange(files.filter((_, j) => j !== i));
  };

  if (files.length === 0) {
    return (
      <div>
        <label className="block border-[2px] border-dashed border-line-strong bg-bg-subtle hover:border-accent hover:bg-accent-soft transition-colors cursor-pointer text-center px-6 py-10">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdd}
            className="hidden"
          />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-3 text-ink-muted"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="0" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <p className="font-sans font-semibold text-[13px] text-ink mb-1">
            {labels.dropzoneText}
          </p>
          <p className="font-mono text-[11px] text-ink-faded">{labels.hintText}</p>
        </label>
        {warning && (
          <p className="font-mono text-[11px] text-[#cf222e] mt-2">{warning}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
        {previews.map((url, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] bg-bg-subtle border border-line-strong overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={labels.removeAria}
              className="absolute top-1 right-1 w-6 h-6 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white grid place-items-center cursor-pointer transition-colors"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-accent text-white text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-[0.06em]">
                1
              </span>
            )}
          </div>
        ))}
      </div>
      <label className="inline-block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdd}
          className="hidden"
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:text-accent underline decoration-accent decoration-2 underline-offset-[3px]">
          + {labels.addMore} ({files.length}/{MAX_FILES})
        </span>
      </label>
      {warning && (
        <p className="font-mono text-[11px] text-[#cf222e] mt-2">{warning}</p>
      )}
    </div>
  );
}
