"use client";

import styles from "./IdeasFilterPopup.module.css";
import type {
  TypeOption,
  StatusOption,
  IdeaFilters,
} from "../../types/ideas.types";

interface IdeasFilterPopupProps {
  isOpen: boolean;
  onToggle: () => void;
  draftFilters: IdeaFilters;
  totalActiveFilters: number;
  typeOptions: TypeOption[];
  statusOptions: StatusOption[];
  uniqueFolders: string[];
  isEmbedded: boolean;
  onToggleDraftFilter: (category: "type" | "status", val: string) => void;
  onSetDraftFolder: (folder: string) => void;
  onApply: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  filterLabel: string;
  applyLabel: string;
  t: (key: string, values?: Record<string, any>) => string;
  typeTitle: string;
  statusTitle: string;
  folderTitle: string;
  allFoldersLabel: string;
}

export default function IdeasFilterPopup({
  isOpen,
  onToggle,
  draftFilters,
  totalActiveFilters,
  typeOptions,
  statusOptions,
  uniqueFolders,
  isEmbedded,
  onToggleDraftFilter,
  onSetDraftFolder,
  onApply,
  containerRef,
  filterLabel,
  applyLabel,
  typeTitle,
  statusTitle,
  folderTitle,
  allFoldersLabel,
}: IdeasFilterPopupProps) {
  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={`${styles.filterBtn} ${styles.desktopOnly}`}
        onClick={onToggle}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1.75 3.5H12.25M3.5 7H10.5M5.25 10.5H8.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {filterLabel}{" "}
        {totalActiveFilters > 0 && <span>({totalActiveFilters})</span>}
      </button>

      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.scrollable}>
            {/* Type */}
            <div className={styles.section}>
              <div className={styles.title}>{typeTitle}</div>
              <div className={styles.options}>
                {typeOptions.map((type) => (
                  <div
                    key={type.id}
                    className={`${styles.option} ${draftFilters.type.includes(type.id) ? styles.selected : ""}`}
                    onClick={() => onToggleDraftFilter("type", type.id)}
                  >
                    <span className={styles.optionText}>{type.label}</span>
                    {draftFilters.type.includes(type.id) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
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

            {/* Status */}
            <div className={styles.section}>
              <div className={styles.title}>{statusTitle}</div>
              <div className={styles.options}>
                {statusOptions.map((status) => (
                  <div
                    key={status.id}
                    className={`${styles.option} ${draftFilters.status.includes(status.id) ? styles.selected : ""}`}
                    onClick={() => onToggleDraftFilter("status", status.id)}
                  >
                    <span className={styles.optionText}>{status.label}</span>
                    {draftFilters.status.includes(status.id) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
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

            {/* Folder (hidden in embedded) */}
            {!isEmbedded && (
              <div className={styles.section}>
                <div className={styles.title}>{folderTitle}</div>
                <div className={styles.selectWrapper}>
                  <select
                    value={draftFilters.folder}
                    onChange={(e) => onSetDraftFolder(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">{allFoldersLabel}</option>
                    {uniqueFolders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <svg
                    className={styles.chevron}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="#6a7c92"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
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
