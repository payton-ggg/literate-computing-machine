"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import styles from "./SpeakerNameDialog.module.css";

interface SpeakerSummary {
  label: string;
  firstUtterance: string;
  phraseCount: number;
  assignedName?: string;
}

interface SpeakerMapping {
  speaker_label: string;
  assigned_name: string;
}

interface SpeakerNameDialogProps {
  isOpen: boolean;
  interviewId: string;
  speakerLabels: string[];
  existingMappings: SpeakerMapping[];
  speakerSummaries: SpeakerSummary[];
  onClose: () => void;
  onAssigned: (payload: { speaker_labels: string[]; assigned_names: string[] }) => void;
}

export default function SpeakerNameDialog({
  isOpen,
  speakerLabels = [],
  existingMappings = [],
  speakerSummaries = [],
  onClose,
  onAssigned,
}: SpeakerNameDialogProps) {
  const t = useTranslations();
  const [assignedNames, setAssignedNames] = useState<string[]>([]);
  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const summariesByLabel = useMemo(() => {
    const map: Record<string, SpeakerSummary> = {};
    speakerSummaries.forEach((s) => {
      if (s?.label) map[s.label] = s;
    });
    return map;
  }, [speakerSummaries]);

  useEffect(() => {
    if (isOpen) {
      setAssignedNames(
        speakerLabels.map((label) => {
          const ex = existingMappings.find((m) => m.speaker_label === label);
          return ex ? ex.assigned_name : "";
        })
      );
      setNameErrors(new Array(speakerLabels.length).fill(""));
      setErrorMessage("");
    }
  }, [isOpen, speakerLabels, existingMappings]);

  if (!isOpen) return null;

  const validateName = (name: string, index: number) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return t("card.speakerNames.validation.empty");
    if (trimmed.length > 100) return t("card.speakerNames.validation.tooLong");

    const validPattern = /^[\p{L}\p{N}\s\-_]+$/u;
    if (!validPattern.test(trimmed)) {
      return t("card.speakerNames.validation.invalidChars");
    }

    const reservedPatterns = ["$$speaker", "speaker a", "speaker b", "speaker c"];
    const nameLower = trimmed.toLowerCase();
    for (const pattern of reservedPatterns) {
      if (nameLower.includes(pattern)) {
        return `${t("card.speakerNames.validation.reserved")}: ${pattern}`;
      }
    }
    return "";
  };

  const validateAllNames = () => {
    let isValid = true;
    const newErrors = [...nameErrors];
    for (let i = 0; i < assignedNames.length; i++) {
      const err = validateName(assignedNames[i], i);
      newErrors[i] = err;
      if (err) isValid = false;
    }
    setNameErrors(newErrors);
    return isValid;
  };

  const canAssign =
    speakerLabels.length > 0 &&
    assignedNames.every((n) => n.trim().length > 0) &&
    assignedNames.every((n, i) => !validateName(n, i));

  const getSpeakerSummary = (label: string) => {
    return summariesByLabel[label] || { label, firstUtterance: "", phraseCount: 0 };
  };

  const formatPhraseCount = (count: number) => {
    if (!count) return `0 ${t("card.speakerNames.phrases")}`;
    return count === 1 ? `1 ${t("card.speakerNames.phrase")}` : `${count} ${t("card.speakerNames.phrases")}`;
  };

  const handleAssign = async () => {
    if (!canAssign) return;
    if (!validateAllNames()) {
      setErrorMessage(t("card.speakerNames.validation.fixErrors"));
      return;
    }

    setIsAssigning(true);
    setErrorMessage("");
    try {
      onAssigned({
        speaker_labels: speakerLabels,
        assigned_names: assignedNames.map((n) => n.trim()),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(`${t("dialogs.createCard.failed")}: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t("card.speakerNames.title")}</h2>
          <button onClick={onClose} className={styles.btnClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.speakerInfo}>
            <p>{t("card.speakerNames.description")}</p>
            {speakerLabels.length === 0 && (
              <div className={styles.noSpeakers}>{t("card.speakerNames.noSpeakers")}</div>
            )}
          </div>

          {speakerLabels.map((label, idx) => {
            const sum = getSpeakerSummary(label);
            return (
              <div key={label} className={styles.speakerCard}>
                <div className={styles.speakerCardHeader}>
                  <div className={styles.speakerLabel}>
                    {t("card.speakerNames.speaker")} {label}
                  </div>
                  <span className={styles.phraseBadge}>{formatPhraseCount(sum.phraseCount)}</span>
                </div>
                <div className={styles.speakerContext}>
                  <div className={styles.contextTitle}>{t("card.speakerNames.firstPhrase")}</div>
                  <p className={styles.contextText}>
                    {sum.firstUtterance ? `"${sum.firstUtterance}"` : t("card.transcript.noTranscript")}
                  </p>
                </div>

                <label htmlFor={`speaker-name-${label}`} className={styles.inputLabel}>
                  {t("card.speakerNames.customName")}
                </label>
                <input
                  id={`speaker-name-${label}`}
                  value={assignedNames[idx] || ""}
                  onChange={(e) => {
                    const newNames = [...assignedNames];
                    newNames[idx] = e.target.value;
                    setAssignedNames(newNames);
                  }}
                  type="text"
                  placeholder={`${t("card.speakerNames.enterName")} ${label}`}
                  className={styles.speakerInput}
                  maxLength={100}
                />
                {nameErrors[idx] && <div className={styles.fieldError}>{nameErrors[idx]}</div>}
              </div>
            );
          })}

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </div>

        <div className={styles.footer}>
          <button
            onClick={handleAssign}
            disabled={!canAssign || isAssigning}
            className={styles.btnAssign}
          >
            {isAssigning ? t("card.speakerNames.assigning") : t("card.speakerNames.assignButton")}
          </button>
          <button onClick={onClose} className={styles.btnCancel}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
