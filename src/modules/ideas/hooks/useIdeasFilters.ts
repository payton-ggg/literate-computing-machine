"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { IdeaFilters } from "../types/ideas.types";
import { EMPTY_FILTERS } from "../types/ideas.types";
import { getIdeaTypeLabel, getIdeaStatusLabel } from "../utils/ideaPresentation";

interface UseIdeasFiltersOptions {
  t: (key: string, values?: Record<string, any>) => string;
}

export function useIdeasFilters({ t }: UseIdeasFiltersOptions) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<IdeaFilters>({
    ...EMPTY_FILTERS,
    type: [],
    status: [],
  });
  const [activeFilters, setActiveFilters] = useState<IdeaFilters>({
    ...EMPTY_FILTERS,
    type: [],
    status: [],
  });

  const filterContainerRef = useRef<HTMLDivElement>(null);

  const totalActiveFilters =
    activeFilters.type.length +
    activeFilters.status.length +
    (activeFilters.folder ? 1 : 0);

  const activeTypeLabels = activeFilters.type.map((type) =>
    getIdeaTypeLabel(t, type),
  );
  const activeStatusLabels = activeFilters.status.map((status) =>
    getIdeaStatusLabel(t, status),
  );

  const toggleDraftFilter = useCallback(
    (category: "type" | "status", val: string) => {
      setDraftFilters((prev) => {
        const arr = prev[category] as string[];
        const next = arr.includes(val)
          ? arr.filter((v) => v !== val)
          : [...arr, val];
        return { ...prev, [category]: next };
      });
    },
    [],
  );

  const setDraftFolderFilter = useCallback((folder: string) => {
    setDraftFilters((prev) => ({ ...prev, folder }));
  }, []);

  const applyFilters = useCallback(() => {
    setActiveFilters(JSON.parse(JSON.stringify(draftFilters)));
    setIsFilterOpen(false);
  }, [draftFilters]);

  const clearFilter = useCallback(
    (category: "type" | "status" | "folder") => {
      setActiveFilters((prev) => {
        const next = { ...prev };
        if (category === "folder") {
          next.folder = "";
        } else {
          next[category] = [];
        }
        return next;
      });
      setDraftFilters((prev) => {
        const next = { ...prev };
        if (category === "folder") {
          next.folder = "";
        } else {
          next[category] = [];
        }
        return next;
      });
    },
    [],
  );

  const resetAllFilters = useCallback(() => {
    const empty: IdeaFilters = { type: [], status: [], folder: "" };
    setActiveFilters(empty);
    setDraftFilters(empty);
  }, []);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return {
    isFilterOpen,
    setIsFilterOpen,
    draftFilters,
    activeFilters,
    totalActiveFilters,
    activeTypeLabels,
    activeStatusLabels,
    toggleDraftFilter,
    setDraftFolderFilter,
    applyFilters,
    clearFilter,
    resetAllFilters,
    filterContainerRef,
  };
}
