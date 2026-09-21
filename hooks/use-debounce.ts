"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a rapidly changing value (such as search input).
 *
 * @param value The incoming value to debounce
 * @param delay Delay duration in milliseconds (default: 300ms)
 * @returns The stabilized debounced value
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
