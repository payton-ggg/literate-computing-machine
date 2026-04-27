"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { ColumnOption } from "../types/ideas.types";

interface UseViewSettingsOptions {
  t: (key: string, values?: Record<string, any>) => string;
}

export function useViewSettings({ t }: UseViewSettingsOptions) {
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [draftVisibleColumns, setDraftVisibleColumns] = useState<string[]>([]);
  const [activeVisibleColumns, setActiveVisibleColumns] = useState<string[]>(
    [],
  );

  const viewSettingsContainerRef = useRef<HTMLDivElement>(null);

  const allColumns: ColumnOption[] = useMemo(
    () => [
      { id: "type", title: t("ideasPage.columns.type") },
      { id: "status", title: t("ideasPage.columns.status") },
      { id: "pain", title: t("ideasPage.columns.pain") },
      { id: "folder", title: t("ideasPage.columns.folder") },
      { id: "priority", title: t("ideasPage.columns.priority") },
      { id: "confidence", title: t("ideasPage.columns.confidence") },
      { id: "evidence", title: t("ideasPage.columns.evidence") },
    ],
    [t],
  );

  const toggleDraftColumn = useCallback((colId: string) => {
    setDraftVisibleColumns((prev) => {
      if (prev.includes(colId)) {
        return prev.filter((c) => c !== colId);
      }
      return [...prev, colId];
    });
  }, []);

  const applyViewSettings = useCallback(() => {
    setActiveVisibleColumns([...draftVisibleColumns]);
    setIsViewSettingsOpen(false);
  }, [draftVisibleColumns]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        viewSettingsContainerRef.current &&
        !viewSettingsContainerRef.current.contains(e.target as Node)
      ) {
        setIsViewSettingsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return {
    isViewSettingsOpen,
    setIsViewSettingsOpen,
    draftVisibleColumns,
    activeVisibleColumns,
    allColumns,
    toggleDraftColumn,
    applyViewSettings,
    viewSettingsContainerRef,
  };
}
