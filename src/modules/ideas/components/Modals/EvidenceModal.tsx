"use client";

import { useTranslations } from "next-intl";
import type { EvidenceFormData } from "../../types/ideas.types";
import styles from "./EvidenceModal.module.css";

interface Props {
  isOpen: boolean;
  editingId: string | number | null;
  form: EvidenceFormData;
  setForm: (form: EvidenceFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EvidenceModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSave,
}: Props) {
  const t = useTranslations();

  if (!isOpen) return null;

  const handleUpdate = (field: keyof EvidenceFormData, value: any) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>
            {editingId
              ? t("ideaDetail.modal.editTitle")
              : t("ideaDetail.modal.addTitle")}
          </h3>
          <button className={styles.btnClose} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a7c92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.formGroup} ${styles.rowGroup}`}>
            <label className={`${styles.formLabel} ${styles.required}`}>
              {t("ideaDetail.modal.character")}
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.customRadio}>
                <input
                  type="radio"
                  name="character"
                  checked={form.character === "positive"}
                  onChange={() => handleUpdate("character", "positive")}
                />
                <span className={styles.radioCircle}></span>
                {t("ideaDetail.evidence.filters.positive")}
              </label>
              <label className={styles.customRadio}>
                <input
                  type="radio"
                  name="character"
                  checked={form.character === "negative"}
                  onChange={() => handleUpdate("character", "negative")}
                />
                <span className={styles.radioCircle}></span>
                {t("ideaDetail.evidence.filters.negative")}
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={`${styles.formLabel} ${styles.required}`}>
              {t("ideaDetail.modal.speaker")}
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={form.title}
              onChange={(e) => handleUpdate("title", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t("ideaDetail.modal.description")}
            </label>
            <textarea
              className={styles.formTextarea}
              value={form.description}
              onChange={(e) => handleUpdate("description", e.target.value)}
              disabled={!!editingId}
            />
            {editingId ? (
              <div className={styles.formHint}>{t("ideaDetail.modal.quoteLocked")}</div>
            ) : (
              <div className={styles.formHint}>{t("ideasPage.drawer.maxLengthHint")}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t("ideaDetail.modal.weight")}
            </label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.formSelect}
                value={form.weight}
                onChange={(e) => handleUpdate("weight", Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#6a7c92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.formHint}>{t("ideaDetail.modal.weightHint")}</div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button className={styles.btnPrimary} onClick={onSave}>
            {editingId ? t("common.save") : t("ideaDetail.actions.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

