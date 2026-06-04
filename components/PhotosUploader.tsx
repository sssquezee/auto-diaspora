"use client";

import { useEffect, useState } from "react";

const MAX_FILES = 15;
// Max accepted upload — files larger get rejected before compression
// (so we don't burn time on a 50 MB phone burst). Real wire size after
// compression is usually < 1 MB.
const MAX_SIZE_MB = 25;
// Compression target: longest side capped at 1600 px, JPEG q=0.85. Hits
// the sweet spot for listing photos — still crisp, ~5-10× smaller than
// raw DSLR / phone HDR output.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  // GIF / SVG / WebP animations: pass through untouched — we'd lose
  // animation / vector quality. Re-encoding makes sense only for raster
  // photos.
  if (!file.type.startsWith("image/jpeg") && !file.type.startsWith("image/png")) {
    return file;
  }
  if (file.size < 500 * 1024) return file; // already small

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob: Blob | null =
      "convertToBlob" in canvas
        ? await canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY })
        : await new Promise((resolve) =>
            (canvas as HTMLCanvasElement).toBlob(
              (b) => resolve(b),
              "image/jpeg",
              JPEG_QUALITY
            )
          );
    if (!blob) return file;
    // Only swap if compression actually saved bytes.
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.(png|jpe?g|webp)$/i, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    // Worst case (Safari OffscreenCanvas quirks, OOM on huge files):
    // upload the original.
    return file;
  }
}

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

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (added.length === 0) return;

    const rejects: string[] = [];
    const compressed: File[] = [];
    for (const f of added) {
      if (!f.type.startsWith("image/")) {
        rejects.push(labels.notImage);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        rejects.push(labels.tooLarge);
        continue;
      }
      compressed.push(await compressImage(f));
    }
    setWarning(rejects[0] ?? null);
    const merged = [...files, ...compressed].slice(0, MAX_FILES);
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
