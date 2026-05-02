"use client";

import React from "react";
import { useTranslations } from "next-intl";
import styles from "./DownloadsSection.module.css";

import { Interview } from "@/modules/research/types/interview.types";

interface DownloadsSectionProps {
  interview: Interview;
  isAudioSource: boolean;
  isDownloadingAudio: boolean;
  isDownloadingTranscript: boolean;
  onDownloadAudio: () => void;
  onDownloadTranscript: () => void;
}

export function DownloadsSection({
  interview,
  isAudioSource,
  isDownloadingAudio,
  isDownloadingTranscript,
  onDownloadAudio,
  onDownloadTranscript,
}: DownloadsSectionProps) {
  const t = useTranslations();
  if (interview.status !== "ready") {
    return null;
  }

  return (
    <div className={styles.downloads}>
      <h3>{t("card.downloads")}</h3>
      <div className={styles.buttonGroup}>
        {isAudioSource && (
          <button
            onClick={onDownloadAudio}
            disabled={isDownloadingAudio}
            className={styles.btnDownload}
            type="button"
          >
            {isDownloadingAudio ? (
              <span className={styles.btnDownloadLoading}>
                <span
                  className={styles.btnDownloadSpinner}
                  aria-hidden="true"
                ></span>
                {t("card.downloadingAudio")}
              </span>
            ) : (
              <span>{t("card.downloadAudio")}</span>
            )}
          </button>
        )}

        <button
          onClick={onDownloadTranscript}
          disabled={!interview.transcript || isDownloadingTranscript}
          className={styles.btnDownload}
          type="button"
        >
          {isDownloadingTranscript ? (
            <span className={styles.btnDownloadLoading}>
              <span
                className={styles.btnDownloadSpinner}
                aria-hidden="true"
              ></span>
              {t("card.downloadingTranscript")}
            </span>
          ) : (
            <span>{t("card.downloadTranscript")}</span>
          )}
        </button>
      </div>
    </div>
  );
}
