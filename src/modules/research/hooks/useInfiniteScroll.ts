"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Whether auto-loading is enabled */
  enabled: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a load is currently in progress */
  isLoading: boolean;
  /** Callback to load more items */
  onLoadMore: () => void;
  /** Debounce delay in ms (default 200) */
  debounceMs?: number;
}

/**
 * Encapsulates IntersectionObserver-based infinite scroll.
 * Returns a ref to attach to a sentinel element.
 */
export function useInfiniteScroll({
  enabled,
  hasMore,
  isLoading,
  onLoadMore,
  debounceMs = 200,
}: UseInfiniteScrollOptions) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedLoadMore = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onLoadMore();
    }, debounceMs);
  }, [onLoadMore, debounceMs]);

  useEffect(() => {
    if (!enabled || !hasMore || isLoading) return;

    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          debouncedLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, hasMore, isLoading, debouncedLoadMore]);

  return triggerRef;
}
