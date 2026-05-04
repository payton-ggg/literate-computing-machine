import React, { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./InterviewDetailView.module.css";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import { Interview } from "@/modules/research/types/interview.types";
import {
  folderApi,
  interviewApi,
  speakerApi,
} from "@/modules/research/api/interviews.api";

import UploadArea, { UploadAreaHandle } from "./UploadArea";
import UploadProgress from "../../global/UploadProgress";
import TranscriptViewer from "./TranscriptViewer";
import { NotesSection } from "./NotesSection";
import { DownloadsSection } from "./DownloadsSection";
import SupportFeedbackDialog from "../../dialogs/SupportFeedbackDialog";
import LowBalanceDialog from "../../dialogs/LowBalanceDialog";
import AssignFolderDialog from "../../dialogs/AssignFolderDialog";
import { AudioPlayer } from "../../global/AudioPlayer";
import { useUploadStore } from "@/modules/research/store/useUploadStore";

interface InterviewDetailViewProps {
  interview: Interview;
  onUpdate: () => void;
  onUpdateFields: (fields: Partial<Interview>) => Promise<void>;
  onDelete: () => Promise<void>;
  onRetry: () => Promise<void>;
}

export default function InterviewDetailView({
  interview,
  onUpdate,
  onUpdateFields,
  onDelete,
  onRetry,
}: InterviewDetailViewProps) {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [speakerMappings, setSpeakerMappings] = useState<any[]>([]);

  // Load speaker mappings if diarization enabled
  React.useEffect(() => {
    if (interview.diarization_enabled && interview.status === "ready") {
      speakerApi
        .getMappings(interview.id)
        .then((res) => {
          setSpeakerMappings(res.data?.mappings || []);
        })
        .catch(console.error);
    }
  }, [interview.id, interview.diarization_enabled, interview.status]);

  const handleAssignSpeakers = async (payload: {
    speaker_labels: string[];
    assigned_names: string[];
  }) => {
    await speakerApi.assignNames(interview.id, payload);
    const res = await speakerApi.getMappings(interview.id);
    setSpeakerMappings(res.data?.mappings || []);
  };

  // Phase 1 Dialog States
  const [showAssignFolder, setShowAssignFolder] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLowBalance, setShowLowBalance] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [lowBalanceInfo, setLowBalanceInfo] = useState({
    required: 0,
    available: 0,
  });
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false);

  // Phase 2 Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [globalUploadError, setGlobalUploadError] = useState<string | null>(
    null,
  );

  const uploadAreaRef = React.useRef<UploadAreaHandle>(null);
  const globalTask = useUploadStore((s) => s.tasks[interview.id]);

  // Combine local and global upload state
  const currentIsUploading = isUploading || !!globalTask;
  const currentUploadProgress = globalTask
    ? globalTask.progress
    : uploadProgress;

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setGlobalUploadError(null);
  };

  const handleUploadProgress = (prog: number) => {
    setUploadProgress(prog);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    onUpdate(); // trigger refresh
  };

  const handleLowBalance = (req: number, avail: number) => {
    setIsUploading(false);
    setLowBalanceInfo({ required: req, available: avail });
    setShowLowBalance(true);
  };

  const handleUploadError = (msg: string) => {
    setIsUploading(false);
    console.error(msg);
    setGlobalUploadError(msg);
  };

  const openAssignFolder = async () => {
    try {
      if (folders.length === 0) {
        const res = await folderApi.list();
        setFolders(res.data?.folders || []);
      }
      setShowAssignFolder(true);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  };

  const handleFolderAssigned = async (folderId: string | null) => {
    await onUpdateFields({ folder_id: folderId });
  };

  const startEditing = () => {
    setEditData({
      title: interview.title || "",
      description: interview.description || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const saveChanges = async () => {
    await onUpdateFields(editData);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  // Mirrors CardDetail.vue isAudioSource computed
  const isAudioSource = (() => {
    const st = (interview.source_type || "").toLowerCase();
    if (st === "audio") return true;
    if (st === "text" || st === "pdf") return false;
    const path = (
      interview.source_file_path ||
      interview.audio_path ||
      ""
    ).toLowerCase();
    if (!path) return false;
    return (
      path.endsWith(".ogg") ||
      path.endsWith(".opus") ||
      path.endsWith(".mp3") ||
      path.endsWith(".wav")
    );
  })();

  const audioPath = interview.audio_path
    ? `/api/interviews/${interview.id}/download/audio`
    : null;

  // Helpers for downloads
  const sanitizeDownloadBasename = (title: string, fallbackId: string) => {
    const raw = (title ?? "").trim();
    if (!raw) return fallbackId;
    return (
      raw
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 150) || fallbackId
    );
  };

  const formatCreatedAtForFilename = (createdAt: string) => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const downloadAudio = async () => {
    if (!isAudioSource || isDownloadingAudio) return;
    setIsDownloadingAudio(true);
    try {
      const response = await interviewApi.downloadAudio(interview.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const rawPath = (
        interview.source_file_path ||
        interview.audio_path ||
        ""
      ).toString();
      const extensionMatch = rawPath.match(/(\.[a-z0-9]+)$/i);
      const extension = extensionMatch ? extensionMatch[1] : "";

      const base = sanitizeDownloadBasename(interview.title, interview.id);
      const datePart =
        formatCreatedAtForFilename(interview.created_at) || "unknown-date";
      link.setAttribute("download", `${base}_${datePart}_record${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download audio failed:", error);
    } finally {
      setIsDownloadingAudio(false);
    }
  };

  const downloadTranscript = async () => {
    if (!interview.transcript || isDownloadingTranscript) return;
    setIsDownloadingTranscript(true);
    try {
      const response = await interviewApi.downloadTranscript(interview.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const base = sanitizeDownloadBasename(interview.title, interview.id);
      const datePart =
        formatCreatedAtForFilename(interview.created_at) || "unknown-date";
      link.setAttribute("download", `${base}_${datePart}_transcript.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download transcript failed:", error);
    } finally {
      setIsDownloadingTranscript(false);
    }
  };

  const getProgressStep = () => {
    if (currentIsUploading) return "uploading";
    if (interview.status === "converting") return "processing";
    if (["analyzing", "processing", "proccesing"].includes(interview.status)) {
      return "transcribing";
    }
    return interview.status;
  };

  const getStatusClass = () => {
    if (interview.status === "ready") return styles.ready;
    if (interview.status === "failed") return styles.failed;
    return styles.processing;
  };

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className={styles.cardDetail}>
      {/* Mobile Header Row */}
      <div className={styles.mobileHeader}>
        <h2 className={styles.pageTitle}>{interview.title}</h2>
        <div className={styles.mobileHeaderActions}>
          <button
            className={styles.mobileActionBtn}
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.51584 6.51584C8.80356 4.22812 12.5127 4.22812 14.8004 6.51584C16.8767 8.59213 17.0686 11.8392 15.3761 14.1319L18.9427 17.7C19.2858 18.0432 19.2858 18.5995 18.9427 18.9427C18.5995 19.2858 18.0432 19.2858 17.7 18.9427L14.1329 15.3754C11.8401 17.0686 8.59241 16.877 6.51584 14.8004C4.22812 12.5127 4.22812 8.80356 6.51584 6.51584ZM7.75852 7.75852C6.15712 9.35992 6.15712 11.9563 7.75852 13.5577C9.35992 15.1591 11.9563 15.1591 13.5577 13.5577C15.1591 11.9563 15.1591 9.35992 13.5577 7.75852C11.9563 6.15712 9.35992 6.15712 7.75852 7.75852Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className={styles.mobileActionBtn} onClick={openAssignFolder}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.11839 4.11852C4.45021 3.7865 4.90026 3.59998 5.36953 3.59998H8.98356C9.45282 3.59998 9.90287 3.7865 10.2347 4.11852C10.5665 4.45053 10.7529 4.90085 10.7529 5.37039V6.01073H18.621C19.0902 6.01073 19.5403 6.19726 19.8721 6.52928C20.2039 6.86129 20.3903 7.3116 20.3903 7.78115V9.62687H21.0301C21.0302 9.62687 21.03 9.62687 21.0301 9.62687C21.3013 9.62681 21.569 9.6891 21.8123 9.80895C22.0556 9.92882 22.2681 10.1031 22.4334 10.3182C22.5988 10.5334 22.7124 10.7836 22.7657 11.0497C22.8185 11.3138 22.8104 11.5863 22.7421 11.8467L20.9738 19.0852C20.8734 19.4623 20.6512 19.7957 20.3418 20.0335C20.0326 20.2712 19.6535 20.4001 19.2634 20.4C19.2634 20.4 19.2635 20.4 19.2634 20.4H5.52774C5.46765 20.4 5.40974 20.3906 5.35541 20.3732C5.32986 20.3709 5.30431 20.368 5.27878 20.3647C4.81897 20.3043 4.39626 20.0802 4.08802 19.7335C3.77978 19.3868 3.60661 18.9406 3.60021 18.4767L3.6001 18.4688L3.60015 5.37039C3.60015 4.90085 3.78657 4.45053 4.11839 4.11852ZM7.27743 19.2699H19.2634C19.4045 19.27 19.5419 19.2234 19.6538 19.1373C19.7643 19.0523 19.8441 18.9336 19.881 18.7991L21.649 11.562C21.6743 11.4672 21.6775 11.3678 21.6582 11.2716C21.639 11.1753 21.5979 11.0848 21.5381 11.007C21.4783 10.9292 21.4014 10.8662 21.3134 10.8228C21.2254 10.7794 21.1286 10.7569 21.0305 10.7569H9.89027C9.7516 10.7568 9.61599 10.8017 9.50503 10.8849C9.39689 10.966 9.31727 11.0793 9.27743 11.2083L7.39273 18.9545C7.39112 18.9611 7.3894 18.9677 7.38755 18.9742C7.3588 19.0762 7.32189 19.175 7.27743 19.2699ZM19.2609 9.62687V7.78115C19.2609 7.61132 19.1935 7.44844 19.0735 7.32836C18.9535 7.20827 18.7907 7.1408 18.621 7.1408H10.1882C9.87635 7.1408 9.62353 6.88783 9.62353 6.57577V5.37039C9.62353 5.20056 9.5561 5.03769 9.43608 4.9176C9.31607 4.79751 9.15329 4.73004 8.98356 4.73004H5.36953C5.1998 4.73004 5.03702 4.79751 4.917 4.9176C4.79699 5.03769 4.72956 5.20056 4.72956 5.37039V18.4644C4.73301 18.6557 4.80475 18.8394 4.93186 18.9824C5.05972 19.1262 5.23507 19.2192 5.4258 19.2442C5.61654 19.2693 5.80992 19.2248 5.97055 19.1189C6.12872 19.0146 6.24473 18.8576 6.29811 18.6759L8.1835 10.9269C8.18547 10.9188 8.18763 10.9108 8.18995 10.9028C8.29705 10.5344 8.52082 10.2108 8.82759 9.98072C9.13419 9.75074 9.5071 9.62657 9.89027 9.62687H19.2609Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className={styles.mobileSearchRow}>
          <div className={styles.searchWrapper}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M4.11839 4.11852C4.45021 3.7865 4.90026 3.59998 5.36953 3.59998H8.98356C9.45282 3.59998 9.90287 3.7865 10.2347 4.11852C10.5665 4.45053 10.7529 4.90085 10.7529 5.37039V6.01073H18.621C19.0902 6.01073 19.5403 6.19726 19.8721 6.52928C20.2039 6.86129 20.3903 7.3116 20.3903 7.78115V9.62687H21.0301C21.0302 9.62687 21.03 9.62687 21.0301 9.62687C21.3013 9.62681 21.569 9.6891 21.8123 9.80895C22.0556 9.92882 22.2681 10.1031 22.4334 10.3182C22.5988 10.5334 22.7124 10.7836 22.7657 11.0497C22.8185 11.3138 22.8104 11.5863 22.7421 11.8467L20.9738 19.0852C20.8734 19.4623 20.6512 19.7957 20.3418 20.0335C20.0326 20.2712 19.6535 20.4001 19.2634 20.4C19.2634 20.4 19.2635 20.4 19.2634 20.4H5.52774C5.46765 20.4 5.40974 20.3906 5.35541 20.3732C5.32986 20.3709 5.30431 20.368 5.27878 20.3647C4.81897 20.3043 4.39626 20.0802 4.08802 19.7335C3.77978 19.3868 3.60661 18.9406 3.60021 18.4767L3.6001 18.4688L3.60015 5.37039C3.60015 4.90085 3.78657 4.45053 4.11839 4.11852ZM7.27743 19.2699H19.2634C19.4045 19.27 19.5419 19.2234 19.6538 19.1373C19.7643 19.0523 19.8441 18.9336 19.881 18.7991L21.649 11.562C21.6743 11.4672 21.6775 11.3678 21.6582 11.2716C21.639 11.1753 21.5979 11.0848 21.5381 11.007C21.4783 10.9292 21.4014 10.8662 21.3134 10.8228C21.2254 10.7794 21.1286 10.7569 21.0305 10.7569H9.89027C9.7516 10.7568 9.61599 10.8017 9.50503 10.8849C9.39689 10.966 9.31727 11.0793 9.27743 11.2083L7.39273 18.9545C7.39112 18.9611 7.3894 18.9677 7.38755 18.9742C7.3588 19.0762 7.32189 19.175 7.27743 19.2699ZM19.2609 9.62687V7.78115C19.2609 7.61132 19.1935 7.44844 19.0735 7.32836C18.9535 7.20827 18.7907 7.1408 18.621 7.1408H10.1882C9.87635 7.1408 9.62353 6.88783 9.62353 6.57577V5.37039C9.62353 5.20056 9.5561 5.03769 9.43608 4.9176C9.31607 4.79751 9.15329 4.73004 8.98356 4.73004H5.36953C5.1998 4.73004 5.03702 4.79751 4.917 4.9176C4.79699 5.03769 4.72956 5.20056 4.72956 5.37039V18.4644C4.73301 18.6557 4.80475 18.8394 4.93186 18.9824C5.05972 19.1262 5.23507 19.2192 5.4258 19.2442C5.61654 19.2693 5.80992 19.2248 5.97055 19.1189C6.12872 19.0146 6.24473 18.8576 6.29811 18.6759L8.1835 10.9269C8.18547 10.9188 8.18763 10.9108 8.18995 10.9028C8.29705 10.5344 8.52082 10.2108 8.82759 9.98072C9.13419 9.75074 9.5071 9.62657 9.89027 9.62687H19.2609Z"
                fill="currentColor"
              />
            </svg>

            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("interviews.searchInterviewsPlaceholder")}
              autoFocus
            />
          </div>
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <div className={styles.titleInline}>
            {isEditing ? (
              <input
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className={styles.titleInput}
                placeholder={t("dialogs.createCard.titlePlaceholder")}
              />
            ) : (
              <h2 className={styles.title}>{interview.title}</h2>
            )}
          </div>
          <div className={`${styles.statusBadge} ${getStatusClass()}`}>
            {t(`status.${interview.status}`)}
          </div>
        </div>

        <div className={styles.actions}>
          {!isEditing ? (
            <>
              <button onClick={startEditing} className={styles.btnIcon}>
                {t("card.edit")}
              </button>
              <button
                onClick={openAssignFolder}
                className={`${styles.btnIcon} ${styles.btnFolder}`}
                title={
                  interview.folder?.name
                    ? `${t("interviews.folder")}: ${interview.folder.name}`
                    : t("card.assignFolder")
                }
              >
                {interview.folder?.name
                  ? t("card.changeFolder")
                  : t("card.assignFolder")}
              </button>
              {interview.status === "failed" && (
                <button
                  onClick={onRetry}
                  className={`${styles.btnIcon} ${styles.btnRetry}`}
                >
                  {t("card.retry")}
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`${styles.btnIcon} ${styles.btnDelete}`}
              >
                {t("card.delete")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={saveChanges}
                className={`${styles.btnIcon} ${styles.btnSave}`}
              >
                {t("card.save")}
              </button>
              <button
                onClick={cancelEditing}
                className={`${styles.btnIcon} ${styles.btnCancel}`}
              >
                {t("card.cancel")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>{t("card.description")}</h3>
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className={styles.descriptionInput}
            placeholder={t("dialogs.createCard.descriptionPlaceholder")}
          />
        ) : (
          <div className={styles.description}>
            {interview.description || t("card.noDescription")}
          </div>
        )}
      </div>

      {interview.status === "empty" && !currentIsUploading && (
        <div className={styles.section}>
          <UploadArea
            ref={uploadAreaRef}
            interviewId={interview.id}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onLowBalance={handleLowBalance}
            onError={handleUploadError}
          />
          {globalUploadError && (
            <div
              className={styles.uploadError}
              style={{
                marginTop: 12,
                padding: "12px 16px",
                background: "var(--bg-danger-light, rgba(239, 68, 68, 0.1))",
                color: "var(--danger, #ef4444)",
                border:
                  "1px solid var(--border-danger, rgba(239, 68, 68, 0.2))",
                borderRadius: 8,
                fontSize: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {globalUploadError}
            </div>
          )}
        </div>
      )}

      {(currentIsUploading ||
        [
          "uploading",
          "converting",
          "analyzing",
          "processing",
          "proccesing",
        ].includes(interview.status)) && (
        <div className={styles.section}>
          <UploadProgress
            step={globalTask ? globalTask.step : getProgressStep()}
            progress={currentUploadProgress}
          />
        </div>
      )}

      {isAudioSource &&
        ![
          "empty",
          "uploading",
          "converting",
          "analyzing",
          "processing",
          "proccesing",
        ].includes(interview.status) &&
        !currentIsUploading && (
          <div className={styles.section}>
            <h3>{t("card.audio")}</h3>
            {interview.status === "ready" ? (
              <div className={styles.audioReady}>
                <AudioPlayer
                  key={
                    interview.source_file_path ||
                    interview.audio_path ||
                    interview.id
                  }
                  interviewId={interview.id}
                  audioPath={audioPath}
                />
              </div>
            ) : interview.status === "failed" ? (
              <div className={styles.uploadFailed}>
                <div className={styles.failedIcon}>❌</div>
                <p className={styles.failedMessage}>
                  {interview.processing_error ||
                    t("card.upload.processingFailed")}
                </p>
                <button onClick={onRetry} className={styles.btnRetryUpload}>
                  {t("card.upload.retryProcessing")}
                </button>
              </div>
            ) : null}
          </div>
        )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>{t("card.transcriptTitle")}</h3>
        </div>
        <TranscriptViewer
          interviewId={interview.id}
          transcript={interview.transcript || ""}
          language={interview.source_language || undefined}
          diarizationEnabled={interview.diarization_enabled}
          speakerMappings={speakerMappings}
          onAssignSpeakers={handleAssignSpeakers}
        />

        <NotesSection
          initialNotes={interview.notes || ""}
          onSave={async (notes) => await onUpdateFields({ notes })}
        />
      </div>

      <DownloadsSection
        interview={interview}
        isAudioSource={isAudioSource}
        isDownloadingAudio={isDownloadingAudio}
        isDownloadingTranscript={isDownloadingTranscript}
        onDownloadAudio={downloadAudio}
        onDownloadTranscript={downloadTranscript}
      />

      <div className={`${styles.section} ${styles.metadata}`}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("card.metadata.id")}:</span>
          <span className={styles.metaValue}>{interview.id}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>
            {t("card.metadata.created")}:
          </span>
          <span className={styles.metaValue}>
            {formatDate(interview.created_at)}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>
            {t("card.metadata.updated")}:
          </span>
          <span className={styles.metaValue}>
            {formatDate(interview.updated_at)}
          </span>
        </div>
        <div className={styles.supportAction}>
          <button
            className={styles.btnSupport}
            onClick={() => setShowSupport(true)}
          >
            {t("support.button")}
          </button>
        </div>
      </div>

      <AssignFolderDialog
        isOpen={showAssignFolder}
        interviewIds={[interview.id]}
        currentFolderId={interview.folder_id}
        folders={folders}
        onClose={() => setShowAssignFolder(false)}
        onAssign={handleFolderAssigned}
      />

      <SupportFeedbackDialog
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />

      <LowBalanceDialog
        isOpen={showLowBalance}
        requiredSeconds={lowBalanceInfo.required}
        availableSeconds={lowBalanceInfo.available}
        onClose={() => setShowLowBalance(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t("card.deleteConfirmTitle")}
        message={t("card.deleteConfirmMessage")}
        type="danger"
        confirmText={t("card.deleteConfirmYes")}
        cancelText={t("card.deleteConfirmBack")}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
