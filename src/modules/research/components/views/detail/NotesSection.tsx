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
    renderedNotes, // You can populate this in the hook with a real markdown parser
    isEditing,
    setIsEditing,
    isPreviewing,
    setIsPreviewing,
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
      </div>

      {!isEditing ? (
        <div
          className={styles.notesPreviewCard}
          onClick={() => setIsEditing(true)}
          style={{ cursor: "text" }}
          title={t("card.edit")}
        >
          <div className={styles.notesMarkdown}>
            {renderedNotes ? (
              <div dangerouslySetInnerHTML={{ __html: renderedNotes }} />
            ) : notes ? (
              <span className={styles.plainText} style={{ whiteSpace: "pre-wrap" }}>
                {notes}
              </span>
            ) : (
              <span className={styles.placeholder} style={{ opacity: 0.5 }}>
                {t("dialogs.createCard.notesPlaceholder")}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.editorContainer}>
          <div className={styles.notesToolbar}>
            <button
              type="button"
              className={styles.notesFmtBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyNotesFormatting("header")}
              title="Heading"
              disabled={isPreviewing}
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
              disabled={isPreviewing}
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
              disabled={isPreviewing}
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
              disabled={isPreviewing}
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
              disabled={isPreviewing}
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
              disabled={isPreviewing}
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
              className={`${styles.notesFmtBtn} ${isPreviewing ? styles.active : ""}`}
              onClick={() => setIsPreviewing(!isPreviewing)}
              title="Toggle Preview"
              style={{ width: "auto", padding: "0 8px" }}
            >
              <span className={styles.fmtLabel} style={{ fontSize: "13px" }}>
                {isPreviewing ? t("card.edit") : "Preview"}
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

          {isPreviewing ? (
            <div className={styles.notesEditorTextarea} style={{ overflowY: "auto" }}>
              {renderedNotes ? (
                <div dangerouslySetInnerHTML={{ __html: renderedNotes }} />
              ) : notes ? (
                <span className={styles.plainText} style={{ whiteSpace: "pre-wrap" }}>
                  {notes}
                </span>
              ) : (
                <span className={styles.placeholder} style={{ opacity: 0.5 }}>
                  {t("dialogs.createCard.notesPlaceholder")}
                </span>
              )}
            </div>
          ) : (
            <textarea
              ref={notesInputRef}
              className={styles.notesEditorTextarea}
              value={notes}
              placeholder={t("dialogs.createCard.notesPlaceholder")}
              onChange={(e) => handleNotesChange(e.target.value)}
              autoFocus
            />
          )}

          <div className={styles.notesFooter}>
            <div className={styles.notesSaveStatus}>
              {savingState && (
                <span className={`${styles.statusLabel} ${styles.statusSaving}`}>
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
            <div style={{ display: "flex", gap: "8px" }}>
              {!autoSaveEnabled && (
                <button
                  className={styles.notesSaveBtn}
                  type="button"
                  onClick={() => saveNotes()}
                  disabled={savingState}
                >
                  {t("common.save")}
                </button>
              )}
              <button
                className={styles.notesClosePreview}
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsPreviewing(false);
                  saveNotes();
                }}
                style={{ padding: "6px 16px" }}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
