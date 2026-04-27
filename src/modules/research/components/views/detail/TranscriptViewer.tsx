"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./TranscriptViewer.module.css";
import SpeakerNameDialog from "./SpeakerNameDialog";
import TranslationDropdown from "./TranslationDropdown";
import { translationApi } from "@/modules/research/api/interviews.api";

interface TranscriptViewerProps {
  interviewId: string;
  transcript: string;
  language?: string;
  diarizationEnabled?: boolean;
  speakerMappings?: Array<{ speaker_label: string; assigned_name: string }>;
  onAssignSpeakers: (payload: {
    speaker_labels: string[];
    assigned_names: string[];
  }) => Promise<void>;
}

export default function TranscriptViewer({
  interviewId,
  transcript,
  language = "en",
  diarizationEnabled = false,
  speakerMappings = [],
  onAssignSpeakers,
}: TranscriptViewerProps) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<"plain" | "diarized">("diarized");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeakerDialog, setShowSpeakerDialog] = useState(false);

  // Translation State
  const [translations, setTranslations] = useState<any[]>([]);
  const [currentTranslationLang, setCurrentTranslationLang] = useState<
    string | null
  >(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (interviewId && transcript) {
      translationApi
        .list(interviewId)
        .then((res) => {
          setTranslations(res.data?.translations || []);
        })
        .catch(console.error);
    }
  }, [interviewId, transcript]);

  const displayedTranscript = translatedText || transcript;

  // Speaker Logic
  const extractSpeakerLabels = (text: string) => {
    const labels = new Set<string>();
    const regex = /\$\$speaker\s+([a-z0-9]+)\$\$/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      labels.add(match[1].toLowerCase());
    }
    return Array.from(labels).sort();
  };

  const speakerLabels = useMemo(
    () => extractSpeakerLabels(transcript),
    [transcript],
  );

  const getSpeakerName = (label: string) => {
    const upper = label.toUpperCase();
    const mapping = speakerMappings.find((m) => m.speaker_label === upper);
    return mapping
      ? mapping.assigned_name
      : `${t("card.speakerNames.speaker")} ${upper}`;
  };

  const transcriptSegments = useMemo(() => {
    if (!displayedTranscript) return [];
    if (!diarizationEnabled) return [];

    const segments: any[] = [];
    const pattern = /\$\$speaker\s+([a-z0-9]+)\$\$\s*:?\s*/gi;
    let match;
    let currentSegment: any = null;

    while ((match = pattern.exec(displayedTranscript)) !== null) {
      if (currentSegment) {
        const text = displayedTranscript
          .slice(currentSegment.endIndex, match.index)
          .trim();
        if (text) segments.push({ ...currentSegment, text });
      }
      const rawLabel = match[1];
      const name = getSpeakerName(rawLabel);
      const colorIndex = ((rawLabel.toUpperCase().charCodeAt(0) - 65) % 6) + 1;

      currentSegment = {
        label: rawLabel,
        name,
        colorClass: styles[`color${colorIndex}`] || styles.colorDefault,
        endIndex: pattern.lastIndex,
      };
    }

    if (currentSegment) {
      const text = displayedTranscript.slice(currentSegment.endIndex).trim();
      if (text) segments.push({ ...currentSegment, text });
    }

    return segments;
  }, [displayedTranscript, diarizationEnabled, speakerMappings, t]);

  const speakerSummaries = useMemo(() => {
    const map = new Map();
    transcriptSegments.forEach((seg) => {
      const label = seg.label.toUpperCase();
      if (!map.has(label)) {
        map.set(label, { label, firstUtterance: seg.text, phraseCount: 1 });
      } else {
        const s = map.get(label);
        s.phraseCount += 1;
      }
    });
    return speakerLabels.map((lbl) => {
      const upper = lbl.toUpperCase();
      const s = map.get(upper) || {
        label: upper,
        firstUtterance: "",
        phraseCount: 0,
      };
      return s;
    });
  }, [transcriptSegments, speakerLabels]);

  const handleTranslationSelect = async (code: string) => {
    if (code === language) {
      setCurrentTranslationLang(null);
      setTranslatedText(null);
      return;
    }
    const existing = translations.find((t) => t.language_code === code);
    if (existing) {
      setCurrentTranslationLang(code);
      setTranslatedText(existing.translated_text);
    }
  };

  const handleTranslate = async (code: string) => {
    setIsTranslating(true);
    setCurrentTranslationLang(code);
    try {
      const res = await translationApi.translate(interviewId, code);
      setTranslatedText(res.data.translated_text);
      // Reload translations
      const listRes = await translationApi.list(interviewId);
      setTranslations(listRes.data.translations || []);
    } catch (err) {
      console.error("Translation failed", err);
      setCurrentTranslationLang(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const renderPlain = () => {
    if (!displayedTranscript) return null;
    let clean = displayedTranscript;
    if (diarizationEnabled) {
      clean = clean.replace(
        /\$\$speaker\s+([a-z0-9]+)\$\$\s*:?\s*/gi,
        (match, lbl) => {
          return `\n${getSpeakerName(lbl)}: `;
        },
      );
    }
    return <div className={styles.plainLine}>{clean.trim()}</div>;
  };

  return (
    <div className={styles.transcriptViewer}>
      <div className={styles.header}>
        <div className={styles.controls}>
          {diarizationEnabled && speakerLabels.length > 0 && (
            <>
              <button
                className={`${styles.btnAction} ${viewMode === "diarized" ? styles.btnActive : ""}`}
                onClick={() => setViewMode("diarized")}
              >
                {t("card.transcript.viewDiarized")}
              </button>
              <button
                className={`${styles.btnAction} ${viewMode === "plain" ? styles.btnActive : ""}`}
                onClick={() => setViewMode("plain")}
              >
                {t("card.transcript.viewPlain")}
              </button>
              <button
                className={styles.btnAction}
                onClick={() => setShowSpeakerDialog(true)}
              >
                {t("card.transcript.editSpeakers")}
              </button>
            </>
          )}
        </div>
        <TranslationDropdown
          interviewId={interviewId}
          sourceLanguage={language || "en"}
          currentLanguage={currentTranslationLang}
          translations={translations}
          disabled={isTranslating}
          onSelect={handleTranslationSelect}
          onTranslate={handleTranslate}
        />
      </div>

      <div
        className={`${styles.content} ${isExpanded ? styles.contentExpanded : ""}`}
      >
        {isTranslating ? (
          <div className={styles.translationLoading}>
            <div className={styles.spinner}></div>
            {t("card.translation.translating")}
          </div>
        ) : !transcript ? (
          <div className={styles.placeholder}>
            {t("card.transcript.pendingTranscript")}
          </div>
        ) : viewMode === "diarized" &&
          diarizationEnabled &&
          transcriptSegments.length > 0 ? (
          transcriptSegments.map((seg, idx) => (
            <div key={idx} className={styles.speakerSegment}>
              <span className={`${styles.speakerLabel} ${seg.colorClass}`}>
                {seg.name}
              </span>
              <div className={styles.speakerText}>{seg.text}</div>
            </div>
          ))
        ) : (
          renderPlain()
        )}
      </div>

      {transcript && (
        <button
          className={styles.btnAction}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ alignSelf: "flex-start" }}
        >
          {isExpanded
            ? t("card.transcript.collapse")
            : t("card.transcript.expand")}
        </button>
      )}

      <SpeakerNameDialog
        isOpen={showSpeakerDialog}
        interviewId={interviewId}
        speakerLabels={speakerLabels.map((l) => l.toUpperCase())}
        existingMappings={speakerMappings}
        speakerSummaries={speakerSummaries}
        onClose={() => setShowSpeakerDialog(false)}
        onAssigned={onAssignSpeakers}
      />
    </div>
  );
}
