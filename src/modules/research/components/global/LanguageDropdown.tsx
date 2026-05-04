"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
// Since PRIORITY_LANGUAGES are needed, let's hardcode a few common ones if constants are missing,
// but ideally we'd import them. I'll mock them based on typical usage.
const PRIORITY_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
];

const OTHER_LANGUAGES = [
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
];

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  popularLabel?: string;
  otherLabel?: string;
}

export default function LanguageDropdown({
  value = "en",
  onChange,
  popularLabel = "Popular",
  otherLabel = "Other languages",
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ bottom: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        bottom: window.innerHeight - rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const allLanguages = [...PRIORITY_LANGUAGES, ...OTHER_LANGUAGES];
  const selectedLang = allLanguages.find((l) => l.code === value);
  const selectedLabel = selectedLang ? selectedLang.name : value;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="language-dropdown-wrapper"
      ref={wrapperRef}
      style={{ position: "relative", flex: 1, maxWidth: "280px" }}
    >
      <button
        type="button"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "var(--bg-alt)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          color: "var(--fg)",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <span>▾</span>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              maxHeight: "320px",
              overflowY: "auto",
              zIndex: 9999,
              marginBottom: "4px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ padding: "4px 0" }}>
              <div
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {popularLabel}
              </div>
              {PRIORITY_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background:
                      value === lang.code
                        ? "rgba(34, 197, 94, 0.15)"
                        : "transparent",
                    color: value === lang.code ? "var(--success)" : "var(--fg)",
                  }}
                >
                  {lang.name}
                </div>
              ))}
            </div>

            <div
              style={{ padding: "4px 0", borderTop: "1px solid var(--border)" }}
            >
              <div
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {otherLabel}
              </div>
              {OTHER_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background:
                      value === lang.code
                        ? "rgba(34, 197, 94, 0.15)"
                        : "transparent",
                    color: value === lang.code ? "var(--success)" : "var(--fg)",
                  }}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
