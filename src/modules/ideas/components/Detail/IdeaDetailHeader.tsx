"use client";

import { useTranslations } from "next-intl";
import type { IdeaDetail } from "../../types/ideas.types";
import { getIdeaTypeLabel, getIdeaStatusLabel, getStatusClass } from "../../utils/ideaPresentation";
import styles from "./IdeaDetailHeader.module.css";

interface Props {
  idea: IdeaDetail;
  headerMenuOpen: boolean;
  onToggleHeaderMenu: () => void;
  onOpenEditIdeaModal: () => void;
  onExport: () => void;
}

export default function IdeaDetailHeader({
  idea,
  headerMenuOpen,
  onToggleHeaderMenu,
  onOpenEditIdeaModal,
  onExport,
}: Props) {
  const t = useTranslations();

  const typeLabel = getIdeaTypeLabel(t, idea.typeCode);
  const statusLabel = getIdeaStatusLabel(t, idea.statusCode);
  const statusCls = getStatusClass(idea.statusCode);

  return (
    <div className={styles.headerBlock}>
      <div className={styles.headerMain}>
        <div className={styles.headerLeft}>
          <h1 className={styles.ideaTitle}>{idea.name}</h1>
          <p className={styles.ideaDescription}>{idea.description}</p>

          <div className={styles.ideaMeta}>
            <span className={`${styles.metaTag} ${styles.typeTag}`}>
              {typeLabel}
            </span>
            <span
              className={`${styles.metaTag} ${styles.statusTag} ${statusCls ? styles[statusCls] : ""}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.btnPrimary}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={onExport}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("ideasPage.export")}
          </button>

          <div className={styles.menuPopupWrapper} data-menu-wrapper>
            <button
              type="button"
              className={styles.btnIconOnly}
              onClick={(e) => {
                e.stopPropagation();
                onToggleHeaderMenu();
              }}
              aria-expanded={headerMenuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {headerMenuOpen && (
              <div className={styles.menuPopup}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={onOpenEditIdeaModal}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {t("common.edit")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

