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

import UploadArea from "./UploadArea";
import UploadProgress from "../../global/UploadProgress";
import TranscriptViewer from "./TranscriptViewer";
import { NotesSection } from "./NotesSection";
import { DownloadsSection } from "./DownloadsSection";
import SupportFeedbackDialog from "../../dialogs/SupportFeedbackDialog";
import LowBalanceDialog from "../../dialogs/LowBalanceDialog";
import AssignFolderDialog from "../../dialogs/AssignFolderDialog";
import { AudioPlayer } from "../../global/AudioPlayer";

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

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
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
    // Ideally show a toast
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

  return (
    <div className={styles.cardDetail}>
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
          <div
            className={`${styles.statusBadge} ${styles[interview.status] || styles.processing}`}
          >
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

      {interview.status === "empty" && !isUploading && (
        <div className={styles.section}>
          <UploadArea
            interviewId={interview.id}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onLowBalance={handleLowBalance}
            onError={handleUploadError}
          />
        </div>
      )}

      {(isUploading ||
        ["uploading", "converting", "analyzing", "processing"].includes(
          interview.status,
        )) && (
        <div className={styles.section}>
          <UploadProgress
            step={isUploading ? "uploading" : interview.status}
            progress={uploadProgress}
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
        ].includes(interview.status) &&
        !isUploading && (
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
      </div>

      <NotesSection
        initialNotes={interview.notes || ""}
        onSave={async (notes) => await onUpdateFields({ notes })}
      />

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
