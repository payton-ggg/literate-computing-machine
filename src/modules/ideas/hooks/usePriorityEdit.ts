"use client";

import { useState, useCallback } from "react";
import { ideasApi } from "../api/ideas.api";
import { toast } from "@/lib/toast";
import type { Idea } from "../types/ideas.types";

interface UsePriorityEditOptions {
  t: (key: string, values?: Record<string, any>) => string;
}

export function usePriorityEdit({ t }: UsePriorityEditOptions) {
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(
    null,
  );
  const [editingPriorityValue, setEditingPriorityValue] = useState<
    number | null
  >(null);

  const startPriorityEdit = useCallback((idea: Idea) => {
    setEditingPriorityId(idea.id);
    setEditingPriorityValue(idea.priority);
  }, []);

  const savePriority = useCallback(
    async (ideaId: string, onUpdate: (id: string, value: number) => void) => {
      if (editingPriorityValue !== null) {
        try {
          await ideasApi.updateIdea(ideaId, {
            priority: editingPriorityValue,
          });
          onUpdate(ideaId, editingPriorityValue);
          toast.success(t("ideasPage.toasts.priorityUpdated"));
        } catch (error) {
          console.error("Error updating priority:", error);
          toast.error(t("ideasPage.toasts.priorityUpdateFailed"));
        }
      }
      setEditingPriorityId(null);
      setEditingPriorityValue(null);
    },
    [editingPriorityValue, t],
  );

  const cancelPriorityEdit = useCallback(() => {
    setEditingPriorityId(null);
    setEditingPriorityValue(null);
  }, []);

  return {
    editingPriorityId,
    editingPriorityValue,
    setEditingPriorityValue,
    startPriorityEdit,
    savePriority,
    cancelPriorityEdit,
  };
}
