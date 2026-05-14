"use client";

import styles from "./JobTreeHeader.module.css";

interface JobTreeHeaderProps {
  isFolderMode: boolean;
  onExport: () => void;
  onExtract: () => void;
  onOpenTransfer: () => void;
  onToggleFullScreen: () => void;
  t: (key: string) => string;
}

export default function JobTreeHeader({
  isFolderMode,
  onExport,
  onExtract,
  onOpenTransfer,
  onToggleFullScreen,
  t,
}: JobTreeHeaderProps) {
  return (
    <header className={styles.contentHeader}>
      <div className={styles.contentTitleGroup}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16M12 6l-4 3M12 6l4 3"
            stroke="var(--fg)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h1 className={styles.contentTitle}>
          {isFolderMode
            ? t("folderJtbd.title") || "Project Job Tree"
            : t("jtbd.title")}
        </h1>
      </div>
      <div className={styles.contentActions}>
        <button className={styles.btnSecondary} onClick={onExport}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3M10 3v10M6 9l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("folderJtbd.export")}
        </button>
        {isFolderMode ? (
          <button className={styles.btnPrimary} onClick={onExtract}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 10h5M12 10h5M10 3v5M10 12v5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {t("folderJtbd.regenerate") || "Regenerate"}
          </button>
        ) : (
          <button className={styles.btnPrimary} onClick={onOpenTransfer}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 7l3 3-3 3M3 10h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("jtbd.transferToIdeas")}
          </button>
        )}
        <button className={styles.btnIcon} onClick={onToggleFullScreen}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
