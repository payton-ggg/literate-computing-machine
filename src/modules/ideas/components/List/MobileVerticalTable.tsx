"use client";

import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import type { Idea } from "../../types/ideas.types";
import { getIdeaTypeLabel, getIdeaStatusLabel, getStatusClass } from "../../utils/ideaPresentation";
import styles from "./MobileVerticalTable.module.css";

interface MobileVerticalTableProps {
  table: Table<Idea>;
  onGoToIdea: (id: string) => void;
  t: (key: string, values?: Record<string, any>) => string;
  mobileLayout: "horizontal" | "vertical";
}

export default function MobileVerticalTable({
  table,
  onGoToIdea,
  t,
  mobileLayout,
}: MobileVerticalTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`${styles.verticalTable} ${mobileLayout === "horizontal" ? styles.hideOnMobile : ""}`}>
      {table.getRowModel().rows.map((row) => {
        const isExpanded = expandedIds.has(row.original.id);
        const hasVisibleDescription = row.original.description;

        return (
          <div key={row.original.id} className={styles.card}>
            <div className={styles.cardTop} onClick={() => toggleExpand(row.original.id)}>
              <div className={styles.checkboxArea} onClick={(e) => e.stopPropagation()}>
                <label className={styles.customCheckbox}>
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                  />
                  <span className={styles.checkmark}></span>
                </label>
              </div>

              <div className={styles.contentArea}>
                <div className={styles.titleRow}>
                  <span className={styles.title}>{row.original.name}</span>
                </div>
                <div className={styles.type}>{getIdeaTypeLabel(t, row.original.type)}</div>
                <div className={styles.statusArea}>
                  <span className={`${styles.statusBadge} ${styles[getStatusClass(row.original.status)]}`}>
                    {getIdeaStatusLabel(t, row.original.status)}
                  </span>
                </div>
              </div>

              <div className={styles.chevronArea}>
                <svg
                  className={`${styles.chevron} ${isExpanded ? styles.isExpanded : ""}`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {isExpanded && (
              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t("ideasPage.columns.pain")}</span>
                  <div className={styles.painWrapper}>{row.original.pain} / 10</div>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t("ideasPage.columns.priority")}</span>
                  <div className={styles.detailValue}>{row.original.priority}</div>
                </div>

                <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                  <span className={styles.detailLabel}>{t("ideasPage.columns.confidence")}</span>
                  <div className={styles.confidenceWrapper}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${row.original.confidence}%` }}
                      ></div>
                    </div>
                    <span className={styles.confidenceText}>{row.original.confidence}%</span>
                  </div>
                </div>

                <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                  <span className={styles.detailLabel}>{t("ideasPage.columns.evidence")}</span>
                  <div className={styles.evidenceRow}>
                    <span className={styles.evUp}>
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                        <path
                          d="M4 9.5V1M4 1L1 4M4 1L7 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {row.original.evidenceUp}
                    </span>
                    <span className={styles.evDown}>
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                        <path
                          d="M4 0.5V9M4 9L1 6M4 9L7 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {row.original.evidenceDown}
                    </span>
                  </div>
                </div>

                {row.original.folder && (
                  <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                    <span className={styles.detailLabel}>{t("ideasPage.columns.folder")}</span>
                    <div className={styles.detailValue}>{row.original.folder}</div>
                  </div>
                )}
              </div>
            )}

            {isExpanded && (
              <div className={styles.viewMore}>
                <button className={styles.viewMoreBtn} onClick={() => onGoToIdea(row.original.id)}>
                  {t("common.viewDetails")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

