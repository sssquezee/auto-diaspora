"use client";

import { useFavorites } from "@/hooks/useFavorites";

type Props = {
  active?: boolean;
  fallback?: number;
};

export function FavoritesCountBadge({ active = false, fallback = 0 }: Props) {
  const { favorites, hydrated } = useFavorites();
  const count = hydrated ? favorites.length : fallback;

  if (count === 0 && hydrated) return null;

  return (
    <span
      className={`font-mono text-[10px] font-bold px-1.5 py-px ${
        active
          ? "bg-accent text-white"
          : "bg-bg-subtle text-ink-muted border border-line-strong"
      }`}
    >
      {count}
    </span>
  );
}

/** Plain text count for stat cards. */
export function FavoritesCountText({ fallback = 0 }: { fallback?: number }) {
  const { favorites, hydrated } = useFavorites();
  return <>{hydrated ? favorites.length : fallback}</>;
}
