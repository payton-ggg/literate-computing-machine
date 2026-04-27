"use client";

import { useTranslations } from "next-intl";
import type { EvidenceItem } from "../../types/ideas.types";
import EvidenceCard from "./EvidenceCard";
import styles from "./EvidenceColumn.module.css";

interface Props {
  evidences: EvidenceItem[];
  filteredEvidences: EvidenceItem[];
  evidenceFilter: string;
  onFilterChange: (val: string) => void;
  activeMenuId: string | number | null;
  onToggleMenu: (id: string | number) => void;
  onToggleExpand: (id: string | number) => void;
  onEdit: (evidence: EvidenceItem) => void;
  onDelete: (id: string | number, title: string) => void;
}

export default function EvidenceColumn({
  evidences,
  filteredEvidences,
  evidenceFilter,
  onFilterChange,
  activeMenuId,
  onToggleMenu,
  onToggleExpand,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations();

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>
            {t("ideaDetail.evidence.title")}
          </h2>
          <span className={styles.count}>{evidences.length}</span>
        </div>
        <div className={styles.actions}>
          <div className={styles.filterWrapper}>
            <select
              className={styles.filterSelect}
              value={evidenceFilter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">
                {t("ideaDetail.evidence.filters.all")}
              </option>
              <option value="positive">
                {t("ideaDetail.evidence.filters.positive")}
              </option>
              <option value="negative">
                {t("ideaDetail.evidence.filters.negative")}
              </option>
            </select>
            <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#6a7c92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {filteredEvidences.map((evidence) => (
          <EvidenceCard
            key={evidence.id}
            evidence={evidence}
            activeMenuId={activeMenuId}
            onToggleMenu={onToggleMenu}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
          />
        ))}
      </div>
    </div>
  );
}

