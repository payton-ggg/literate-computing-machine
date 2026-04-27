"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./PasswordInput.module.css";

interface Props {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
}

export default function PasswordInput({ id, value, onChange, placeholder, label }: Props) {
  const [show, setShow] = useState(false);
  const t = useTranslations();

  return (
    <div className={styles.formGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <div className={styles.fieldInputWrap}>
        <input
          id={id}
          className={styles.fieldInput}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          className={styles.eyeBtn}
          onClick={() => setShow((s) => !s)}
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
