"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  addFavoriteAction,
  removeFavoriteAction,
} from "@/app/[locale]/account/favorites/actions";

type Props = {
  listingId: string;
  /** True when current user is logged in (from server). */
  isAuthed: boolean;
  /** Server-rendered initial state. Updates optimistically on click. */
  initiallyFavorited: boolean;
  className?: string;
  label?: string;
};

export function FavoriteButton({
  listingId,
  isAuthed,
  initiallyFavorited,
  className = "",
  label,
}: Props) {
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthed) {
      router.push("/auth/login");
      return;
    }

    // Optimistic flip
    const next = !favorited;
    setFavorited(next);

    const fd = new FormData();
    fd.append("listing_id", listingId);
    fd.append("locale", locale);

    startTransition(async () => {
      if (next) {
        await addFavoriteAction(fd);
      } else {
        await removeFavoriteAction(fd);
      }
    });
  };

  return (
    <button
      type="button"
      aria-label={label ?? "Toggle favorite"}
      aria-pressed={favorited}
      onClick={onClick}
      className={`grid place-items-center transition-colors cursor-pointer ${
        favorited
          ? "bg-accent text-white"
          : "bg-white/95 text-ink hover:bg-accent hover:text-white"
      } ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
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
