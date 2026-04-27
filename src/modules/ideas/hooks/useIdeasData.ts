"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Idea } from "../types/ideas.types";
import { ideasApi } from "../api/ideas.api";
import { mapApiIdeaToRow } from "../utils/ideaPresentation";
import { toast } from "@/lib/toast";

interface UseIdeasDataProps {
  folderNameById: Record<string, string>;
  t: (key: string, values?: Record<string, any>) => string;
}

export function useIdeasData({ folderNameById, t }: UseIdeasDataProps) {
  const [data, setData] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInitialEmptyStateDelayed, setShowInitialEmptyStateDelayed] =
    useState(false);

  const emptyStateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Watch data+loading for delayed empty state
  useEffect(() => {
    if (emptyStateTimeoutRef.current) {
      clearTimeout(emptyStateTimeoutRef.current);
    }

    if (!isLoading && data.length === 0 && !errorMessage) {
      emptyStateTimeoutRef.current = setTimeout(() => {
        setShowInitialEmptyStateDelayed(true);
      }, 3000);
    } else {
      setShowInitialEmptyStateDelayed(false);
    }

    return () => {
      if (emptyStateTimeoutRef.current) {
        clearTimeout(emptyStateTimeoutRef.current);
      }
    };
  }, [data, isLoading, errorMessage]);

  const fetchIdeas = useCallback(
    async (folderId: string | null = null) => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await ideasApi.getIdeas(folderId);
        const fetchedIdeas =
          response.data.ideas || response.data || [];

        setData(
          fetchedIdeas.map((idea: Record<string, unknown>) =>
            mapApiIdeaToRow(idea, folderNameById, t),
          ),
        );
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        console.error("Error fetching ideas:", error);
        setErrorMessage(
          err.response?.data?.error || t("ideasPage.errors.loadIdeas"),
        );
        toast.error(t("ideasPage.errors.loadIdeasToast"));
      } finally {
        setIsLoading(false);
      }
    },
    [folderNameById, t],
  );

  const retryLoading = useCallback(() => {
    setErrorMessage("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    data,
    setData,
    isLoading,
    errorMessage,
    showInitialEmptyStateDelayed,
    fetchIdeas,
    retryLoading,
  };
}
