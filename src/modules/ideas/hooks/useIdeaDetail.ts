"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { ideasApi } from "../api/ideas.api";
import { folderApi } from "@/modules/research/api/interviews.api";
import { toast } from "@/lib/toast";
import { mapIdeaDetailResponse } from "../utils/ideaPresentation";
import type {
  IdeaDetail,
  IdeaDetailFormData,
  FolderOption,
} from "../types/ideas.types";
import { EMPTY_IDEA_DETAIL, EMPTY_DETAIL_FORM } from "../types/ideas.types";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export function useIdeaDetail(ideaId: string) {
  const t = useTranslations();

  const [idea, setIdea] = useState<IdeaDetail>(EMPTY_IDEA_DETAIL);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [isLoadingIdea, setIsLoadingIdea] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  const [formData, setFormData] = useState<IdeaDetailFormData>(EMPTY_DETAIL_FORM);
  const originalDataRef = useRef<IdeaDetailFormData>(EMPTY_DETAIL_FORM);

  // Raw evidence for hydration in useIdeaEvidence
  const [rawEvidence, setRawEvidence] = useState<Record<string, unknown>[]>([]);

  const folderSelectOptions = useMemo(() => {
    const list = (folders || [])
      .map((f) => ({
        id: f.id != null ? String(f.id) : "",
        name: (f.name && String(f.name).trim()) || String(f.id || ""),
      }))
      .filter((f) => f.id);
    const fid = idea.folderId ? String(idea.folderId) : "";
    if (fid && !list.some((f) => f.id === fid)) {
      return [{ id: fid, name: fid }, ...list];
    }
    return list;
  }, [folders, idea.folderId]);

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: t("header.nav.interviews"), href: "/research" },
    ];

    const folder = folders.find(
      (f) => String(f.id) === String(idea.folderId),
    );

    if (folder) {
      items.push({
        label: folder.name,
        href: `/research/${folder.id}`,
      });
      items.push({
        label: t("header.nav.ideas"),
        href: `/research/${folder.id}/ideas`,
      });
    } else {
      items.push({
        label: t("header.nav.ideas"),
        href: "/ideas",
      });
    }

    items.push({ label: idea.name || t("common.loading") });
    return items;
  }, [folders, idea.folderId, idea.name, t]);

  function syncFormFromIdea(ideaData: IdeaDetail) {
    const base: IdeaDetailFormData = {
      pain: ideaData.pain,
      priority: ideaData.priority,
      confidence: ideaData.confidence,
      folderId: ideaData.folderId ? String(ideaData.folderId) : "",
      evidenceSignal: "",
      segment: "",
      problem: "",
      solution: "",
      jtbd_when: ideaData.jtbd_when || "",
      jtbd_want: ideaData.jtbd_want || "",
      jtbd_so_that: ideaData.jtbd_so_that || "",
      jtbd_solution: ideaData.jtbd_solution || "",
    };
    setFormData(base);
    originalDataRef.current = { ...base };
  }

  const loadIdea = useCallback(async () => {
    if (!ideaId) return;
    setIsLoadingIdea(true);
    try {
      const [ideaRes, foldersRes] = await Promise.all([
        ideasApi.getIdea(ideaId),
        folderApi.list().catch(() => ({ data: { folders: [] } })),
      ]);
      setFolders(foldersRes.data?.folders || []);
      const d = ideaRes.data;
      const mapped = mapIdeaDetailResponse(d);
      setIdea(mapped);
      setRawEvidence(d.evidence || []);
      syncFormFromIdea(mapped);
    } catch (e) {
      console.error("Failed to load idea:", e);
    } finally {
      setIsLoadingIdea(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  const setFormField = useCallback(
    (field: keyof IdeaDetailFormData, value: string | number) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        // Dirty check
        const orig = originalDataRef.current;
        const dirty =
          next.pain !== orig.pain ||
          next.priority !== orig.priority ||
          next.confidence !== orig.confidence ||
          next.folderId !== orig.folderId ||
          next.jtbd_when !== orig.jtbd_when ||
          next.jtbd_want !== orig.jtbd_want ||
          next.jtbd_so_that !== orig.jtbd_so_that ||
          next.jtbd_solution !== orig.jtbd_solution;
        setShowUpdateBanner(dirty);
        return next;
      });
    },
    [],
  );

  const handleUpdateInsights = useCallback(async () => {
    if (!ideaId || isEvaluating) return;
    setIsEvaluating(true);
    setShowUpdateBanner(false);
    try {
      const orig = originalDataRef.current;
      const payload: Record<string, unknown> = {};
      if (formData.pain !== orig.pain) payload.pain_score = Number(formData.pain);
      if (formData.priority !== orig.priority) payload.priority = Number(formData.priority);
      if (formData.confidence !== orig.confidence) payload.confidence = Number(formData.confidence);

      if (idea.typeCode === "jtbd") {
        payload.jtbd_context = {
          when: formData.jtbd_when,
          want: formData.jtbd_want,
          so_that: formData.jtbd_so_that,
          solution: formData.jtbd_solution,
        };
      }

      const res = await ideasApi.updateIdea(ideaId, payload);
      const d = res.data;
      const mapped = { ...idea, ...mapIdeaDetailResponse(d) };
      setIdea(mapped);
      syncFormFromIdea(mapped);
      toast.success(t("common.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsEvaluating(false);
    }
  }, [ideaId, isEvaluating, formData, idea, t]);

  return {
    idea,
    setIdea,
    folders,
    folderSelectOptions,
    isLoadingIdea,
    isEvaluating,
    showUpdateBanner,
    setShowUpdateBanner,
    formData,
    setFormField,
    handleUpdateInsights,
    breadcrumbItems,
    rawEvidence,
    loadIdea,
    t,
  };
}
