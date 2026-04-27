"use client";

import { useState, useMemo, useCallback } from "react";
import type { Interview, Folder } from "../types/interview.types";

type SortOrder = "recent" | "oldest";

/**
 * Provides search + sort for both interviews and folders.
 */
export function useInterviewFiltering<T extends Interview | Folder>(
  items: T[],
  filterFn?: (item: T, query: string) => boolean,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  }, []);

  const filtered = useMemo(() => {
    let result = [...items];
    const q = searchQuery.trim().toLowerCase();

    if (q && filterFn) {
      result = result.filter((item) => filterFn(item, q));
    } else if (q) {
      // default: filter by name/title + description
      result = result.filter((item) => {
        const name =
          ("title" in item ? item.title : "") ||
          ("name" in item ? (item as Folder).name : "");
        const desc =
          ("description" in item ? (item.description ?? "") : "");
        return (
          name.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, sortOrder, filterFn]);

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    toggleSort,
    filtered,
    resultsCount: filtered.length,
  };
}
