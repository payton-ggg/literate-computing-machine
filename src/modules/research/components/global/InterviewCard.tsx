"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type {
  Interview,
  InterviewStatus,
} from "@/modules/research/types/interview.types";
import styles from "./InterviewCard.module.css";

interface InterviewCardProps {
  interview: Interview;
  selectionMode?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onToggleSelection?: () => void;
}

function getStatusClass(status: InterviewStatus) {
  if (status === "ready") return "ready";
  if (status === "failed") return "error";
  return "loading";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function InterviewCard({
  interview,
  selectionMode = false,
  selected = false,
  onClick,
  onToggleSelection,
}: InterviewCardProps) {
  const t = useTranslations();

  const statusType = getStatusClass(interview.status);
  const statusLabel = t(`status.${interview.status}`);
  const formattedDate = useMemo(
    () => formatDate(interview.created_at),
    [interview.created_at],
  );

  const accentClass =
    statusType === "ready"
      ? styles.accentReady
      : statusType === "error"
        ? styles.accentError
        : styles.accentLoading;

  const statusBadgeClass =
    statusType === "ready"
      ? styles.statusReady
      : statusType === "error"
        ? styles.statusError
        : styles.statusLoading;

  const cardClasses = [
    styles.card,
    selectionMode ? styles.isSelectionMode : "",
    selected ? styles.isSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={`${styles.accent} ${accentClass}`} />

      {selectionMode && (
        <button
          className={
            selected
              ? styles.selectionIndicatorChecked
              : styles.selectionIndicator
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.();
          }}
        >
          {selected && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7.25L5.5 9.75L11 4.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}

      <div className={styles.cardHeader}>
        <div className={statusBadgeClass}>{statusLabel}</div>
        <span className={styles.cardDate}>{formattedDate}</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{interview.title}</h3>
        {interview.description && (
          <p className={styles.cardDesc}>{interview.description}</p>
        )}
      </div>
    </div>
  );
}
