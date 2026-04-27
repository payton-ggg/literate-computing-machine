"use client";

import { useLocale } from "@/lib/i18n";
import styles from "./PublicHeader.module.css";

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <button
      className={styles.langSwitch}
      onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
    >
      {locale.toUpperCase()}
    </button>
  );
}
