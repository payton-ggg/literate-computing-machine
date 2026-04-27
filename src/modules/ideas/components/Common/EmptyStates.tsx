"use client";

import styles from "./EmptyStates.module.css";

interface EmptyStateProps {
  type: "initial" | "error" | "filter";
  onAction?: () => void;
  t: (key: string, values?: Record<string, any>) => string;
}

export default function EmptyStates({ type, onAction, t }: EmptyStateProps) {
  const content = {
    initial: {
      title: t("ideasPage.emptyStates.initial.title"),
      desc: t("ideasPage.emptyStates.initial.desc"),
      btn: t("ideasPage.emptyStates.initial.btn"),
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    error: {
      title: t("ideasPage.emptyStates.error.title"),
      desc: t("ideasPage.emptyStates.error.desc"),
      btn: t("ideasPage.emptyStates.error.btn"),
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="#EF4444"
            strokeWidth="1.5"
          />
          <path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    filter: {
      title: t("ideasPage.emptyStates.filter.title"),
      desc: t("ideasPage.emptyStates.filter.desc"),
      btn: t("ideasPage.emptyStates.filter.btn"),
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  }[type];

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>{content.icon}</div>
      <h3 className={styles.title}>{content.title}</h3>
      <p className={styles.description}>{content.desc}</p>
      {onAction && (
        <button
          className={`${styles.btn} ${type === "error" ? styles.btnSecondary : styles.btnPrimary}`}
          onClick={onAction}
        >
          {content.btn}
        </button>
      )}
    </div>
  );
}

