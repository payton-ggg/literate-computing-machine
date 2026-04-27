"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import styles from "./LogoutModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function useFadeMount(isOpen: boolean, duration = 180) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // double-RAF ensures element is in DOM before transition starts
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), duration);
      return () => clearTimeout(t);
    }
  }, [isOpen, duration]);

  return { mounted, visible };
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: Props) {
  const t = useTranslations();
  const { mounted, visible } = useFadeMount(isOpen);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [isOpen, handleKey]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.logoutOverlay} ${visible ? styles.visible : ""}`}
      onClick={onClose}
    >
      <div
        className={`${styles.logoutModal} ${visible ? styles.visible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.logoutModalHeader}>
          <span className={styles.logoutModalTitle}>
            {t("modals.logout.title")}
          </span>
          <button className={styles.logoutModalClose} onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 4L4 12M4 4L12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.logoutModalBody}>{t("modals.logout.text")}</div>
        <div className={styles.logoutModalFooter}>
          <button className={styles.logoutBtnCancel} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button className={styles.logoutBtnConfirm} onClick={onConfirm}>
            {t("modals.logout.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
