import { useTranslations } from "next-intl";
import styles from "./InterviewHeader.module.css";

interface InterviewHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  sortOrder: "recent" | "oldest";
  selectionMode: boolean;
  selectedCount: number;
  onToggleSort: () => void;
  onToggleSelectionMode: () => void;
  onUpload: () => void;
}

export default function InterviewHeader({
  searchQuery,
  onSearchChange,
  resultsCount,
  sortOrder,
  selectionMode,
  selectedCount,
  onToggleSort,
  onToggleSelectionMode,
  onUpload,
}: InterviewHeaderProps) {
  const t = useTranslations();

  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <div className={styles.iconWrapper}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <h1 className={styles.pageTitle}>{t("interviews.title")}</h1>
        </div>

        <div className={styles.topRowActions}>
          <button
            className={
              selectionMode ? styles.btnSecondaryActive : styles.btnSecondary
            }
            onClick={onToggleSelectionMode}
          >
            {selectionMode
              ? t("interviews.selection.cancelSelect")
              : t("interviews.selection.select")}
          </button>

          <button className={styles.btnPrimary} onClick={onUpload}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("interviews.uploadInterview")}
          </button>
        </div>
      </div>

      <div className={styles.toolbarRow}>
        <div className={styles.searchWrapper}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t("interviews.searchInterviewsPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.toolbarActions}>
          <span className={styles.resultsCount}>
            {selectionMode && selectedCount > 0
              ? `${t("interviews.selection.selected")}: ${selectedCount}`
              : `${resultsCount} ${t("interviews.results")}`}
          </span>
          <button className={styles.sortButton} onClick={onToggleSort}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            {sortOrder === "recent"
              ? t("interviews.sortRecent")
              : t("interviews.sortOldest")}
          </button>
        </div>
      </div>
    </div>
  );
}
