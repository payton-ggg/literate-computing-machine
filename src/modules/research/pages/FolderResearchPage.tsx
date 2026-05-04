"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";

import { useInterviewSelection } from "../hooks/useInterviewSelection";
import { useInterviewFiltering } from "../hooks/useInterviewFiltering";
import { interviewApi, folderApi } from "../api/interviews.api";
import type { Interview, Folder } from "../types/interview.types";
import styles from "./FolderResearchPage.module.css";
import InterviewSidebar from "../components/global/InterviewSidebar";
import InterviewHeader from "../components/global/InterviewHeader";
import InterviewCard from "../components/global/InterviewCard";
import BulkActionBar from "../components/global/BulkActionBar";
import CreateCardDialog from "../components/dialogs/CreateCardDialog";

interface FolderResearchPageProps {
  folderId: string;
}

export function FolderResearchPage({ folderId }: FolderResearchPageProps) {
  const t = useTranslations();
  const router = useRouter();

  const isUncategorized = folderId === "uncategorized";
  const actualFolderId = isUncategorized ? null : folderId;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const currentFolder = folders.find((f) => f.id === actualFolderId) ?? null;

  const selection = useInterviewSelection();
  const filtering = useInterviewFiltering(interviews);

  // Load folders + interviews
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [foldersRes, interviewsRes] = await Promise.all([
        folderApi.list(),
        interviewApi.list({
          folderId: actualFolderId,
          uncategorized: isUncategorized,
        }),
      ]);
      setFolders(foldersRes.data?.folders ?? foldersRes.data ?? []);
      const data = interviewsRes.data;
      setInterviews(data?.interviews ?? data ?? []);
      setHasMore(data?.has_more ?? false);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [actualFolderId, isUncategorized]);

  useEffect(() => {
    loadData();
    selection.exitSelectionMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const handleCardClick = (id: string) => {
    if (selection.selectionMode) {
      selection.toggleSelection(id);
    } else {
      router.push(`/research/interview/${id}`);
    }
  };

  const handleDelete = () => {
    if (selection.selectedCount > 0) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    const ids = selection.selectedIdsArray;
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(ids.map((id) => interviewApi.delete(id)));
      selection.exitSelectionMode();
      setShowDeleteConfirm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardCreated = (interview: { id: string }) => {
    router.push(`/research/interview/${interview.id}`);
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const res = await interviewApi.list({
        folderId: actualFolderId,
        uncategorized: isUncategorized,
        offset: interviews.length,
      });
      const data = res.data;
      const more = data?.interviews ?? data ?? [];
      setInterviews((prev) => [...prev, ...more]);
      setHasMore(data?.has_more ?? false);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const breadcrumbItems = [
    { label: t("header.nav.interviews"), href: "/" },
    ...(currentFolder ? [{ label: currentFolder.name }] : []),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.projectLayout}>
        <Breadcrumbs items={breadcrumbItems} />

        <div className={styles.layoutInner}>
          <InterviewSidebar folder={currentFolder} />

          <main
            className={
              selection.selectedCount > 0 ? styles.contentBulk : styles.content
            }
          >
            <InterviewHeader
              searchQuery={filtering.searchQuery}
              onSearchChange={filtering.setSearchQuery}
              resultsCount={filtering.resultsCount}
              sortOrder={filtering.sortOrder}
              selectionMode={selection.selectionMode}
              selectedCount={selection.selectedCount}
              onToggleSort={filtering.toggleSort}
              onToggleSelectionMode={selection.toggleSelectionMode}
              onUpload={() => setShowCreateDialog(true)}
            />

            {isLoading ? (
              <div className={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div className={styles.skeletonPill} />
                      <div className={styles.skeletonTextShort} />
                    </div>
                    <div>
                      <div className={styles.skeletonTextTitle} />
                      <div className={styles.skeletonTextDesc} />
                      <div className={styles.skeletonTextDescLast} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtering.filtered.length === 0 && !filtering.searchQuery ? (
              <div className={styles.emptyState}>
                <p>{t("interviews.noInterviews")}</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {(filtering.filtered as Interview[]).map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    selectionMode={selection.selectionMode}
                    selected={selection.selectedIds.has(interview.id)}
                    onClick={() => handleCardClick(interview.id)}
                    onToggleSelection={() =>
                      selection.toggleSelection(interview.id)
                    }
                  />
                ))}
              </div>
            )}

            {hasMore && !isLoadingMore && (
              <div className={styles.loadMoreContainer}>
                <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                  {t("interviews.selection.loadMore")}
                </button>
              </div>
            )}

            {isLoadingMore && (
              <div className={styles.loadingState}>
                {t("common.loading")}...
              </div>
            )}

            <BulkActionBar
              count={selection.selectedCount}
              isDeleting={isDeleting}
              onClear={selection.clearSelection}
              onDelete={handleDelete}
            />
          </main>
        </div>
      </div>

      <CreateCardDialog
        isOpen={showCreateDialog}
        folderId={actualFolderId}
        folders={folders}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleCardCreated}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t("interviews.selection.deleteConfirmTitle")}
        message={t("interviews.selection.deleteConfirmMessage")}
        type="danger"
        confirmText={t("interviews.selection.deleteConfirmYes")}
        cancelText={t("interviews.selection.deleteConfirmBack")}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isDeleting) setShowDeleteConfirm(false);
        }}
      />
      <div className="h-20 w-full" />
      <button
        className={styles.mobileFab}
        onClick={() => setShowCreateDialog(true)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: 8 }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {t("interviews.uploadInterview")}
      </button>
    </div>
  );
}
