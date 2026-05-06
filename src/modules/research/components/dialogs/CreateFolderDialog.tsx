"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import styles from "./CreateFolderDialog.module.css";
import { folderApi } from "../../api/interviews.api";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (folder: { id: string; name: string }) => void;
}

export default function CreateFolderDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateFolderDialogProps) {
  const t = useTranslations();
  useLockBodyScroll(isOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0;

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setErrorMessage("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };
      const res = await folderApi.create(payload);
      const folder = res.data;
      onCreated(folder);
      handleClose();
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { code?: string } };
      };
      if (!err.response) {
        setErrorMessage(t("dialogs.createFolder.networkError"));
      } else {
        const status = err.response.status;
        const code = err.response.data?.code || "";
        if (
          (status === 400 && code === "INVALID_REQUEST") ||
          (status === 409 && code === "FOLDER_EXISTS")
        ) {
          setErrorMessage(t("dialogs.createFolder.validationError"));
        } else {
          setErrorMessage(t("dialogs.createFolder.failed"));
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.heading}>{t("dialogs.createFolder.title")}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M11 1L1 11M1 1l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>
              <span className={styles.requiredStar}>*</span>{" "}
              {t("dialogs.createFolder.nameLabel")}
            </label>
            <input
              type="text"
              className={styles.textInput}
              placeholder={t("dialogs.createFolder.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("dialogs.createFolder.descriptionLabel")}</label>
            <textarea
              className={styles.textarea}
              placeholder={t("dialogs.createFolder.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </form>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={handleClose}>
            {t("common.cancel")}
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => handleSubmit()}
            disabled={!canSubmit || submitting}
          >
            {submitting
              ? t("dialogs.createFolder.creating")
              : t("dialogs.createFolder.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
