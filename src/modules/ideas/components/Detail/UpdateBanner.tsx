"use client";

import styles from "./UpdateBanner.module.css";

interface Props {
  visible: boolean;
  isEvaluating: boolean;
  saveLabel: string;
  savingLabel: string;
  onSave: () => void;
  onHide: () => void;
}

export default function UpdateBanner({
  visible,
  isEvaluating,
  saveLabel,
  savingLabel,
  onSave,
  onHide,
}: Props) {
  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6941C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <span className={styles.text}>У вас есть несохраненные изменения</span>
      </div>
      <div className={styles.right}>
        <button
          className={styles.btnRefresh}
          onClick={onSave}
          disabled={isEvaluating}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {isEvaluating ? savingLabel : saveLabel}
        </button>
        <button className={styles.btnHide} onClick={onHide}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#929faf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </div>
    </div>
  );
}

