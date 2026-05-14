"use client";

import { EditNodeForm } from "@/modules/research/types/jobTree.types";
import styles from "./EditJobModal.module.css";

interface EditJobModalProps {
  isOpen: boolean;
  form: EditNodeForm;
  isSaving: boolean;
  onFormChange: (form: EditNodeForm) => void;
  onSave: () => void;
  onClose: () => void;
  t: (key: string) => string;
}

export default function EditJobModal({
  isOpen,
  form,
  isSaving,
  onFormChange,
  onSave,
  onClose,
  t,
}: EditJobModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {t("jtbd.editModal.title") || "Edit Job"}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t("jtbd.editModal.name") || "Name"}
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            />
          </div>

          {form.level === "core" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t("jtbd.whenTrigger")}
                </label>
                <textarea
                  className={styles.formTextarea}
                  value={form.when_trigger}
                  onChange={(e) =>
                    onFormChange({ ...form, when_trigger: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("jtbd.iWantTo")}</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.i_want_to}
                  onChange={(e) =>
                    onFormChange({ ...form, i_want_to: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("jtbd.soThat")}</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.so_that}
                  onChange={(e) =>
                    onFormChange({ ...form, so_that: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t("jtbd.currentSolution")}
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.current_solution}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      current_solution: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          {form.level === "micro" && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t("jtbd.context") || "Context"}
              </label>
              <textarea
                className={`${styles.formTextarea} ${styles.formTextareaLarge}`}
                value={form.context}
                onChange={(e) =>
                  onFormChange({ ...form, context: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className={styles.btnPrimary}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving && <span className={styles.spinnerSmall} />}
            {isSaving ? t("common.saving") || "Saving..." : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
