"use client";

import { useTranslations } from "next-intl";
import styles from "./AccountMenu.module.css";

interface Props {
  isOpen: boolean;
  style: React.CSSProperties;
  username: string;
  email: string;
  locale: string;
  isDark: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export default function AccountMenu({
  isOpen,
  style,
  username,
  email,
  locale,
  isDark,
  onClose,
  onOpenSettings,
  onToggleLocale,
  onToggleTheme,
  onLogout,
}: Props) {
  const t = useTranslations("header");

  if (!isOpen) return null;

  return (
    <div className={styles.accountMenu} onClick={onClose}>
      <div
        id="account-menu-panel"
        className={styles.accountMenuPanel}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.accountMenuHeader}>
          <div className={styles.accountMenuUsername}>{username}</div>
          <div className={styles.accountMenuEmail}>{email}</div>
        </div>

        <button className={styles.accountMenuItem} onClick={onOpenSettings}>
          <span className={styles.itemIcon}>
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className={styles.itemLabel}>{t("settings")}</span>
        </button>

        <button className={styles.accountMenuItem} onClick={onToggleLocale}>
          <span className={styles.itemIcon}>
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
              <path d="M2 5h7M9 3v2c0 4.418-2.239 8.152-5 10M11 19l4-9 4 9M12.5 17h5" />
              <path d="M21.5 12c-2 2.5-4.5 4-7.5 4" />
            </svg>
          </span>
          <span className={styles.itemLabel}>{t("language")}</span>
          <span className={styles.itemBadge}>{locale.toUpperCase()}</span>
        </button>

        <button className={styles.accountMenuItem} onClick={onToggleTheme}>
          <span className={styles.itemIcon}>
            {isDark ? (
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
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
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
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
          <span className={styles.itemLabel}>
            {isDark ? t("themeLight") : t("themeDark")}
          </span>
          <span
            className={`${styles.itemThemeToggle} ${!isDark ? styles.active : ""}`}
          >
            <span className={styles.toggleKnob} />
          </span>
        </button>

        <div className={styles.accountMenuDivider} />

        <button
          className={`${styles.accountMenuItem} ${styles.exit}`}
          onClick={onLogout}
        >
          <span className={styles.itemIcon}>
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className={styles.itemLabel}>{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
