"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useTranslations } from "next-intl";
import styles from "./UploadArea.module.css";
import LanguageDropdown from "../../global/LanguageDropdown";
import { interviewApi } from "@/modules/research/api/interviews.api";

interface UploadAreaProps {
  interviewId: string;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: () => void;
  onLowBalance: (req: number, avail: number) => void;
  onError: (msg: string) => void;
}

export interface UploadAreaHandle {
  autoUpload: (files: File[], language: string) => Promise<void>;
}

const UploadArea = forwardRef<UploadAreaHandle, UploadAreaProps>(({
  interviewId,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onLowBalance,
  onError,
}, ref) => {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadLanguage, setUploadLanguage] = useState("en");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const processSelectedFiles = (files: File[]) => {
    setUploadError("");
    const validExtensions = [
      ".aac", ".ogg", ".opus", ".mp3", ".mp4", ".wav", ".webm",
      ".m4a", ".mov", ".mkv", ".txt", ".md", ".pdf",
    ];
    const validMimePrefixes = ["audio/", "video/"];
    const validMimeExact = new Set([
      "application/ogg",
      "application/pdf",
      "text/plain",
      "text/markdown",
    ]);

    for (const file of files) {
      const lower = file.name.toLowerCase();
      const dot = lower.lastIndexOf(".");
      const ext = dot >= 0 ? lower.slice(dot) : "";
      const mime = (file.type || "").toLowerCase();
      const extOk = ext !== "" && validExtensions.includes(ext);
      const mimeOk =
        mime !== "" &&
        (validMimeExact.has(mime) ||
          validMimePrefixes.some((prefix) => mime.startsWith(prefix)));
      
      if (!extOk && !mimeOk) {
        setUploadError(t("card.upload.invalidFormat", { name: file.name }));
        return;
      }
      if (file.size > 3 * 1024 * 1024 * 1024) {
        setUploadError(t("card.upload.fileTooLarge", { name: file.name }));
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return gb.toFixed(2) + " GB";
    if (mb >= 1) return mb.toFixed(2) + " MB";
    if (kb >= 1) return kb.toFixed(2) + " KB";
    return bytes + " B";
  };

  const supportsDirectUpload = (file: File) => {
    const name = (file.name || "").toLowerCase();
    return !name.endsWith(".txt") && !name.endsWith(".md") && !name.endsWith(".pdf");
  };

  const executeUpload = async (files: File[], language: string) => {
    if (files.length === 0) return;
    onUploadStart();

    const uploadViaFormDataFn = async () => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("language", language);
      await interviewApi.attachAudio(interviewId, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            onUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });
    };

    const uploadFilesDirectlyFn = async () => {
      const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
      let uploadedBytes = 0;
      const confirmedFiles = [];

      for (const file of files) {
        const urlRes = await interviewApi.requestUploadUrl(interviewId, {
          filename: file.name,
          size_bytes: file.size,
          content_type: file.type || "application/octet-stream",
        });

        if (!urlRes.data?.direct || !urlRes.data?.upload_url) {
          return uploadViaFormDataFn();
        }

        let prevLoaded = 0;
        await interviewApi.uploadToSignedUrl(
          urlRes.data.upload_url,
          file,
          urlRes.data.headers || { "Content-Type": file.type || "application/octet-stream" },
          (e) => {
            const currentLoaded = e.loaded || 0;
            uploadedBytes += currentLoaded - prevLoaded;
            prevLoaded = currentLoaded;
            if (totalBytes > 0) {
              onUploadProgress(Math.min(99, Math.round((uploadedBytes / totalBytes) * 100)));
            }
          }
        );

        uploadedBytes += (file.size || 0) - prevLoaded;
        confirmedFiles.push({
          filename: file.name,
          object_key: urlRes.data.object_key,
          size_bytes: file.size,
          content_type: file.type || "application/octet-stream",
        });
      }

      await interviewApi.confirmUpload(interviewId, {
        language: language,
        files: confirmedFiles,
      });
    };

    try {
      const canUseDirect = files.every(supportsDirectUpload);
      if (canUseDirect) {
        await uploadFilesDirectlyFn();
      } else {
        await uploadViaFormDataFn();
      }
      onUploadProgress(100);
      clearFiles();
      onUploadComplete();
    } catch (error: any) {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      if (status === 402 && code === "INSUFFICIENT_BALANCE") {
        onLowBalance(
          Number(error.response.data?.required_seconds) || 0,
          Number(error.response.data?.available_seconds) || 0
        );
      } else {
        onError(t("card.upload.uploadFailed"));
      }
    }
  };

  const startUpload = () => executeUpload(selectedFiles, uploadLanguage);

  useImperativeHandle(ref, () => ({
    autoUpload: async (files: File[], language: string) => {
      setSelectedFiles(files);
      setUploadLanguage(language);
      await executeUpload(files, language);
    }
  }));

  return (
    <div className={styles.uploadArea}>
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        <div className={styles.dropZoneContent}>
          <div className={styles.uploadIcon}>🎬 🔊 📄</div>
          <p className={styles.uploadTitle}>{t("card.upload.dropFiles")}</p>
          <p className={styles.uploadSubtitle}>{t("card.upload.orBrowse")}</p>
          <p className={styles.uploadFormats}>{t("card.upload.formats")}</p>
          <p className={styles.uploadFormats}>{t("card.upload.maxSize")}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".aac,.ogg,.opus,.mp3,.mp4,.wav,.webm,.m4a,.mov,.mkv,.txt,.md,.pdf,audio/*,video/*"
            onChange={onFileSelect}
            className={styles.fileInput}
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className={styles.selectedFiles}>
          <div className={styles.filesHeader}>
            <span>{t("card.upload.filesSelected", { count: selectedFiles.length })}</span>
            <button onClick={clearFiles} className={styles.btnClear}>
              {t("common.clear")}
            </button>
          </div>
          <div className={styles.filesList}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className={styles.fileItem}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                <button onClick={() => removeFile(idx)} className={styles.btnRemove}>✕</button>
              </div>
            ))}
          </div>
          <div className={styles.languageSelect}>
            <label>{t("card.upload.language")}:</label>
            <LanguageDropdown
              value={uploadLanguage}
              onChange={setUploadLanguage}
              popularLabel={t("card.upload.popularLanguages")}
              otherLabel={t("card.upload.otherLanguages")}
            />
          </div>
          <button onClick={startUpload} className={styles.btnStartUpload}>
            {t("card.upload.startProcessing")}
          </button>
        </div>
      )}

      {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
    </div>
  );
});

export default UploadArea;
