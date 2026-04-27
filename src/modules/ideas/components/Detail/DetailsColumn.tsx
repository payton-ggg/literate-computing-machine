"use client";

import { useTranslations } from "next-intl";
import type { IdeaDetail, IdeaDetailFormData, FolderOption } from "../../types/ideas.types";
import styles from "./DetailsColumn.module.css";

interface Props {
  idea: IdeaDetail;
  formData: IdeaDetailFormData;
  folderSelectOptions: FolderOption[];
  onFieldChange: (field: keyof IdeaDetailFormData, value: string | number) => void;
}

export default function DetailsColumn({
  idea,
  formData,
  folderSelectOptions,
  onFieldChange,
}: Props) {
  const t = useTranslations();

  return (
    <div className={styles.column}>
      <h2 className={styles.sectionTitle}>{t("ideaDetail.details.title")}</h2>

      {/* Folder select */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{t("ideasPage.filters.folder")}</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.formSelect}
            value={formData.folderId}
            onChange={(e) => onFieldChange("folderId", e.target.value)}
          >
            <option value="" disabled>{t("ideaDetail.details.folderPlaceholder")}</option>
            {folderSelectOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#6a7c92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Manual fields */}
      {idea.typeCode === "manual" && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t("ideaDetail.details.expectedEffect")}</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.evidenceSignal}
            onChange={(e) => onFieldChange("evidenceSignal", e.target.value)}
            placeholder={t("ideaDetail.details.expectedEffectPlaceholder")}
          />
        </div>
      )}

      {/* Hypothesis fields */}
      {idea.typeCode === "hypothesis" && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.segment")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.segment}
              onChange={(e) => onFieldChange("segment", e.target.value)}
              placeholder={t("ideasPage.drawer.segmentPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.problem")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.problem}
              onChange={(e) => onFieldChange("problem", e.target.value)}
              placeholder={t("ideasPage.drawer.problemPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.solution")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.solution}
              onChange={(e) => onFieldChange("solution", e.target.value)}
              placeholder={t("ideasPage.drawer.solutionPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("ideasPage.drawer.evidenceSignal")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.evidenceSignal}
              onChange={(e) => onFieldChange("evidenceSignal", e.target.value)}
              placeholder={t("ideasPage.drawer.evidenceSignalPlaceholder")}
            />
          </div>
        </>
      )}

      {/* JTBD fields */}
      {idea.typeCode === "jtbd" && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("jtbd.transferModal.when")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.jtbd_when}
              onChange={(e) => onFieldChange("jtbd_when", e.target.value)}
              placeholder={t("jtbd.transferModal.whenPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("jtbd.transferModal.want")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.jtbd_want}
              onChange={(e) => onFieldChange("jtbd_want", e.target.value)}
              placeholder={t("jtbd.transferModal.wantPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("jtbd.transferModal.soThat")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.jtbd_so_that}
              onChange={(e) => onFieldChange("jtbd_so_that", e.target.value)}
              placeholder={t("jtbd.transferModal.soThatPlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("jtbd.transferModal.solution")}</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.jtbd_solution}
              onChange={(e) => onFieldChange("jtbd_solution", e.target.value)}
              placeholder={t("jtbd.transferModal.solutionPlaceholder")}
            />
          </div>
        </>
      )}

      {/* Common assessment fields */}
      <div className={styles.formGroup} style={{ marginTop: 16 }}>
        <label className={styles.formLabel}>{t("ideasPage.columns.pain")}</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.formSelect}
            value={formData.pain}
            onChange={(e) => onFieldChange("pain", Number(e.target.value))}
          >
            <option value={0} disabled>{t("ideasPage.drawer.painPlaceholder")}</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#6a7c92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{t("ideasPage.columns.priority")}</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.formSelect}
            value={formData.priority}
            onChange={(e) => onFieldChange("priority", Number(e.target.value))}
          >
            <option value={0} disabled>{t("ideasPage.drawer.priorityPlaceholder")}</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#6a7c92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
        <label className={styles.formLabel}>{t("ideasPage.columns.confidence")} (%)</label>
        <input
          type="number"
          className={styles.formInput}
          value={formData.confidence}
          onChange={(e) => onFieldChange("confidence", Number(e.target.value))}
          min={0}
          max={100}
          placeholder="0%"
        />
      </div>
    </div>
  );
}

