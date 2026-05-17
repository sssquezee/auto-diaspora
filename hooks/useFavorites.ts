"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FAVORITES_KEY,
  FAVORITES_CHANGED_EVENT,
  getFavorites,
  toggleFavorite as toggleInStorage,
} from "@/lib/favorites";

/** React hook for reading + mutating favorites with cross-tab sync. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setHydrated(true);

    const sync = () => setFavorites(getFavorites());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) sync();
    };
    window.addEventListener("storage", storageHandler);
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites(toggleInStorage(id));
  }, []);

  const isFav = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, isFav, toggle, hydrated };
}
