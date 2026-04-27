"use client";

import styles from "./ViewSettingsPopup.module.css";
import type { ColumnOption } from "../../types/ideas.types";

interface ViewSettingsPopupProps {
  isOpen: boolean;
  onToggle: () => void;
  draftVisibleColumns: string[];
  activeVisibleColumnsCount: number;
  allColumns: ColumnOption[];
  onToggleDraftColumn: (colId: string) => void;
  onApply: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewSettingsLabel: string;
  applyLabel: string;
}

export default function ViewSettingsPopup({
  isOpen,
  onToggle,
  draftVisibleColumns,
  activeVisibleColumnsCount,
  allColumns,
  onToggleDraftColumn,
  onApply,
  containerRef,
  viewSettingsLabel,
  applyLabel,
}: ViewSettingsPopupProps) {
  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={`${styles.btn} ${styles.iconOnly} ${styles.desktopOnly} ${isOpen ? styles.active : ""}`}
        onClick={onToggle}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.75" y="4" width="10.5" height="1.5" rx="0.5" fill="currentColor" />
          <rect x="1.75" y="8.5" width="10.5" height="1.5" rx="0.5" fill="currentColor" />
          <circle cx="4" cy="4.75" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="9.25" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {activeVisibleColumnsCount > 0 && (
          <span className={styles.badge}>{activeVisibleColumnsCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.scrollable}>
            <div className={styles.section}>
              <div className={styles.title}>{viewSettingsLabel}</div>
              <div className={styles.options}>
                {allColumns.map((col) => (
                  <div
                    key={col.id}
                    className={`${styles.option} ${draftVisibleColumns.includes(col.id) ? styles.selected : ""}`}
                    onClick={() => onToggleDraftColumn(col.id)}
                  >
                    <span className={styles.optionText}>{col.title}</span>
                    {draftVisibleColumns.includes(col.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#006DFA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.applyBtn} onClick={onApply}>
              {applyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

