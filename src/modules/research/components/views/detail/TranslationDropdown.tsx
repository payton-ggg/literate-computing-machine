"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

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

const allLanguages = [...PRIORITY_LANGUAGES, ...OTHER_LANGUAGES];

interface Translation {
  language_code: string;
}

interface TranslationDropdownProps {
  interviewId: string;
  sourceLanguage?: string;
  translations?: Translation[];
  currentLanguage?: string | null;
  disabled?: boolean;
  onSelect: (code: string) => void;
  onTranslate: (code: string) => void;
}

export default function TranslationDropdown({
  interviewId,
  sourceLanguage = "en",
  translations = [],
  currentLanguage = null,
  disabled = false,
  onSelect,
  onTranslate,
}: TranslationDropdownProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentLang = currentLanguage || sourceLanguage;
  const translatedLanguages = translations || [];

  const availableLanguages = useMemo(() => {
    const available = [sourceLanguage];
    translatedLanguages.forEach((tr) => {
      if (!available.includes(tr.language_code)) {
        available.push(tr.language_code);
      }
    });
    return available;
  }, [sourceLanguage, translatedLanguages]);

  const otherLanguages = useMemo(() => {
    const translatedCodes = translatedLanguages.map((tr) => tr.language_code);
    return allLanguages.filter(
      (lang) => lang.code !== sourceLanguage && !translatedCodes.includes(lang.code)
    );
  }, [sourceLanguage, translatedLanguages]);

  const getLanguageName = (code: string) => {
    const lang = allLanguages.find((l) => l.code === code);
    return lang ? lang.name : code;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (code: string, isExisting: boolean) => {
    setIsOpen(false);
    if (isExisting) {
      onSelect(code);
    } else {
      onTranslate(code);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          fontSize: "13px",
          color: "var(--fg)",
          background: "var(--bg-alt)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "14px" }}>🌐</span>
          {t("card.translation.button")}
        </span>
        <span style={{ fontSize: "10px", color: "var(--muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }}>▾</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            width: "240px",
            maxHeight: "320px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          {availableLanguages.length > 0 && (
            <div style={{ padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>
                {t("card.translation.original")}
              </div>
              <div
                onClick={() => selectLanguage(sourceLanguage, true)}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: currentLang === sourceLanguage ? "rgba(34, 197, 94, 0.15)" : "transparent",
                  color: currentLang === sourceLanguage ? "var(--success)" : "var(--fg)",
                  fontWeight: 500,
                }}
              >
                {getLanguageName(sourceLanguage)}
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>
                  {t("card.translation.original")}
                </span>
              </div>

              {translatedLanguages.length > 0 && (
                <>
                  <div style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginTop: "4px" }}>
                    {t("card.translation.translated")}
                  </div>
                  {translatedLanguages.map((lang) => (
                    <div
                      key={lang.language_code}
                      onClick={() => selectLanguage(lang.language_code, true)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: currentLang === lang.language_code ? "rgba(34, 197, 94, 0.15)" : "transparent",
                        color: currentLang === lang.language_code ? "var(--success)" : "var(--fg)",
                        fontWeight: 500,
                      }}
                    >
                      {getLanguageName(lang.language_code)}
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>✓</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div style={{ padding: "4px 0" }}>
            <div style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>
              {t("card.translation.selectLanguage")}
            </div>
            {otherLanguages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => selectLanguage(lang.code, false)}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "var(--fg)",
                }}
              >
                {lang.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
