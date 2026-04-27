"use client";

import { useState, useCallback } from "react";
import type { NewIdeaForm, FolderOption } from "../types/ideas.types";
import { EMPTY_FORM } from "../types/ideas.types";
import { ideasApi, operationApi } from "../api/ideas.api";
import { toast } from "@/lib/toast";

interface UseNewIdeaDrawerOptions {
  selectedFolderId: string;
  currentFolderId: string;
  availableFolders: FolderOption[];
  t: (key: string, values?: Record<string, any>) => string;
  onCreated: (folderId: string) => void;
  onBillingIssue?: (issue: any) => void;
}

export function useNewIdeaDrawer({
  selectedFolderId,
  currentFolderId,
  availableFolders,
  t,
  onCreated,
  onBillingIssue,
}: UseNewIdeaDrawerOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTemplateHintVisible, setIsTemplateHintVisible] = useState(false);
  const [form, setForm] = useState<NewIdeaForm>({ ...EMPTY_FORM });

  const updateField = useCallback(
    <K extends keyof NewIdeaForm>(field: K, value: NewIdeaForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const open = useCallback(() => {
    setForm({
      ...EMPTY_FORM,
      folder:
        selectedFolderId ||
        currentFolderId ||
        availableFolders[0]?.id ||
        "",
    });
    setIsTemplateHintVisible(false);
    setIsOpen(true);
  }, [selectedFolderId, currentFolderId, availableFolders]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goToLibrary = useCallback(() => {
    let path = "/library";
    if (form.type === "hypothesis") {
      path = "/library/hypothesis";
    } else if (form.type === "jtbd") {
      path = "/library/jtbd";
    }
    window.open(path, "_blank");
  }, [form.type]);

  const runAutoEvaluation = useCallback(
    async (ideaId: string, folderId: string) => {
      try {
        const res = await operationApi.start({
          operation_key: "extract_evidence",
          target_id: ideaId,
        });
        const opData = res.data;

        // Check for billing issues
        if (
          opData?.error === "insufficient_balance" ||
          opData?.error === "ppu_limit_reached"
        ) {
          onBillingIssue?.(opData);
          return;
        }

        // Fire and forget — poll not needed here, success toast on start
        onCreated(folderId);
        toast.success(t("ideasPage.toasts.autoEvaluateSuccess"));
      } catch (error) {
        console.error("Error evaluating new idea:", error);
        toast.error(t("ideasPage.toasts.autoEvaluateFailed"));
      }
    },
    [t, onCreated, onBillingIssue],
  );

  const save = useCallback(async () => {
    if (!form.name) return;
    if (!form.folder) {
      toast.error(t("ideasPage.errors.chooseFolder"));
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    let apiType = "manual";
    if (form.type === "jtbd") apiType = "jtbd";
    const shouldAutoEvaluate = form.pain === 0 && form.priority === 0;

    const payload = {
      name: form.name,
      folder_id: form.folder,
      idea_type: apiType,
      pain_score: form.pain || null,
      priority: form.priority || null,
    };

    try {
      const createResponse = await ideasApi.createIdea(payload);
      const createdIdeaId = createResponse?.data?.id;

      close();
      onCreated(form.folder);
      toast.success(t("ideasPage.toasts.createSuccess"));

      if (shouldAutoEvaluate && createdIdeaId) {
        toast.info(t("ideasPage.toasts.autoEvaluateStarted"));
        void runAutoEvaluation(createdIdeaId, form.folder).catch(
          (evaluateError) => {
            console.error("Error evaluating new idea:", evaluateError);
            toast.error(t("ideasPage.toasts.autoEvaluateFailed"));
          },
        );
      }
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error(t("ideasPage.toasts.createFailed"));
    } finally {
      setIsSaving(false);
    }
  }, [form, isSaving, t, close, onCreated, runAutoEvaluation]);

  return {
    isOpen,
    isSaving,
    isTemplateHintVisible,
    setIsTemplateHintVisible,
    form,
    updateField,
    open,
    close,
    save,
    goToLibrary,
  };
}
