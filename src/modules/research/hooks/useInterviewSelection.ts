"use client";

import { useState, useCallback } from "react";

/**
 * Encapsulates selection mode + selected IDs logic.
 * Used by both CardListView and FolderProjectView.
 */
export function useInterviewSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        // turning off → clear selection
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  return {
    selectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    selectedIdsArray: Array.from(selectedIds),
    toggleSelectionMode,
    toggleSelection,
    clearSelection,
    exitSelectionMode,
  };
}
