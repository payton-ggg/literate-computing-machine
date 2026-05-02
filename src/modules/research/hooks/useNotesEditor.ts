import React, { useState, useRef, useCallback } from 'react';

export function useNotesEditor(initialNotes: string = '', onSave?: (notes: string) => Promise<void>) {
  const [notes, setNotes] = useState(initialNotes);
  const [renderedNotes, setRenderedNotes] = useState(''); // Ideally populated from a markdown parser
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [savingState, setSavingState] = useState(false);
  const [savedState, setSavedState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedNotesRef = useRef(initialNotes);

  const parseMarkdown = (md: string) => {
    if (!md) return '';
    let html = md;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Lists
    html = html.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/^1\. (.*$)/gim, '<ol><li>$1</li></ol>');
    
    // Fix consecutive lists
    html = html.replace(/<\/ul>\n<ul>/gim, '');
    html = html.replace(/<\/ol>\n<ol>/gim, '');
    
    // Newlines to <br> for plain text outside elements
    html = html.replace(/\n/gim, '<br>');
    
    return html;
  };

  // Sync with initialNotes if they change from outside
  React.useEffect(() => {
    setNotes(initialNotes);
    lastSavedNotesRef.current = initialNotes;
  }, [initialNotes]);

  React.useEffect(() => {
    setRenderedNotes(parseMarkdown(notes));
  }, [notes]);

  const saveNotes = useCallback(async (textToSave?: string) => {
    const currentNotes = textToSave ?? notes;
    if (currentNotes === lastSavedNotesRef.current) return;
    
    setSavingState(true);
    setSavedState(false);
    setErrorState(null);
    
    try {
      if (onSave) {
        await onSave(currentNotes);
      }
      lastSavedNotesRef.current = currentNotes;
      setSavingState(false);
      setSavedState(true);
      // Reset saved state after a few seconds
      setTimeout(() => setSavedState(false), 3000);
    } catch (err: any) {
      setSavingState(false);
      setErrorState(err.message || 'Error saving notes');
    }
  }, [notes, onSave]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    
    if (autoSaveEnabled) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      setSavingState(true); // indicate that we have unsaved changes
      saveTimeoutRef.current = setTimeout(() => {
        saveNotes(value);
      }, 1500);
    }
  }, [saveNotes, autoSaveEnabled]);

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

  return {
    notes,
    renderedNotes,
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
    saveNotes
  };
}
