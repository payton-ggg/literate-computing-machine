"use client";

import type { NewIdeaForm, FolderOption, IdeaFormType } from "../../types/ideas.types";
import styles from "./NewIdeaDrawer.module.css";

interface NewIdeaDrawerProps {
  isOpen: boolean;
  isSaving: boolean;
  isTemplateHintVisible: boolean;
  setIsTemplateHintVisible: (visible: boolean) => void;
  form: NewIdeaForm;
  updateField: <K extends keyof NewIdeaForm>(field: K, value: NewIdeaForm[K]) => void;
  onClose: () => void;
  onSave: () => void;
  onGoToLibrary: () => void;
  folders: FolderOption[];
  t: (key: string, values?: Record<string, any>) => string;
}

export default function NewIdeaDrawer({
  isOpen,
  isSaving,
  isTemplateHintVisible,
  setIsTemplateHintVisible,
  form,
  updateField,
  onClose,
  onSave,
  onGoToLibrary,
  folders,
  t,
}: NewIdeaDrawerProps) {
  if (!isOpen) return null;

  const renderHypothesisFields = () => (
    <>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.segment")}</label>
        <input
          className={styles.input}
          value={form.segment}
          onChange={(e) => updateField("segment", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.segment")}
        />
      </div>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.problem")}</label>
        <textarea
          className={styles.textarea}
          value={form.problem}
          onChange={(e) => updateField("problem", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.problem")}
        />
      </div>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.solution")}</label>
        <textarea
          className={styles.textarea}
          value={form.solution}
          onChange={(e) => updateField("solution", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.solution")}
        />
      </div>
    </>
  );

  const renderJtbdFields = () => (
    <>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.jtbdWhen")}</label>
        <textarea
          className={styles.textarea}
          value={form.jtbdContext}
          onChange={(e) => updateField("jtbdContext", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.jtbdWhen")}
        />
      </div>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.jtbdWant")}</label>
        <textarea
          className={styles.textarea}
          value={form.jtbdAction}
          onChange={(e) => updateField("jtbdAction", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.jtbdWant")}
        />
      </div>
      <div className={styles.formSection}>
        <label className={styles.formLabel}>{t("ideasPage.drawer.fields.jtbdResult")}</label>
        <textarea
          className={styles.textarea}
          value={form.jtbdResult}
          onChange={(e) => updateField("jtbdResult", e.target.value)}
          placeholder={t("ideasPage.drawer.placeholders.jtbdResult")}
        />
      </div>
    </>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("ideasPage.drawer.title")}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.typeToggle}>
            <button
              className={`${styles.typeBtn} ${form.type === "hypothesis" ? styles.active : ""}`}
              onClick={() => updateField("type", "hypothesis")}
            >
              {t("ideasPage.drawer.types.hypothesis")}
            </button>
            <button
              className={`${styles.typeBtn} ${form.type === "jtbd" ? styles.active : ""}`}
              onClick={() => updateField("type", "jtbd")}
            >
              {t("ideasPage.drawer.types.jtbd")}
            </button>
            <button
              className={`${styles.typeBtn} ${form.type === "manual" ? styles.active : ""}`}
              onClick={() => updateField("type", "manual")}
            >
              {t("ideasPage.drawer.types.manual")}
            </button>
            <button className={styles.libraryLink} onClick={onGoToLibrary} title={t("ideasPage.drawer.goToLibrary")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20V4H6.5C5.83696 4 5.20107 4.26339 4.73223 4.73223C4.26339 5.20107 4 5.83696 4 6.5V19.5ZM4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.fields.name")}</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("ideasPage.drawer.placeholders.name")}
              autoFocus
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.fields.folder")}</label>
            <select
              className={styles.input}
              value={form.folder}
              onChange={(e) => updateField("folder", e.target.value)}
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.templateHeader}>
            <h3 className={styles.templateTitle}>{t("ideasPage.drawer.templateTitle")}</h3>
            <span className={styles.infoIconWrapper} onClick={() => setIsTemplateHintVisible(!isTemplateHintVisible)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {isTemplateHintVisible && (
            <div className={styles.hintBox}>
              <p className={styles.hintText}>{t(`ideasPage.drawer.hints.${form.type}Line1`)}</p>
              <p className={styles.hintText}>{t(`ideasPage.drawer.hints.${form.type}Line2`)}</p>
            </div>
          )}

          {form.type === "hypothesis" && renderHypothesisFields()}
          {form.type === "jtbd" && renderJtbdFields()}

          {form.type === "manual" && (
            <div className={styles.formSection}>
              <label className={styles.formLabel}>{t("ideasPage.drawer.fields.description")}</label>
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder={t("ideasPage.drawer.placeholders.description")}
              />
            </div>
          )}

          <div className={styles.aiBox}>
            <div className={styles.aiIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className={styles.aiText}>{t("ideasPage.drawer.aiAssessment")}</div>
          </div>

          <div className={styles.splitInputs}>
            <div className={`${styles.formSection} ${styles.splitItem}`}>
              <label className={styles.formLabel}>{t("ideasPage.drawer.fields.pain")}</label>
              <select
                className={styles.input}
                value={form.pain}
                onChange={(e) => updateField("pain", Number(e.target.value))}
              >
                <option value={0}>{t("ideasPage.drawer.fields.notSet")}</option>
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.formSection} ${styles.splitItem}`}>
              <label className={styles.formLabel}>{t("ideasPage.drawer.fields.priority")}</label>
              <select
                className={styles.input}
                value={form.priority}
                onChange={(e) => updateField("priority", Number(e.target.value))}
              >
                <option value={0}>{t("ideasPage.drawer.fields.notSet")}</option>
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={isSaving || !form.name}>
            {isSaving ? t("common.saving") : t("ideasPage.drawer.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

