"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { folderApi } from "@/modules/research/api/interviews.api";
import type { FolderOption, StatusOption, TypeOption } from "../types/ideas.types";
import { useIdeasData } from "../hooks/useIdeasData";
import { useIdeasFilters } from "../hooks/useIdeasFilters";
import { useIdeasTable } from "../hooks/useIdeasTable";
import { useViewSettings } from "../hooks/useViewSettings";
import { usePriorityEdit } from "../hooks/usePriorityEdit";
import { useNewIdeaDrawer } from "../hooks/useNewIdeaDrawer";
import { useIdeasExport } from "../hooks/useIdeasExport";
import { useBillingIssue } from "../hooks/useBillingIssue";

import IdeasPageTitle from "../components/List/IdeasPageTitle";
import IdeasSearchBar from "../components/List/IdeasSearchBar";
import IdeasFilterPopup from "../components/List/IdeasFilterPopup";
import ViewSettingsPopup from "../components/List/ViewSettingsPopup";
import ActiveFilterPills from "../components/List/ActiveFilterPills";
import IdeasHeader from "../components/List/IdeasHeader";
import IdeasTable from "../components/List/IdeasTable";
import MobileVerticalTable from "../components/List/MobileVerticalTable";
import LayoutSwitcher from "../components/List/LayoutSwitcher";
import SelectionActionBar from "../components/List/SelectionActionBar";
import ChangeFolderModal from "../components/Modals/ChangeFolderModal";
import NewIdeaDrawer from "../components/Drawers/NewIdeaDrawer";
import EmptyStates from "../components/Common/EmptyStates";
import InsufficientBalanceModal from "../components/Modals/InsufficientBalanceModal";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";

import styles from "./IdeasPage.module.css";
import { ideasApi } from "../api/ideas.api";
import { toast } from "@/lib/toast";

interface IdeasPageProps {
  folderId?: string;
}

export default function IdeasPage({ folderId }: IdeasPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const isEmbedded = !!folderId;

  // Folder data for mapping and selects
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const folderNameById = useMemo(() => {
    return folders.reduce((acc, f) => ({ ...acc, [f.id]: f.name }), {});
  }, [folders]);

  useEffect(() => {
    folderApi.list().then((res) => {
      setFolders(res.data?.folders || res.data || []);
    });
  }, []);

  // Options
  const typeOptions: TypeOption[] = [
    { id: "hypothesis", label: t("ideasPage.types.hypothesis") },
    { id: "jtbd", label: t("ideasPage.types.jtbd") },
    { id: "insight", label: t("ideasPage.types.insight") },
    { id: "manual", label: t("ideasPage.types.manual") },
  ];

  const statusOptions: StatusOption[] = [
    { id: "has_signals", label: t("ideasPage.statuses.hasSignals") },
    { id: "confirmed", label: t("ideasPage.statuses.confirmed") },
    { id: "refuted", label: t("ideasPage.statuses.refuted") },
    { id: "no_data", label: t("ideasPage.statuses.noData") },
  ];

  const uniqueFolders = useMemo(() => folders.map((f) => f.name), [folders]);

  // Hooks
  const {
    data,
    setData,
    isLoading,
    errorMessage,
    showInitialEmptyStateDelayed,
    fetchIdeas,
    retryLoading,
  } = useIdeasData({ folderNameById, t });

  const {
    isFilterOpen,
    setIsFilterOpen,
    draftFilters,
    activeFilters,
    totalActiveFilters,
    activeTypeLabels,
    activeStatusLabels,
    toggleDraftFilter,
    setDraftFolderFilter,
    applyFilters,
    clearFilter,
    resetAllFilters,
    filterContainerRef,
  } = useIdeasFilters({ t });

  const {
    isViewSettingsOpen,
    setIsViewSettingsOpen,
    draftVisibleColumns,
    activeVisibleColumns,
    allColumns,
    toggleDraftColumn,
    applyViewSettings,
    viewSettingsContainerRef,
  } = useViewSettings({ t });

  const {
    table,
    globalFilter,
    setGlobalFilter,
    selectedCount,
    resultsCountText,
  } = useIdeasTable({
    data,
    activeFilters,
    activeVisibleColumns,
    isEmbedded,
    t,
  });

  const {
    editingPriorityId,
    editingPriorityValue,
    setEditingPriorityValue,
    startPriorityEdit,
    savePriority,
    cancelPriorityEdit,
  } = usePriorityEdit({ t });

  const {
    activeBillingIssue,
    setActiveBillingIssue,
    billingIssueMode,
    billingIssueAvailable,
    billingIssueEstimatedPpuCents,
    billingIssuePpuRemainingCents,
    billingIssuePpuSpendingLimitCents,
    closeBillingIssueModal,
    openPricingPage,
    openBillingPage,
  } = useBillingIssue();

  const {
    isOpen: isNewIdeaDrawerOpen,
    isSaving: isSavingNewIdea,
    isTemplateHintVisible,
    setIsTemplateHintVisible,
    form: newIdeaForm,
    updateField: updateNewIdeaField,
    open: openNewIdeaDrawer,
    close: closeNewIdeaDrawer,
    save: saveNewIdea,
    goToLibrary,
  } = useNewIdeaDrawer({
    selectedFolderId: folderId || "",
    currentFolderId: folderId || "",
    availableFolders: folders,
    t,
    onCreated: () => fetchIdeas(folderId || null),
    onBillingIssue: (issue) => setActiveBillingIssue(issue),
  });

  const {
    showExportStatusModal,
    exportModalTitle,
    exportModalMessage,
    handleExport,
    closeExportModal,
  } = useIdeasExport({ t });

  // Mobile states
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileLayout, setMobileLayout] = useState<"horizontal" | "vertical">("vertical");

  // Selection states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangeFolderModal, setShowChangeFolderModal] = useState(false);

  useEffect(() => {
    fetchIdeas(folderId || null);
  }, [fetchIdeas, folderId]);

  const handleGoToIdea = useCallback(
    (id: string) => {
      router.push(`/ideas/${id}`);
    },
    [router],
  );

  const confirmDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => ideasApi.deleteIdea(id)));
      toast.success(t("ideasPage.toasts.deleteSuccess", { count: ids.length }));
      table.resetRowSelection();
      fetchIdeas(folderId || null);
    } catch (error) {
      console.error("Error deleting ideas:", error);
      toast.error(t("ideasPage.toasts.deleteFailed"));
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleChangeFolder = async (targetFolderId: string) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id);
    if (ids.length === 0) return;

    try {
      await Promise.all(
        ids.map((id) => ideasApi.updateIdea(id, { folder_id: targetFolderId })),
      );
      toast.success(
        t("ideasPage.toasts.folderChanged", { count: ids.length }),
      );
      table.resetRowSelection();
      fetchIdeas(folderId || null);
    } catch (error) {
      console.error("Error changing folder:", error);
      toast.error(t("ideasPage.toasts.folderChangeFailed"));
    } finally {
      setShowChangeFolderModal(false);
    }
  };

  const isEmpty = data.length === 0 && !isLoading && !errorMessage;
  const isFilterEmpty = data.length > 0 && table.getFilteredRowModel().rows.length === 0;

  return (
    <div className={`${styles.page} ${isEmbedded ? styles.embedded : ""} ${folderId ? styles.withBorderRadius : ""}`}>
      <div className={`${styles.container} ${folderId ? styles.hasFolder : ""}`}>
        <IdeasPageTitle
          title={t("ideasPage.title")}
          onToggleSearch={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          onToggleViewSettings={() => setIsViewSettingsOpen(!isViewSettingsOpen)}
          isMobileSearchOpen={isMobileSearchOpen}
          totalActiveFilters={totalActiveFilters}
          activeVisibleColumnsCount={activeVisibleColumns.length}
        />

        <div className={styles.ideasContent}>
          <IdeasHeader
            resultsCountText={resultsCountText}
            onExport={() => handleExport(table.getSelectedRowModel().rows.map(r => r.original.id))}
            onNewIdea={openNewIdeaDrawer}
            exportLabel={t("common.export")}
            newIdeaLabel={t("ideasPage.newIdea")}
            childrenLeft={
              <IdeasSearchBar
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={t("ideasPage.searchPlaceholder")}
                isMobileOpen={isMobileSearchOpen}
              />
            }
            childrenRight={
              <>
                <IdeasFilterPopup
                  isOpen={isFilterOpen}
                  onToggle={() => setIsFilterOpen(!isFilterOpen)}
                  draftFilters={draftFilters}
                  t={t}
                  totalActiveFilters={totalActiveFilters}
                  typeOptions={typeOptions}
                  statusOptions={statusOptions}
                  uniqueFolders={uniqueFolders}
                  isEmbedded={isEmbedded}
                  onToggleDraftFilter={toggleDraftFilter}
                  onSetDraftFolder={setDraftFolderFilter}
                  onApply={applyFilters}
                  containerRef={filterContainerRef}
                  filterLabel={t("common.filter")}
                  applyLabel={t("common.apply")}
                  typeTitle={t("ideasPage.filters.type")}
                  statusTitle={t("ideasPage.filters.status")}
                  folderTitle={t("ideasPage.filters.folder")}
                  allFoldersLabel={t("ideasPage.filters.allFolders")}
                />
                <LayoutSwitcher
                  layout={mobileLayout}
                  onChange={setMobileLayout}
                  horizontalLabel={t("ideasPage.layouts.horizontal")}
                  verticalLabel={t("ideasPage.layouts.vertical")}
                />
                <ViewSettingsPopup
                  isOpen={isViewSettingsOpen}
                  onToggle={() => setIsViewSettingsOpen(!isViewSettingsOpen)}
                  draftVisibleColumns={draftVisibleColumns}
                  activeVisibleColumnsCount={activeVisibleColumns.length}
                  allColumns={allColumns}
                  onToggleDraftColumn={toggleDraftColumn}
                  onApply={applyViewSettings}
                  containerRef={viewSettingsContainerRef}
                  viewSettingsLabel={t("ideasPage.viewSettings.title")}
                  applyLabel={t("common.apply")}
                />
              </>
            }
          />

          <ActiveFilterPills
            activeFilters={activeFilters}
            activeTypeLabels={activeTypeLabels}
            activeStatusLabels={activeStatusLabels}
            isEmbedded={isEmbedded}
            onClearFilter={clearFilter}
            typeLabel={t("ideasPage.filters.type")}
            statusLabel={t("ideasPage.filters.status")}
            folderLabel={t("ideasPage.filters.folder")}
          />

          {isLoading && data.length === 0 ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner} />
              <p>{t("common.loading")}...</p>
            </div>
          ) : errorMessage ? (
            <EmptyStates type="error" onAction={retryLoading} t={t} />
          ) : isEmpty ? (
            showInitialEmptyStateDelayed ? (
              <EmptyStates type="initial" onAction={openNewIdeaDrawer} t={t} />
            ) : (
              <div className={styles.loadingWrapper} />
            )
          ) : isFilterEmpty ? (
            <EmptyStates type="filter" onAction={resetAllFilters} t={t} />
          ) : (
            <>
              <IdeasTable
                table={table}
                onGoToIdea={handleGoToIdea}
                onStartPriorityEdit={startPriorityEdit}
                onSavePriority={savePriority}
                onCancelPriorityEdit={cancelPriorityEdit}
                editingPriorityId={editingPriorityId}
                editingPriorityValue={editingPriorityValue}
                onSetEditingPriorityValue={setEditingPriorityValue}
                t={t}
                mobileLayout={mobileLayout}
              />
              <MobileVerticalTable
                table={table}
                onGoToIdea={handleGoToIdea}
                t={t}
                mobileLayout={mobileLayout}
              />
            </>
          )}
        </div>
      </div>

      <SelectionActionBar
        count={selectedCount}
        onDelete={() => setShowDeleteConfirm(true)}
        onChangeFolder={() => setShowChangeFolderModal(true)}
        onClear={() => table.resetRowSelection()}
        t={t}
      />

      <NewIdeaDrawer
        isOpen={isNewIdeaDrawerOpen}
        isSaving={isSavingNewIdea}
        isTemplateHintVisible={isTemplateHintVisible}
        setIsTemplateHintVisible={setIsTemplateHintVisible}
        form={newIdeaForm}
        updateField={updateNewIdeaField}
        onClose={closeNewIdeaDrawer}
        onSave={saveNewIdea}
        onGoToLibrary={goToLibrary}
        folders={folders}
        t={t}
      />

      <ChangeFolderModal
        isOpen={showChangeFolderModal}
        folders={folders}
        onClose={() => setShowChangeFolderModal(false)}
        onConfirm={handleChangeFolder}
        t={t}
      />

      <InsufficientBalanceModal
        isOpen={!!activeBillingIssue}
        mode={billingIssueMode}
        estimatedTokens={activeBillingIssue?.estimated_tokens || 0}
        available={billingIssueAvailable}
        ppuRemainingCents={billingIssuePpuRemainingCents}
        ppuSpendingLimitCents={billingIssuePpuSpendingLimitCents}
        onUpgrade={openPricingPage}
        onEnablePpu={openBillingPage}
        onIncreaseLimit={openBillingPage}
        onClose={closeBillingIssueModal}
        t={t}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t("ideasPage.selection.deleteConfirmTitle")}
        message={t("ideasPage.selection.deleteConfirmMessage", { count: selectedCount })}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText={t("common.delete")}
        type="danger"
      />

      <ConfirmDialog
        isOpen={showExportStatusModal}
        title={exportModalTitle}
        message={exportModalMessage}
        onConfirm={closeExportModal}
        onClose={closeExportModal}
        confirmText={t("common.ok")}
        hideCancel
        type="primary"
      />
    </div>
  );
}
