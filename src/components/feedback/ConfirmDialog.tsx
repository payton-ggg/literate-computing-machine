"use client";

import { useTranslations } from "next-intl";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  items?: string[];
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger" | "primary" */
  type?: "danger" | "primary";
  hideCancel?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  items,
  warning,
  confirmText,
  cancelText,
  type = "danger",
  hideCancel = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {message && <p className={styles.message}>{message}</p>}

          {items && items.length > 0 && (
            <ul className={styles.itemsList}>
              {items.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          )}

          {warning && (
            <div className={styles.warning}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5.33334V8M8 10.6667H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.3181 14.6667 8Z"
                  stroke="#D92D20"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {warning}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!hideCancel && (
            <button className={styles.btnSecondary} onClick={onClose}>
              {cancelText || t("common.cancel")}
            </button>
          )}
          <button
            className={
              type === "danger" ? styles.btnDanger : styles.btnPrimary
            }
            onClick={onConfirm}
          >
            {confirmText || t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
