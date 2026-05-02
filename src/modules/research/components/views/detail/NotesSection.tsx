"use client";

import { useTranslations } from "next-intl";
import styles from "./NotesSection.module.css";
import { useNotesEditor } from "@/modules/research/hooks/useNotesEditor";

interface NotesSectionProps {
  initialNotes?: string;
  onSave?: (notes: string) => Promise<void>;
}

export function NotesSection({ initialNotes = "", onSave }: NotesSectionProps) {
  const t = useTranslations();
  const {
    notes,
    renderedNotes,
    isNotesPreviewVisible,
    setIsNotesPreviewVisible,
    autoSaveEnabled,
    setAutoSaveEnabled,
    savingState,
    savedState,
    errorState,
    notesInputRef,
    handleNotesChange,
    applyNotesFormatting,
    saveNotes,
  } = useNotesEditor(initialNotes, onSave);

  return (
    <div className={styles.notesSection}>
      <div className={styles.notesHeader}>
        <h3>{t("card.notes")}</h3>

        {renderedNotes && !isNotesPreviewVisible && (
          <button
            className={styles.notesPreviewToggle}
            onClick={() => setIsNotesPreviewVisible(true)}
            type="button"
            title="Preview Notes"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}

        {isNotesPreviewVisible && (
          <button
            className={`${styles.notesPreviewToggle} ${styles.active}`}
            onClick={() => setIsNotesPreviewVisible(false)}
            type="button"
            title="Edit Notes"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        )}
      </div>

      {isNotesPreviewVisible ? (
        <div className={styles.notesPreviewCard}>
          <div
            className={styles.notesMarkdown}
            dangerouslySetInnerHTML={{ __html: renderedNotes }}
          />
          <button
            className={styles.notesClosePreview}
            onClick={() => setIsNotesPreviewVisible(false)}
            type="button"
          >
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.notesToolbar}>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("header")}
              title="Heading"
            >
              <span className={styles.fmtLabel}>
                H<sub>1</sub>
              </span>
            </button>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("bold")}
              title="Bold"
            >
              <span className={styles.fmtLabel} style={{ fontWeight: 700 }}>
                B
              </span>
            </button>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("strikethrough")}
              title="Strikethrough"
            >
              <span
                className={styles.fmtLabel}
                style={{ textDecoration: "line-through" }}
              >
                T
              </span>
            </button>
            <span className={styles.notesToolbarDivider}></span>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("ul")}
              title="Bulleted list"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("ol")}
              title="Numbered list"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("quote")}
              title="Quote"
            >
              <span
                className={styles.fmtLabel}
                style={{ fontSize: "18px", lineHeight: 1 }}
              >
                &#10077;
              </span>
            </button>
            <span className={styles.notesToolbarDivider}></span>
            <button
              type="button"
              className={`${styles.notesFmtBtn} ${styles.autoSaveBtn} ${autoSaveEnabled ? styles.active : ""}`}
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title={t("card.autoSave")}
            >
              <span
                className={styles.fmtLabel}
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1,
                }}
              >
                <span style={{ fontSize: "7px", opacity: 0.7 }}>AUTO</span>
                <span>{autoSaveEnabled ? "ON" : "OFF"}</span>
              </span>
            </button>
          </div>

          <textarea
            ref={notesInputRef}
            className={styles.notesEditorTextarea}
            value={notes}
            placeholder={t("dialogs.createCard.notesPlaceholder")}
            onChange={(e) => handleNotesChange(e.target.value)}
          />

          <div className={styles.notesFooter}>
            <div className={styles.notesSaveStatus}>
              {savingState && (
                <span
                  className={`${styles.statusLabel} ${styles.statusSaving}`}
                >
                  {t("common.saving")}
                </span>
              )}
              {!savingState && savedState && (
                <span className={`${styles.statusLabel} ${styles.statusSaved}`}>
                  {t("common.saved")}
                </span>
              )}
              {!savingState && !savedState && errorState && (
                <span className={`${styles.statusLabel} ${styles.statusError}`}>
                  {errorState}
                </span>
              )}
            </div>
            <button
              className={styles.notesSaveBtn}
              type="button"
              onClick={saveNotes}
              disabled={savingState}
            >
              {t("common.save")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
