"use client";

import styles from "./IdeasHeader.module.css";

interface IdeasHeaderProps {
  resultsCountText: string;
  onExport: () => void;
  onNewIdea: () => void;
  exportLabel: string;
  newIdeaLabel: string;
  childrenLeft?: React.ReactNode;
  childrenRight?: React.ReactNode;
}

export default function IdeasHeader({
  resultsCountText,
  onExport,
  onNewIdea,
  exportLabel,
  newIdeaLabel,
  childrenLeft,
  childrenRight,
}: IdeasHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>{childrenLeft}</div>

      <div className={styles.right}>
        <span className={styles.resultsCount}>{resultsCountText}</span>

        <button
          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnExport}`}
          onClick={onExport}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1.75V9.33333M7 9.33333L4.08333 6.41667M7 9.33333L9.91667 6.41667M2.33333 12.25H11.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {exportLabel}
        </button>

        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnNewIdea}`}
          onClick={onNewIdea}
        >
          {newIdeaLabel}
        </button>

        {childrenRight}
      </div>
    </div>
  );
}
