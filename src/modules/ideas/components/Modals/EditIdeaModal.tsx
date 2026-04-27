"use client";

import { useTranslations } from "next-intl";
import type { EditIdeaFormData } from "../../types/ideas.types";
import styles from "./EvidenceModal.module.css"; // Reuse modal styles

interface Props {
  isOpen: boolean;
  isSaving: boolean;
  form: EditIdeaFormData;
  setForm: (form: EditIdeaFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditIdeaModal({
  isOpen,
  isSaving,
  form,
  setForm,
  onClose,
  onSave,
}: Props) {
  const t = useTranslations();

  if (!isOpen) return null;

  const handleUpdate = (field: keyof EditIdeaFormData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>{t("ideaDetail.editIdea.title")}</h3>
          <button type="button" className={styles.btnClose} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a7c92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={`${styles.formLabel} ${styles.required}`}>
              {t("ideaDetail.editIdea.nameLabel")}
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={form.name}
              onChange={(e) => handleUpdate("name", e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t("ideaDetail.editIdea.descriptionLabel")}
            </label>
            <textarea
              className={styles.formTextarea}
              value={form.description}
              onChange={(e) => handleUpdate("description", e.target.value)}
              rows={4}
              placeholder={t("ideaDetail.editIdea.descriptionPlaceholder")}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={onSave}
            disabled={!form.name.trim() || isSaving}
          >
            {isSaving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

