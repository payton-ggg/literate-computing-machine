"use client";

import React, { useEffect } from "react";
import { useUploadStore } from "../../store/useUploadStore";
import { interviewApi } from "../../api/interviews.api";
import UploadProgress from "./UploadProgress";
import { useTranslations } from "next-intl";

export default function GlobalUploadManager() {
  const t = useTranslations();
  const tasks = useUploadStore((state) => state.tasks);
  const updateTask = useUploadStore((state) => state.updateTask);
  const removeTask = useUploadStore((state) => state.removeTask);

  useEffect(() => {
    Object.values(tasks).forEach((task) => {
      // Start upload if not already uploading and no error
      if (task.step === "uploading" && task.progress === 0 && !task.error) {
        startUpload(task);
      }
    });
  }, [tasks]);

  const startUpload = async (task: any) => {
    const { id: interviewId, files, language } = task;
    if (files.length === 0) return;

    const supportsDirectUpload = (file: File) => {
      const name = (file.name || "").toLowerCase();
      return !name.endsWith(".txt") && !name.endsWith(".md") && !name.endsWith(".pdf");
    };

    const uploadViaFormDataFn = async () => {
      const formData = new FormData();
      files.forEach((f: File) => formData.append("files", f));
      formData.append("language", language);
      await interviewApi.attachAudio(interviewId, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            updateTask(interviewId, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        },
      });
    };

    const uploadFilesDirectlyFn = async () => {
      const totalBytes = files.reduce((sum: number, f: File) => sum + (f.size || 0), 0);
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
              updateTask(interviewId, { progress: Math.min(99, Math.round((uploadedBytes / totalBytes) * 100)) });
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
      updateTask(interviewId, { progress: 1 }); // to avoid restarting
      const canUseDirect = files.every(supportsDirectUpload);
      if (canUseDirect) {
        await uploadFilesDirectlyFn();
      } else {
        await uploadViaFormDataFn();
      }
      
      updateTask(interviewId, { progress: 100, step: "transcribing" });

      // After 5 seconds of transcribing, we can dismiss the global UI 
      // or we just leave it so the user can navigate to the page.
      // Let's remove it after 4 seconds to not pollute the UI forever
      setTimeout(() => {
        removeTask(interviewId);
      }, 4000);

    } catch (error: any) {
      const backendMsg = error.response?.data?.error || error.response?.data?.message;
      const msg = backendMsg ? `${t("card.upload.uploadFailed")}: ${backendMsg}` : t("card.upload.uploadFailed");
      updateTask(interviewId, { error: msg, step: "error" });
      
      // Remove error after 10 seconds
      setTimeout(() => {
        removeTask(interviewId);
      }, 10000);
    }
  };

  const activeTasks = Object.values(tasks);
  if (activeTasks.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 320,
      width: "100%"
    }}>
      {activeTasks.map(task => (
        <div key={task.id} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.fileName}
            </span>
            <button 
              onClick={() => removeTask(task.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}
            >
              ✕
            </button>
          </div>
          
          {task.error ? (
            <div style={{ fontSize: 13, color: "var(--danger)" }}>
              {task.error}
            </div>
          ) : (
            <UploadProgress step={task.step} progress={task.progress} />
          )}
        </div>
      ))}
    </div>
  );
}
