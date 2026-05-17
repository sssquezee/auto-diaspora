"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SAVED_SEARCHES_KEY,
  SAVED_SEARCHES_CHANGED_EVENT,
  addSavedSearch as add,
  getSavedSearches,
  removeSavedSearch as remove,
  type SavedSearch,
} from "@/lib/saved-searches";

export function useSavedSearches() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getSavedSearches());
    setHydrated(true);

    const sync = () => setItems(getSavedSearches());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === SAVED_SEARCHES_KEY) sync();
    };
    window.addEventListener("storage", storageHandler);
    window.addEventListener(SAVED_SEARCHES_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener(SAVED_SEARCHES_CHANGED_EVENT, sync);
    };
  }, []);

  const addItem = useCallback(
    (input: { name: string; query: string; summary: string }) => {
      setItems(add(input));
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems(remove(id));
  }, []);

  return { items, hydrated, addItem, removeItem };
}
