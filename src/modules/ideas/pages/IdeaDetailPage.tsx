"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useIdeaDetail } from "../hooks/useIdeaDetail";
import { useIdeaEvidence } from "../hooks/useIdeaEvidence";
import { useDropdownMenu } from "../hooks/useDropdownMenu";
import { ideasApi } from "../api/ideas.api";
import { toast } from "@/lib/toast";
import { mapIdeaDetailResponse } from "../utils/ideaPresentation";
import type { EditIdeaFormData } from "../types/ideas.types";

import IdeaDetailHeader from "../components/Detail/IdeaDetailHeader";
import UpdateBanner from "../components/Detail/UpdateBanner";
import EvidenceColumn from "../components/Detail/EvidenceColumn";
import DetailsColumn from "../components/Detail/DetailsColumn";
import EvidenceModal from "../components/Modals/EvidenceModal";
import EditIdeaModal from "../components/Modals/EditIdeaModal";

import styles from "./IdeaDetailPage.module.css";

interface Props {
  id: string;
}

export default function IdeaDetailPage({ id }: Props) {
  const t = useTranslations();

  // 1. Data Hook
  const {
    idea,
    setIdea,
    folderSelectOptions,
    isEvaluating,
    showUpdateBanner,
    setShowUpdateBanner,
    formData,
    setFormField,
    handleUpdateInsights,
    breadcrumbItems,
    rawEvidence,
    loadIdea,
  } = useIdeaDetail(id);

  // 2. Evidence Hook
  const {
    filteredEvidences,
    evidences,
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
  } = useIdeaEvidence(id, rawEvidence, t as any, loadIdea);

  // 3. UI/Dropdowns Hook
  const {
    activeMenuId,
    headerMenuOpen,
    toggleMenu,
    toggleHeaderMenu,
    closeAll,
  } = useDropdownMenu();

  // 4. Edit Idea Modal Local State
  const [showEditIdeaModal, setShowEditIdeaModal] = useState(false);
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  const [editIdeaForm, setEditIdeaForm] = useState<EditIdeaFormData>({
    name: "",
    description: "",
  });

  const openEditIdeaModal = useCallback(() => {
    closeAll();
    setEditIdeaForm({
      name: idea.name || "",
      description: idea.description || "",
    });
    setShowEditIdeaModal(true);
  }, [idea, closeAll]);

  const saveEditIdea = async () => {
    if (!id) return;
    const name = editIdeaForm.name.trim();
    if (!name) return;
    setIsSavingIdea(true);
    try {
      const res = await ideasApi.updateIdea(id, {
        name,
        description: editIdeaForm.description.trim(),
      });
      const d = res.data;
      setIdea({ ...idea, ...mapIdeaDetailResponse(d) });
      setShowEditIdeaModal(false);
      toast.success(t("ideaDetail.toasts.ideaSaved"));
    } catch {
      toast.error(t("ideaDetail.toasts.updateFailed"));
    } finally {
      setIsSavingIdea(false);
    }
  };

  const handleExport = useCallback(() => {
    // Placeholder for export logic, similar to IdeasPage
    toast.info("Export started...");
  }, []);

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbItems} />

      <IdeaDetailHeader
        idea={idea}
        headerMenuOpen={headerMenuOpen}
        onToggleHeaderMenu={toggleHeaderMenu}
        onOpenEditIdeaModal={openEditIdeaModal}
        onExport={handleExport}
      />

      <UpdateBanner
        visible={showUpdateBanner}
        isEvaluating={isEvaluating}
        saveLabel={t("common.save")}
        savingLabel={t("common.saving")}
        onSave={handleUpdateInsights}
        onHide={() => setShowUpdateBanner(false)}
      />

      <div className={styles.contentGrid}>
        <EvidenceColumn
          evidences={evidences}
          filteredEvidences={filteredEvidences}
          evidenceFilter={evidenceFilter}
          onFilterChange={setEvidenceFilter}
          activeMenuId={activeMenuId}
          onToggleMenu={toggleMenu}
          onToggleExpand={toggleExpand}
          onEdit={openEditModal}
          onDelete={deleteEvidence}
        />

        <DetailsColumn
          idea={idea}
          formData={formData}
          folderSelectOptions={folderSelectOptions as any}
          onFieldChange={setFormField}
        />
      </div>

      <EvidenceModal
        isOpen={showAddModal}
        editingId={editingEvidenceId}
        form={evidenceForm}
        setForm={setEvidenceForm}
        onClose={closeAddModal}
        onSave={saveEvidence}
      />

      <EditIdeaModal
        isOpen={showEditIdeaModal}
        isSaving={isSavingIdea}
        form={editIdeaForm}
        setForm={setEditIdeaForm}
        onClose={() => setShowEditIdeaModal(false)}
        onSave={saveEditIdea}
      />
    </div>
  );
}
