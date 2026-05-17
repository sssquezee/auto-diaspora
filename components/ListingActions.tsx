"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

type Props = {
  listingId: string;
  phone: { full: string; masked: string };
  writeLabel: string;
  showPhoneLabel: string;
  addFavLabel: string;
  removeFavLabel: string;
};

const primaryBtn =
  "w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.12em] py-3.5 cursor-pointer border-0 transition-colors";

const secondaryBtn =
  "w-full bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.12em] py-[10px] cursor-pointer transition-colors";

const subtleBtn =
  "w-full bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white font-sans font-semibold text-[12px] uppercase tracking-[0.12em] py-[10px] cursor-pointer transition-colors flex items-center justify-center gap-2";

export function ListingActions({
  listingId,
  phone,
  writeLabel,
  showPhoneLabel,
  addFavLabel,
  removeFavLabel,
}: Props) {
  const { isFav, toggle, hydrated } = useFavorites();
  const fav = hydrated && isFav(listingId);
  const [phoneShown, setPhoneShown] = useState(false);

  return (
    <div className="bg-white border-[1.5px] border-ink p-4 flex flex-col gap-2">
      <button type="button" className={primaryBtn}>
        {writeLabel}
      </button>

      {phoneShown ? (
        <a
          href={`tel:${phone.full.replace(/\s/g, "")}`}
          className={`${secondaryBtn} no-underline flex items-center justify-center gap-2 font-mono tabular-nums tracking-[0.04em]`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {phone.full}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setPhoneShown(true)}
          className={`${secondaryBtn} flex items-center justify-center gap-2`}
        >
          {showPhoneLabel}
          <span className="font-mono tabular-nums tracking-[0.04em] text-ink-muted">
            {phone.masked}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => toggle(listingId)}
        aria-pressed={fav}
        className={`${subtleBtn} ${
          fav ? "bg-ink text-white" : ""
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={fav ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {fav ? removeFavLabel : addFavLabel}
      </button>
    </div>
  );
}
