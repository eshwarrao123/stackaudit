"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// useLocalStorage
//
// Generic, SSR-safe localStorage hook.
// Defers hydration until after mount to prevent
// server/client mismatch with Next.js App Router.
// ─────────────────────────────────────────────

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Silently ignore parse errors — fall back to initialValue
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const resolved = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Ignore storage quota errors
        }
        return resolved;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setStoredValue(initialValue);
  }, [key, initialValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return [storedValue, setValue, removeValue];
}
