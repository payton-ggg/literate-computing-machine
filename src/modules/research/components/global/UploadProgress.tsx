"use client";

import { useTranslations } from "next-intl";
import styles from "./UploadProgress.module.css";

interface UploadProgressProps {
  step?: "uploading" | "processing" | "transcribing" | "done" | string;
  progress?: number;
}

export default function UploadProgress({
  step = "uploading",
  progress = 0,
}: UploadProgressProps) {
  const t = useTranslations();

  const steps = [
    { id: "uploading", label: t("card.progress.steps.upload") },
    { id: "processing", label: t("card.progress.steps.process") },
    { id: "transcribing", label: t("card.progress.steps.transcribe") },
  ];

  const currentStepIndex =
    step === "done" ? steps.length : steps.findIndex((s) => s.id === step);

  const isIndeterminate = step === "processing" || step === "transcribing";

  const displayProgress =
    step === "done" ? 100 : Math.min(Math.max(progress, 0), 100);

  const statusTitle = () => {
    switch (step) {
      case "uploading":
        return t("card.progress.uploading");
      case "processing":
        return t("card.progress.processing");
      case "transcribing":
        return t("card.progress.transcribing");
      case "done":
        return t("card.progress.complete");
      default:
        return t("card.progress.processing");
    }
  };

  const getStepClass = (index: number) => {
    if (currentStepIndex > index) return styles.completed;
    if (currentStepIndex === index) return styles.active;
    return styles.pending;
  };

  return (
    <div className={styles.uploadProgress}>
      <div className={styles.progressHeader}>
        <div className={`${styles.statusIndicator} ${styles[`step-${step}`] || ""}`}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>{statusTitle()}</span>
        </div>
        {!isIndeterminate && (
          <span className={styles.progressPercent}>{displayProgress}%</span>
        )}
      </div>

      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${isIndeterminate ? styles.indeterminate : ""}`}
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>

      <div className={styles.steps}>
        {steps.map((s, index) => (
          <div key={s.id} className={`${styles.step} ${getStepClass(index)}`}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
