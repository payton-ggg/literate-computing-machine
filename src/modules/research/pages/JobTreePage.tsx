"use client";

import { useTranslations } from "next-intl";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";

import { useJobTree } from "../hooks/useJobTree";
import { useJobTreeCanvas } from "../hooks/useJobTreeCanvas";
import InterviewSidebar from "../components/global/InterviewSidebar";
import JobTreeCanvas from "../components/views/jobTree/JobTreeCanvas";
import JobTreeHeader from "../components/views/jobTree/JobTreeHeader";
import JobTreeSidePanel from "../components/views/jobTree/JobTreeSidePanel";
import EditJobModal from "../components/views/jobTree/EditJobModal";
import styles from "./JobTreePage.module.css";

interface JobTreePageProps {
  interviewId?: string;
  folderId?: string;
}

export function JobTreePage({ interviewId, folderId }: JobTreePageProps) {
  const t = useTranslations();

  const tree = useJobTree({ interviewId, folderId });
  const canvas = useJobTreeCanvas();

  const handleNavigatePrev = () => {
    const node = tree.navigatePrev();
    if (node) canvas.scrollToNode(node);
  };

  const handleNavigateNext = () => {
    const node = tree.navigateNext();
    if (node) canvas.scrollToNode(node);
  };

  return (
    <div className={styles.jobTreePage}>
      {!tree.isFullScreen && <Breadcrumbs items={tree.breadcrumbItems} />}

      <div
        className={`${styles.mainLayout} ${tree.isFullScreen ? styles.isFullScreen : ""}`}
      >
        {!tree.isFullScreen && (
          <InterviewSidebar
            folder={tree.folderData}
            interviewId={tree.isFolderMode ? undefined : interviewId}
          />
        )}

        <main className={styles.contentPanel}>
          {tree.isLoading ? (
            <div className={styles.stateCenter}>
              <div className={styles.spinner} />
              <p>{t("jtbd.loading")}</p>
            </div>
          ) : tree.isExtracting ? (
            <div className={styles.stateCenter}>
              <div className={styles.spinner} />
              <p>
                {tree.isFolderMode
                  ? t("folderJtbd.generating") || "Generating tree..."
                  : t("jtbd.extracting")}
              </p>
              {tree.isFolderMode && (
                <p className={styles.stateHint}>
                  {t("folderJtbd.generatingHint") ||
                    "This may take some time. Please wait."}
                </p>
              )}
            </div>
          ) : !tree.fullTree ? (
            <div className={styles.emptyStateWrapper}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>🌳</div>
                <h2 className={styles.emptyTitle}>
                  {tree.isFolderMode
                    ? t("folderJtbd.emptyTitle") || "No job tree created"
                    : t("jtbd.noTree")}
                </h2>
                {tree.isFolderMode && (
                  <p className={styles.emptyDesc}>
                    {t("folderJtbd.emptyDesc") ||
                      "Click Generate to extract all jobs from interviews in this project."}
                  </p>
                )}
                <button
                  className={styles.btnPrimary}
                  onClick={tree.extractTree}
                >
                  {tree.isFolderMode && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ marginRight: 6 }}
                    >
                      <path
                        d="M10 2l2.5 5.5L18 10l-5.5 2.5L10 18l-2.5-5.5L2 10l5.5-2.5z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {tree.isFolderMode
                    ? t("folderJtbd.generateButton") || "Generate"
                    : t("jtbd.extractButton")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {!tree.isFullScreen && (
                <JobTreeHeader
                  isFolderMode={tree.isFolderMode}
                  onExport={tree.handleExport}
                  onExtract={tree.extractTree}
                  onOpenTransfer={tree.handleTransferSingle}
                  onToggleFullScreen={tree.toggleFullScreen}
                  t={t}
                />
              )}

              <JobTreeCanvas
                canvasWrapperRef={canvas.canvasWrapperRef}
                canvasTransform={canvas.canvasTransform}
                canvasDims={tree.canvasDims}
                flatNodes={tree.flatNodes}
                connections={tree.connections}
                selectedNodeId={tree.selectedNodeId}
                collapsedNodes={tree.collapsedNodes}
                onWheel={canvas.onWheel}
                onMouseDown={canvas.onCanvasMouseDown}
                onTouchStart={canvas.onCanvasTouchStart}
                onSelectNode={tree.selectNode}
                onToggleCollapse={tree.toggleCollapse}
                getBadgeLabel={tree.getBadgeLabel}
              />

              {tree.isFullScreen && (
                <div className={styles.exitFullScreen}>
                  <button
                    className={styles.btnExitFullscreen}
                    onClick={tree.toggleFullScreen}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {tree.selectedNode && (
          <JobTreeSidePanel
            node={tree.selectedNode}
            onClose={() => tree.setSelectedNodeId(null)}
            onTransferSingle={tree.handleTransferSingle}
            onEditNode={tree.openEditModal}
            onCopyLink={tree.copyNodeLink}
            onDownloadNode={tree.handleDownloadNode}
            onDeleteNode={tree.confirmDeleteNode}
            onNavigatePrev={handleNavigatePrev}
            onNavigateNext={handleNavigateNext}
            canNavigatePrev={tree.canNavigatePrev}
            canNavigateNext={tree.canNavigateNext}
            children={tree.getChildren(tree.selectedNode)}
            childrenTitle={tree.getChildrenTitle(tree.selectedNode.level)}
            onSelectNode={tree.selectNode}
            getBadgeLabel={tree.getBadgeLabel}
            getImportanceColor={tree.getImportanceColor}
            getSatisfactionColor={tree.getSatisfactionColor}
            t={t}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={tree.showDeleteConfirm}
        title={t("jtbd.confirmDeleteTitle") || "Delete job?"}
        message={t("jtbd.confirmDeleteMsg", {
          name: tree.nodeToDelete?.name || "",
        })}
        warning={t("jtbd.deleteWarning") || "Deletion is irreversible"}
        confirmText={t("jtbd.deleteConfirmButton") || "Yes, delete"}
        type="danger"
        onConfirm={tree.deleteNode}
        onClose={() => tree.setShowDeleteConfirm(false)}
      />

      <EditJobModal
        isOpen={tree.showEditModal}
        form={tree.editNodeForm}
        isSaving={tree.isSavingNode}
        onFormChange={tree.setEditNodeForm}
        onSave={tree.saveEditNode}
        onClose={tree.closeEditModal}
        t={t}
      />

      <div className={styles.toastStack}>
        {tree.toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}
          >
            <span className={styles.toastIcon}>
              {toast.type === "error" ? "✕" : "✓"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}