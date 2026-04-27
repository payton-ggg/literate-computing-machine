"use client";

import { useState } from "react";
import type { FolderOption } from "../../types/ideas.types";
import styles from "./ChangeFolderModal.module.css";

interface ChangeFolderModalProps {
  isOpen: boolean;
  folders: FolderOption[];
  onClose: () => void;
  onConfirm: (folderId: string) => void;
  t: (key: string, values?: Record<string, any>) => string;
}

export default function ChangeFolderModal({
  isOpen,
  folders,
  onClose,
  onConfirm,
  t,
}: ChangeFolderModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState("");

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t("ideasPage.selection.changeFolderTitle")}</h2>

        <label className={styles.label}>{t("ideasPage.selection.targetFolder")}</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
          >
            <option value="" disabled>
              {t("ideasPage.selection.selectFolder")}
            </option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => onConfirm(selectedFolderId)}
            disabled={!selectedFolderId}
          >
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

