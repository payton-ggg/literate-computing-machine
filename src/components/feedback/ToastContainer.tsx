"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToastStore, type Toast } from "@/lib/toast";
import styles from "./ToastContainer.module.css";

function ToastIcon({ type }: { type: Toast["type"] }) {
  if (type === "error")
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M8.57 3.22L1.51 15.5c-.26.45-.26 1 0 1.45.27.45.75.73 1.28.73h14.12c.53 0 1.01-.28 1.28-.73.26-.45.26-1 0-1.45L11.13 3.22c-.27-.45-.75-.72-1.28-.72s-1.01.27-1.28.72z"
          fill="#F47C22"
        />
        <path d="M10 8v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.75" fill="white" />
      </svg>
    );
  if (type === "success")
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" fill="#14b053" />
        <path
          d="M7 10l2 2 4-4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#006dfa" />
      <path d="M10 9v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="7" r="0.75" fill="white" />
    </svg>
  );
}

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toastItem} ${styles[t.type]}`}
        >
          <div className={styles.toastIcon}>
            <ToastIcon type={t.type} />
          </div>
          <span className={styles.toastText}>{t.message}</span>
          <button className={styles.toastClose} onClick={() => remove(t.id)}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M8.5 2.5l-6 6M2.5 2.5l6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
