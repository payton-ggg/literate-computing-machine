"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./LayoutSwitcher.module.css";

interface LayoutSwitcherProps {
  layout: "horizontal" | "vertical";
  onChange: (layout: "horizontal" | "vertical") => void;
  horizontalLabel: string;
  verticalLabel: string;
}

export default function LayoutSwitcher({
  layout,
  onChange,
  horizontalLabel,
  verticalLabel,
}: LayoutSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        {layout === "horizontal" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6H21M3 12H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 9H21M3 15H21" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={`${styles.option} ${layout === "horizontal" ? styles.active : ""}`}
            onClick={() => {
              onChange("horizontal");
              setIsOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {horizontalLabel}
          </button>
          <button
            className={`${styles.option} ${layout === "vertical" ? styles.active : ""}`}
            onClick={() => {
              onChange("vertical");
              setIsOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 9H21M3 15H21" stroke="currentColor" strokeWidth="2" />
            </svg>
            {verticalLabel}
          </button>
        </div>
      )}
    </div>
  );
}

