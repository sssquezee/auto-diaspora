"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  /** Synthetic gradient backgrounds — one per slot. Length defines fallback total. */
  gradients: string[];
  /** Real photo URLs from Storage. When non-empty, these replace gradients 1:1. */
  photos?: string[];
  badges?: React.ReactNode;
  prevLabel: string;
  nextLabel: string;
  thumbLabel: string;
  alt?: string;
};

export function ListingGallery({
  gradients,
  photos,
  badges,
  prevLabel,
  nextLabel,
  thumbLabel,
  alt = "",
}: Props) {
  const hasPhotos = !!photos && photos.length > 0;
  const slots = hasPhotos ? photos! : gradients;
  const [index, setIndex] = useState(0);
  const total = slots.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((prev) => (prev + delta + total) % total);
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="bg-white border-[1.5px] border-ink">
      <div
        className="w-full relative overflow-hidden"
        style={{
          background: gradients[index % gradients.length],
          height: "clamp(260px, 48vh, 520px)",
        }}
      >
        {hasPhotos && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={slots[index]}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {badges}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={prevLabel}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-accent hover:text-white text-ink border-[1.5px] border-ink grid place-items-center cursor-pointer transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={nextLabel}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-accent hover:text-white text-ink border-[1.5px] border-ink grid place-items-center cursor-pointer transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 bg-ink text-white font-mono font-bold text-[12px] px-2 py-1 tabular-nums">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex gap-1 p-2 border-t-[1.5px] border-ink overflow-x-auto">
        {slots.map((slot, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${thumbLabel} ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={`w-[88px] h-[64px] flex-shrink-0 cursor-pointer p-0 transition-opacity relative overflow-hidden ${
              i === index
                ? "outline outline-2 outline-accent outline-offset-[-2px]"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{
              background: hasPhotos
                ? gradients[i % gradients.length]
                : slot,
              border: 0,
            }}
          >
            {hasPhotos && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={slot}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
