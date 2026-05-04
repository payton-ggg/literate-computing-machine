import { useState, useEffect, useCallback, useRef } from "react";
import { interviewApi } from "../api/interviews.api";
import type { Interview } from "../types/interview.types";

interface UseInterviewDetailOptions {
  id: string | null;
}

export function useInterviewDetail({ id }: UseInterviewDetailOptions) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInterview = useCallback(
    async (hideLoading = false) => {
      if (!id) return null;

      if (!hideLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await interviewApi.get(id);
        setInterview(res.data);
        return res.data;
      } catch (err: unknown) {
        console.error("Failed to load interview:", err);
        if (err instanceof Error) {
          setError(err.message || "Failed to load interview");
        } else {
          setError("Failed to load interview");
        }
        return null;
      } finally {
        if (!hideLoading) {
          setIsLoading(false);
        }
      }
    },
    [id],
  );

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInterview();

    return () => {
      stopPolling();
    };
  }, [fetchInterview, stopPolling]);

  // Polling logic
  const startPolling = useCallback(() => {
    if (pollingTimerRef.current) return;

    pollingTimerRef.current = setInterval(async () => {
      const latest = await fetchInterview(true);
      if (
        latest &&
        !["uploading", "converting", "analyzing"].includes(latest.status)
      ) {
        stopPolling();
      }
    }, 5000);
  }, [fetchInterview, stopPolling]);

  // Watch status to trigger polling
  useEffect(() => {
    if (
      interview &&
      ["uploading", "converting", "analyzing"].includes(interview.status)
    ) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [interview, startPolling, stopPolling]);

  // Expose mutations
  const updateInterview = async (updates: Partial<Interview>) => {
    if (!id) return;
    try {
      const res = await interviewApi.update(id, updates);
      setInterview(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteInterview = async () => {
    if (!id) return;
    await interviewApi.delete(id);
    setInterview(null);
  };

  const retryInterview = async () => {
    if (!id) return;
    const res = await interviewApi.retry(id);
    setInterview(res.data);
  };

  return {
    interview,
    isLoading,
    error,
    refresh: () => fetchInterview(false),
    updateInterview,
    deleteInterview,
    retryInterview,
    startPolling,
    setInterview, // For optimistic updates
  };
}
