"use client";

import Link from "next/link";
import type { EvidenceItem } from "../../types/ideas.types";
import styles from "./EvidenceCard.module.css";

interface Props {
  evidence: EvidenceItem;
  activeMenuId: string | number | null;
  onToggleMenu: (id: string | number) => void;
  onToggleExpand: (id: string | number) => void;
  onEdit: (evidence: EvidenceItem) => void;
  onDelete: (id: string | number, title: string) => void;
  editLabel: string;
  deleteLabel: string;
}

export default function EvidenceCard({
  evidence,
  activeMenuId,
  onToggleMenu,
  onToggleExpand,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[evidence.character]}`}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          {evidence.character === "positive" ? (
            <svg className={`${styles.icon} ${styles.up}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          ) : (
            <svg className={`${styles.icon} ${styles.down}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          )}
          <h3 className={styles.cardTitle}>{evidence.title}</h3>
        </div>
        <div className={styles.headerRight}>
          {evidence.score > 0 && (
            <span className={`${styles.score} ${styles[evidence.character]}`}>
              {evidence.score}
            </span>
          )}
          <div className={styles.menuWrapper} data-menu-wrapper>
            <button
              className={styles.btnIcon}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(evidence.id);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#929faf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {activeMenuId === evidence.id && (
              <div className={styles.menuPopup}>
                <button
                  className={styles.menuItem}
                  onClick={() => onEdit(evidence)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {editLabel}
                </button>
                <button
                  className={`${styles.menuItem} ${styles.menuItemDelete}`}
                  onClick={() => onDelete(evidence.id, evidence.title)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {deleteLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {evidence.snippet && (
        <div className={styles.cardBody}>
          <div
            className={`${styles.snippet} ${styles[evidence.character]} ${evidence.isExpanded ? styles.isExpanded : ""}`}
          >
            {evidence.snippet}
          </div>
          <button
            className={styles.btnExpand}
            onClick={() => onToggleExpand(evidence.id)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0abb9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: evidence.isExpanded ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}

      {evidence.interviewTitle && (
        <div className={styles.cardFooter}>
          <Link
            href={evidence.interviewUrl}
            className={styles.evidenceLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {evidence.interviewTitle}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

