"use client";

import { useFavorites } from "@/hooks/useFavorites";

type Props = {
  listingId: string;
  className?: string;
  label?: string;
};

export function FavoriteButton({ listingId, className = "", label }: Props) {
  const { isFav, toggle, hydrated } = useFavorites();
  const active = hydrated && isFav(listingId);

  return (
    <button
      type="button"
      aria-label={label ?? "Add to favorites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(listingId);
      }}
      className={`grid place-items-center transition-colors cursor-pointer ${
        active
          ? "bg-accent text-white"
          : "bg-white/95 text-ink hover:bg-accent hover:text-white"
      } ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
