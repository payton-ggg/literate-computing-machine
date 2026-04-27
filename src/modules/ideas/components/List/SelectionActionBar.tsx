"use client";

import styles from "./SelectionActionBar.module.css";

interface SelectionActionBarProps {
  count: number;
  onDelete: () => void;
  onChangeFolder: () => void;
  onClear: () => void;
  t: (key: string, values?: Record<string, any>) => string;
}

export default function SelectionActionBar({
  count,
  onDelete,
  onChangeFolder,
  onClear,
  t,
}: SelectionActionBarProps) {
  if (count === 0) return null;

  return (
    <div className={styles.actionBar}>
      <span className={styles.countText}>
        {t("ideasPage.selection.count", { count })}
      </span>

      <div className={styles.divider} />

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnDelete}`} onClick={onDelete}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1.75 3.5H3.5M3.5 3.5H12.25M3.5 3.5V11.375C3.5 11.6071 3.59219 11.8296 3.75628 11.9937C3.92037 12.1578 4.14294 12.25 4.375 12.25H9.625C9.85706 12.25 10.0796 12.1578 10.2437 11.9937C10.4078 11.8296 10.5 11.6071 10.5 11.375V3.5H3.5ZM5.25 3.5V2.625C5.25 2.39294 5.34219 2.17037 5.50628 2.00628C5.67037 1.84219 5.89294 1.75 6.125 1.75H7.875C8.10706 1.75 8.32963 1.84219 8.49372 2.00628C8.65781 2.17037 8.75 2.39294 8.75 2.625V3.5M5.6875 6.5625V9.1875M8.3125 6.5625V9.1875"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("common.delete")}</span>
        </button>

        <button className={`${styles.btn} ${styles.btnFolder}`} onClick={onChangeFolder}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1.75 4.375C1.75 4.14294 1.84219 3.92037 2.00628 3.75628C2.17037 3.59219 2.39294 3.5 2.625 3.5H5.4075C5.63956 3.5 5.86212 3.59219 6.02622 3.75628L6.80628 4.53634C6.97037 4.70044 7.19294 4.79262 7.425 4.79262H11.375C11.6071 4.79262 11.8296 4.88481 11.9937 5.04891C12.1578 5.213 12.25 5.43556 12.25 5.66762V10.5C12.25 10.7321 12.1578 10.9546 11.9937 11.1187C11.8296 11.2828 11.6071 11.375 11.375 11.375H2.625C2.39294 11.375 2.17037 11.2828 2.00628 11.1187C1.84219 10.9546 1.75 10.7321 1.75 10.5V4.375Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("ideasPage.selection.changeFolder")}</span>
        </button>

        <button className={styles.btnClose} onClick={onClear}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

