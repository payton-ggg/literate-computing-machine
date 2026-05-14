"use client";

import { FlatNode, NodeLevel } from "@/modules/research/types/jobTree.types";
import styles from "./JobTreeSidePanel.module.css";

interface JobTreeSidePanelProps {
  node: FlatNode;
  onClose: () => void;
  onTransferSingle: (node: FlatNode) => void;
  onEditNode: (node: FlatNode) => void;
  onCopyLink: () => void;
  onDownloadNode: (node: FlatNode) => void;
  onDeleteNode: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  children: FlatNode[];
  childrenTitle: string;
  onSelectNode: (node: FlatNode) => void;
  getBadgeLabel: (level: NodeLevel) => string;
  getImportanceColor: (v?: number) => string;
  getSatisfactionColor: (v?: number) => string;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export default function JobTreeSidePanel({
  node,
  onClose,
  onTransferSingle,
  onEditNode,
  onCopyLink,
  onDownloadNode,
  onDeleteNode,
  onNavigatePrev,
  onNavigateNext,
  canNavigatePrev,
  canNavigateNext,
  children,
  childrenTitle,
  onSelectNode,
  getBadgeLabel,
  getImportanceColor,
  getSatisfactionColor,
  t,
}: JobTreeSidePanelProps) {
  return (
    <div className={styles.sidePanel}>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <span
            className={`${styles.panelType} ${
              node.level === "core"
                ? styles.textCore
                : node.level === "high_level"
                  ? styles.textHighLevel
                  : ""
            }`}
          >
            {getBadgeLabel(node.level)} {t("folderJtbd.panel.coreTitle")}
          </span>
        </div>
        <button className={styles.btnClose} onClick={onClose}>
          &times;
        </button>
      </header>

      <div className={styles.panelBody}>
        <div className={styles.panelTopActions}>
          <button
            className={`${styles.btnPanel} ${styles.primary}`}
            onClick={() => onTransferSingle(node)}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3v14M6 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {t("jtbd.inIdea")}
          </button>
          <button
            className={`${styles.btnPanel} ${styles.secondary}`}
            onClick={() => onEditNode(node)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {t("jtbd.edit")}
          </button>
          <div className={styles.panelSubActions}>
            <button
              className={`${styles.btnPanel} ${styles.iconOnly}`}
              title={t("jtbd.copy")}
              onClick={onCopyLink}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-6M13 7l5-5m0 0h-4m4 0v4" />
              </svg>
            </button>
            <button
              className={`${styles.btnPanel} ${styles.iconOnly}`}
              title={t("jtbd.download")}
              onClick={() => onDownloadNode(node)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
            <button
              className={`${styles.btnPanel} ${styles.iconOnly} ${styles.danger}`}
              title={t("jtbd.delete")}
              onClick={onDeleteNode}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D92D20"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </div>

        <h2 className={styles.panelName}>{node.name}</h2>
        {node.description ? (
          <p className={styles.panelDesc}>{node.description}</p>
        ) : (
          <p className={`${styles.panelDesc} ${styles.empty}`}>
            {t("folderJtbd.panel.noDescription")}
          </p>
        )}

        {node.level === "core" && (
          <div className={styles.panelDetails}>
            <div className={styles.detailBlock}>
              <label>{t("jtbd.whenTrigger")}</label>
              <div className={styles.detailContent}>
                {node.data?.when_trigger || "-"}
              </div>
            </div>
            <div className={styles.detailBlock}>
              <label>{t("jtbd.iWantTo")}</label>
              <div className={styles.detailContent}>
                {node.data?.i_want_to || "-"}
              </div>
            </div>
            <div className={styles.detailBlock}>
              <label>{t("jtbd.soThat")}</label>
              <div className={styles.detailContent}>
                {node.data?.so_that || "-"}
              </div>
            </div>
            <div className={styles.detailBlock}>
              <label>{t("jtbd.currentSolution")}</label>
              <div className={styles.detailContent}>
                {node.data?.current_solution || "-"}
              </div>
            </div>
            <div className={styles.detailBlock}>
              <label>{t("folderJtbd.panel.scores")}</label>
              <div className={styles.scoreRow}>
                <div className={styles.scoreItem}>
                  <span>
                    {t("jtbd.importance")}: {node.data?.importance || "-"}
                  </span>
                  <div
                    className={styles.scoreDot}
                    style={{
                      background: getImportanceColor(node.data?.importance),
                    }}
                  />
                </div>
                <div className={styles.scoreItem}>
                  <span>
                    {t("jtbd.satisfaction")}: {node.data?.satisfaction || "-"}
                  </span>
                  <div
                    className={styles.scoreDot}
                    style={{
                      background: getSatisfactionColor(node.data?.satisfaction),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {node.level === "micro" && node.data?.context && (
          <div className={styles.panelDetails}>
            <div className={styles.detailBlock}>
              <label>{t("jtbd.context") || "Context"}</label>
              <div className={styles.detailContent}>{node.data.context}</div>
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div className={styles.panelChildren}>
            <h3 className={styles.childrenTitle}>{childrenTitle}</h3>
            {children.map((child) => (
              <div
                key={child.id}
                className={styles.panelChildItem}
                onClick={() => onSelectNode(child)}
              >
                <span className={styles.panelChildBadge}>
                  {getBadgeLabel(child.level)}
                </span>
                <span className={styles.panelChildName}>{child.name}</span>
              </div>
            ))}
          </div>
        )}

        {node.data?.evidence && (
          <div className={styles.panelEvidence}>
            <label>{t("jtbd.evidence")}</label>
            <div className={styles.evidenceBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" fill="#E0E7FF" />
                <path d="M10 10h1.5l-1 3h2" stroke="#4F46E5" />
              </svg>
              {node.data.evidence}
            </div>
          </div>
        )}

        <div className={styles.panelConnections}>
          <div className={styles.connHeader}>
            <h3>{t("jtbd.connections") || "Connections"}</h3>
            <div className={styles.connStats}>
              <span className={`${styles.stat} ${styles.up}`}>
                <svg width="12" height="12" viewBox="0 0 16 16">
                  <path
                    d="M8 12V4M5 7l3-3 3 3"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
                1
              </span>
              <span className={`${styles.stat} ${styles.down}`}>
                <svg width="12" height="12" viewBox="0 0 16 16">
                  <path
                    d="M8 4v8M5 9l3 3 3-3"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
                2
              </span>
            </div>
            <button className={styles.btnAddConn}>+</button>
          </div>
          <div className={styles.connBar} />
        </div>
      </div>

      <footer className={styles.panelFooter}>
        <button
          className={styles.btnNav}
          onClick={onNavigatePrev}
          disabled={!canNavigatePrev}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" />
          </svg>
          {t("folderJtbd.panel.prev")}
        </button>
        <button
          className={`${styles.btnNav} ${styles.btnNavPrimary}`}
          onClick={onNavigateNext}
          disabled={!canNavigateNext}
        >
          {t("folderJtbd.panel.next")}
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </footer>
    </div>
  );
}
