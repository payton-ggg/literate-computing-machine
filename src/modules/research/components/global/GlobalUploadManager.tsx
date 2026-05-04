"use client";

import { useEffect } from "react";
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
      return (
        !name.endsWith(".txt") &&
        !name.endsWith(".md") &&
        !name.endsWith(".pdf")
      );
    };

    const uploadViaFormDataFn = async () => {
      const formData = new FormData();
      files.forEach((f: File) => formData.append("files", f));
      formData.append("language", language);
      await interviewApi.attachAudio(interviewId, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            updateTask(interviewId, {
              progress: Math.round((e.loaded / e.total) * 100),
            });
          }
        },
      });
    };

    const uploadFilesDirectlyFn = async () => {
      const totalBytes = files.reduce(
        (sum: number, f: File) => sum + (f.size || 0),
        0,
      );
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
          urlRes.data.headers || {
            "Content-Type": file.type || "application/octet-stream",
          },
          (e) => {
            const currentLoaded = e.loaded || 0;
            uploadedBytes += currentLoaded - prevLoaded;
            prevLoaded = currentLoaded;
            if (totalBytes > 0) {
              updateTask(interviewId, {
                progress: Math.min(
                  99,
                  Math.round((uploadedBytes / totalBytes) * 100),
                ),
              });
            }
          },
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

      // Poll the backend until the status is "ready" or "failed"
      const pollInterval = setInterval(async () => {
        try {
          const res = await interviewApi.get(interviewId);
          const status = res.data.status;

          if (
            ![
              "uploading",
              "converting",
              "analyzing",
              "processing",
              "proccesing",
            ].includes(status)
          ) {
            clearInterval(pollInterval);

            if (status === "ready") {
              updateTask(interviewId, { step: "done", progress: 100 });
              // Leave it on screen for 5 seconds to show it's done, then remove
              setTimeout(() => removeTask(interviewId), 5000);
            } else if (status === "failed") {
              updateTask(interviewId, {
                step: "error",
                error:
                  res.data.processing_error ||
                  t("card.upload.processingFailed"),
              });
              setTimeout(() => removeTask(interviewId), 10000);
            } else {
              // some other status like empty (deleted)
              removeTask(interviewId);
            }
          }
        } catch (err) {
          // Silently ignore polling errors so it keeps trying
        }
      }, 5000);
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.error || error.response?.data?.message;
      const msg = backendMsg
        ? `${t("card.upload.uploadFailed")}: ${backendMsg}`
        : t("card.upload.uploadFailed");
      updateTask(interviewId, { error: msg, step: "error" });

      setTimeout(() => {
        removeTask(interviewId);
      }, 10000);
    }
  };

  const activeTasks = Object.values(tasks);
  if (activeTasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-w-[360px] w-full">
      {activeTasks.map((task) => (
        <div
          key={task.id}
          className="bg-(--bg-card) rounded-lg p-4 shadow-md flex flex-col gap-2"
        >
          <div className="flex justify-between items-center gap-2">
            <span className="text-[13px] font-semibold text-(--fg) overflow-hidden truncate whitespace-nowrap flex-1">
              {task.fileName}
            </span>
            <button
              onClick={() => removeTask(task.id)}
              className="bg-transparent border-none cursor-pointer text-(--muted) p-1 shrink-0"
            >
              ✕
            </button>
          </div>

          {task.error ? (
            <div className="text-[13px] text-(--danger)">{task.error}</div>
          ) : (
            <UploadProgress step={task.step} progress={task.progress} />
          )}
        </div>
      ))}
    </div>
  );
}
