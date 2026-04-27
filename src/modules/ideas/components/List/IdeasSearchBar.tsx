"use client";

import styles from "./IdeasSearchBar.module.css";

interface IdeasSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  isMobileOpen: boolean;
}

export default function IdeasSearchBar({
  value,
  onChange,
  placeholder,
  isMobileOpen,
}: IdeasSearchBarProps) {
  const searchField = (
    <div className={styles.wrapper}>
      <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop search */}
      <div className={styles.desktopOnly}>{searchField}</div>
      {/* Mobile search */}
      {isMobileOpen && <div className={styles.mobileSearchBar}>{searchField}</div>}
    </>
  );
}

