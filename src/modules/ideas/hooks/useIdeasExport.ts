"use client";

import { useState, useCallback } from "react";

interface UseIdeasExportOptions {
  t: (key: string, values?: Record<string, any>) => string;
}

export function useIdeasExport({ t }: UseIdeasExportOptions) {
  const [showExportStatusModal, setShowExportStatusModal] = useState(false);
  const [exportModalTitle, setExportModalTitle] = useState("");
  const [exportModalMessage, setExportModalMessage] = useState("");

  const handleExport = useCallback(
    (selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        setExportModalTitle(t("common.error") || "Error");
        setExportModalMessage(t("ideasPage.exportEmptySelection"));
        setShowExportStatusModal(true);
        return;
      }
      console.log("Export ideas:", selectedIds);
      setExportModalTitle(t("common.success") || "Success");
      setExportModalMessage(
        t("ideasPage.exportReady", {
          count: selectedIds.length,
          ids: selectedIds.join(", "),
        }),
      );
      setShowExportStatusModal(true);
    },
    [t],
  );

  const closeExportModal = useCallback(() => {
    setShowExportStatusModal(false);
  }, []);

  return {
    showExportStatusModal,
    exportModalTitle,
    exportModalMessage,
    handleExport,
    closeExportModal,
  };
}
