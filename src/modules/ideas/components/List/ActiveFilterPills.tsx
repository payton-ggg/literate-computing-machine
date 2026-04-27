"use client";

import styles from "./ActiveFilterPills.module.css";
import type { IdeaFilters } from "../../types/ideas.types";

interface ActiveFilterPillsProps {
  activeFilters: IdeaFilters;
  activeTypeLabels: string[];
  activeStatusLabels: string[];
  isEmbedded: boolean;
  onClearFilter: (category: "type" | "status" | "folder") => void;
  typeLabel: string;
  statusLabel: string;
  folderLabel: string;
}

export default function ActiveFilterPills({
  activeFilters,
  activeTypeLabels,
  activeStatusLabels,
  isEmbedded,
  onClearFilter,
  typeLabel,
  statusLabel,
  folderLabel,
}: ActiveFilterPillsProps) {
  const hasActiveFilters =
    activeFilters.type.length > 0 ||
    activeFilters.status.length > 0 ||
    (activeFilters.folder && !isEmbedded);

  if (!hasActiveFilters) return null;

  return (
    <div className={styles.row}>
      {activeFilters.type.length > 0 && (
        <span className={styles.pill}>
          <span className={styles.label}>{typeLabel}</span>{" "}
          <strong>{activeTypeLabels.join(", ")}</strong>
          <svg
            onClick={() => onClearFilter("type")}
            className={styles.remove}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {activeFilters.status.length > 0 && (
        <span className={styles.pill}>
          <span className={styles.label}>{statusLabel}</span>{" "}
          <strong>{activeStatusLabels.join(", ")}</strong>
          <svg
            onClick={() => onClearFilter("status")}
            className={styles.remove}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {activeFilters.folder && !isEmbedded && (
        <span className={styles.pill}>
          <span className={styles.label}>{folderLabel}</span>{" "}
          <strong>{activeFilters.folder}</strong>
          <svg
            onClick={() => onClearFilter("folder")}
            className={styles.remove}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
