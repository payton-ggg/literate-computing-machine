"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./SupportFeedbackDialog.module.css";
// import { supportApi } from "@/modules/research/api/interviews.api"; // API needed here?

interface SupportFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportFeedbackDialog({
  isOpen,
  onClose,
}: SupportFeedbackDialogProps) {
  const t = useTranslations();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      // TODO: implement supportApi.submitFeedback
      // await supportApi.submitFeedback(message);
      // toast.success(t("support.success"));
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Failed to submit feedback", error);
      // toast.error(t("support.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialogCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.heading}>{t("support.title")}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("support.placeholder")}
            rows={6}
          />
        </form>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={handleClose}>
            {t("support.cancel")}
          </button>
          <button
            className={styles.btnSubmit}
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
          >
            {loading ? "..." : t("support.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
