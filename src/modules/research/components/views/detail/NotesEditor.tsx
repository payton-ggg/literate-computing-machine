"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import styles from "./NotesEditor.module.css";

interface NotesEditorProps {
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
  onBlur?: () => void;
  placeholder?: string;
}

export default function NotesEditor({
  initialNotes,
  onSave,
  onBlur,
  placeholder,
}: NotesEditorProps) {
  const t = useTranslations();
  const [notes, setNotes] = useState(initialNotes || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedNotesRef = useRef(initialNotes || "");

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const triggerSave = useCallback(
    async (text: string) => {
      if (text === lastSavedNotesRef.current) return;
      setSaveStatus("saving");
      try {
        await onSave(text);
        lastSavedNotesRef.current = text;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Failed to auto-save notes", err);
        setSaveStatus("idle");
      }
    },
    [onSave]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave(val);
    }, 1500); // 1.5s debounce
  };

  const handleBlur = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (notes !== lastSavedNotesRef.current) {
      triggerSave(notes);
    }
    if (onBlur) {
      // Let save finish before calling parent blur
      setTimeout(() => onBlur(), 100);
    }
  };

  const insertFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selection = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    let newValue = "";
    let newStart = start;
    let newEnd = end;

    if (format === "bold") {
      const text = selection || "bold text";
      newValue = `${before}**${text}**${after}`;
      newStart = before.length + 2;
      newEnd = newStart + text.length;
    } else if (format === "italic") {
      const text = selection || "italic text";
      newValue = `${before}*${text}*${after}`;
      newStart = before.length + 1;
      newEnd = newStart + text.length;
    } else if (format === "header") {
      const text = selection || "Heading";
      newValue = `${before}# ${text}${after}`;
      newStart = before.length + 2;
      newEnd = newStart + text.length;
    } else if (format === "ul") {
      const text = selection || "list item";
      const prefix = before.endsWith("\n") || before === "" ? "" : "\n";
      newValue = `${before}${prefix}- ${text}${after}`;
      newStart = before.length + prefix.length + 2;
      newEnd = newStart + text.length;
    }

    if (newValue === value) return;

    setNotes(newValue);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => triggerSave(newValue), 1500);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  return (
    <div className={styles.notesEditorContainer}>
      <div className={styles.notesHeader}>
        <div className={styles.toolbar}>
          <button onClick={() => insertFormat("bold")} className={styles.toolbarBtn} title={t("card.notesToolbar.bold")}>
            B
          </button>
          <button onClick={() => insertFormat("italic")} className={styles.toolbarBtn} title={t("card.notesToolbar.italic")}>
            I
          </button>
          <button onClick={() => insertFormat("header")} className={styles.toolbarBtn} title={t("card.notesToolbar.header")}>
            H
          </button>
          <button onClick={() => insertFormat("ul")} className={styles.toolbarBtn} title={t("card.notesToolbar.ul")}>
            • List
          </button>
        </div>
        <div className={`${styles.saveIndicator} ${styles[saveStatus]}`}>
          {saveStatus === "saving" && t("card.inlineEditing.saving")}
          {saveStatus === "saved" && t("card.inlineEditing.saved")}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={handleChange}
        onBlur={handleBlur}
        className={styles.notesTextarea}
        placeholder={placeholder}
      />
    </div>
  );
}
