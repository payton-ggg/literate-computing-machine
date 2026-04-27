"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { interviewApi, folderApi } from "@/modules/research/api/interviews.api";
import type { Folder } from "@/modules/research/types/interview.types";
import styles from "./CreateFolderDialog.module.css";

interface CreateCardDialogProps {
  isOpen: boolean;
  folderId?: string | null;
  folders: Folder[];
  onClose: () => void;
  onCreated: (interview: { id: string }) => void;
}

export default function CreateCardDialog({
  isOpen,
  folderId,
  folders,
  onClose,
  onCreated,
}: CreateCardDialogProps) {
  const t = useTranslations();
  const locale = useLocale();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    folderId ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(locale || "ru");
  const [isDragover, setIsDragover] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canCreate = title.trim().length > 0 && selectedFolderId !== null;

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(folderId ?? null);
      setSelectedLanguage(locale || "ru");
    }
  }, [isOpen, folderId, locale]);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setIsDragover(false);
      setErrorMessage("");
      setIsCreating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragover(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canCreate || isCreating) return;

    setIsCreating(true);
    setErrorMessage("");

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        folder_id: selectedFolderId,
        language: selectedLanguage,
      };

      const res = await interviewApi.createEmpty(payload);
      const interview = res.data;

      if (selectedFile) {
        // Background upload — fire and forget
        const fd = new FormData();
        fd.append("files", selectedFile);
        fd.append("language", selectedLanguage);
        interviewApi.attachAudio(interview.id, fd).catch((err) => {
          console.error("Background upload failed:", err);
        });
      }

      onCreated(interview);
      handleClose();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { code?: string; message?: string; error?: string };
        };
      };
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      if (status === 400 && code === "VALIDATION_ERROR") {
        setErrorMessage(t("dialogs.createCard.titleTooLong"));
      } else {
        const msg =
          err?.response?.data?.message || err?.response?.data?.error || "";
        setErrorMessage(`${t("dialogs.createCard.failed")}: ${msg}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.heading}>{t("dialogs.createCard.title")}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M12 3L3 12M3 3l9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>
              <span className={styles.requiredStar}>*</span>{" "}
              {t("dialogs.createCard.titleLabel")}
            </label>
            <input
              type="text"
              className={styles.textInput}
              placeholder={t("dialogs.createCard.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("dialogs.createCard.descriptionLabel")}</label>
            <input
              type="text"
              className={styles.textInput}
              placeholder={t("dialogs.createCard.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("card.upload.uploadFile")}</label>
            <div
              style={{
                border: `1px solid var(--border)`,
                borderRadius: 8,
                padding: selectedFile ? "16px 20px" : "28px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: "var(--bg-alt)",
                transition: "border-color 0.18s",
                minHeight: selectedFile ? "auto" : 140,
                borderColor: isDragover ? "var(--accent)" : undefined,
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragover(true);
              }}
              onDragLeave={() => setIsDragover(false)}
              onDrop={handleFileDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.m4a,.mp3,.wav,.ogg,.webm,.mp4,.txt,.md,.pdf"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="#14b053"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "var(--fg)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M10 4L4 10M4 4l6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--fg)" }}>
                    {t("card.upload.dropFiles")}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>
                    {t("card.upload.orBrowse")}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    {t("card.upload.maxSize")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t("card.upload.language")}</label>
            <select
              className={styles.textInput}
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="ru">{t("card.upload.russian")}</option>
              <option value="en">{t("card.upload.english")}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              <span className={styles.requiredStar}>*</span>{" "}
              {t("card.upload.addToFolder")}
            </label>
            <select
              className={styles.textInput}
              value={selectedFolderId ?? ""}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              required
              style={{ cursor: "pointer" }}
            >
              <option value="" disabled>
                {t("dialogs.assignFolder.placeholder")}
              </option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </form>

        <div className={styles.footer}>
          <button
            className={styles.btnPrimary}
            onClick={() => handleSubmit()}
            disabled={!canCreate || isCreating}
          >
            {isCreating
              ? t("dialogs.createCard.creating")
              : t("dialogs.createCard.create")}
          </button>
          <button className={styles.btnGhost} onClick={handleClose}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
