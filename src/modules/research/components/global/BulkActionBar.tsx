"use client";

import { useTranslations } from "next-intl";
import styles from "./BulkActionBar.module.css";

interface BulkActionBarProps {
  count: number;
  isDeleting?: boolean;
  onClear: () => void;
  onDelete: () => void;
}

export default function BulkActionBar({
  count,
  isDeleting = false,
  onClear,
  onDelete,
}: BulkActionBarProps) {
  const t = useTranslations();

  if (count === 0) return null;

  return (
    <div className={styles.bar}>
      <span className={styles.label}>
        {t("interviews.selection.selectedCountLabel", { count })}
      </span>
      <div className={styles.buttons}>
        <button className={styles.ghost} onClick={onClear}>
          {t("interviews.selection.resetSelection")}
        </button>
        <button
          className={styles.danger}
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : t("common.delete")}
        </button>
      </div>
    </div>
  );
}
