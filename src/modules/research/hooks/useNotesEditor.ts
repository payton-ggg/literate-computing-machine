import React, { useState, useRef, useCallback } from 'react';

export function useNotesEditor(initialNotes: string = '', onSave?: (notes: string) => Promise<void>) {
  const [notes, setNotes] = useState(initialNotes);
  const [renderedNotes, setRenderedNotes] = useState(''); // Ideally populated from a markdown parser
  const [isNotesPreviewVisible, setIsNotesPreviewVisible] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [savedState, setSavedState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  // Sync with initialNotes if they change from outside
  React.useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    // Auto-save logic could go here if autoSaveEnabled is true
  }, []);

  const applyNotesFormatting = useCallback((formatType: string) => {
    const textarea = notesInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    let newText = notes;
    let newCursorPos = start;

    switch (formatType) {
      case 'header':
        newText = notes.substring(0, start) + '# ' + selectedText + notes.substring(end);
        newCursorPos = start + 2;
        break;
      case 'bold':
        newText = notes.substring(0, start) + '**' + selectedText + '**' + notes.substring(end);
        newCursorPos = start + 2;
        break;
      case 'strikethrough':
        newText = notes.substring(0, start) + '~~' + selectedText + '~~' + notes.substring(end);
        newCursorPos = start + 2;
        break;
      case 'ul':
        newText = notes.substring(0, start) + '- ' + selectedText + notes.substring(end);
        newCursorPos = start + 2;
        break;
      case 'ol':
        newText = notes.substring(0, start) + '1. ' + selectedText + notes.substring(end);
        newCursorPos = start + 3;
        break;
      case 'quote':
        newText = notes.substring(0, start) + '> ' + selectedText + notes.substring(end);
        newCursorPos = start + 2;
        break;
    }

    setNotes(newText);
    
    // Focus and restore cursor position slightly after render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  }, [notes]);

  const saveNotes = useCallback(async () => {
    if (notes === initialNotes) return;
    
    setSavingState(true);
    setSavedState(false);
    setErrorState(null);
    
    try {
      if (onSave) {
        await onSave(notes);
      }
      setSavingState(false);
      setSavedState(true);
      // Reset saved state after a few seconds
      setTimeout(() => setSavedState(false), 3000);
    } catch (err: any) {
      setSavingState(false);
      setErrorState(err.message || 'Error saving notes');
    }
  }, [notes, initialNotes, onSave]);

  return {
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
    saveNotes
  };
}
