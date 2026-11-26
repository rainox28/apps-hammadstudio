"use client";

import { useCallback, useSyncExternalStore } from "react";

const SAVED_KEY = "hammad-studio-apps:saved:v1";
const EMPTY_LIST: string[] = [];

let cachedRaw: string | null = null;
let cachedParsed: string[] = EMPTY_LIST;

function readSavedSlugs(): string[] {
  if (typeof window === "undefined") return EMPTY_LIST;
  try {
    const raw = window.localStorage.getItem(SAVED_KEY) ?? "[]";
    if (raw === cachedRaw) return cachedParsed;
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : EMPTY_LIST;
    cachedRaw = raw;
    cachedParsed = list;
    return list;
  } catch {
    return EMPTY_LIST;
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SAVED_KEY) callback();
  };
  const onCustom = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener("studio-apps:saved", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("studio-apps:saved", onCustom);
  };
}

function getServerSnapshot(): string[] {
  return EMPTY_LIST;
}

export function useSavedApps() {
  const savedSlugs = useSyncExternalStore(
    subscribe,
    readSavedSlugs,
    getServerSnapshot
  );

  const toggleSaved = useCallback((slug: string) => {
    const current = new Set(readSavedSlugs());
    const wasSaved = current.has(slug);
    if (wasSaved) current.delete(slug);
    else current.add(slug);

    const next = [...current];
    try {
      const raw = JSON.stringify(next);
      window.localStorage.setItem(SAVED_KEY, raw);
      cachedRaw = raw;
      cachedParsed = next;
    } catch {
      // Ignore storage quota issues.
    }
    window.dispatchEvent(new Event("studio-apps:saved"));
    return !wasSaved;
  }, []);

  return {
    savedSlugs,
    savedSet: new Set(savedSlugs),
    savedCount: savedSlugs.length,
    toggleSaved,
  };
}
