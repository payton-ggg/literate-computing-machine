"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ideasApi } from "../api/ideas.api";
import { interviewApi } from "@/modules/research/api/interviews.api";
import { toast } from "@/lib/toast";
import {
  mapIdeaEvidenceToUI,
  filterIdeaEvidences,
  isServerEvidenceId,
  characterToEvidenceKind,
} from "../utils/ideaPresentation";
import type { EvidenceItem, EvidenceFormData } from "../types/ideas.types";
import { EMPTY_EVIDENCE_FORM } from "../types/ideas.types";

type TFn = (key: string, values?: Record<string, unknown>) => string;

export function useIdeaEvidence(
  ideaId: string,
  rawEvidence: Record<string, unknown>[],
  t: TFn,
  loadIdea: () => Promise<void>,
) {
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [evidenceFilter, setEvidenceFilter] = useState("all");
  const hydrationTokenRef = useRef(0);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvidenceId, setEditingEvidenceId] = useState<
    string | number | null
  >(null);
  const [evidenceForm, setEvidenceForm] =
    useState<EvidenceFormData>(EMPTY_EVIDENCE_FORM);

  // Hydrate evidences when rawEvidence changes
  useEffect(() => {
    if (!rawEvidence || rawEvidence.length === 0) {
      setEvidences([]);
      return;
    }
    hydrateEvidences(rawEvidence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawEvidence]);

  async function hydrateEvidences(raw: Record<string, unknown>[]) {
    const token = ++hydrationTokenRef.current;
    const mapped = raw
      .filter((ev) => ev.kind !== "neutral")
      .map((ev) => mapIdeaEvidenceToUI(ev, t));
    setEvidences(mapped);

    const interviewIds = [
      ...new Set(mapped.map((ev) => ev.interviewId).filter(Boolean)),
    ];
    if (interviewIds.length === 0) return;

    const titleResults = await Promise.allSettled(
      interviewIds.map((id) => interviewApi.get(id)),
    );

    if (token !== hydrationTokenRef.current) return;

    const titleById: Record<string, string> = {};
    interviewIds.forEach((id, idx) => {
      const res = titleResults[idx];
      titleById[id] =
        res.status === "fulfilled"
          ? res.value?.data?.title?.trim() || ""
          : "";
    });

    setEvidences(
      mapped.map((ev) => ({
        ...ev,
        interviewTitle: ev.interviewId
          ? titleById[ev.interviewId] || ""
          : "",
      })),
    );
  }

  const filteredEvidences = useMemo(
    () => filterIdeaEvidences(evidences, evidenceFilter),
    [evidences, evidenceFilter],
  );

  const openAddModal = useCallback(() => {
    setEditingEvidenceId(null);
    setEvidenceForm(EMPTY_EVIDENCE_FORM);
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((evidence: EvidenceItem) => {
    setEditingEvidenceId(evidence.id);
    const w = evidence.weight ?? evidence.score ?? 3;
    setEvidenceForm({
      character: evidence.character,
      title: evidence.title,
      description: evidence.snippet,
      weight: w,
    });
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const toggleExpand = useCallback((id: string | number) => {
    setEvidences((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, isExpanded: !ev.isExpanded } : ev,
      ),
    );
  }, []);

  const saveEvidence = useCallback(async () => {
    if (!ideaId) return;

    // Edit server evidence
    if (
      editingEvidenceId &&
      isServerEvidenceId(editingEvidenceId)
    ) {
      try {
        await ideasApi.updateEvidence(
          ideaId,
          editingEvidenceId as string,
          {
            kind: characterToEvidenceKind(evidenceForm.character),
            speaker: evidenceForm.title.trim(),
            weight: Number(evidenceForm.weight) || 3,
          },
        );
        closeAddModal();
        await loadIdea();
        toast.success(
          t("ideaDetail.toasts.edited", { title: evidenceForm.title }),
        );
      } catch {
        toast.error(t("ideaDetail.toasts.updateFailed"));
      }
      return;
    }

    // Edit local evidence
    if (editingEvidenceId) {
      const w = Number(evidenceForm.weight) || 3;
      setEvidences((prev) =>
        prev.map((ev) =>
          ev.id === editingEvidenceId
            ? {
                ...ev,
                character: evidenceForm.character,
                title: evidenceForm.title,
                weight: w,
                score: w,
              }
            : ev,
        ),
      );
      toast.success(
        t("ideaDetail.toasts.edited", { title: evidenceForm.title }),
      );
    } else {
      // Add local evidence
      const w = Number(evidenceForm.weight) || 3;
      setEvidences((prev) => [
        ...prev,
        {
          id: Date.now(),
          character: evidenceForm.character,
          title: evidenceForm.title,
          snippet: evidenceForm.description,
          rawSpeaker: "",
          interviewId: "",
          interviewTitle: "",
          interviewUrl: "",
          isExpanded: false,
          weight: w,
          score: w,
        },
      ]);
      toast.success(
        t("ideaDetail.toasts.added", { title: evidenceForm.title }),
      );
    }
    closeAddModal();
  }, [ideaId, editingEvidenceId, evidenceForm, closeAddModal, loadIdea, t]);

  const deleteEvidence = useCallback(
    async (id: string | number, title: string) => {
      if (ideaId && isServerEvidenceId(id)) {
        try {
          await ideasApi.deleteEvidence(ideaId, id as string);
          await loadIdea();
          toast.success(t("ideaDetail.toasts.deleted", { title }));
        } catch {
          toast.error(t("ideaDetail.toasts.updateFailed"));
        }
        return;
      }
      setEvidences((prev) => prev.filter((e) => e.id !== id));
      toast.success(t("ideaDetail.toasts.deleted", { title }));
    },
    [ideaId, loadIdea, t],
  );

  return {
    evidences,
    filteredEvidences,
    evidenceFilter,
    setEvidenceFilter,
    showAddModal,
    editingEvidenceId,
    evidenceForm,
    setEvidenceForm,
    openAddModal,
    openEditModal,
    closeAddModal,
    toggleExpand,
    saveEvidence,
    deleteEvidence,
  };
}
